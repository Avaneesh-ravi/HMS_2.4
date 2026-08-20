interface ProgressStepsProps {
  currentStep: number;
  steps: { title: string; tamilTitle: string }[];
  onStepClick: (index: number) => void;
}

export function ProgressSteps({ currentStep, steps, onStepClick }: ProgressStepsProps) {
  return (
    <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex items-start justify-between min-w-[700px] px-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center relative z-10">
              <button
                onClick={() => onStepClick(index)}
                className="group cursor-pointer focus:outline-none flex flex-col items-center"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0 ${
                    index < currentStep
                      ? 'bg-teal-600 border-teal-600'
                      : index === currentStep
                      ? 'bg-white border-teal-600 ring-4 ring-teal-100'
                      : 'bg-white border-gray-300 group-hover:border-teal-400'
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      index < currentStep ? 'text-white' : index === currentStep ? 'text-teal-600' : 'text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </span>
                </div>
                <div className="mt-3 text-center w-32 px-1">
                  <p
                    className={`text-[11px] font-bold leading-tight ${
                      index <= currentStep ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p
                    className={`text-[10px] mt-1 font-medium ${
                      index <= currentStep ? 'text-teal-600' : 'text-gray-400'
                    }`}
                  >
                    {step.tamilTitle}
                  </p>
                </div>
              </button>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 px-2 h-0.5 mt-5 relative">
                <div 
                  className={`h-full w-full transition-all duration-500 ${
                    index < currentStep ? 'bg-teal-600' : 'bg-gray-300'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
