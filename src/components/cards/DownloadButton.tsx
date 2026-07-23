import { useState, useRef, useEffect } from 'react';
import type { TimeSeries, IndicatorConfig } from '../../types';
import { fetchObservations } from '../../services/dataCommonsApi';

interface DownloadButtonProps {
  chartId: string;
  series: TimeSeries[];
  indicatorName: string;
  config: IndicatorConfig;
  entityDcid: string;
}

function downloadCSV(series: TimeSeries[], indicatorName: string) {
  if (series.length === 0) return;

  const dateSet = new Set<string>();
  for (const s of series) {
    for (const obs of s.observations) dateSet.add(obs.date);
  }
  const dates = Array.from(dateSet).sort();

  const headers = ['Date', ...series.map(s => s.label || s.statVar)];
  const rows = dates.map(date => {
    const values = series.map(s => {
      const obs = s.observations.find(o => o.date === date);
      return obs ? String(obs.value) : '';
    });
    return [date, ...values];
  });

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  triggerDownload(csv, `${sanitize(indicatorName)}.csv`, 'text/csv');
}

function downloadPNG(chartId: string, indicatorName: string) {
  const container = document.getElementById(chartId);
  if (!container) return;
  const svg = container.querySelector('svg');
  if (!svg) return;

  const clone = svg.cloneNode(true) as SVGSVGElement;
  const svgData = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = svg.clientWidth * 2;
    canvas.height = svg.clientHeight * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(blob => {
      if (blob) {
        const pngUrl = URL.createObjectURL(blob);
        triggerDownload(null, `${sanitize(indicatorName)}.png`, '', pngUrl);
        URL.revokeObjectURL(pngUrl);
      }
    });
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

async function downloadAllData(config: IndicatorConfig, entityDcid: string) {
  const allVars = config.statVars;
  if (allVars.length === 0) return;

  // Fetch all stat vars in one request
  const response = await fetchObservations({
    variableDcids: allVars,
    entityDcids: [entityDcid],
    date: '',
    select: ['date', 'entity', 'variable', 'value'],
  });

  // Collect all dates across all vars
  const dateSet = new Set<string>();
  const varData: Record<string, Record<string, number>> = {};

  for (const statVar of allVars) {
    const vd = response.byVariable?.[statVar];
    if (!vd) continue;
    const ed = vd.byEntity?.[entityDcid];
    if (!ed) continue;
    const facets = ed.orderedFacets;
    if (!facets || facets.length === 0) continue;

    // Pick best facet (most observations)
    let best = facets[0];
    for (let i = 1; i < facets.length; i++) {
      if ((facets[i].observations?.length ?? 0) > (best.observations?.length ?? 0)) {
        best = facets[i];
      }
    }

    const observations = best.observations || [];
    varData[statVar] = {};
    for (const obs of observations) {
      dateSet.add(obs.date);
      varData[statVar][obs.date] = obs.value;
    }
  }

  const dates = Array.from(dateSet).sort();
  const varsWithData = allVars.filter(v => varData[v]);

  if (varsWithData.length === 0 || dates.length === 0) return;

  // Build CSV with all stat vars as columns
  const headers = ['Date', ...varsWithData];
  const rows = dates.map(date => {
    const values = varsWithData.map(v => {
      const val = varData[v]?.[date];
      return val !== undefined ? String(val) : '';
    });
    return [date, ...values];
  });

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  triggerDownload(csv, `${sanitize(config.name)}_all_data.csv`, 'text/csv');
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}

function triggerDownload(content: string | null, filename: string, type: string, blobUrl?: string) {
  const a = document.createElement('a');
  if (blobUrl) {
    a.href = blobUrl;
  } else if (content) {
    const blob = new Blob([content], { type });
    a.href = URL.createObjectURL(blob);
  }
  a.download = filename;
  a.click();
}

export function DownloadButton({ chartId, series, indicatorName, config, entityDcid }: DownloadButtonProps) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      await downloadAllData(config, entityDcid);
    } finally {
      setDownloading(false);
      setOpen(false);
    }
  };

  return (
    <div className="download-container" ref={ref}>
      <button className="download-btn" onClick={() => setOpen(!open)} title="Download">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1v10M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="download-menu">
          <button onClick={() => { downloadCSV(series, indicatorName); setOpen(false); }}>
            Download CSV (current view)
          </button>
          <button onClick={handleDownloadAll} disabled={downloading}>
            {downloading ? 'Fetching...' : 'Download all data (CSV)'}
          </button>
          <button onClick={() => { downloadPNG(chartId, indicatorName); setOpen(false); }}>
            Download PNG
          </button>
        </div>
      )}
    </div>
  );
}
