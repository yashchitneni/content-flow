import React, { useState } from 'react';
import {
  ErrorFactory,
  withErrorHandling,
  retry,
  useErrorHandler,
  useToast,
  ProgressModal,
  LoadingState,
  withErrorBoundary,
  CircuitBreaker
} from '../lib/error-integration';
import { ProgressStep } from '../components/molecules/ProgressModal/ProgressModal.types';

// Example component showing error handling patterns
const FileUploadExample: React.FC = () => {
  const { handleError } = useErrorHandler();
  const toast = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSteps, setUploadSteps] = useState<ProgressStep[]>([]);

  // Example 1: Basic error handling with toast notifications
  const handleBasicOperation = async () => {
    try {
      // Simulate an operation that might fail
      const result = await simulateOperation();
      toast.showSuccess('Operation completed successfully!');
    } catch (error) {
      handleError(error as Error);
    }
  };

  // Example 2: File upload with progress modal
  const handleFileUpload = async (file: File) => {
    const steps: ProgressStep[] = [
      { id: 'validate', label: 'Validating file', status: 'pending' },
      { id: 'upload', label: 'Uploading to server', status: 'pending' },
      { id: 'process', label: 'Processing file', status: 'pending' },
      { id: 'complete', label: 'Upload complete', status: 'pending' }
    ];
    
    setUploadSteps(steps);
    setIsUploading(true);

    try {
      // Step 1: Validate file
      updateStep('validate', 'active', 'Checking file format...');
      await validateFile(file);
      updateStep('validate', 'completed');

      // Step 2: Upload file with retry
      updateStep('upload', 'active', 'Uploading...', 0);
      await withErrorHandling(
        () => uploadFile(file, (progress) => {
          updateStep('upload', 'active', `Uploading... ${Math.round(progress)}%`, progress);
        }),
        {
          type: 'retry',
          config: {
            maxAttempts: 3,
            initialDelay: 1000,
            maxDelay: 5000,
            backoffMultiplier: 2
          }
        }
      );
      updateStep('upload', 'completed');

      // Step 3: Process file
      updateStep('process', 'active', 'Processing your file...');
      await processFile(file);
      updateStep('process', 'completed');

      // Step 4: Complete
      updateStep('complete', 'completed');
      toast.showSuccess('File uploaded successfully!');
      
    } catch (error) {
      const appError = error as Error;
      const failedStep = uploadSteps.find(s => s.status === 'active');
      if (failedStep) {
        updateStep(failedStep.id, 'error', appError.message);
      }
      handleError(appError);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
      }, 2000);
    }
  };

  // Example 3: Circuit breaker for external API
  const apiCircuitBreaker = new CircuitBreaker(
    () => callExternalAPI(),
    {
      failureThreshold: 3,
      resetTimeout: 30000,
      onStateChange: (state) => {
        if (state === 'open') {
          toast.showWarning('Service temporarily unavailable. Will retry in 30 seconds.');
        } else if (state === 'closed') {
          toast.showInfo('Service connection restored.');
        }
      }
    }
  );

  const handleAPICall = async () => {
    try {
      const result = await apiCircuitBreaker.execute();
      toast.showSuccess('API call successful!');
    } catch (error) {
      handleError(error as Error);
    }
  };

  // Helper functions
  const updateStep = (
    stepId: string,
    status: ProgressStep['status'],
    message?: string,
    progress?: number
  ) => {
    setUploadSteps(prev => prev.map(step =>
      step.id === stepId
        ? { ...step, status, message, progress }
        : step
    ));
  };

  const simulateOperation = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (Math.random() > 0.5) {
      throw ErrorFactory.networkError('Failed to connect to server');
    }
  };

  const validateFile = async (file: File) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (file.size > 10 * 1024 * 1024) {
      throw ErrorFactory.validationError(
        'fileSize',
        'File size exceeds 10MB limit',
        'Please select a file smaller than 10MB'
      );
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'video/mp4'];
    if (!validTypes.includes(file.type)) {
      throw ErrorFactory.validationError(
        'fileType',
        `Invalid file type: ${file.type}`,
        'Please select a JPEG, PNG, or MP4 file'
      );
    }
  };

  const uploadFile = async (file: File, onProgress: (progress: number) => void) => {
    // Simulate upload with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      onProgress(i);
      
      // Simulate random network error
      if (i === 50 && Math.random() > 0.7) {
        throw ErrorFactory.networkError('Upload connection lost');
      }
    }
  };

  const processFile = async (file: File) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate processing error
    if (Math.random() > 0.8) {
      throw ErrorFactory.apiError(
        '/api/process',
        500,
        'Internal server error during processing'
      );
    }
  };

  const callExternalAPI = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate API failures
    if (Math.random() > 0.3) {
      throw ErrorFactory.apiError(
        '/api/external',
        503,
        'Service temporarily unavailable'
      );
    }
    
    return { data: 'success' };
  };

  // Component UI
  return (
    <div style={{ padding: '20px' }}>
      <h2>Error Handling Examples</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Basic Error Handling</h3>
        <button onClick={handleBasicOperation}>
          Try Operation (50% chance of error)
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>File Upload with Progress</h3>
        <input
          type="file"
          accept="image/*,video/mp4"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Circuit Breaker Example</h3>
        <button onClick={handleAPICall}>
          Call External API (70% chance of error)
        </button>
      </div>
      
      <ProgressModal
        isOpen={isUploading}
        title="Uploading File"
        steps={uploadSteps}
        canCancel={true}
        onCancel={() => setIsUploading(false)}
      />
    </div>
  );
};

// Wrap component with error boundary
export default withErrorBoundary(FileUploadExample, {
  fallback: (error, errorInfo) => (
    <div style={{ padding: '20px', color: 'red' }}>
      <h2>Component Error</h2>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>
        Reload Page
      </button>
    </div>
  )
});