import { useState, useCallback, useEffect } from 'react';
import ApiService from '../services/api';
import { useDataManager } from './useApi';

/**
 * 学生管理hook - 处理班级、分组、学生的复杂嵌套结构
 */
export const useStudentManagement = () => {
  const [classes, setClasses] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 加载所有数据
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const classesData = await ApiService.getClasses.call(ApiService);
      
      // 为每个班级加载分组和学生数据
      const classesWithData = await Promise.all(
        classesData.map(async (cls) => {
          const groups = await ApiService.getGroups.call(ApiService, cls.id);
          const groupsWithStudents = await Promise.all(
            groups.map(async (group) => {
              const students = await ApiService.getStudents.call(ApiService, group.id);
              return { ...group, students };
            })
          );
          return { ...cls, groups: groupsWithStudents };
        })
      );
      
      setClasses(classesWithData);
      if (classesWithData.length > 0 && !activeTab) {
        setActiveTab(classesWithData[0].id);
      }
    } catch (err) {
      setError(err.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // 获取当前活动的班级
  const getCurrentClass = useCallback(() => {
    return classes.find(cls => cls.id === activeTab);
  }, [classes, activeTab]);

  // 班级操作
  const createClass = useCallback(async (classData) => {
    try {
      const newClass = await ApiService.createClass.call(ApiService, classData);
      const classWithGroups = { ...newClass, groups: [] };
      setClasses(prev => [...prev, classWithGroups]);
      setActiveTab(newClass.id);
      return newClass;
    } catch (err) {
      setError(err.message || '创建班级失败');
      throw err;
    }
  }, []);

  const updateClass = useCallback(async (classId, updateData) => {
    try {
      const updatedClass = await ApiService.updateClass.call(ApiService, classId, updateData);
      setClasses(prev => prev.map(cls => 
        cls.id === classId ? { ...cls, ...updatedClass } : cls
      ));
      return updatedClass;
    } catch (err) {
      setError(err.message || '更新班级失败');
      throw err;
    }
  }, []);

  const deleteClass = useCallback(async (classId) => {
    try {
      await ApiService.deleteClass.call(ApiService, classId);
      const newClasses = classes.filter(cls => cls.id !== classId);
      setClasses(newClasses);
      if (activeTab === classId && newClasses.length > 0) {
        setActiveTab(newClasses[0].id);
      } else if (newClasses.length === 0) {
        setActiveTab(null);
      }
    } catch (err) {
      setError(err.message || '删除班级失败');
      throw err;
    }
  }, [classes, activeTab]);

  // 分组操作
  const createGroup = useCallback(async (groupData) => {
    try {
      const newGroup = await ApiService.createGroup.call(ApiService, groupData);
      const groupWithStudents = { ...newGroup, students: [] };
      setClasses(prev => prev.map(cls => 
        cls.id === activeTab 
          ? { ...cls, groups: [...cls.groups, groupWithStudents] }
          : cls
      ));
      return newGroup;
    } catch (err) {
      setError(err.message || '创建分组失败');
      throw err;
    }
  }, [activeTab]);

  const updateGroup = useCallback(async (groupId, updateData) => {
    try {
      const updatedGroup = await ApiService.updateGroup.call(ApiService, groupId, updateData);
      setClasses(prev => prev.map(cls => 
        cls.id === activeTab 
          ? {
              ...cls,
              groups: cls.groups.map(grp => 
                grp.id === groupId ? { ...grp, ...updatedGroup } : grp
              )
            }
          : cls
      ));
      return updatedGroup;
    } catch (err) {
      setError(err.message || '更新分组失败');
      throw err;
    }
  }, [activeTab]);

  const deleteGroup = useCallback(async (groupId) => {
    try {
      await ApiService.deleteGroup.call(ApiService, groupId);
      setClasses(prev => prev.map(cls => 
        cls.id === activeTab 
          ? { ...cls, groups: cls.groups.filter(grp => grp.id !== groupId) }
          : cls
      ));
    } catch (err) {
      setError(err.message || '删除分组失败');
      throw err;
    }
  }, [activeTab]);

  // 学生操作
  const createStudent = useCallback(async (studentData) => {
    try {
      const newStudent = await ApiService.createStudent.call(ApiService, studentData);
      setClasses(prev => prev.map(cls => 
        cls.id === activeTab 
          ? {
              ...cls,
              groups: cls.groups.map(grp => 
                grp.id === studentData.groupId 
                  ? { ...grp, students: [...grp.students, newStudent] }
                  : grp
              )
            }
          : cls
      ));
      return newStudent;
    } catch (err) {
      setError(err.message || '创建学生失败');
      throw err;
    }
  }, [activeTab]);

  const updateStudent = useCallback(async (studentId, updateData, groupId) => {
    try {
      const updatedStudent = await ApiService.updateStudent.call(ApiService, studentId, updateData);
      setClasses(prev => prev.map(cls => 
        cls.id === activeTab 
          ? {
              ...cls,
              groups: cls.groups.map(grp => 
                grp.id === groupId 
                  ? {
                      ...grp,
                      students: grp.students.map(std => 
                        std.id === studentId 
                          ? { ...std, ...updatedStudent }
                          : std
                      )
                    }
                  : grp
              )
            }
          : cls
      ));
      return updatedStudent;
    } catch (err) {
      setError(err.message || '更新学生失败');
      throw err;
    }
  }, [activeTab]);

  const deleteStudent = useCallback(async (studentId, groupId) => {
    try {
      await ApiService.deleteStudent.call(ApiService, studentId);
      setClasses(prev => prev.map(cls => 
        cls.id === activeTab 
          ? {
              ...cls,
              groups: cls.groups.map(grp => 
                grp.id === groupId 
                  ? { ...grp, students: grp.students.filter(std => std.id !== studentId) }
                  : grp
              )
            }
          : cls
      ));
    } catch (err) {
      setError(err.message || '删除学生失败');
      throw err;
    }
  }, [activeTab]);

  // 初始化加载
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // 状态
    classes,
    activeTab,
    loading,
    error,
    
    // 操作
    setActiveTab,
    setError,
    loadData,
    getCurrentClass,
    
    // 班级操作
    createClass,
    updateClass,
    deleteClass,
    
    // 分组操作
    createGroup,
    updateGroup,
    deleteGroup,
    
    // 学生操作
    createStudent,
    updateStudent,
    deleteStudent
  };
};