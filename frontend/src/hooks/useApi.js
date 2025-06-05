import { useState, useCallback } from 'react';
import ApiService from '../services/api';

/**
 * 通用API调用hook
 * @param {Function} apiFunction - API调用函数
 * @param {Object} options - 配置选项
 * @returns {Object} { data, loading, error, execute, reset }
 */
export const useApi = (apiFunction, options = {}) => {
  const { immediate = false, onSuccess, onError } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};

/**
 * 数据列表管理hook
 * @param {Function} fetchFunction - 获取数据的函数
 * @param {Function} createFunction - 创建数据的函数
 * @param {Function} updateFunction - 更新数据的函数
 * @param {Function} deleteFunction - 删除数据的函数
 */
export const useDataManager = ({
  fetchFunction,
  createFunction,
  updateFunction,
  deleteFunction
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFunction(...args);
      setItems(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  const createItem = useCallback(async (itemData) => {
    try {
      const newItem = await createFunction(itemData);
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [createFunction]);

  const updateItem = useCallback(async (id, updateData) => {
    try {
      const updatedItem = await updateFunction(id, updateData);
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updatedItem } : item
      ));
      return updatedItem;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [updateFunction]);

  const deleteItem = useCallback(async (id) => {
    try {
      await deleteFunction(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [deleteFunction]);

  const updateItemInState = useCallback((id, updateData) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updateData } : item
    ));
  }, []);

  const addItemToState = useCallback((newItem) => {
    setItems(prev => [...prev, newItem]);
  }, []);

  const removeItemFromState = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  return {
    items,
    setItems,
    loading,
    error,
    setError,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    updateItemInState,
    addItemToState,
    removeItemFromState
  };
};