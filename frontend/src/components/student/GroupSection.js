import React from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import InlineEdit from '../ui/InlineEdit';
import StudentTable from './StudentTable';

const GroupSection = ({
  group,
  onUpdateGroup,
  onDeleteGroup,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  editingCell,
  onStartEdit,
  onSaveEdit,
  onCancelEdit
}) => {
  const handleGroupNameSave = async (newName) => {
    await onUpdateGroup(group.id, { name: newName });
  };

  const handleAddStudent = () => {
    onAddStudent(group.id);
  };

  const handleDeleteGroup = () => {
    onDeleteGroup(group.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* 分组头部 */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <InlineEdit
              value={group.name}
              onSave={handleGroupNameSave}
              onCancel={onCancelEdit}
              isEditing={editingCell === `group-${group.id}`}
              onStartEdit={() => onStartEdit(`group-${group.id}`, group.name)}
              placeholder="分组名称"
              className="text-lg font-semibold"
              required
            />
            <span className="text-sm text-gray-500">
              ({group.students?.length || 0} 人)
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={PlusIcon}
              onClick={handleAddStudent}
            >
              添加学生
            </Button>
            
            <Button
              size="sm"
              variant="danger"
              icon={TrashIcon}
              onClick={handleDeleteGroup}
              className="p-2"
              title="删除分组"
            />
          </div>
        </div>
      </div>
      
      {/* 学生表格 */}
      <div className="p-4">
        {group.students && group.students.length > 0 ? (
          <StudentTable
            students={group.students}
            groupId={group.id}
            onUpdateStudent={onUpdateStudent}
            onDeleteStudent={onDeleteStudent}
            editingCell={editingCell}
            onStartEdit={onStartEdit}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>暂无学生</p>
            <p className="text-sm mt-1">点击上方"添加学生"按钮开始添加</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupSection;