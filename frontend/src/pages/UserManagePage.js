/**
 * 用户管理页面 - 重构版本
 * 
 * 功能说明：
 * - 用户列表展示：显示所有用户的基本信息
 * - 用户管理：创建、编辑、删除用户
 * - 密码管理：重置用户密码
 * - 权限管理：设置用户类型（普通用户/管理员）
 * 
 * 重构优势：
 * - 使用自定义Hooks分离业务逻辑
 * - 组件化拆分，提高代码复用性
 * - 统一的表单验证和错误处理
 * - 更好的用户体验和交互设计
 */
import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import NavBar from '../components/NavBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import UserTable from '../components/user/UserTable';
import AddUserForm from '../components/user/AddUserForm';
import ResetPasswordForm from '../components/user/ResetPasswordForm';
import { useUserManagement } from '../hooks/useUserManagement';
import { useInlineEdit, useConfirmDialog } from '../hooks/useForm';
import { useAuth } from '../contexts/AuthContext';

/**
 * 用户管理页面主组件
 * 
 * 使用useUserManagement Hook管理所有用户相关的业务逻辑
 * 包括用户的CRUD操作和密码管理
 */
function UserManagePage() {
  const { user: currentUser } = useAuth();
  
  // 使用自定义Hook管理用户相关的所有状态和操作
  const {
    users,              // 用户列表
    loading,            // 加载状态
    error,              // 错误信息
    setError,           // 设置错误信息
    createUser,         // 创建用户
    updateUser,         // 更新用户
    deleteUser,         // 删除用户
    resetPassword,      // 重置密码
    formatDateTime,     // 格式化日期时间
    getUserTypeText     // 获取用户类型文本
  } = useUserManagement();
  
  // 内联编辑状态
  const {
    editingCell,
    startEdit,
    cancelEdit,
    saveEdit
  } = useInlineEdit();
  
  // 使用确认对话框Hook管理删除用户的确认流程
  const {
    confirmState,           // 对话框状态
    showConfirm,           // 显示确认对话框
    hideConfirm,           // 隐藏对话框
    handleConfirm          // 确认操作
  } = useConfirmDialog();
  
  // 本地状态管理
  const [showAddForm, setShowAddForm] = useState(false);     // 是否显示添加用户表单
  const [resetPasswordState, setResetPasswordState] = useState({
    show: false,
    userId: null,
    userName: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  // 处理编辑保存
  const handleSaveEdit = async (cellKey, value) => {
    const [field, userId] = cellKey.split('-');
    await updateUser(parseInt(userId), { [field]: value });
  };

  // 处理添加用户
  const handleAddUser = async (userData) => {
    await createUser(userData);
    setSuccessMessage('用户创建成功');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleUpdateUser = async (userId, updateData) => {
    await updateUser(userId, updateData);
  };

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    showConfirm({
      title: '删除用户',
      message: `确定要删除用户"${user?.username}"吗？此操作不可撤销。`,
      onConfirm: () => deleteUser(userId)
    });
  };

  // 打开重置密码对话框
  const handleResetPassword = (userId) => {
    const user = users.find(u => u.id === userId);
    setResetPasswordState({
      show: true,
      userId,
      userName: user?.username || ''
    });
  };

  // 处理重置密码
  const handleResetPasswordSubmit = async (newPassword) => {
    await resetPassword(resetPasswordState.userId, newPassword);
    setResetPasswordState({ show: false, userId: null, userName: '' });
    setSuccessMessage('密码重置成功');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // 加载状态显示
  if (loading) {
    return (
      <div>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="text-center">
            <LoadingSpinner size="xl" />
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* 页面头部 */}
      <div className="pt-16">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    管理系统用户账户和权限
                  </p>
                </div>
                <Button
                  icon={PlusIcon}
                  onClick={() => setShowAddForm(true)}
                >
                  添加用户
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 消息提示 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {/* 错误提示 */}
          {error && (
            <ErrorMessage 
              error={error} 
              onDismiss={() => setError(null)}
              className="mb-4"
            />
          )}
          
          {/* 成功消息提示 */}
          {successMessage && (
            <ErrorMessage 
              error={successMessage}
              type="info"
              onDismiss={() => setSuccessMessage('')}
              className="mb-4"
            />
          )}
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {users.length === 0 ? (
              // 空状态
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  还没有用户
                </h3>
                <p className="text-gray-500 mb-6">
                  创建第一个用户开始管理
                </p>
                <Button
                  icon={PlusIcon}
                  onClick={() => setShowAddForm(true)}
                >
                  添加用户
                </Button>
              </div>
            ) : (
              // 用户表格
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    用户列表 ({users.length})
                  </h2>
                </div>
                
                {/* 用户表格组件 */}
                <UserTable
                  users={users}
                  currentUser={currentUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  onResetPassword={handleResetPassword}
                  editingCell={editingCell}
                  onStartEdit={startEdit}
                  onCancelEdit={cancelEdit}
                  formatDateTime={formatDateTime}
                  getUserTypeText={getUserTypeText}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 添加用户表单 */}
      <AddUserForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddUser}
      />

      {/* 重置密码表单 */}
      <ResetPasswordForm
        isOpen={resetPasswordState.show}
        onClose={() => setResetPasswordState({ show: false, userId: null, userName: '' })}
        onSubmit={handleResetPasswordSubmit}
        userName={resetPasswordState.userName}
      />

      {/* 删除用户确认对话框 */}
      <ConfirmDialog
        isOpen={confirmState.show}
        onClose={hideConfirm}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
      />
    </div>
  );
}

export default UserManagePage;