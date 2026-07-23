import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

// ── Chart data types ────────────────────────────────────────────────────────

interface ChartDataItem {
  label: string;
  value: number;
}

interface ChartBlock {
  type: 'bar' | 'pie' | 'horizontal-bar' | 'line';
  title?: string;
  unit?: string;
  data: ChartDataItem[];
}

// ── Colors ──────────────────────────────────────────────────────────────────

const CHART_COLORS = [
  '#0d9488', '#d97706', '#7c3aed', '#dc2626', '#2563eb',
  '#059669', '#db2777', '#ea580c', '#4f46e5', '#0891b2',
];

// ── Inline Bar Chart ────────────────────────────────────────────────────────

function InlineBarChart({ chart }: { chart: ChartBlock }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !chart.data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 420;
    const margin = { top: 16, right: 20, bottom: 40, left: 100 };
    const barHeight = 26;
    const gap = 6;
    const height = margin.top + margin.bottom + chart.data.length * (barHeight + gap);

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const innerWidth = width - margin.left - margin.right;

    const x = d3.scaleLinear()
      .domain([0, d3.max(chart.data, d => d.value) ?? 1])
      .range([0, innerWidth])
      .nice();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Bars
    chart.data.forEach((d, i) => {
      const y = i * (barHeight + gap);

      g.append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', x(d.value))
        .attr('height', barHeight)
        .attr('rx', 3)
        .attr('fill', CHART_COLORS[i % CHART_COLORS.length])
        .attr('opacity', 0.85);

      // Label
      g.append('text')
        .attr('x', -6)
        .attr('y', y + barHeight / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'central')
        .attr('font-size', '11px')
        .attr('fill', '#475569')
        .text(d.label.length > 16 ? d.label.slice(0, 15) + '...' : d.label);

      // Value
      const textX = x(d.value) + 6;
      g.append('text')
        .attr('x', textX > innerWidth - 30 ? x(d.value) - 6 : textX)
        .attr('y', y + barHeight / 2)
        .attr('text-anchor', textX > innerWidth - 30 ? 'end' : 'start')
        .attr('dominant-baseline', 'central')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('fill', textX > innerWidth - 30 ? '#fff' : '#334155')
        .text(d3.format(',')(d.value) + (chart.unit ? ` ${chart.unit}` : ''));
    });

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${chart.data.length * (barHeight + gap)})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => d3.format(',.0f')(d as number)))
      .call(g => g.select('.domain').attr('stroke', '#e2e8f0'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#f1f5f9'))
      .call(g => g.selectAll('.tick text').attr('fill', '#94a3b8').attr('font-size', '10px'));
  }, [chart]);

  const h = 56 + chart.data.length * 32;
  return (
    <div className="chat-chart-wrapper">
      {chart.title && <div className="chat-chart-title">{chart.title}</div>}
      <svg ref={svgRef} width="100%" style={{ maxHeight: Math.max(h, 120) }} />
    </div>
  );
}

// ── Inline Pie Chart ────────────────────────────────────────────────────────

function InlinePieChart({ chart }: { chart: ChartBlock }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !chart.data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const size = 280;
    const radius = size / 2 - 20;

    svg.attr('viewBox', `0 0 ${size + 160} ${size}`);

    const g = svg.append('g').attr('transform', `translate(${size / 2},${size / 2})`);

    const pie = d3.pie<ChartDataItem>().value(d => d.value).sort(null);
    const arc = d3.arc<d3.PieArcDatum<ChartDataItem>>().innerRadius(radius * 0.45).outerRadius(radius);

    const arcs = g.selectAll('path')
      .data(pie(chart.data))
      .join('path')
      .attr('d', arc)
      .attr('fill', (_, i) => CHART_COLORS[i % CHART_COLORS.length])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Tooltip on hover
    arcs.append('title')
      .text(d => `${d.data.label}: ${d3.format(',')(d.data.value)}${chart.unit ? ' ' + chart.unit : ''}`);

    // Legend
    const legend = svg.append('g').attr('transform', `translate(${size + 8}, 20)`);
    chart.data.forEach((d, i) => {
      const row = legend.append('g').attr('transform', `translate(0, ${i * 22})`);
      row.append('rect')
        .attr('width', 12).attr('height', 12).attr('rx', 2)
        .attr('fill', CHART_COLORS[i % CHART_COLORS.length]);
      row.append('text')
        .attr('x', 18).attr('y', 10)
        .attr('font-size', '10px')
        .attr('fill', '#475569')
        .text(`${d.label.length > 14 ? d.label.slice(0, 13) + '...' : d.label} (${d3.format(',')(d.value)})`);
    });
  }, [chart]);

  return (
    <div className="chat-chart-wrapper">
      {chart.title && <div className="chat-chart-title">{chart.title}</div>}
      <svg ref={svgRef} width="100%" style={{ maxHeight: 280 }} />
    </div>
  );
}

// ── Inline Line Chart ───────────────────────────────────────────────────────

