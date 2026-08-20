import { useState } from 'react';

interface EmojiRatingProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
  language: 'en' | 'ta';
  emojiSize?: number;
}

export function EmojiRating({ label, value, onChange, required, language }: EmojiRatingProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const ratings = [
    {
      emoji: '☹️',
      labelEn: 'Very Bad',
      labelTa: 'மிகவும் மோசம்',
      value: 1,
      selectedBg: '#dc2626',
      borderColor: 'border-red-300',
      hoverBorder: 'hover:border-red-400',
      glowShadow: 'rgba(239,68,68,0.35)',
    },
    {
      emoji: '😟',
      labelEn: 'Poor',
      labelTa: 'மோசம்',
      value: 2,
      selectedBg: '#ea580c',
      borderColor: 'border-orange-300',
      hoverBorder: 'hover:border-orange-400',
      glowShadow: 'rgba(249,115,22,0.35)',
    },
    {
      emoji: '😐',
      labelEn: 'Average',
      labelTa: 'சாதாரண',
      value: 3,
      selectedBg: '#ca8a04',
      borderColor: 'border-yellow-300',
      hoverBorder: 'hover:border-yellow-400',
      glowShadow: 'rgba(234,179,8,0.35)',
    },
    {
      emoji: '😊',
      labelEn: 'Good',
      labelTa: 'நல்ல',
      value: 4,
      selectedBg: '#16a34a',
      borderColor: 'border-lime-300',
      hoverBorder: 'hover:border-lime-400',
      glowShadow: 'rgba(34,197,94,0.35)',
    },
    {
      emoji: '😄',
      labelEn: 'Excellent',
      labelTa: 'சிறந்த',
      value: 5,
      selectedBg: '#15803d',
      borderColor: 'border-green-300',
      hoverBorder: 'hover:border-green-400',
      glowShadow: 'rgba(21,128,61,0.35)',
    },
  ];

  const handleClick = (ratingValue: number) => {
    onChange(value === ratingValue ? 0 : ratingValue);
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {/* Responsive emoji row: all 5 cards visible at every breakpoint */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 'clamp(3px, 1vw, 8px)',
          width: '100%',
          overflow: 'hidden',
          flexWrap: 'nowrap',
          alignItems: 'stretch',
          padding: '4px 0',
        }}
      >
        {ratings.map((rating) => {
          const isSelected = value === rating.value;
          const isHovered = hoveredValue === rating.value;

          let cardTransform = 'scale(1)';
          if (isSelected) {
            cardTransform = isHovered ? 'translateY(-4px) scale(1.08)' : 'scale(1.08)';
          } else if (value !== 0) {
            cardTransform = isHovered ? 'translateY(-4px) scale(0.97)' : 'scale(0.97)';
          } else {
            cardTransform = isHovered ? 'translateY(-4px) scale(1)' : 'scale(1)';
          }

          let boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
          if (isSelected) {
            boxShadow = isHovered
              ? `0 10px 20px ${rating.glowShadow}`
              : `0 6px 20px ${rating.glowShadow}`;
          } else if (isHovered) {
            boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
          }

          let borderColor = undefined;
          if (isSelected) {
            borderColor = rating.selectedBg;
          } else if (isHovered) {
            borderColor = 'rgba(13, 148, 136, 0.4)';
          }

          return (
            <button
              key={rating.value}
              type="button"
              onClick={() => handleClick(rating.value)}
              onMouseEnter={() => setHoveredValue(rating.value)}
              onMouseLeave={() => setHoveredValue(null)}
              style={{
                flex: '1 1 0',
                minWidth: 0,
                maxWidth: '130px',
                overflow: 'hidden',
                transform: cardTransform,
                transition: 'transform 200ms ease-out, box-shadow 200ms ease-out, background-color 250ms ease, border-color 250ms ease',
                backgroundColor: isSelected ? rating.selectedBg : '#ffffff',
                boxShadow,
                borderWidth: isSelected ? '3px' : '2px',
                borderStyle: 'solid',
                borderColor: borderColor,
                borderRadius: 'clamp(10px, 1.5vw, 16px)',
                padding: 'clamp(6px, 1.2vw, 12px) clamp(3px, 0.8vw, 8px)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                outline: 'none',
                transformOrigin: 'center center',
              }}
              className={`${!isSelected && !isHovered ? `${rating.borderColor}` : ''}`}
            >
              {/* Emoji — responsive size via clamp */}
              <div
                style={{
                  width: 'clamp(38px, 10vw, 72px)',
                  height: 'clamp(38px, 10vw, 72px)',
                  fontSize: 'clamp(28px, 7vw, 52px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  filter: isSelected
                    ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                    : 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))',
                  transition: 'filter 200ms ease-out, transform 200ms ease-out',
                  transform: isHovered ? (isSelected ? 'translateY(-6px)' : 'translateY(-8px)') : 'translateY(0)',
                  flexShrink: 0,
                }}
              >
                {rating.emoji}
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: 'clamp(8px, 1.2vw, 13px)',
                  fontWeight: 600,
                  textAlign: 'center',
                  lineHeight: 1.3,
                  marginTop: 'clamp(4px, 0.8vw, 10px)',
                  color: isSelected ? '#ffffff' : '#374151',
                  transition: 'color 250ms ease',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                }}
              >
                {language === 'en' ? rating.labelEn : rating.labelTa}
              </span>

              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'clamp(10px, 1.5vw, 14px)',
                    boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.3)',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
