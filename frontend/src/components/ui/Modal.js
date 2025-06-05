import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // 处理ESC键关闭
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
      />
      
      {/* 模态框容器 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`
            relative w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl 
            transform transition-all ${className}
          `}
        >
          {/* 头部 */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              )}
            </div>
          )}
          
          {/* 内容 */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;