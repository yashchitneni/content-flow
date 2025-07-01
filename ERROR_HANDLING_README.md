# ContentFlow Error Handling System

This comprehensive error handling system provides robust error management, user feedback, and recovery mechanisms for the ContentFlow application.

## Core Components

### 1. Error Types and Factory (`src/lib/errors/`)

**Error Types:**
- `NETWORK` - Network connectivity issues
- `VALIDATION` - Input validation failures
- `FILE_SYSTEM` - File operation errors
- `API` - External API errors
- `AUTH` - Authentication errors
- `PERMISSION` - Permission denied errors
- `TIMEOUT` - Operation timeouts
- `RATE_LIMIT` - API rate limiting
- `UNKNOWN` - Unexpected errors

**Error Factory Usage:**
```typescript
import { ErrorFactory } from '@/lib/errors';

// Network error
throw ErrorFactory.networkError('Connection failed');

// Validation error
throw ErrorFactory.validationError(
  'email',
  'Invalid email format',
  'Please enter a valid email address'
);

// API error
throw ErrorFactory.apiError(
  '/api/upload',
  500,
  'Server error',
  'Upload failed. Please try again.'
);
```

### 2. Toast Notifications (`src/components/molecules/Toast/`)

**Features:**
- Success, error, warning, and info variants
- Auto-dismiss with configurable duration
- Action buttons for user interaction
- Accessible with ARIA attributes

**Usage:**
```typescript
import { useToast } from '@/lib/error-integration';

const toast = useToast();

// Show notifications
toast.showSuccess('File uploaded successfully!');
toast.showError('Upload failed', 'Please check your connection');
toast.showWarning('Large file detected');
toast.showInfo('Processing may take a few minutes');

// Custom toast with action
toast.showToast({
  variant: 'error',
  title: 'Connection lost',
  message: 'Unable to save changes',
  action: {
    label: 'Retry',
    onClick: () => retryOperation()
  }
});
```

### 3. Error Boundaries (`src/components/organisms/ErrorBoundary/`)

**Features:**
- Catches React component errors
- Customizable fallback UI
- Auto-recovery with reset keys
- Development mode error details

**Usage:**
```typescript
import { ErrorBoundary, withErrorBoundary } from '@/lib/error-integration';

// As a wrapper component
<ErrorBoundary
  fallback={(error) => <CustomErrorUI error={error} />}
  onError={(error, errorInfo) => logError(error)}
  resetKeys={[userId, projectId]}
>
  <YourComponent />
</ErrorBoundary>

// As a HOC
export default withErrorBoundary(YourComponent, {
  isolate: true,
  fallback: (error) => <MinimalErrorUI error={error} />
});
```

### 4. Retry Mechanisms (`src/lib/retry/`)

**Features:**
- Configurable retry attempts and delays
- Exponential backoff
- Jitter to prevent thundering herd
- Circuit breaker pattern

**Usage:**
```typescript
import { retry, withErrorHandling, CircuitBreaker } from '@/lib/error-integration';

// Basic retry
const result = await retry(
  () => fetchData(),
  {
    maxAttempts: 3,
    initialDelay: 1000,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}`);
    }
  }
);

// With error handling
const data = await withErrorHandling(
  () => uploadFile(file),
  {
    type: 'retry',
    config: {
      maxAttempts: 5,
      retryableErrors: [ErrorType.NETWORK, ErrorType.TIMEOUT]
    }
  }
);

// Circuit breaker for external services
const apiBreaker = new CircuitBreaker(
  () => callExternalAPI(),
  {
    failureThreshold: 3,
    resetTimeout: 30000
  }
);
```

### 5. Progress Modal (`src/components/molecules/ProgressModal/`)

**Features:**
- Multi-step progress indication
- Real-time status updates
- Progress bars for long operations
- Cancellable operations

**Usage:**
```typescript
import { ProgressModal } from '@/lib/error-integration';

const [steps, setSteps] = useState<ProgressStep[]>([
  { id: 'upload', label: 'Uploading file', status: 'pending' },
  { id: 'process', label: 'Processing', status: 'pending' },
  { id: 'complete', label: 'Complete', status: 'pending' }
]);

<ProgressModal
  isOpen={isProcessing}
  title="Importing Videos"
  steps={steps}
  canCancel={true}
  onCancel={handleCancel}
  onComplete={handleComplete}
/>
```

### 6. Logging System (`src/lib/logging/`)

**Features:**
- Multiple log levels (DEBUG, INFO, WARN, ERROR, FATAL)
- Structured logging with context
- Remote logging support
- Automatic error serialization

**Usage:**
```typescript
import { logger } from '@/lib/logging';

