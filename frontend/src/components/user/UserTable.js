import React from 'react';
import { TrashIcon, KeyIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import InlineEdit from '../ui/InlineEdit';

const UserTable = ({
  users,
  currentUser,
  onUpdateUser,
  onDeleteUser,
  onResetPassword,
  editingCell,
  onStartEdit,
  onCancelEdit,
  formatDateTime,
  getUserTypeText
}) => {
  const handleUserUpdate = async (userId, field, value) => {
    const updateData = { [field]: value };
    await onUpdateUser(userId, updateData);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return '请输入有效的邮箱地址';
    }
    return null;
  };

  const validateUsername = (username) => {
    if (username.length < 3) {
      return '用户名至少需要3个字符';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return '用户名只能包含字母、数字和下划线';
    }
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              用户名
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              邮箱
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              用户类型
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              创建时间
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              最后登录
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => {
            const usernameCellKey = `username-${user.id}`;
            const emailCellKey = `email-${user.id}`;
            const isCurrentUser = currentUser?.id === user.id;

            return (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {user.userType === 'admin' ? (
                      <ShieldCheckIcon className="h-5 w-5 text-blue-500 mr-2" />
                    ) : (
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                    )}
                    <InlineEdit
                      value={user.username}
                      onSave={(value) => handleUserUpdate(user.id, 'username', value)}
                      onCancel={onCancelEdit}
                      isEditing={editingCell === usernameCellKey}
                      onStartEdit={() => onStartEdit(usernameCellKey, user.username)}
                      placeholder="用户名"
                      className="font-medium"
                      required
                      validate={validateUsername}
                    />
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <InlineEdit
                    value={user.email}
                    onSave={(value) => handleUserUpdate(user.id, 'email', value)}
                    onCancel={onCancelEdit}
                    isEditing={editingCell === emailCellKey}
                    onStartEdit={() => onStartEdit(emailCellKey, user.email)}
                    placeholder="邮箱地址"
                    type="email"
                    required
                    validate={validateEmail}
                  />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.userType === 'admin' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getUserTypeText(user.userType)}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(user.createdAt)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(user.lastLoginAt)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      icon={KeyIcon}
                      onClick={() => onResetPassword(user.id)}
                      title="重置密码"
                    >
                      重置密码
                    </Button>
                    
                    {!isCurrentUser && (
                      <Button
                        size="sm"
                        variant="danger"
                        icon={TrashIcon}
                        onClick={() => onDeleteUser(user.id)}
                        title="删除用户"
                      >
                        删除
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;