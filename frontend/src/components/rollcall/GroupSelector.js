/**
 * 分组选择器组件
 * 
 * 功能说明：
 * - 显示当前班级的所有分组
 * - 支持多选分组进行点名
 * - 显示每个分组的学生数量
 * - 支持全选/取消全选功能
 * 
 * 使用场景：
 * - 点名页面中的分组筛选
 * - 支持按分组进行定向点名
 */
import React from 'react';
import { UserGroupIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui';

/**
 * 分组选择器组件
 * 
 * @param {Object} props - 组件属性
 * @param {Object} props.selectedClass - 当前选中的班级
 * @param {Array} props.selectedGroups - 当前选中的分组ID列表
 * @param {Function} props.onToggleGroup - 切换分组选择的回调函数
 * @param {boolean} props.disabled - 是否禁用选择
 */
function GroupSelector({ 
  selectedClass, 
  selectedGroups = [], 
  onToggleGroup, 
  disabled = false 
}) {
  // 如果没有选中班级，不显示组件
  if (!selectedClass) {
    return null;
  }

  const groups = selectedClass.groups || [];
  
  // 如果班级没有分组，显示提示
  if (groups.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <UserGroupIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>当前班级暂无分组</p>
          <p className="text-sm mt-1">请先在学生管理页面为班级创建分组</p>
        </div>
      </div>
    );
  }

  // 检查是否全选
  const isAllSelected = groups.length > 0 && selectedGroups.length === groups.length;
  const isPartialSelected = selectedGroups.length > 0 && selectedGroups.length < groups.length;

  // 处理全选/取消全选
  const handleSelectAll = () => {
    if (disabled) return;
    
    if (isAllSelected) {
      // 取消全选
      selectedGroups.forEach(groupId => onToggleGroup(groupId));
    } else {
      // 全选
      groups.forEach(group => {
        if (!selectedGroups.includes(group.id)) {
          onToggleGroup(group.id);
        }
      });
    }
  };

  // 计算选中分组的总学生数
  const selectedStudentCount = groups
    .filter(group => selectedGroups.includes(group.id))
    .reduce((total, group) => total + (group.students?.length || 0), 0);

  // 计算总学生数
  const totalStudentCount = groups
    .reduce((total, group) => total + (group.students?.length || 0), 0);

  return (
    <div>
      {/* 全选按钮和统计信息 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={disabled}
            className={`
              ${isAllSelected ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}
              ${isPartialSelected ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : ''}
            `}
          >
            {isAllSelected ? '取消全选' : '全选'}
          </Button>
        </div>
        
        {/* 统计信息 */}
        <div className="text-sm text-gray-600">
          {selectedGroups.length === 0 ? (
            <span>未选择分组，将从所有分组中点名 ({totalStudentCount}人)</span>
          ) : (
            <span>
              已选择 {selectedGroups.length} 个分组，共 {selectedStudentCount} 人
            </span>
          )}
        </div>
      </div>

      {/* 分组列表 */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {groups.map((group) => {
            const isSelected = selectedGroups.includes(group.id);
            const studentCount = group.students?.length || 0;

            return (
              <button
                key={group.id}
                onClick={() => !disabled && onToggleGroup(group.id)}
                disabled={disabled}
                className={`
                  relative p-4 rounded-lg border-2 transition-all duration-200 text-left
                  ${isSelected 
                    ? 'border-green-500 bg-green-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                `}
              >
                {/* 选中状态指示器 */}
                <div className="absolute top-3 right-3">
                  <div className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                    ${isSelected 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300 bg-white'
                    }
                  `}>
                    {isSelected && (
                      <CheckIcon className="h-3 w-3 text-white" />
                    )}
                  </div>
                </div>

                {/* 分组信息 */}
                <div className="pr-8">
                  <h4 className={`font-medium mb-2 ${
                    isSelected ? 'text-green-900' : 'text-gray-900'
                  }`}>
                    {group.name}
                  </h4>
                  
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>学生数量:</span>
                      <span className="font-medium">{studentCount}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 选择提示 */}
        {selectedGroups.length === 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              💡 提示：未选择分组时，将从所有分组中随机点名
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupSelector;