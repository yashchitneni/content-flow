import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../../atoms/Icon';
import { ProgressModalProps } from './ProgressModal.types';

export const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  title,
  steps,
  currentStep,
  canCancel = false,
  onCancel,
  onComplete,
  showOverlay = true
}) => {
  const allStepsCompleted = steps.every(step => step.status === 'completed');
  
  useEffect(() => {
    if (allStepsCompleted && onComplete) {
      // Delay completion callback to show final state
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [allStepsCompleted, onComplete]);

  if (!isOpen) return null;

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Icon name="check-circle" size="sm" />;
      case 'active':
        return (
          <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        );
      case 'error':
        return <Icon name="x-circle" size="sm" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getIconContainerClasses = (status: string) => {
    const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300";
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-success-100 text-success-600`;
      case 'active':
        return `${baseClasses} bg-primary-100 text-primary-600`;
      case 'error':
        return `${baseClasses} bg-error-100 text-error-600`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-400`;
    }
  };

  const getStepLabelClasses = (status: string) => {
    return `text-base ${status === 'active' ? 'font-semibold' : 'font-normal'} ${
      status === 'error' ? 'text-error-700' : 'text-gray-900'
    } mb-1`;
  };

  return createPortal(
    <div className={`fixed inset-0 ${showOverlay ? 'bg-black/50' : 'bg-transparent'} flex items-center justify-center z-50 ${showOverlay ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-[480px] w-[90%] max-h-[80vh] overflow-auto pointer-events-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 m-0">{title}</h2>
        </div>
        
        <div className="flex flex-col gap-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start gap-3">
              <div className={getIconContainerClasses(step.status)}>
                {getStepIcon(step.status)}
              </div>
              
              <div className="flex-1 pt-1">
                <div className={getStepLabelClasses(step.status)}>
                  {step.label}
                </div>
                
                {step.message && (
                  <p className="text-sm text-gray-600 m-0">{step.message}</p>
                )}
                
                {step.status === 'active' && step.progress !== undefined && (
                  <div 
                    className="h-1 bg-gray-200 rounded-full overflow-hidden mt-2"
                    style={{'--progress-width': `${step.progress}%`} as React.CSSProperties}
                  >
                    <div className="h-full bg-primary-500 w-[var(--progress-width)] transition-[width] duration-300" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {canCancel && onCancel && !allStepsCompleted && (
          <button
            onClick={onCancel}
            className="mt-6 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md text-base font-medium cursor-pointer transition-colors duration-150 hover:bg-gray-200"
          >
            Cancel Operation
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};