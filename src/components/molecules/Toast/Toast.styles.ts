import { colors, spacing, borderRadius, shadows, animation } from '../../../tokens';
import { ToastVariant } from './Toast.types';

export const toastStyles = {
  container: `
    display: flex;
    align-items: flex-start;
    gap: ${spacing[3]};
    padding: ${spacing[4]};
    border-radius: ${borderRadius.md};
    box-shadow: ${shadows.md};
    background-color: ${colors.white};
    border: 1px solid;
    min-width: 320px;
    max-width: 480px;
    transition: all ${animation.duration.normal} ${animation.easing.inOut};
    position: relative;
  `,
  
  variants: {
    success: {
      borderColor: colors.success[500],
      iconColor: colors.success[500],
      backgroundColor: colors.success[50]
    },
    error: {
      borderColor: colors.error[500],
      iconColor: colors.error[500],
      backgroundColor: colors.error[50]
    },
    warning: {
      borderColor: colors.warning[500],
      iconColor: colors.warning[500],
      backgroundColor: colors.warning[50]
    },
    info: {
      borderColor: colors.info[500],
      iconColor: colors.info[500],
      backgroundColor: colors.info[50]
    }
  },
  
  iconContainer: `
    flex-shrink: 0;
    margin-top: 2px;
  `,
  
  content: `
    flex: 1;
    min-width: 0;
  `,
  
  title: `
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
    color: ${colors.gray[900]};
    margin: 0;
  `,
  
  message: `
    font-size: 14px;
    line-height: 20px;
    color: ${colors.gray[700]};
    margin-top: ${spacing[1]};
  `,
  
  actions: `
    display: flex;
    gap: ${spacing[2]};
    margin-top: ${spacing[3]};
  `,
  
  actionButton: `
    font-size: 14px;
    font-weight: 500;
    color: ${colors.primary[600]};
    background: none;
    border: none;
    padding: ${spacing[1]} ${spacing[2]};
    border-radius: ${borderRadius.sm};
    cursor: pointer;
    transition: background-color ${animation.duration.fast} ${animation.easing.inOut};
    
    &:hover {
      background-color: ${colors.gray[100]};
    }
    
    &:focus {
      outline: 2px solid ${colors.primary[400]};
      outline-offset: 2px;
    }
  `,
  
  closeButton: `
    position: absolute;
    top: ${spacing[2]};
    right: ${spacing[2]};
    padding: ${spacing[1]};
    background: none;
    border: none;
    border-radius: ${borderRadius.sm};
    cursor: pointer;
    color: ${colors.gray[500]};
    transition: all ${animation.duration.fast} ${animation.easing.inOut};
    
    &:hover {
      color: ${colors.gray[700]};
      background-color: ${colors.gray[100]};
    }
    
    &:focus {
      outline: 2px solid ${colors.primary[400]};
      outline-offset: 2px;
    }
  `
};

export function getVariantStyles(variant: ToastVariant) {
  return toastStyles.variants[variant];
}