import React, { useState, useEffect, useRef } from 'react';
import NavBar from "../components/NavBar";
import ConfirmModal from '../components/ConfirmModal';
import { PlusIcon, TrashIcon, UserIcon, ShieldCheckIcon, KeyIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';

function UserManagePage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    userType: 'user',
    email: '',
    password: ''
  });
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [errors, setErrors] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resetPasswordUserId, setResetPasswordUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  // 加载用户数据
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await ApiService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('加载用户失败:', error);
      setErrors({ general: '加载用户失败，请刷新页面重试' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      setErrors({ general: '请填写所有必填字段' });
      return;
    }
    
    try {
      const createdUser = await ApiService.createUser(newUser);
      setUsers([...users, createdUser]);
      setNewUser({
        username: '',
        userType: 'user',
        email: '',
        password: ''
      });
      setShowAddForm(false);
      setErrors({});
    } catch (error) {
      console.error('创建用户失败:', error);
      setErrors({ general: '创建用户失败，请重试' });
    }
  };

  const handleDelete = (id) => {
    setDeleteUserId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await ApiService.deleteUser(deleteUserId);
      setUsers(users.filter(u => u.id !== deleteUserId));
    } catch (error) {
      console.error('删除用户失败:', error);
      setErrors({ general: '删除用户失败，请重试' });
    }
  };

  // 格式化时间显示
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-');
  };

  const startEdit = (cellId, value) => {
    setEditingCell(cellId);
    setEditValue(value || '');
    setErrors(prev => ({ ...prev, [cellId]: false }));
  };

  const saveEdit = async () => {
    if (!editValue.trim()) {
      setErrors(prev => ({ ...prev, [editingCell]: true }));
      return;
    }

    const [field, userId] = editingCell.split('-');
    const userIdNum = parseInt(userId);
    
    try {
      const updateData = { [field]: editValue.trim() };
      await ApiService.updateUser(userIdNum, updateData);
      
      setUsers(prev => prev.map(user => 
        user.id === userIdNum 
        ? { ...user, [field]: editValue.trim() }
        : user
      ));
      
      setEditingCell(null);
      setEditValue('');
      setErrors(prev => ({ ...prev, [editingCell]: false }));
    } catch (error) {
      console.error('更新用户失败:', error);
      setErrors({ general: '更新用户失败，请重试' });
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
    setErrors(prev => ({ ...prev, [editingCell]: false }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const handleBlur = () => {
    saveEdit();
  };

  const handleResetPassword = (userId) => {
    setResetPasswordUserId(userId);
    setNewPassword('');
    setShowResetPasswordModal(true);
  };

  const confirmResetPassword = async () => {
    if (!newPassword.trim()) {
      setErrors({ resetPassword: '请输入新密码' });
      return;
    }

    try {
      await ApiService.resetUserPassword(resetPasswordUserId, newPassword);
      setShowResetPasswordModal(false);
      setResetPasswordUserId(null);
      setNewPassword('');
      setErrors({});
      setSuccessMessage('密码重置成功！');
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('重置密码失败:', error);
      setErrors({ resetPassword: error.message || '重置密码失败，请重试' });
    }
  };

  const cancelResetPassword = () => {
    setShowResetPasswordModal(false);
    setResetPasswordUserId(null);
    setNewPassword('');
    setErrors(prev => ({ ...prev, resetPassword: '' }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="w-full max-w-7xl mx-auto pt-20 sm:pt-20 lg:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="w-full max-w-7xl mx-auto pt-20 sm:pt-20 lg:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">用户管理</h2>
          
          {/* 错误提示 */}
          {errors.general && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{errors.general}</p>
            </div>
          )}
          
          {/* 添加用户按钮 */}
          <div className="mb-4 sm:mb-6">
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full sm:w-auto bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center sm:justify-start gap-2 font-medium"
            >
              <PlusIcon className="w-5 h-5" />
              添加用户
            </button>
          </div>

          {/* 添加用户表单 */}
          {showAddForm && (
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">添加新用户</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用户名 *</label>
                  <input
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入用户名"
                    value={newUser.username}
                    onChange={e => setNewUser({...newUser, username: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 *</label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入邮箱"
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">密码 *</label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入密码"
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用户类型</label>
                  <select
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newUser.userType}
                    onChange={e => setNewUser({...newUser, userType: e.target.value})}
                  >
                    <option value="user">普通用户</option>
                    <option value="admin">管理员</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button 
                  onClick={handleAdd}
                  className="w-full sm:w-auto bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  确认添加
                </button>
                <button 
                  onClick={() => {
                    setShowAddForm(false);
                    setNewUser({
                      username: '',
                      type: '普通用户',
                      email: '',
                      password: ''
                    });
                  }}
                  className="w-full sm:w-auto bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 用户列表 */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* 移动端卡片视图 */}
          <div className="block sm:hidden">
            {users.map(user => (
              <div key={user.id} className="p-4 border-b border-gray-200 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center flex-1">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                    user.userType === 'admin' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    {user.userType === 'admin' ? (
                      <ShieldCheckIcon className="h-6 w-6 text-red-600" />
                    ) : (
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {editingCell === `username-${user.id}` ? (
                          <input
                            ref={inputRef}
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            onBlur={handleBlur}
                            className={`border rounded px-2 py-1 text-sm w-full ${
                              errors[`username-${user.id}`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        ) : (
                          <span 
                            onClick={() => startEdit(`username-${user.id}`, user.username)}
                            className="cursor-pointer hover:text-blue-600 block truncate"
                          >
                            {user.username}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {editingCell === `email-${user.id}` ? (
                          <input
                            ref={inputRef}
                            type="email"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            onBlur={handleBlur}
                            className={`border rounded px-2 py-1 text-xs w-full ${
                              errors[`email-${user.id}`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        ) : (
                          <span 
                            onClick={() => startEdit(`email-${user.id}`, user.email)}
                            className="cursor-pointer hover:text-blue-600 block truncate"
                          >
                            {user.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    {user.userType !== 'admin' && (
                      <button 
                        onClick={() => handleResetPassword(user.id)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                        title="重置密码"
                      >
                        <KeyIcon className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900 transition-colors p-1"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    {editingCell === `userType-${user.id}` ? (
                      <select
                        ref={inputRef}
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onBlur={handleBlur}
                        className="border border-gray-300 rounded px-2 py-1 text-xs"
                      >
                        <option value="user">普通用户</option>
                        <option value="admin">管理员</option>
                      </select>
                    ) : (
                      <span 
                        onClick={() => startEdit(`userType-${user.id}`, user.userType)}
                        className={`inline-flex px-2 py-1 font-semibold rounded-full cursor-pointer hover:opacity-80 ${
                          user.userType === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.userType === 'admin' ? '管理员' : '普通用户'}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500">{user.createdAt}</span>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                暂无用户，请点击上方按钮添加用户
              </div>
            )}
          </div>
          
          {/* 桌面端表格视图 */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户信息</th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户名</th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">邮箱</th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户类型</th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">创建时间</th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-8 w-8 lg:h-10 lg:w-10 rounded-full flex items-center justify-center ${
                          user.userType === 'admin' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {user.userType === 'admin' ? (
                            <ShieldCheckIcon className="h-4 w-4 lg:h-6 lg:w-6 text-red-600" />
                          ) : (
                            <UserIcon className="h-4 w-4 lg:h-6 lg:w-6 text-blue-600" />
                          )}
                        </div>
                        <div className="ml-2 lg:ml-4">
                          <div className="text-xs lg:text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-xs text-gray-500 sm:hidden">{user.userType === 'admin' ? '管理员' : '普通用户'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                      {editingCell === `username-${user.id}` ? (
                        <input
                          ref={inputRef}
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          onBlur={handleBlur}
                          className={`border rounded px-2 py-1 text-xs lg:text-sm w-full ${
                            errors[`username-${user.id}`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                      ) : (
                        <span 
                          onClick={() => startEdit(`username-${user.id}`, user.username)}
                          className="text-xs lg:text-sm text-gray-900 cursor-pointer hover:text-blue-600 block truncate"
                        >
                          {user.username}
                        </span>
                      )}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {editingCell === `email-${user.id}` ? (
                        <input
                          ref={inputRef}
                          type="email"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          onBlur={handleBlur}
                          className={`border rounded px-2 py-1 text-xs lg:text-sm w-full ${
                            errors[`email-${user.id}`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                      ) : (
                        <span 
                          onClick={() => startEdit(`email-${user.id}`, user.email)}
                          className="text-xs lg:text-sm text-gray-900 cursor-pointer hover:text-blue-600 block truncate"
                        >
                          {user.email}
                        </span>
                      )}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                      {editingCell === `userType-${user.id}` ? (
                        <select
                          ref={inputRef}
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          onBlur={handleBlur}
                          className="border border-gray-300 rounded px-2 py-1 text-xs lg:text-sm w-full"
                        >
                          <option value="user">普通用户</option>
                          <option value="admin">管理员</option>
                        </select>
                      ) : (
                        <span 
                          onClick={() => startEdit(`userType-${user.id}`, user.userType)}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer hover:opacity-80 ${
                            user.userType === 'admin' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {user.userType === 'admin' ? '管理员' : '普通用户'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500 hidden lg:table-cell">
                      {formatDateTime(user.createdAt)}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {user.userType !== 'admin' && (
                          <button 
                            onClick={() => handleResetPassword(user.id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                            title="重置密码"
                          >
                            <KeyIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1"
                        >
                          <TrashIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {users.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      暂无用户，请点击上方按钮添加用户
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* 重置密码弹窗 */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">重置用户密码</h3>
              
              {errors.resetPassword && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{errors.resetPassword}</p>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新密码
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入新密码"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={confirmResetPassword}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  确认重置
                </button>
                <button
                  onClick={cancelResetPassword}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
       )}
       
       {/* 确认删除弹窗 */}
       <ConfirmModal
         isOpen={showDeleteConfirm}
         onClose={() => setShowDeleteConfirm(false)}
         onConfirm={confirmDelete}
         title="确认删除用户"
         message="确定要删除这个用户吗？此操作不可撤销。"
         confirmText="删除"
         cancelText="取消"
         type="danger"
       />

       {/* 成功提示弹窗 */}
       {showSuccessDialog && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
             <div className="text-center">
               <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                 <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
               </div>
               <h3 className="text-lg font-medium text-gray-900 mb-4">{successMessage}</h3>
               <button
                 onClick={() => setShowSuccessDialog(false)}
                 className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
               >
                 确定
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}

export default UserManagePage;