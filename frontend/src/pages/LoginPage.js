/**
 * 重构后的登录页面
 * 
 * 功能说明：
 * - 用户登录认证：支持用户名和密码验证
 * - 表单验证：实时验证用户输入，提供友好的错误提示
 * - 密码显示切换：支持显示/隐藏密码功能
 * - 错误处理：统一的错误处理和显示机制
 * - 加载状态：登录过程中的加载状态反馈
 * 
 * 重构优势：
 * 1. 使用自定义 useForm Hook 统一管理表单状态和验证逻辑
 * 2. 采用通用 UI 组件（Button、Input、ErrorMessage）提高一致性
 * 3. 集成 AuthContext 进行统一的认证管理
 * 4. 更好的用户体验和交互设计
 * 5. 代码结构清晰，易于维护和扩展
 * 6. 统一的错误处理机制，提供友好的用户反馈
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useForm } from '../hooks/useForm';
import { Button, Input, ErrorMessage } from '../components/ui';

/**
 * 重构后的登录页面主组件
 * 
 * 核心功能：
 * - 集成 AuthContext 进行用户认证
 * - 使用 useForm Hook 管理表单状态和验证
 * - 使用通用 UI 组件提供一致的用户体验
 * - 支持密码显示/隐藏切换
 * - 提供完整的错误处理和加载状态反馈
 */
function LoginPage() {
  // 从认证上下文获取登录方法
  const { login } = useAuth();
  // 用于登录成功后的页面跳转
  const navigate = useNavigate();
  // 控制密码显示/隐藏状态
  const [showPassword, setShowPassword] = useState(false);
  
  // 表单验证规则函数
  const validateForm = (values) => {
    const errors = {};
    
    // 用户名验证规则
    if (!values.username) {
      errors.username = '请输入用户名';
    } else if (values.username.length < 3) {
      errors.username = '用户名至少需要3个字符';
    } else if (values.username.length > 50) {
      errors.username = '用户名不能超过50个字符';
    }
    
    // 密码验证规则
    if (!values.password) {
      errors.password = '请输入密码';
    } else if (values.password.length < 6) {
      errors.password = '密码至少需要6个字符';
    } else if (values.password.length > 100) {
      errors.password = '密码不能超过100个字符';
    }
    
    return errors;
  };

  // 表单提交处理逻辑
  const handleFormSubmit = async (values) => {
    try {
      // 调用认证上下文的登录方法
      await login(values.username, values.password);
      // 登录成功后跳转到学生管理页面
      navigate('/');
    } catch (error) {
      // 登录失败时抛出错误，由 useForm 处理
      throw new Error(error.message || '登录失败，请检查用户名和密码');
    }
  };

  // 使用自定义 useForm Hook 管理表单状态和验证逻辑
  const {
    values,           // 表单当前值（用户名、密码）
    errors,           // 表单验证错误信息
    isSubmitting: loading,     // 表单提交加载状态
    handleChange: handleFieldChange,     // 处理表单输入变化的方法
    handleSubmit,     // 处理表单提交的方法
    setFieldError     // 手动设置字段错误信息的方法
  } = useForm(
    // 表单初始值
    {
      username: '',
      password: ''
    },
    // 表单提交处理函数
    handleFormSubmit,
    // 表单验证函数
    validateForm
  );

  // 适配原有的 handleChange 接口
  const handleChange = (e) => {
    const { name, value } = e.target;
    handleFieldChange(name, value);
  };

  // 获取提交错误信息
  const error = errors.submit;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* 页面标题区域 */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          学生管理系统
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          请登录您的账户
        </p>
      </div>

      {/* 登录表单区域 */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* 错误信息显示 */}
          {error && (
            <div className="mb-4">
              <ErrorMessage error={error} />
            </div>
          )}
          
          {/* 登录表单 */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 用户名输入字段 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                用户名
              </label>
              <div className="mt-1">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={values.username}
                  onChange={handleChange}
                  error={errors.username}
                  disabled={loading}
                  placeholder="请输入用户名"
                />
              </div>
            </div>

            {/* 密码输入字段 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <div className="mt-1 relative">
                {/* 密码输入框 */}
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={values.password}
                  onChange={handleChange}
                  error={errors.password}
                  disabled={loading}
                  placeholder="请输入密码"
                  className="pr-10"
                />
                {/* 密码显示/隐藏切换按钮 */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* 登录提交按钮 */}
            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                disabled={loading}
                className="w-full"
              >
                登录
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;