import { ReactNode } from 'react';
import { Check } from 'lucide-react';

interface SelectableCardProps {
  icon: ReactNode;
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export function SelectableCard({ icon, label, selected, onToggle }: SelectableCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative p-6 rounded-xl border-2 transition-all hover:scale-105 ${
        selected
          ? 'border-teal-600 bg-teal-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-teal-300'
      }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
        selected ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-600'
      }`}>
        {icon}
      </div>
      <p className={`text-sm font-medium ${
        selected ? 'text-teal-700' : 'text-gray-700'
      }`}>
        {label}
      </p>
    </button>
  );
}
