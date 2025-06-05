/**
 * 班级选择器组件
 * 
 * 功能说明：
 * - 显示可用班级列表
 * - 支持班级切换
 * - 显示当前选中班级的基本信息
 * 
 * 使用场景：
 * - 点名页面中的班级选择
 * - 支持快速切换不同班级
 */
import React from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';

/**
 * 班级选择器组件
 * 
 * @param {Object} props - 组件属性
 * @param {Array} props.classes - 班级列表
 * @param {Object} props.selectedClass - 当前选中的班级
 * @param {Function} props.onSelectClass - 选择班级的回调函数
 * @param {boolean} props.disabled - 是否禁用选择
 */
function ClassSelector({ 
  classes = [], 
  selectedClass, 
  onSelectClass, 
  disabled = false 
}) {
  // 如果没有班级数据，显示空状态
  if (classes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <UserGroupIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>暂无班级数据</p>
          <p className="text-sm mt-1">请先在学生管理页面创建班级</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 班级列表 */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {classes.map((classItem) => {
            const isSelected = selectedClass?.id === classItem.id;
            const totalStudents = classItem.groups?.reduce(
              (total, group) => total + (group.students?.length || 0), 
              0
            ) || 0;
            const totalGroups = classItem.groups?.length || 0;

            return (
              <button
                key={classItem.id}
                onClick={() => !disabled && onSelectClass(classItem)}
                disabled={disabled}
                className={`
                  relative p-4 rounded-lg border-2 transition-all duration-200
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                `}
              >
                {/* 选中状态指示器 */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                )}

                {/* 班级信息 */}
                <div className="text-left">
                  <h4 className={`font-medium mb-2 ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {classItem.name}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 当前选中班级的详细信息 */}
      {selectedClass && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">
            当前班级: {selectedClass.name}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">分组列表:</span>
              <div className="mt-1 space-y-1">
                {selectedClass.groups?.map((group) => (
                  <div key={group.id} className="flex justify-between text-blue-600">
                    <span>{group.name}</span>
                    <span>({group.students?.length || 0}人)</span>
                  </div>
                )) || (
                  <span className="text-blue-500">暂无分组</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-blue-700">班级统计:</span>
              <div className="mt-1 space-y-1 text-blue-600">
                <div>总人数: {selectedClass.groups?.reduce(
                  (total, group) => total + (group.students?.length || 0), 0
                ) || 0}人</div>
                <div>分组数: {selectedClass.groups?.length || 0}个</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassSelector;