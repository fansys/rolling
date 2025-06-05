import React, { useRef, useEffect } from 'react';
import { CheckIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import Input from './Input';
import Button from './Button';

const InlineEdit = ({
  value,
  onSave,
  onCancel,
  isEditing,
  onStartEdit,
  placeholder = '点击编辑',
  type = 'text',
  className = '',
  inputClassName = '',
  displayClassName = '',
  error,
  required = false,
  validate
}) => {
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const [editValue, setEditValue] = React.useState(value || '');
  const [localError, setLocalError] = React.useState('');
  const [isBlurring, setIsBlurring] = React.useState(false);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  const handleSave = async () => {
    const trimmedValue = editValue.trim();
    
    // 验证
    if (required && !trimmedValue) {
      setLocalError('此字段为必填项');
      return;
    }
    
    if (validate) {
      const validationError = validate(trimmedValue);
      if (validationError) {
        setLocalError(validationError);
        return;
      }
    }
    
    try {
      await onSave(trimmedValue);
      setLocalError('');
      // 保存成功后调用onCancel来关闭编辑状态
      onCancel();
    } catch (err) {
      setLocalError(err.message || '保存失败');
    }
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setLocalError('');
    onCancel();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const displayError = error || localError;

  if (isEditing) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className="flex-1">
          <Input
            ref={inputRef}
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={() => {
              // 设置延迟，让点击事件先触发
              setIsBlurring(true);
              setTimeout(() => {
                if (isBlurring) {
                  handleSave();
                }
                setIsBlurring(false);
              }, 100);
            }}
            className={inputClassName}
            error={displayError}
          />
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="success"
            onClick={(e) => {
              e.preventDefault();
              setIsBlurring(false); // 防止onBlur触发handleSave
              handleSave();
            }}
            icon={CheckIcon}
            className="p-1"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              setIsBlurring(false); // 防止onBlur触发handleSave
              handleCancel();
            }}
            icon={XMarkIcon}
            className="p-1"
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        group cursor-pointer hover:bg-gray-50 rounded px-2 py-1 
        flex items-center justify-between ${displayClassName} ${className}
      `}
      onClick={onStartEdit}
    >
      <span className={value ? 'text-gray-900' : 'text-gray-400'}>
        {value || placeholder}
      </span>
      <PencilIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default InlineEdit;