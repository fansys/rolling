/**
 * 重构后的点名页面
 * 
 * 功能说明：
 * - 整合了所有点名相关的功能模块
 * - 使用自定义 Hook (useRollCall) 管理状态和逻辑
 * - 采用模块化的 UI 组件提高代码复用性
 * - 提供完整的点名流程：班级选择 -> 分组筛选 -> 点名控制 -> 结果展示 -> 历史记录
 * 
 * 重构优势：
 * 1. 代码结构清晰，职责分离
 * 2. 状态管理集中化，便于维护
 * 3. 组件复用性高，易于扩展
 * 4. 用户体验优化，交互流畅
 * 5. 错误处理完善，提示友好
 */
import React, { useState } from 'react';
import { 
  PageLayout,
  ClassSelector,
  GroupSelector,
  RollCallControls,
  RollCallResult,
  RollCallHistory
} from '../components';
import { useRollCall } from '../hooks';

/**
 * 重构后的点名页面组件
 */
function RollCallPage() {
  // 使用自定义 Hook 管理点名相关的所有状态和逻辑
  const {
    // 数据状态
    classes,
    selectedClass,
    selectedGroups,
    history,
    
    // 点名状态
    isRolling,
    currentStudent,
    recentStudents,
    allowRepeat,
    
    // 统计信息
    stats,
    
    // 加载和错误状态
    loading,
    error,
    
    // 操作方法
    selectClass,
    toggleGroup,
    toggleRepeat,
    startRollCall,
    stopRollCall,
    resetRollCall,
    deleteHistory
  } = useRollCall();

  // 不再需要标签页状态，改为左中右三栏布局

  return (
    <PageLayout
      title="智能点名"
      subtitle="为班级的点名提供便利和效率"
      loading={loading}
      error={error}
    >
      <div className="flex flex-col lg:flex-row gap-4 min-h-[600px]">
        {/* 左侧：选择器区域 */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* 班级选择器 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">选择班级</h3>
              </div>
              <div className="p-4">
                <ClassSelector
                  classes={classes}
                  selectedClass={selectedClass}
                  onSelectClass={selectClass}
                  disabled={isRolling}
                />
              </div>
            </div>
            
            {/* 分组选择器 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">选择分组</h3>
              </div>
              <div className="p-4">
                <GroupSelector
                  selectedClass={selectedClass}
                  selectedGroups={selectedGroups}
                  onToggleGroup={toggleGroup}
                  disabled={isRolling}
                />
              </div>
            </div>

            {/* 点名模式设置 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">点名模式</h3>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">允许重复点名</span>
                  <button
                    onClick={() => !isRolling && toggleRepeat()}
                    disabled={isRolling}
                    className={`
                      relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 
                      transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:ring-offset-2
                      ${allowRepeat ? 'bg-blue-500 border-blue-500' : 'bg-gray-200 border-gray-200'}
                      ${isRolling ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <span 
                      className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full 
                        bg-white shadow ring-0 transition duration-200 ease-in-out
                        ${allowRepeat ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {allowRepeat ? '已点过的学生仍有机会被再次点到' : '已点过的学生不会再被点到'}
                </div>
              </div>
            </div>
          </div>

        {/* 中间：点名结果区域 */}
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 min-w-0 min-h-[400px] lg:min-h-[600px] lg:max-h-[calc(100vh-200px)] my-4 lg:my-0">
          <RollCallResult
            currentStudent={currentStudent}
            isRolling={isRolling}
            recentStudents={recentStudents}
            allowRepeat={allowRepeat}
            onToggleRepeat={toggleRepeat}
            onStart={startRollCall}
            onStop={stopRollCall}
            onReset={resetRollCall}
            stats={stats}
            disabled={!selectedClass}
          />
        </div>

        {/* 右侧：点名历史区域 */}
        <div className="w-full lg:w-80 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 min-h-[300px] lg:max-h-[calc(100vh-200px)] flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-sm font-medium text-gray-900">点名历史</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <RollCallHistory
              history={history}
              onDeleteHistory={deleteHistory}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* 使用提示 - 当没有选择班级时在底部显示 */}
      {!selectedClass && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                使用说明
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>首先选择要进行点名的班级</li>
                  <li>可选择特定分组进行定向点名，不选择则从所有分组中点名</li>
                  <li>设置点名模式：允许重复或不允许重复</li>
                  <li>点击"开始点名"开始随机选择学生</li>
                  <li>点名过程中可随时停止，也可重置重新开始</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default RollCallPage;