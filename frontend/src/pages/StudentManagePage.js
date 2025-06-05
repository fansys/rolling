/**
 * 学生管理页面 - 重构版本
 * 
 * 功能说明：
 * - 班级管理：创建、删除班级，切换班级
 * - 分组管理：在班级内创建、删除分组，编辑分组名称
 * - 学生管理：在分组内添加、删除学生，编辑学生信息（学号、姓名、权重）
 * 
 * 重构优势：
 * - 使用自定义Hooks分离业务逻辑
 * - 组件化拆分，提高代码复用性
 * - 统一的错误处理和加载状态管理
 * - 更好的用户体验和交互设计
 */
import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import NavBar from '../components/NavBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ClassTabs from '../components/student/ClassTabs';
import GroupSection from '../components/student/GroupSection';
import { useStudentManagement } from '../hooks/useStudentManagement';
import { useInlineEdit, useConfirmDialog } from '../hooks/useForm';
import { useAuth } from '../contexts/AuthContext';

/**
 * 学生管理页面主组件
 * 
 * 使用useStudentManagement Hook管理所有业务逻辑
 * 包括班级、分组、学生的CRUD操作
 */
function StudentManagePage() {
  const { user } = useAuth();
  
  // 使用自定义Hook管理学生相关的所有状态和操作
  const {
    classes,           // 班级列表
    activeTab,         // 当前选中的班级ID
    loading,           // 加载状态
    error,             // 错误信息
    setActiveTab,      // 设置当前班级
    setError,          // 设置错误信息
    getCurrentClass,   // 获取当前班级
    createClass,       // 创建班级
    updateClass,       // 更新班级
    deleteClass,       // 删除班级
    createGroup,       // 创建分组
    updateGroup,       // 更新分组
    deleteGroup,       // 删除分组
    createStudent,     // 创建学生
    updateStudent,     // 更新学生
    deleteStudent      // 删除学生
  } = useStudentManagement();
  
  // 使用内联编辑Hook管理编辑状态
  const {
    editingCell,       // 当前编辑的单元格
    editValue,         // 编辑中的值
    errors: editErrors, // 编辑错误
    setEditValue,      // 设置编辑值
    startEdit,         // 开始编辑
    cancelEdit,        // 取消编辑
    saveEdit,          // 保存编辑
    handleKeyPress     // 处理键盘事件
  } = useInlineEdit();
  
  // 使用确认对话框Hook管理确认流程
  const {
    confirmState,      // 确认对话框状态
    showConfirm,       // 显示确认对话框
    hideConfirm,       // 隐藏确认对话框
    handleConfirm      // 处理确认操作
  } = useConfirmDialog();

  const currentClass = getCurrentClass();

  // 处理编辑保存
  const handleSaveEdit = async (cellKey, value) => {
    const [type, ...ids] = cellKey.split('-');
    const trimmedValue = value.trim();
    
    if (type === 'group') {
      const groupId = parseInt(ids[0]);
      await updateGroup(groupId, { name: trimmedValue });
    } else if (type === 'student') {
      const [groupId, studentId, field] = ids.map(id => parseInt(id));
      const fieldName = field === 0 ? 'studentId' : field === 1 ? 'name' : 'weight';
      const fieldValue = field === 2 ? Number(trimmedValue) || 1 : trimmedValue;
      
      await updateStudent(studentId, { [fieldName]: fieldValue }, groupId);
    }
  };

  // 班级操作
  const handleAddClass = async (classData) => {
    await createClass(classData);
  };

  const handleDeleteClass = (classId) => {
    const className = classes.find(c => c.id === classId)?.name || '';
    showConfirm({
      title: '删除班级',
      message: `确定要删除班级"${className}"吗？此操作将同时删除该班级下的所有分组和学生数据。`,
      onConfirm: () => deleteClass(classId)
    });
  };

  // 分组操作
  const handleAddGroup = async () => {
    if (!activeTab) return;
    await createGroup({ classId: activeTab, name: '新分组' });
  };

  const handleUpdateGroup = async (groupId, updateData) => {
    await updateGroup(groupId, updateData);
  };

  const handleDeleteGroup = (groupId) => {
    const groupName = currentClass?.groups.find(g => g.id === groupId)?.name || '';
    showConfirm({
      title: '删除分组',
      message: `确定要删除分组"${groupName}"吗？此操作将同时删除该分组下的所有学生数据。`,
      onConfirm: () => deleteGroup(groupId)
    });
  };

  // 学生操作
  const handleAddStudent = async (groupId) => {
    await createStudent({
      groupId: groupId,
      studentId: '',
      name: '新学生',
      weight: 1
    });
  };

  const handleUpdateStudent = async (studentId, updateData, groupId) => {
    await updateStudent(studentId, updateData, groupId);
  };

  const handleDeleteStudent = (studentId, groupId) => {
    const group = currentClass?.groups.find(g => g.id === groupId);
    const studentName = group?.students.find(s => s.id === studentId)?.name || '';
    showConfirm({
      title: '删除学生',
      message: `确定要删除学生"${studentName}"吗？`,
      onConfirm: () => deleteStudent(studentId, groupId)
    });
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
              <h1 className="text-2xl font-bold text-gray-900">学生管理</h1>
              <p className="mt-1 text-sm text-gray-500">
                管理班级、分组和学生信息
              </p>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <ErrorMessage 
              error={error} 
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* 主要内容区域 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {classes.length === 0 ? (
            // 空状态
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  还没有班级
                </h3>
                <p className="text-gray-500 mb-6">
                  创建第一个班级开始管理学生
                </p>
                <Button
                  icon={PlusIcon}
                  onClick={() => handleAddClass({ name: '新班级' })}
                >
                  创建班级
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 班级标签页组件 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <ClassTabs
                  classes={classes}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onAddClass={handleAddClass}
                  onDeleteClass={handleDeleteClass}
                />
                
                {/* 分组管理区域 */}
                {currentClass && (
                  <div className="p-6">
                    {/* 添加分组按钮 */}
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {currentClass.name} - 分组管理
                      </h2>
                      <Button
                        icon={PlusIcon}
                        onClick={handleAddGroup}
                      >
                        添加分组
                      </Button>
                    </div>
                    
                    {/* 分组列表 */}
                    {currentClass.groups && currentClass.groups.length > 0 ? (
                      <div className="space-y-6">
                        {currentClass.groups.map((group) => (
                          <GroupSection
                            key={group.id}
                            group={group}
                            onUpdateGroup={handleUpdateGroup}
                            onDeleteGroup={handleDeleteGroup}
                            onAddStudent={handleAddStudent}
                            onUpdateStudent={handleUpdateStudent}
                            onDeleteStudent={handleDeleteStudent}
                            editingCell={editingCell}
                            onStartEdit={startEdit}
                            onSaveEdit={async (cellKey, value) => {
                              await saveEdit(() => handleSaveEdit(cellKey, value));
                            }}
                            onCancelEdit={cancelEdit}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          还没有分组
                        </h3>
                        <p className="text-gray-500 mb-4">
                          为这个班级创建第一个分组
                        </p>
                        <Button
                          icon={PlusIcon}
                          onClick={handleAddGroup}
                        >
                          创建分组
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 确认对话框组件 */}
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

export default StudentManagePage;