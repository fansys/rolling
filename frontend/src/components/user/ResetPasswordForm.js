import React from 'react';
import { KeyIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { useForm } from '../../hooks/useForm';

const ResetPasswordForm = ({ isOpen, onClose, onSubmit, userName }) => {
  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset
  } = useForm(
    { password: '', confirmPassword: '' },
    async (formData) => {
      await onSubmit(formData.password);
      reset();
      onClose();
    },
    (values) => {
      const errors = {};
      
      if (!values.password?.trim()) {
        errors.password = '新密码不能为空';
      } else if (values.password.length < 6) {
        errors.password = '密码至少需要6个字符';
      }
      
      if (!values.confirmPassword?.trim()) {
        errors.confirmPassword = '请确认密码';
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = '两次输入的密码不一致';
      }
      
      return errors;
    }
  );

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`重置密码 - ${userName}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          为用户 <strong>{userName}</strong> 设置新密码
        </div>
        
        <Input
          label="新密码"
          type="password"
          value={values.password}
          onChange={(e) => handleChange('password', e.target.value)}
          error={errors.password}
          placeholder="请输入新密码"
          required
        />
        
        <Input
          label="确认密码"
          type="password"
          value={values.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          placeholder="请再次输入新密码"
          required
        />
        
        {errors.submit && (
          <div className="text-red-600 text-sm">
            {errors.submit}
          </div>
        )}
        
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            取消
          </Button>
          
          <Button
            type="submit"
            icon={KeyIcon}
            loading={isSubmitting}
          >
            重置密码
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ResetPasswordForm;