
import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center mb-2">
        <div className="h-1 bg-gray-200 flex-1 rounded-full">
          <div 
            className="h-1 bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm mb-1",
              index < currentStep 
                ? "bg-primary text-white"
                : index === currentStep
                  ? "border-2 border-primary text-primary"
                  : "bg-gray-100 text-gray-400"
            )}>
              {index < currentStep ? "✓" : index + 1}
            </div>
            <span className={cn(
              "text-xs hidden sm:block",
              index === currentStep ? "text-primary font-medium" : "text-gray-500"
            )}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
