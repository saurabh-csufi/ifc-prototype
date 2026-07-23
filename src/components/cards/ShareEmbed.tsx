import { useState, useRef, useEffect } from 'react';
import type { IndicatorConfig, FilterState } from '../../types';

interface ShareEmbedProps {
  config: IndicatorConfig;
  entityDcid: string;
  stateName: string;
  filterState: FilterState;
}

function serializeFilterValue(v: string | string[]): string {
  return Array.isArray(v) ? v.join(',') : v;
}

function buildShareUrl(config: IndicatorConfig, entityDcid: string, filters: FilterState): string {
  const base = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();
  params.set('indicator', config.id);
  params.set('state', entityDcid);
  for (const [k, v] of Object.entries(filters)) {
    params.set(`f_${k}`, serializeFilterValue(v));
  }
  return `${base}?${params.toString()}`;
}

function buildEmbedUrl(config: IndicatorConfig, entityDcid: string, filters: FilterState): string {
  const base = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();
  params.set('embed', 'true');
  params.set('indicator', config.id);
  params.set('state', entityDcid);
  for (const [k, v] of Object.entries(filters)) {
    params.set(`f_${k}`, serializeFilterValue(v));
  }
  return `${base}?${params.toString()}`;
}

export function ShareEmbed({ config, entityDcid, stateName, filterState }: ShareEmbedProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCopied(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const shareUrl = buildShareUrl(config, entityDcid, filterState);
  const embedUrl = buildEmbedUrl(config, entityDcid, filterState);
  const shareText = `${config.name} — ${stateName} | Bharat In Data`;
  const embedCode = `<iframe src="${embedUrl}" width="480" height="420" style="border:1px solid #e2e8f0;border-radius:12px;" frameborder="0" loading="lazy"></iframe>`;

  const shareToTwitter = () => {
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied('link');
    setTimeout(() => setCopied(null), 2000);
  };

  const copyEmbed = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied('embed');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="share-embed-container" ref={ref}>
      <button
        className="share-embed-btn"
        onClick={() => { setOpen(!open); setCopied(null); }}
        title="Share & Embed"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M11.5 1.5a2 2 0 110 4 2 2 0 010-4zM4.5 5.5a2 2 0 110 4 2 2 0 010-4zM11.5 9.5a2 2 0 110 4 2 2 0 010-4zM6.3 8.2l3.4 2.1M6.3 6.8l3.4-2.1"
            stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div className="share-embed-menu">
          {/* Share section */}
          <div className="share-embed-section">
            <div className="share-embed-section-label">Share</div>
            <div className="share-social-row">
              <button className="share-social-btn share-twitter" onClick={shareToTwitter} title="Share on X/Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <button className="share-social-btn share-linkedin" onClick={shareToLinkedIn} title="Share on LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
              <button className="share-social-btn share-whatsapp" onClick={shareToWhatsApp} title="Share on WhatsApp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </button>
              <button
                className={`share-social-btn share-copy ${copied === 'link' ? 'copied' : ''}`}
                onClick={copyLink}
                title="Copy link"
              >
                {copied === 'link' ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6.5 9.5l3-3M5.5 7l-1.3 1.3a2.121 2.121 0 003 3L8.5 10M7.5 6l1.3-1.3a2.121 2.121 0 013 3L10.5 9"
                      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Embed section */}
          <div className="share-embed-section">
            <div className="share-embed-section-label">Embed</div>
            <div className="embed-code-box">
              <code>{embedCode}</code>
            </div>
            <button
              className={`embed-copy-btn ${copied === 'embed' ? 'copied' : ''}`}
              onClick={copyEmbed}
            >
              {copied === 'embed' ? 'Copied!' : 'Copy embed code'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
