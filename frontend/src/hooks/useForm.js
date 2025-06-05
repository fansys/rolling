import { useState, useCallback } from 'react';

/**
 * 表单管理hook
 * @param {Object} initialValues - 初始值
 * @param {Function} onSubmit - 提交处理函数
 * @param {Function} validate - 验证函数
 */
export const useForm = (initialValues = {}, onSubmit, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // 清除该字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    // 验证
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setErrors({});
      await onSubmit(values);
    } catch (error) {
      setErrors({ submit: error.message || '提交失败' });
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldError = useCallback((field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setFieldError,
    setValues,
    setErrors
  };
};

/**
 * 内联编辑hook
 */
export const useInlineEdit = () => {
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [errors, setErrors] = useState({});

  const startEdit = useCallback((cellKey, currentValue) => {
    setEditingCell(cellKey);
    setEditValue(currentValue || '');
    setErrors({});
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
    setErrors({});
  }, []);

  const saveEdit = useCallback(async (onSave) => {
    if (!editingCell) return;
    
    try {
      await onSave(editingCell, editValue);
      // 保存成功后立即关闭编辑状态
      const currentCell = editingCell;
      setEditingCell(null);
      setEditValue('');
      setErrors({});
      return true;
    } catch (error) {
      setErrors({ [editingCell]: error.message || '保存失败' });
      return false;
    }
  }, [editingCell, editValue]);

  const handleKeyPress = useCallback((e, onSave) => {
    if (e.key === 'Enter') {
      saveEdit(onSave);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }, [saveEdit, cancelEdit]);

  return {
    editingCell,
    editValue,
    errors,
    setEditValue,
    startEdit,
    cancelEdit,
    saveEdit,
    handleKeyPress,
    setErrors
  };
};

/**
 * 确认对话框hook
 */
export const useConfirmDialog = () => {
  const [confirmState, setConfirmState] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  const showConfirm = useCallback((options) => {
    setConfirmState({
      show: true,
      title: options.title || '确认操作',
      message: options.message || '确定要执行此操作吗？',
      onConfirm: options.onConfirm,
      type: options.type || 'danger'
    });
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, show: false }));
  }, []);

  const handleConfirm = useCallback(async () => {
    if (confirmState.onConfirm) {
      try {
        await confirmState.onConfirm();
      } catch (error) {
        console.error('确认操作失败:', error);
      }
    }
    hideConfirm();
  }, [confirmState.onConfirm, hideConfirm]);

  return {
    confirmState,
    showConfirm,
    hideConfirm,
    handleConfirm
  };
};