import * as Switch from '@radix-ui/react-switch';

interface ToggleSwitchProps {
  label: string;
  tamilLabel: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  required?: boolean;
}

export function ToggleSwitch({ label, tamilLabel, checked, onCheckedChange, required }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <label className="text-sm font-medium text-gray-700">
        {label} {tamilLabel && <span className="text-teal-600">/ {tamilLabel}</span>}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-3">
        <span className={`text-sm ${!checked ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
          No / இல்லை
        </span>
        <Switch.Root
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="w-14 h-7 bg-gray-300 rounded-full relative data-[state=checked]:bg-teal-600 transition-colors outline-none cursor-pointer"
        >
          <Switch.Thumb className="block w-6 h-6 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[30px] shadow-lg" />
        </Switch.Root>
        <span className={`text-sm ${checked ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
          Yes / ஆம்
        </span>
      </div>
    </div>
  );
}
