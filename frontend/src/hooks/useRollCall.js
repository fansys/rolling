/**
 * 点名管理自定义Hook
 * 
 * 功能说明：
 * - 班级和分组数据管理
 * - 点名逻辑控制（开始、停止、重置）
 * - 点名历史记录管理
 * - 候选学生筛选和随机选择
 * 
 * 使用场景：
 * - RollCallPage组件中的点名功能
 * - 支持重复点名和不重复点名模式
 * - 支持按分组筛选学生
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import ApiService from '../services/api';

/**
 * 点名管理Hook
 * 
 * @returns {Object} 点名相关的状态和操作方法
 */
export function useRollCall() {
  // 检查ApiService是否正确导入
  if (!ApiService) {
    console.error('ApiService未正确导入');
    throw new Error('API服务初始化失败');
  }
  
  // 直接管理班级数据状态
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 设置错误的函数
  const setErrorState = useCallback((err) => {
    setError(err);
  }, []);

  // 获取班级数据的函数
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getClasses.call(ApiService);
      setClasses(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化时获取班级数据（只在组件挂载时执行一次）
  useEffect(() => {
    refreshData();
  }, []); // 空依赖数组，只执行一次

  // 点名相关状态
  const [selectedClass, setSelectedClass] = useState(null);     // 选中的班级
  const [selectedGroups, setSelectedGroups] = useState([]);     // 选中的分组
  const [history, setHistory] = useState([]);                  // 点名历史
  const [current, setCurrent] = useState(null);                // 当前被点名的学生
  const [isRolling, setIsRolling] = useState(false);          // 是否正在点名
  const [allowRepeat, setAllowRepeat] = useState(false);       // 是否允许重复点名
  const [rollSpeed, setRollSpeed] = useState(80);             // 点名速度（毫秒）
  const [intervalId, setIntervalId] = useState(null);         // 定时器ID

  /**
   * 获取候选学生列表
   * 根据选中的分组和重复设置筛选学生
   */
  const getCandidates = useCallback(() => {
    if (!selectedClass) return [];

    let students = [];
    
    // 如果选择了特定分组，只从这些分组中获取学生
    if (selectedGroups.length > 0) {
      students = selectedClass.groups
        .filter(group => selectedGroups.includes(group.id))
        .flatMap(group => (group.students || []).map(student => ({
          ...student,
          groupName: group.name,
          groupId: group.id
        })));
    } else {
      // 否则从所有分组中获取学生
      students = selectedClass.groups.flatMap(group => 
        (group.students || []).map(student => ({
          ...student,
          groupName: group.name,
          groupId: group.id
        }))
      );
    }

    // 如果不允许重复，过滤掉已经被点名的学生
    if (!allowRepeat) {
      students = students.filter(student => 
        !history.some(record => record.student.id === student.id)
      );
    }

    return students;
  }, [selectedClass, selectedGroups, history, allowRepeat]);

  /**
   * 开始点名
   * 启动随机选择学生的定时器
   */
  const startRollCall = useCallback(() => {
    const candidates = getCandidates();
    if (candidates.length === 0) {
      setError('没有可点名的学生');
      return;
    }

    setIsRolling(true);
    setError(null);

    const sequences =candidates.flatMap((item, idx) =>
      Array.from({ length: item.weight }, () => (idx))
    ).sort(() => Math.random() - 0.5);;

    // 启动定时器，随机选择学生
    const id = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * sequences.length);
      setCurrent(candidates[sequences[randomIndex]]);
    }, rollSpeed);

    setIntervalId(id);
  }, [getCandidates, rollSpeed, setError]);

  /**
   * 停止点名
   * 停止定时器并保存点名记录
   */
  const stopRollCall = useCallback(async () => {
    try {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      
      setIsRolling(false);

      // 如果有当前选中的学生，保存点名记录
      if (current && selectedClass) {
        try {
          // 检查ApiService是否可用
          if (!ApiService || typeof ApiService.createRollCallRecord !== 'function') {
            console.error('ApiService不可用:', ApiService);
            throw new Error('API服务不可用');
          }
          
          // 验证必要的数据
          if (!current.id || !selectedClass.id) {
            throw new Error('学生或班级信息不完整');
          }
          
          // 保存到后端
          const recordData = {
            studentId: current.id,
            classId: selectedClass.id
          };
          
          console.log('准备保存点名记录:', recordData);
           const result = await ApiService.createRollCallRecord.call(ApiService, recordData);
           console.log('API调用结果:', result);

          // 添加到本地历史记录
          const historyRecord = {
            id: Date.now(), // 临时ID
            student: {
              ...current,
              groupName: current.groupName || selectedClass.groups?.find(g => 
                g.students?.some(s => s.id === current.id)
              )?.name || '未知分组'
            },
            timestamp: new Date(),
            className: selectedClass.name,
            groupName: current.groupName || selectedClass.groups?.find(g => 
              g.students?.some(s => s.id === current.id)
            )?.name || '未知分组'
          };

          setHistory(prev => [...prev, historyRecord]);
          console.log('点名记录保存成功');
        } catch (err) {
          console.error('保存点名记录失败:', err);
          setError(`保存点名记录失败: ${err.message}`);
        }
      }
    } catch (err) {
      console.error('停止点名过程中发生错误:', err);
      setError(`停止点名失败: ${err.message}`);
    }
  }, [intervalId, current, selectedClass, setError]);

  /**
   * 重置点名
   * 清空历史记录和当前状态
   */
  const resetRollCall = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    setHistory([]);
    setCurrent(null);
    setIsRolling(false);
    setError(null);
  }, [intervalId, setError]);

  /**
   * 选择班级
   * 切换班级时重置相关状态
   */
  const selectClass = useCallback((classData) => {
    // 停止当前点名
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    setSelectedClass(classData);
    setSelectedGroups([]);
    setHistory([]);
    setCurrent(null);
    setIsRolling(false);
    setError(null);
  }, [intervalId, setError]);

  /**
   * 切换分组选择
   */
  const toggleGroupSelection = useCallback((groupId) => {
    setSelectedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  }, []);

  /**
   * 格式化时间显示
   */
  const formatTime = useCallback((date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []);

  /**
   * 获取点名统计信息
   */
  const getStatistics = useCallback(() => {
    const candidates = getCandidates();
    let totalStudents = 0;
    let calledStudents = 0;
    let remainingStudents = 0;
    
    if (selectedClass) {
      // 计算总学生数（根据选择的分组）
      if (selectedGroups.length > 0) {
        // 如果选择了特定分组，只计算这些分组的学生
        totalStudents = selectedClass.groups
          .filter(group => selectedGroups.includes(group.id))
          .reduce((sum, group) => sum + (group.students?.length || 0), 0);
      } else {
        // 否则计算所有分组的学生
        totalStudents = selectedClass.groups
          .reduce((sum, group) => sum + (group.students?.length || 0), 0);
      }
      
      // 计算已点名学生数（去重）
      const calledStudentIds = new Set(history.map(record => record.student.id));
      calledStudents = calledStudentIds.size;
      
      // 计算剩余可点名学生数
      if (allowRepeat) {
        // 允许重复时，剩余数等于总数
        remainingStudents = totalStudents;
      } else {
        // 不允许重复时，剩余数等于总数减去已点名数
        remainingStudents = Math.max(0, totalStudents - calledStudents);
      }
    }
    
    return {
      totalStudents,                    // 总学生数
      calledStudents,                   // 已点名学生数（去重）
      remainingStudents,                // 剩余可点名学生数
      availableCandidates: candidates.length,  // 当前可点名候选人数
      calledCount: history.length,      // 点名次数（包含重复）
      startTime: history.length > 0 ? history[0].timestamp : null,
      elapsedTime: history.length > 0 ? Date.now() - new Date(history[0].timestamp).getTime() : 0
    };
  }, [getCandidates, selectedClass, selectedGroups, history, allowRepeat]);

  // 缓存统计信息
  const stats = useMemo(() => getStatistics(), [getStatistics]);

  // 缓存操作函数
  const toggleRepeat = useCallback(() => setAllowRepeat(prev => !prev), []);
  const deleteHistoryItem = useCallback((historyId) => {
    setHistory(prev => prev.filter(item => item.id !== historyId));
  }, []);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  // 当班级数据加载完成后，默认选择第一个班级
  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      selectClass(classes[0]);
    }
  }, [classes, selectedClass, selectClass]);

  return {
    // 数据状态
    classes,
    selectedClass,
    selectedGroups,
    history,
    currentStudent: current,
    recentStudents: history.slice(-5).reverse(),
    loading,
    error,
    
    // 点名状态
    isRolling,
    allowRepeat,
    rollSpeed,
    
    // 统计信息
    stats,
    
    // 操作方法
    selectClass,
    toggleGroup: toggleGroupSelection,
    toggleRepeat,
    startRollCall,
    stopRollCall,
    resetRollCall,
    deleteHistory: deleteHistoryItem,
    setError: setErrorState,
    refreshData
  };
}