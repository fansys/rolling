/**
 * 点名控制面板组件
 * 
 * 功能说明：
 * - 提供点名操作的控制按钮（开始、停止、重置）
 * - 显示点名模式选择（重复/不重复）
 * - 显示当前点名状态和统计信息
 * 
 * 使用场景：
 * - 点名页面中的操作控制区域
 * - 提供点名过程中的交互控制
 */
import React from 'react';
import { 
  PlayIcon, 
  StopIcon, 
  ArrowPathIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';

/**
 * 点名控制面板组件
 * 
 * @param {Object} props - 组件属性
 * @param {boolean} props.isRolling - 是否正在点名
 * @param {boolean} props.allowRepeat - 是否允许重复点名
 * @param {Function} props.onToggleRepeat - 切换重复模式的回调函数
 * @param {Function} props.onStart - 开始点名的回调函数
 * @param {Function} props.onStop - 停止点名的回调函数
 * @param {Function} props.onReset - 重置点名的回调函数
 * @param {Object} props.stats - 点名统计信息
 * @param {boolean} props.disabled - 是否禁用控制
 */
function RollCallControls({ 
  isRolling = false,
  allowRepeat = false,
  onToggleRepeat,
  onStart,
  onStop,
  onReset,
  stats = {},
  disabled = false
}) {
  // 解构统计信息
  const { 
    totalStudents = 0, 
    calledStudents = 0, 
    remainingStudents = 0,
    startTime = null,
    elapsedTime = 0
  } = stats;

  // 格式化时间（将毫秒转换为分:秒格式）
  const formatTime = (milliseconds) => {
    if (!milliseconds) return '00:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 计算点名进度百分比
  const progressPercentage = totalStudents > 0 
    ? Math.round((calledStudents / totalStudents) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 组件标题 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <ClockIcon className="h-5 w-5 mr-2 text-purple-500" />
          点名控制
        </h3>
      </div>

      {/* 控制面板内容 */}
      <div className="p-6">
        {/* 点名模式选择 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-700 font-medium">点名模式:</span>
            <div className="flex items-center">
              <button
                onClick={() => !disabled && onToggleRepeat()}
                disabled={disabled || isRolling}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 
                  transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 
                  focus:ring-purple-500 focus:ring-offset-2
                  ${allowRepeat ? 'bg-purple-500 border-purple-500' : 'bg-gray-200 border-gray-200'}
                  ${(disabled || isRolling) ? 'opacity-50 cursor-not-allowed' : ''}
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
              <span className="ml-2 text-sm text-gray-600">
                {allowRepeat ? '允许重复点名' : '不重复点名'}
              </span>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
            {allowRepeat ? (
              <p>当前模式：允许重复点名 - 已点过的学生仍有机会被再次点到</p>
            ) : (
              <p>当前模式：不重复点名 - 已点过的学生不会再被点到</p>
            )}
          </div>
        </div>

        {/* 点名统计信息 */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="flex items-center text-blue-700 mb-1">
              <UserIcon className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">总人数</span>
            </div>
            <div className="text-xl font-bold text-blue-900">{totalStudents}</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <div className="flex items-center text-green-700 mb-1">
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">已点</span>
            </div>
            <div className="text-xl font-bold text-green-900">{calledStudents}</div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
            <div className="flex items-center text-yellow-700 mb-1">
              <XCircleIcon className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">未点</span>
            </div>
            <div className="text-xl font-bold text-yellow-900">{remainingStudents}</div>
          </div>
        </div>

        {/* 点名进度条 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">点名进度</span>
            <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-purple-500 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* 点名计时器 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">点名时间:</span>
            <div className="text-lg font-mono font-bold text-purple-700">
              {formatTime(elapsedTime)}
            </div>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="grid grid-cols-3 gap-3">
          {!isRolling ? (
            <Button
              variant="primary"
              onClick={onStart}
              disabled={disabled || totalStudents === 0}
              className="flex items-center justify-center"
            >
              <PlayIcon className="h-5 w-5 mr-1" />
              开始点名
            </Button>
          ) : (
            <Button
              variant="danger"
              onClick={onStop}
              disabled={disabled}
              className="flex items-center justify-center"
            >
              <StopIcon className="h-5 w-5 mr-1" />
              停止点名
            </Button>
          )}
          
          <Button
            variant="secondary"
            onClick={onReset}
            disabled={disabled || (calledStudents === 0 && !isRolling)}
            className="flex items-center justify-center"
          >
            <ArrowPathIcon className="h-5 w-5 mr-1" />
            重置点名
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {}}
            disabled={true}
            className="flex items-center justify-center opacity-50"
          >
            更多选项
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RollCallControls;