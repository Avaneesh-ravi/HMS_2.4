import { ReactNode } from 'react';

interface FeedbackCardProps {
  title: string;
  tamilTitle: string;
  icon: ReactNode;
  children: ReactNode;
  required?: boolean;
  cardColor?: string;
}

export function FeedbackCard({ title, tamilTitle, icon, children, required, cardColor }: FeedbackCardProps) {
  return (
    <div className="rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow h-full flex flex-col" style={{ backgroundColor: cardColor || '#ffffff' }}>
      <div className="flex items-center gap-3 mb-4 min-h-[44px]">
        <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-gray-900 leading-snug">
            {title}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </h3>
          {tamilTitle && <p className="text-sm text-teal-600">{tamilTitle}</p>}
        </div>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
