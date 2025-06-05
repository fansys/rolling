import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { useForm } from '../../hooks/useForm';

const AddUserForm = ({ isOpen, onClose, onSubmit }) => {
  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset
  } = useForm(
    {
      username: '',
      email: '',
      password: '',
      userType: 'user'
    },
    async (formData) => {
      await onSubmit(formData);
      reset();
      onClose();
    },
    (values) => {
      const errors = {};
      
      // 用户名验证
      if (!values.username?.trim()) {
        errors.username = '用户名不能为空';
      } else if (values.username.length < 3) {
        errors.username = '用户名至少需要3个字符';
      } else if (!/^[a-zA-Z0-9_]+$/.test(values.username)) {
        errors.username = '用户名只能包含字母、数字和下划线';
      }
      
      // 邮箱验证
      if (!values.email?.trim()) {
        errors.email = '邮箱不能为空';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = '请输入有效的邮箱地址';
      }
      
      // 密码验证
      if (!values.password?.trim()) {
        errors.password = '密码不能为空';
      } else if (values.password.length < 6) {
        errors.password = '密码至少需要6个字符';
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
      title="添加新用户"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="用户名"
          value={values.username}
          onChange={(e) => handleChange('username', e.target.value)}
          error={errors.username}
          placeholder="请输入用户名"
          required
        />
        
        <Input
          label="邮箱"
          type="email"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          placeholder="请输入邮箱地址"
          required
        />
        
        <Input
          label="密码"
          type="password"
          value={values.password}
          onChange={(e) => handleChange('password', e.target.value)}
          error={errors.password}
          placeholder="请输入密码"
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            用户类型 <span className="text-red-500">*</span>
          </label>
          <select
            value={values.userType}
            onChange={(e) => handleChange('userType', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        
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
            icon={PlusIcon}
            loading={isSubmitting}
          >
            添加用户
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddUserForm;