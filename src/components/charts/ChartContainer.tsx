import { useRef, useState, useEffect, type ReactNode } from 'react';

interface Dimensions {
  width: number;
  height: number;
}

interface ChartContainerProps {
  children: (dimensions: Dimensions) => ReactNode;
  aspectRatio?: number;
}

export function ChartContainer({ children, aspectRatio = 16 / 10 }: ChartContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          setDimensions({
            width,
            height: Math.max(200, width / aspectRatio),
          });
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [aspectRatio]);

  return (
    <div ref={containerRef} className="chart-container">
      {dimensions && children(dimensions)}
    </div>
  );
}
