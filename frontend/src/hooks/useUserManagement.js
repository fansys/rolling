import { useState, useCallback, useEffect } from 'react';
import ApiService from '../services/api';
import { useDataManager } from './useApi';

/**
 * 用户管理hook
 */
export const useUserManagement = () => {
  const {
    items: users,
    setItems: setUsers,
    loading,
    error,
    setError,
    fetchItems: fetchUsers,
    createItem: createUser,
    updateItem: updateUser,
    deleteItem: deleteUser,
    updateItemInState,
    addItemToState,
    removeItemFromState
  } = useDataManager({
    fetchFunction: ApiService.getUsers.bind(ApiService),
    createFunction: ApiService.createUser.bind(ApiService),
    updateFunction: ApiService.updateUser.bind(ApiService),
    deleteFunction: ApiService.deleteUser.bind(ApiService)
  });

  // 初始化时获取用户数据
  useEffect(() => {
    fetchUsers();
  }, []);

  // 重置密码
  const resetPassword = useCallback(async (userId, newPassword) => {
    try {
      await ApiService.resetUserPassword(userId, newPassword);
      return true;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [setError]);

  // 格式化时间显示
  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // 获取用户类型显示文本
  const getUserTypeText = useCallback((userType) => {
    const typeMap = {
      admin: '管理员',
      user: '普通用户'
    };
    return typeMap[userType] || userType;
  }, []);

  return {
    users,
    loading,
    error,
    setError,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    formatDateTime,
    getUserTypeText,
    updateItemInState,
    addItemToState,
    removeItemFromState
  };
};