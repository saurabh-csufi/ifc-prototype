import { useState } from 'react';
import type { IndicatorConfig, DatasetId } from '../../types';
import { IndicatorCard } from '../cards/IndicatorCard';
import { getDatasetAccent } from '../../utils/colors';

interface CardCarouselProps {
  indicators: IndicatorConfig[];
  entityDcid: string;
  dataset: DatasetId;
}

const CARDS_PER_PAGE = 3;

export function CardCarousel({ indicators, entityDcid, dataset }: CardCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(indicators.length / CARDS_PER_PAGE);
  const startIdx = currentPage * CARDS_PER_PAGE;
  const visibleCards = indicators.slice(startIdx, startIdx + CARDS_PER_PAGE);

  const accentColor = getDatasetAccent(dataset);

  // Reset page if current page exceeds available pages after filtering
  if (currentPage >= totalPages && totalPages > 0) {
    setCurrentPage(0);
  }

  if (indicators.length === 0) return null;

  return (
    <div className="card-carousel">
      <div className="carousel-track">
        {visibleCards.map(indicator => (
          <div key={indicator.id} className="carousel-card-slot">
            <IndicatorCard config={indicator} entityDcid={entityDcid} />
          </div>
        ))}
        {/* Fill empty slots to keep consistent layout */}
        {visibleCards.length < CARDS_PER_PAGE &&
          Array.from({ length: CARDS_PER_PAGE - visibleCards.length }).map((_, i) => (
            <div key={`empty-${i}`} className="carousel-card-slot carousel-card-empty" />
          ))
        }
      </div>

      {/* Dot pagination */}
      {totalPages > 1 && (
        <div className="carousel-dots">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`carousel-dot ${i === currentPage ? 'active' : ''}`}
              style={i === currentPage ? { backgroundColor: accentColor } : {}}
              onClick={() => setCurrentPage(i)}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
