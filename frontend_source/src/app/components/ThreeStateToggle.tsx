interface ThreeStateToggleProps {
  label: string;
  value: boolean | null;
  onValueChange: (value: boolean | null) => void;
  required?: boolean;
  language: 'en' | 'ta';
}

export function ThreeStateToggle({ label, value, onValueChange, required, language }: ThreeStateToggleProps) {
  return (
    <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
      <label className="block text-sm font-medium text-gray-700 mb-5">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="grid grid-cols-2 gap-4">
        {/* NO Button - LEFT SIDE */}
        <button
          type="button"
          onClick={() => onValueChange(false)}
          className={`group relative py-5 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
            value === false
              ? 'bg-[#dbeafe] border-2 border-[#93c5fd] text-[#1e3a8a]'
              : 'bg-white border-2 border-[#e5e7eb] text-[#6b7280] hover:border-[#93c5fd] hover:shadow-lg'
          }`}
        >
          <span className={`text-base font-bold transition-all duration-300`}>
            {language === 'en' ? 'No' : 'இல்லை'}
          </span>
        </button>

        {/* YES Button - RIGHT SIDE */}
        <button
          type="button"
          onClick={() => onValueChange(true)}
          className={`group relative py-5 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
            value === true
              ? 'bg-[#dbeafe] border-2 border-[#93c5fd] text-[#1e3a8a]'
              : 'bg-white border-2 border-[#e5e7eb] text-[#6b7280] hover:border-[#93c5fd] hover:shadow-lg'
          }`}
        >
          <span className={`text-base font-bold transition-all duration-300`}>
            {language === 'en' ? 'Yes' : 'ஆம்'}
          </span>
        </button>
      </div>
    </div>
  );
}