function InlineLineChart({ chart }: { chart: ChartBlock }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !chart.data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 420;
    const height = 200;
    const margin = { top: 16, right: 20, bottom: 36, left: 60 };

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint<string>()
      .domain(chart.data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(chart.data, d => d.value) ?? 1])
      .range([innerHeight, 0])
      .nice();

    // Grid
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke', '#f1f5f9'))
      .call(g => g.selectAll('.tick text').attr('fill', '#94a3b8').attr('font-size', '10px'));

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .call(g => g.select('.domain').attr('stroke', '#e2e8f0'))
      .call(g => g.selectAll('.tick text').attr('fill', '#94a3b8').attr('font-size', '10px'));

    // Line
    const line = d3.line<ChartDataItem>()
      .x(d => x(d.label)!)
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(chart.data)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', CHART_COLORS[0])
      .attr('stroke-width', 2.5);

    // Dots
    g.selectAll('circle')
      .data(chart.data)
      .join('circle')
      .attr('cx', d => x(d.label)!)
      .attr('cy', d => y(d.value))
      .attr('r', 4)
      .attr('fill', CHART_COLORS[0])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);
  }, [chart]);

  return (
    <div className="chat-chart-wrapper">
      {chart.title && <div className="chat-chart-title">{chart.title}</div>}
      <svg ref={svgRef} width="100%" style={{ maxHeight: 220 }} />
    </div>
  );
}

// ── Chart renderer dispatcher ───────────────────────────────────────────────

function ChatChart({ chart }: { chart: ChartBlock }) {
  switch (chart.type) {
    case 'pie':
      return <InlinePieChart chart={chart} />;
    case 'line':
      return <InlineLineChart chart={chart} />;
    case 'bar':
    case 'horizontal-bar':
    default:
      return <InlineBarChart chart={chart} />;
  }
}

// ── Markdown parser ─────────────────────────────────────────────────────────

interface ParsedBlock {
  type: 'text' | 'chart';
  content: string;
  chart?: ChartBlock;
}

function parseChartBlocks(text: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  // Match ```chart:type or ```chart blocks
  const chartRegex = /```chart(?::(\w[\w-]*))?[ \t]*\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = chartRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    try {
      const chartData = JSON.parse(match[2].trim());
      const chartType = (match[1] || chartData.type || 'bar') as ChartBlock['type'];
      blocks.push({
        type: 'chart',
        content: '',
        chart: { ...chartData, type: chartType },
      });
    } catch {
      // If JSON parse fails, render as code block
      blocks.push({ type: 'text', content: match[0] });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    blocks.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return blocks;
}

function renderMarkdownLine(line: string): string {
  // Bold
  line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic (but not inside bold markers)
  line = line.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
  // Inline code
  line = line.replace(/`([^`]+?)`/g, '<code class="chat-inline-code">$1</code>');
  return line;
}

function renderMarkdownToHtml(text: string): string {
  const lines = text.split('\n');
  const htmlParts: string[] = [];
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';
  let inTable = false;
  let tableRows: string[][] = [];

  const closeList = () => {
    if (inList) {
      htmlParts.push(`</${listType}>`);
      inList = false;
    }
  };

  const closeTable = () => {
    if (inTable && tableRows.length > 0) {
      let tableHtml = '<div class="chat-table-wrapper"><table class="chat-table">';
      tableRows.forEach((row, ri) => {
        const tag = ri === 0 ? 'th' : 'td';
        if (ri === 0) tableHtml += '<thead>';
        if (ri === 1) tableHtml += '</thead><tbody>';
        tableHtml += '<tr>' + row.map(cell => `<${tag}>${renderMarkdownLine(cell.trim())}</${tag}>`).join('') + '</tr>';
      });
      if (tableRows.length > 1) tableHtml += '</tbody>';
      else tableHtml += '</thead>';
      tableHtml += '</table></div>';
      htmlParts.push(tableHtml);
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        htmlParts.push(`<pre class="chat-code-block"><code>${codeContent.join('\n').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
        inCodeBlock = false;
        codeContent = [];

      } else {
        closeList();
        closeTable();
        inCodeBlock = true;
        // language hint from ``` block (unused for now)
      }
      continue;
    }
    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    // Table rows (|col1|col2|)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const cells = line.trim().slice(1, -1).split('|');
      // Skip separator rows (|---|---|)
      if (cells.every(c => /^[\s:-]+$/.test(c))) continue;
      if (!inTable) {
        closeList();
        inTable = true;
      }
      tableRows.push(cells);
      continue;
    } else {
      closeTable();
    }

    // Headings
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      htmlParts.push(`<h${level} class="chat-h${level}">${renderMarkdownLine(headingMatch[2])}</h${level}>`);
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}\s*$/.test(line.trim())) {
      closeList();
      htmlParts.push('<hr class="chat-hr" />');
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        closeList();
        inList = true;
        listType = 'ul';
        htmlParts.push('<ul class="chat-list">');
      }
      htmlParts.push(`<li>${renderMarkdownLine(ulMatch[2])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        closeList();
        inList = true;
        listType = 'ol';
        htmlParts.push('<ol class="chat-list">');
      }
      htmlParts.push(`<li>${renderMarkdownLine(olMatch[2])}</li>`);
      continue;
    }

    closeList();

    // Empty line
    if (line.trim() === '') {
      continue;
    }

    // Regular paragraph
    htmlParts.push(`<p class="chat-p">${renderMarkdownLine(line)}</p>`);
  }

  closeList();
  closeTable();
  if (inCodeBlock) {
    htmlParts.push(`<pre class="chat-code-block"><code>${codeContent.join('\n').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
  }

  return htmlParts.join('');
}

// ── Main component ──────────────────────────────────────────────────────────

export function ChatMarkdown({ text }: { text: string }) {
  const blocks = parseChartBlocks(text);

  return (
    <div className="chat-markdown">
      {blocks.map((block, i) => {
        if (block.type === 'chart' && block.chart) {
          return <ChatChart key={i} chart={block.chart} />;
        }
        return (
          <div
            key={i}
            dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(block.content) }}
          />
        );
      })}
    </div>
  );
}
