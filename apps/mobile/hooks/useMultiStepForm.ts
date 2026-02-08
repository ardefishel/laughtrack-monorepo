import { useState, useCallback } from 'react';
import { hooksLogger } from '@/lib/loggers';

export interface UseMultiStepFormReturn<T extends string> {
  currentStep: T;
  stepIndex: number;
  goToStep: (step: T) => void;
  goNext: () => void;
  goBack: () => void;
  reset: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function useMultiStepForm<T extends string>(
  steps: T[]
): UseMultiStepFormReturn<T> {
  const [currentStep, setCurrentStep] = useState<T>(steps[0]);

  const stepIndex = steps.indexOf(currentStep);

  const goToStep = useCallback((step: T) => {
    hooksLogger.debug(`[useMultiStepForm] go to step: ${step}`);
    setCurrentStep(step);
  }, []);

  const goNext = useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      hooksLogger.debug(`[useMultiStepForm] go next: ${currentStep} -> ${nextStep}`);
      setCurrentStep(nextStep);
    }
  }, [currentStep, steps]);

  const goBack = useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      hooksLogger.debug(`[useMultiStepForm] go back: ${currentStep} -> ${prevStep}`);
      setCurrentStep(prevStep);
    }
  }, [currentStep, steps]);

  const reset = useCallback(() => {
    hooksLogger.debug(`[useMultiStepForm] reset to first step: ${steps[0]}`);
    setCurrentStep(steps[0]);
  }, [steps]);

  return {
    currentStep,
    stepIndex,
    goToStep,
    goNext,
    goBack,
    reset,
    isFirstStep: stepIndex === 0,
    isLastStep: stepIndex === steps.length - 1,
  };
}
