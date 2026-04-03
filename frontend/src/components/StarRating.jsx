// Star rating display and interactive selector component
import { useState } from 'react';

export default function StarRating({ rating = 0, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0);

  // Renders a single star — filled, half, or empty based on value
  const renderStar = (index) => {
    const filled = interactive ? (hovered || rating) >= index : rating >= index;
    return (
      <span
        key={index}
        className={`text-xl transition-colors duration-100 ${
          filled ? 'text-amber-400' : 'text-stone-200'
        } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
        onClick={() => interactive && onRate && onRate(index)}
        onMouseEnter={() => interactive && setHovered(index)}
        onMouseLeave={() => interactive && setHovered(0)}
      >
        ★
      </span>
    );
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(renderStar)}
      {!interactive && rating > 0 && (
        <span className="ml-1.5 text-sm text-stone-500 font-medium">{Number(rating).toFixed(1)}</span>
      )}
    </div>
  );
}
