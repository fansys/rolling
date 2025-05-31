import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import NavBar from "../components/NavBar";
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';


function StudentManagePage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [newClassName, setNewClassName] = useState('');
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: '', id: null, name: '' });
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const classesData = await ApiService.getClasses();
      
      // 为每个班级加载分组和学生数据
      const classesWithData = await Promise.all(
        classesData.map(async (cls) => {
          const groups = await ApiService.getGroups(cls.id);
          const groupsWithStudents = await Promise.all(
            groups.map(async (group) => {
              const students = await ApiService.getStudents(group.id);
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
    } catch (error) {
      console.error('加载数据失败:', error);
      setErrors({ general: '加载数据失败，请刷新页面重试' });
    } finally {
      setLoading(false);
    }
  };

  // 获取当前活动的班级
  const getCurrentClass = () => {
    return classes.find(cls => cls.id === activeTab);
  };

  // 添加班级
  const handleAddClass = async () => {
    if (!newClassName.trim()) return;
    try {
      const newClass = await ApiService.createClass({ name: newClassName });
      setClasses([...classes, { ...newClass, groups: [] }]);
      setActiveTab(newClass.id);
      setNewClassName('');
    } catch (error) {
      console.error('添加班级失败:', error);
      setErrors({ general: '添加班级失败，请重试' });
    }
  };

  // 删除班级
  const handleDeleteClass = (classId) => {
    const className = classes.find(c => c.id === classId)?.name || '';
    setDeleteConfirm({ show: true, type: 'class', id: classId, name: className });
  };

  const confirmDeleteClass = async () => {
    try {
      await ApiService.deleteClass(deleteConfirm.id);
      const newClasses = classes.filter(cls => cls.id !== deleteConfirm.id);
      setClasses(newClasses);
      if (activeTab === deleteConfirm.id && newClasses.length > 0) {
        setActiveTab(newClasses[0].id);
      }
    } catch (error) {
      console.error('删除班级失败:', error);
      setErrors({ general: '删除班级失败，请重试' });
    }
  };

  // 添加分组
  const handleAddGroup = async () => {
    try {
      const newGroup = await ApiService.createGroup({ classId: activeTab, name: '新分组' });
      setClasses(classes.map(cls => 
        cls.id === activeTab 
          ? { ...cls, groups: [...cls.groups, { ...newGroup, students: [] }] }
          : cls
      ));
    } catch (error) {
      console.error('添加分组失败:', error);
      setErrors({ general: '添加分组失败，请重试' });
    }
  };

  // 删除分组
  const handleDeleteGroup = (groupId) => {
    const currentClass = classes.find(cls => cls.id === activeTab);
    const groupName = currentClass?.groups.find(g => g.id === groupId)?.name || '';
    setDeleteConfirm({ show: true, type: 'group', id: groupId, name: groupName });
  };

  const confirmDeleteGroup = async () => {
    try {
      await ApiService.deleteGroup(deleteConfirm.id);
      setClasses(classes.map(cls => 
        cls.id === activeTab 
          ? { ...cls, groups: cls.groups.filter(grp => grp.id !== deleteConfirm.id) }
          : cls
      ));
    } catch (error) {
      console.error('删除分组失败:', error);
      setErrors({ general: '删除分组失败，请重试' });
    }
  };

  // 添加学生
  const handleAddStudent = async (groupId) => {
    try {
      const newStudent = await ApiService.createStudent({
        groupId: groupId,
        studentId: '',
        name: '新学生',
        weight: 1
      });
      setClasses(classes.map(cls => 
        cls.id === activeTab 
          ? {
              ...cls,
              groups: cls.groups.map(grp => 
                grp.id === groupId 
                  ? { ...grp, students: [...grp.students, newStudent] }
                  : grp
              )
            }
          : cls
      ));
    } catch (error) {
      console.error('添加学生失败:', error);
      setErrors({ general: '添加学生失败，请重试' });
    }
  };

  // 删除学生
  const handleDeleteStudent = (groupId, studentId) => {
    const currentClass = classes.find(cls => cls.id === activeTab);
    const group = currentClass?.groups.find(g => g.id === groupId);
    const studentName = group?.students.find(s => s.id === studentId)?.name || '';
    setDeleteConfirm({ show: true, type: 'student', id: studentId, name: studentName, groupId });
  };

  const confirmDeleteStudent = async () => {
    try {
      await ApiService.deleteStudent(deleteConfirm.id);
      setClasses(classes.map(cls => 
        cls.id === activeTab 
          ? {
              ...cls,
              groups: cls.groups.map(grp => 
                grp.id === deleteConfirm.groupId 
                  ? { ...grp, students: grp.students.filter(std => std.id !== deleteConfirm.id) }
                  : grp
              )
            }
          : cls
      ));
    } catch (error) {
      console.error('删除学生失败:', error);
      setErrors({ general: '删除学生失败，请重试' });
    }
  };

  // 开始编辑
  const startEdit = (cellKey, currentValue) => {
    setEditingCell(cellKey);
    setEditValue(currentValue || '');
    setErrors({});
  };

  // 保存编辑
  const saveEdit = async () => {
    if (!editingCell) return;
    
    const [type, ...ids] = editingCell.split('-');
    const value = editValue.trim();
    
    // 验证空值
    if (!value && type !== 'weight') {
      setErrors({ [editingCell]: true });
      return;
    }
    
    try {
      if (type === 'group') {
        const groupId = parseInt(ids[0]);
        await ApiService.updateGroup(groupId, { name: value });
        setClasses(classes.map(cls => 
          cls.id === activeTab 
            ? {
                ...cls,
                groups: cls.groups.map(grp => 
                  grp.id === groupId ? { ...grp, name: value } : grp
                )
              }
            : cls
        ));
      } else if (type === 'student') {
        const [groupId, studentId, field] = ids.map(id => parseInt(id));
        const fieldName = field === 0 ? 'studentId' : field === 1 ? 'name' : 'weight';
        const fieldValue = field === 2 ? Number(value) || 1 : value;
        
        await ApiService.updateStudent(studentId, { [fieldName]: fieldValue });
        setClasses(classes.map(cls => 
          cls.id === activeTab 
            ? {
                ...cls,
                groups: cls.groups.map(grp => 
                  grp.id === groupId 
                    ? {
                        ...grp,
                        students: grp.students.map(std => 
                          std.id === studentId 
                            ? { ...std, [field === 0 ? 'studentId' : field === 1 ? 'name' : 'weight']: fieldValue }
                            : std
                        )
                      }
                    : grp
                )
              }
            : cls
        ));
      }
      
      setEditingCell(null);
      setEditValue('');
      setErrors({});
    } catch (error) {
      console.error('保存编辑失败:', error);
      setErrors({ [editingCell]: true, general: '保存失败，请重试' });
    }
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
    setErrors({});
  };

  // 处理键盘事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // 处理点击空白处
  const handleBlur = () => {
    if (editingCell) {
      saveEdit();
    }
  };

  // 统一的确认删除处理函数
  const handleConfirmDelete = async () => {
    switch (deleteConfirm.type) {
      case 'class':
        await confirmDeleteClass();
        break;
      case 'group':
        await confirmDeleteGroup();
        break;
      case 'student':
        await confirmDeleteStudent();
        break;
    }
    setDeleteConfirm({ show: false, type: '', id: null, name: '' });
  };

  const currentClass = getCurrentClass();

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
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">学生管理</h2>
          
          {/* 错误提示 */}
          {errors.general && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{errors.general}</p>
            </div>
          )}
          
          {/* 添加班级 */}
          <div className="mb-4 sm:mb-6 p-4 bg-white rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">添加班级</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                className="border border-gray-300 px-4 py-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入班级名称"
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddClass()}
              />
              <button 
                className="w-full sm:w-auto bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium"
                onClick={handleAddClass}
              >
                <PlusIcon className="w-5 h-5" />
                添加班级
              </button>
            </div>
          </div>

          {/* 班级Tab */}
          {classes.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto">
                  {classes.map(cls => (
                    <button
                      key={cls.id}
                      onClick={() => setActiveTab(cls.id)}
                      className={`group inline-flex items-center py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                        activeTab === cls.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="truncate max-w-24 sm:max-w-none">{cls.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClass(cls.id);
                        }}
                        className="ml-1 sm:ml-2 p-1 rounded-full hover:bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <XMarkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}
        </div>

        {/* 班级内容 */}
        {currentClass && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* 添加分组按钮 */}
            <div className="p-3 sm:p-4 bg-gray-50 border-b">
              <button 
                onClick={handleAddGroup}
                className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <PlusIcon className="w-5 h-5" />
                添加分组
              </button>
            </div>

            {/* 移动端卡片视图 */}
            <div className="block sm:hidden">
              {currentClass.groups.map(group => (
                <div key={group.id} className="border-b border-gray-200 last:border-b-0">
                  {/* 分组卡片 */}
                  <div className="p-4 bg-green-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-green-800">{group.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleAddStudent(group.id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                        >
                          添加学生
                        </button>
                        <button 
                          onClick={() => handleDeleteGroup(group.id)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* 学生卡片 */}
                  {group.students.map(student => (
                    <div key={student.id} className="p-3 bg-white border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-600">学生</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteStudent(group.id, student.id)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">学号:</span>
                          <span className="ml-1 text-gray-900">{student.studentId || '未设置'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">姓名:</span>
                          <span className="ml-1 text-gray-900">{student.name || '未设置'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">权重:</span>
                          <span className="ml-1 text-gray-900">{student.weight}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {group.students.length === 0 && (
                    <div className="p-4 bg-white border-t border-gray-100 text-center text-gray-500 text-xs">
                      暂无学生，点击上方按钮添加学生
                    </div>
                  )}
                </div>
              ))}
              
              {currentClass.groups.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  暂无分组，请点击上方按钮添加分组
                </div>
              )}
            </div>
            
            {/* 桌面端表格视图 */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分组/学生</th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">学号</th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">权重</th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentClass.groups.map(group => (
                    <React.Fragment key={group.id}>
                      {/* 分组行 */}
                      <tr className="bg-green-50 hover:bg-green-100 transition-colors">
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 lg:mr-3"></div>
                            {editingCell === `group-${group.id}` ? (
                              <input
                                ref={inputRef}
                                type="text"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                onBlur={handleBlur}
                                className={`border rounded px-2 py-1 text-xs lg:text-sm font-medium w-full ${
                                  errors[`group-${group.id}`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                              />
                            ) : (
                              <span 
                                onClick={() => startEdit(`group-${group.id}`, group.name)}
                                className="text-xs lg:text-sm font-medium text-green-800 cursor-pointer hover:text-green-600 truncate"
                              >
                                {group.name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500 hidden md:table-cell">-</td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500">-</td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500 hidden md:table-cell">-</td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-1 lg:gap-2">
                            <button 
                              onClick={() => handleAddStudent(group.id)}
                              className="bg-blue-500 text-white px-2 lg:px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                            >
                              <span className="hidden sm:inline">添加学生</span>
                              <span className="sm:hidden">+</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteGroup(group.id)}
                              className="text-red-600 hover:text-red-900 transition-colors p-1"
                            >
                              <TrashIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* 学生行 */}
                      {group.students.map(student => (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center ml-4 lg:ml-6">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mr-2 lg:mr-3"></div>
                              <span className="text-xs lg:text-sm text-gray-600">学生</span>
                            </div>
                          </td>
                          <td className="px-3 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                            {editingCell === `student-${group.id}-${student.id}-0` ? (
                              <input
                                ref={inputRef}
                                type="text"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                onBlur={handleBlur}
                                className={`border rounded px-2 py-1 text-xs lg:text-sm w-20 lg:w-24 ${
                                  errors[`student-${group.id}-${student.id}-0`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                              />
                            ) : (
                              <span 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  startEdit(`student-${group.id}-${student.id}-0`, student.studentId);
                }}
                className={`text-xs lg:text-sm cursor-pointer hover:text-blue-600 block truncate min-h-[20px] py-1 ${
                  !student.studentId ? 'text-gray-400 italic' : 'text-gray-900'
                }`}
                style={{touchAction: 'manipulation'}}
              >
                {student.studentId || '点击输入学号'}
              </span>
                            )}
                          </td>
                          <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              {/* 姓名 */}
                              <div>
                                {editingCell === `student-${group.id}-${student.id}-1` ? (
                                  <input
                                    ref={inputRef}
                                    type="text"
                                    value={editValue}
                                    onChange={e => setEditValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    onBlur={handleBlur}
                                    className={`border rounded px-2 py-1 text-xs lg:text-sm w-full ${
                                      errors[`student-${group.id}-${student.id}-1`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                  />
                                ) : (
                                  <span 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      startEdit(`student-${group.id}-${student.id}-1`, student.name);
                                    }}
                                    className={`text-xs lg:text-sm cursor-pointer hover:text-blue-600 block truncate min-h-[20px] py-1 ${
                                      !student.name ? 'text-gray-400 italic' : 'text-gray-900'
                                    }`}
                                    style={{touchAction: 'manipulation'}}
                                  >
                                    {student.name || '点击输入姓名'}
                                  </span>
                                )}
                              </div>
                              
                              {/* 小屏幕显示学号和权重 */}
                              <div className="md:hidden flex gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <span>学号:</span>
                                  {editingCell === `student-${group.id}-${student.id}-0` ? (
                                    <input
                                      ref={inputRef}
                                      type="text"
                                      value={editValue}
                                      onChange={e => setEditValue(e.target.value)}
                                      onKeyPress={handleKeyPress}
                                      onBlur={handleBlur}
                                      className={`border rounded px-1 py-0.5 text-xs w-16 ${
                                        errors[`student-${group.id}-${student.id}-0`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                      }`}
                                    />
                                  ) : (
                                    <span 
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        startEdit(`student-${group.id}-${student.id}-0`, student.studentId);
                                      }}
                                      className={`cursor-pointer hover:text-blue-600 inline-block min-w-[40px] py-1 ${
                                        !student.studentId ? 'text-gray-400 italic' : 'text-gray-700'
                                      }`}
                                      style={{touchAction: 'manipulation'}}
                                    >
                                      {student.studentId || '点击输入'}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <span>权重:</span>
                                  {editingCell === `student-${group.id}-${student.id}-2` ? (
                                    <input
                                      ref={inputRef}
                                      type="number"
                                      min="1"
                                      value={editValue}
                                      onChange={e => setEditValue(e.target.value)}
                                      onKeyPress={handleKeyPress}
                                      onBlur={handleBlur}
                                      className={`border rounded px-1 py-0.5 text-xs w-12 text-center ${
                                        errors[`student-${group.id}-${student.id}-2`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                      }`}
                                    />
                                  ) : (
                                    <span 
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        startEdit(`student-${group.id}-${student.id}-2`, student.weight.toString());
                                      }}
                                      className="cursor-pointer hover:text-blue-600 text-gray-700 inline-block min-w-[20px] py-1"
                                      style={{touchAction: 'manipulation'}}
                                    >
                                      {student.weight}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                            {editingCell === `student-${group.id}-${student.id}-2` ? (
                              <input
                                ref={inputRef}
                                type="number"
                                min="1"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                onBlur={handleBlur}
                                className={`border rounded px-2 py-1 text-xs lg:text-sm w-12 lg:w-16 text-center ${
                                  errors[`student-${group.id}-${student.id}-2`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                              />
                            ) : (
                              <span 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  startEdit(`student-${group.id}-${student.id}-2`, student.weight.toString());
                }}
                className="text-xs lg:text-sm cursor-pointer hover:text-blue-600 inline-block w-12 lg:w-16 text-center text-gray-900 min-h-[20px] py-1"
                style={{touchAction: 'manipulation'}}
              >
                {student.weight}
              </span>
                            )}
                          </td>
                          <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => handleDeleteStudent(group.id, student.id)}
                              className="text-red-600 hover:text-red-900 transition-colors p-1"
                            >
                              <TrashIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  
                  {currentClass.groups.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        暂无分组，请点击上方按钮添加分组
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {classes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">暂无班级，请先添加班级</div>
          </div>
        )}
      </div>
      
      {/* 确认删除弹窗 */}
      <ConfirmModal
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, type: '', id: null, name: '' })}
        onConfirm={handleConfirmDelete}
        title={`确认删除${deleteConfirm.type === 'class' ? '班级' : deleteConfirm.type === 'group' ? '分组' : '学生'}`}
        message={`确定要删除${deleteConfirm.type === 'class' ? '班级' : deleteConfirm.type === 'group' ? '分组' : '学生'} "${deleteConfirm.name}" 吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
}

export default StudentManagePage;