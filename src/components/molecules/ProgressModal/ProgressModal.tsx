import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../../atoms/Icon';
import { ProgressModalProps } from './ProgressModal.types';
import { colors, spacing, borderRadius, shadows, animation, zIndex } from '../../../tokens';

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

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: showOverlay ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: zIndex.modal,
    pointerEvents: showOverlay ? 'auto' : 'none'
  };

  const modalStyles: React.CSSProperties = {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.xl,
    padding: spacing[6],
    maxWidth: '480px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    pointerEvents: 'auto'
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[6]
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 600,
    color: colors.gray[900],
    margin: 0
  };

  const stepContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[4]
  };

  const getStepStyles = (status: string): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'flex-start',
      gap: spacing[3]
    };

    return baseStyles;
  };

  const getIconContainerStyles = (status: string): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      width: '32px',
      height: '32px',
      borderRadius: borderRadius.full,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: `all ${animation.duration.normal} ${animation.easing.inOut}`
    };

    switch (status) {
      case 'completed':
        return {
          ...baseStyles,
          backgroundColor: colors.success[100],
          color: colors.success[600]
        };
      case 'active':
        return {
          ...baseStyles,
          backgroundColor: colors.primary[100],
          color: colors.primary[600]
        };
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: colors.error[100],
          color: colors.error[600]
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: colors.gray[100],
          color: colors.gray[400]
        };
    }
  };

  const stepContentStyles: React.CSSProperties = {
    flex: 1,
    paddingTop: '4px'
  };

  const stepLabelStyles = (status: string): React.CSSProperties => ({
    fontSize: '16px',
    fontWeight: status === 'active' ? 600 : 400,
    color: status === 'error' ? colors.error[700] : colors.gray[900],
    marginBottom: spacing[1]
  });

  const stepMessageStyles: React.CSSProperties = {
    fontSize: '14px',
    color: colors.gray[600],
    margin: 0
  };

  const progressBarContainerStyles: React.CSSProperties = {
    height: '4px',
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginTop: spacing[2]
  };

  const progressBarStyles = (progress: number): React.CSSProperties => ({
    height: '100%',
    backgroundColor: colors.primary[500],
    width: `${progress}%`,
    transition: `width ${animation.duration.normal} ${animation.easing.inOut}`
  });

  const cancelButtonStyles: React.CSSProperties = {
    marginTop: spacing[6],
    padding: `${spacing[2]} ${spacing[4]}`,
    backgroundColor: colors.gray[100],
    color: colors.gray[700],
    border: `1px solid ${colors.gray[300]}`,
    borderRadius: borderRadius.md,
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: `all ${animation.duration.fast} ${animation.easing.inOut}`
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Icon name="check-circle" size="sm" />;
      case 'active':
        return (
          <div style={{
            width: '16px',
            height: '16px',
            border: `2px solid ${colors.primary[600]}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        );
      case 'error':
        return <Icon name="x-circle" size="sm" />;
      default:
        return <div style={{
          width: '16px',
          height: '16px',
          backgroundColor: colors.gray[400],
          borderRadius: '50%'
        }} />;
    }
  };

  return createPortal(
    <div style={overlayStyles}>
      <div style={modalStyles}>
        <div style={headerStyles}>
          <h2 style={titleStyles}>{title}</h2>
        </div>
        
        <div style={stepContainerStyles}>
          {steps.map((step) => (
            <div key={step.id} style={getStepStyles(step.status)}>
              <div style={getIconContainerStyles(step.status)}>
                {getStepIcon(step.status)}
              </div>
              
              <div style={stepContentStyles}>
                <div style={stepLabelStyles(step.status)}>
                  {step.label}
                </div>
                
                {step.message && (
                  <p style={stepMessageStyles}>{step.message}</p>
                )}
                
                {step.status === 'active' && step.progress !== undefined && (
                  <div style={progressBarContainerStyles}>
                    <div style={progressBarStyles(step.progress)} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {canCancel && onCancel && !allStepsCompleted && (
          <button
            onClick={onCancel}
            style={cancelButtonStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.gray[200];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.gray[100];
            }}
          >
            Cancel Operation
          </button>
        )}
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>,
    document.body
  );
};