// Log messages
logger.info('File upload started', { fileSize: file.size });
logger.warn('Large file detected', { size: file.size });
logger.error('Upload failed', error, { attempt: 3 });

// Log app errors
logger.logAppError(appError, { userId, operation: 'upload' });
```

## Integration Examples

### Tauri Command Error Handling

```typescript
import { invokeTauriCommand } from '@/lib/error-integration';

const result = await invokeTauriCommand(
  'process_video',
  { path: videoPath },
  {
    loadingMessage: 'Processing video...',
    successMessage: 'Video processed successfully!',
    errorMessage: 'Failed to process video'
  }
);
```

### Component Error Handling Pattern

```typescript
import { useErrorHandler, useToast } from '@/lib/error-integration';

const MyComponent = () => {
  const { handleError } = useErrorHandler();
  const toast = useToast();
  
  const handleOperation = async () => {
    try {
      const result = await riskyOperation();
      toast.showSuccess('Operation completed!');
    } catch (error) {
      handleError(error as Error);
    }
  };
  
  return <button onClick={handleOperation}>Perform Operation</button>;
};
```

### File Operations with Feedback

```typescript
const handleFileImport = async (files: File[]) => {
  const steps = files.map((file, i) => ({
    id: `file-${i}`,
    label: `Importing ${file.name}`,
    status: 'pending' as const
  }));
  
  setProgressSteps(steps);
  setShowProgress(true);
  
  for (let i = 0; i < files.length; i++) {
    try {
      updateStep(`file-${i}`, 'active');
      await importFile(files[i]);
      updateStep(`file-${i}`, 'completed');
    } catch (error) {
      updateStep(`file-${i}`, 'error', error.message);
      handleError(error);
      break;
    }
  }
};
```

## Best Practices

1. **Always provide user-friendly messages:**
   ```typescript
   throw ErrorFactory.create(
     ErrorType.API,
     'Technical: API returned 500', // For logs
     'Unable to save your changes. Please try again.' // For users
   );
   ```

2. **Use appropriate error severity:**
   - `LOW` - Minor issues, info toasts
   - `MEDIUM` - Warnings, recoverable errors
   - `HIGH` - Errors requiring user action
   - `CRITICAL` - System failures, data loss risk

3. **Configure retry strategies appropriately:**
   - Network errors: Exponential backoff
   - Rate limits: Fixed delay
   - Validation errors: Don't retry

4. **Wrap async operations:**
   ```typescript
   const data = await withErrorHandling(
     () => fetchData(),
     { type: 'retry' }
   );
   ```

5. **Use error boundaries for component isolation:**
   ```typescript
   // Isolate feature components
   export default withErrorBoundary(FeatureComponent, {
     isolate: true
   });
   ```

## Configuration

Configure the error handling system in your app initialization:

```typescript
import { errorHandler, logger } from '@/lib/error-integration';

// Configure error handler
errorHandler.configure({
  onError: (error) => {
    // Global error handling
  },
  defaultRecoveryStrategies: new Map([
    [ErrorType.NETWORK, { type: 'retry' }]
  ])
});

// Configure logger
logger.configure({
  minLevel: LogLevel.INFO,
  enableRemote: true,
  remoteEndpoint: 'https://logs.example.com'
});
```

## Testing

The error handling system is designed to be easily testable:

```typescript
// Test error creation
const error = ErrorFactory.validationError('email', 'Invalid format');
expect(error.type).toBe(ErrorType.VALIDATION);
expect(error.userMessage).toContain('Invalid');

// Test retry logic
const mockOperation = jest.fn()
  .mockRejectedValueOnce(new Error('Network error'))
  .mockResolvedValueOnce('success');

const result = await retry(mockOperation, { maxAttempts: 2 });
expect(result).toBe('success');
expect(mockOperation).toHaveBeenCalledTimes(2);
```

## Migration from Basic Error Handling

Replace basic try-catch blocks:

```typescript
// Before
try {
  await uploadFile(file);
  alert('Success!');
} catch (error) {
  console.error(error);
  alert('Failed!');
}

// After
try {
  await withErrorHandling(
    () => uploadFile(file),
    { type: 'retry' }
  );
  toast.showSuccess('File uploaded successfully!');
} catch (error) {
  handleError(error);
}
```

This error handling system ensures a consistent, user-friendly experience across the ContentFlow application while providing developers with powerful tools for error management and recovery.