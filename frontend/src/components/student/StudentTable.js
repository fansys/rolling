import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import InlineEdit from '../ui/InlineEdit';

const StudentTable = ({
  students,
  groupId,
  onUpdateStudent,
  onDeleteStudent,
  editingCell,
  onStartEdit,
  onSaveEdit,
  onCancelEdit
}) => {
  const handleStudentUpdate = async (studentId, field, value) => {
    const updateData = { [field]: value };
    if (field === 'weight') {
      updateData[field] = Number(value) || 1;
    }
    await onUpdateStudent(studentId, updateData, groupId);
  };

  const handleDeleteStudent = (studentId) => {
    onDeleteStudent(studentId, groupId);
  };

  const validateWeight = (value) => {
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      return '权重必须是非负数';
    }
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              学号
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              姓名
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              权重
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student) => {
            const studentIdCellKey = `student-${groupId}-${student.id}-0`;
            const nameCellKey = `student-${groupId}-${student.id}-1`;
            const weightCellKey = `student-${groupId}-${student.id}-2`;

            return (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <InlineEdit
                    value={student.studentId}
                    onSave={(value) => {
                      handleStudentUpdate(student.id, 'studentId', value);
                      onSaveEdit(studentIdCellKey, value);
                    }}
                    onCancel={onCancelEdit}
                    isEditing={editingCell === studentIdCellKey}
                    onStartEdit={() => onStartEdit(studentIdCellKey, student.studentId)}
                    placeholder="请输入学号"
                    className="w-full"
                  />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <InlineEdit
                    value={student.name}
                    onSave={(value) => handleStudentUpdate(student.id, 'name', value)}
                    onCancel={onCancelEdit}
                    isEditing={editingCell === nameCellKey}
                    onStartEdit={() => onStartEdit(nameCellKey, student.name)}
                    placeholder="请输入姓名"
                    className="w-full"
                    required
                  />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <InlineEdit
                    value={student.weight?.toString() || '1'}
                    onSave={(value) => handleStudentUpdate(student.id, 'weight', value)}
                    onCancel={onCancelEdit}
                    isEditing={editingCell === weightCellKey}
                    onStartEdit={() => onStartEdit(weightCellKey, student.weight?.toString() || '1')}
                    placeholder="1"
                    type="number"
                    className="w-60"
                    validate={validateWeight}
                  />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Button
                    size="sm"
                    variant="danger"
                    icon={TrashIcon}
                    onClick={() => handleDeleteStudent(student.id)}
                    className="p-2"
                    title="删除学生"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;