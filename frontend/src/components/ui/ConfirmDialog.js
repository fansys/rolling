import React from 'react';
import { ExclamationTriangleIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'danger',
  confirmText = '确认',
  cancelText = '取消',
  loading = false
}) => {
  const typeConfig = {
    danger: {
      icon: ExclamationTriangleIcon,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      confirmVariant: 'danger'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      confirmVariant: 'warning'
    },
    info: {
      icon: CheckIcon,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      confirmVariant: 'primary'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('确认操作失败:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      closeOnOverlayClick={!loading}
    >
      <div className="text-center">
        {/* 图标 */}
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${config.iconBg} mb-4`}>
          <Icon className={`h-6 w-6 ${config.iconColor}`} />
        </div>
        
        {/* 标题 */}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        
        {/* 消息 */}
        <p className="text-sm text-gray-500 mb-6">
          {message}
        </p>
        
        {/* 按钮 */}
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;