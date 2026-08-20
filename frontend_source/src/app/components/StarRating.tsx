import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  label: string;
  tamilLabel: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
}

export function StarRating({ label, tamilLabel, value, onChange, required }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  const tamilLabels = ['மோசம்', 'சாதாரண', 'நல்ல', 'மிக நல்ல', 'சிறந்த'];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {tamilLabel && <span className="text-teal-600">/ {tamilLabel}</span>}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110"
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            onClick={() => onChange(star)}
          >
            <Star
              size={32}
              className={`${
                star <= (hoverValue || value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              } transition-colors`}
            />
          </button>
        ))}
        {value > 0 && (
          <span className="ml-3 text-sm font-medium text-gray-700">
            {labels[value - 1]} / {tamilLabels[value - 1]}
          </span>
        )}
      </div>
    </div>
  );
}
