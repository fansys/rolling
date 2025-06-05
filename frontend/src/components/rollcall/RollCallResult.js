/**
 * 点名结果显示组件
 *
 * 功能说明：
 * - 显示当前被点到的学生信息
 * - 展示点名动画效果
 * - 显示学生的详细信息（姓名、分组等）
 *
 * 使用场景：
 * - 点名页面中的结果展示区域
 * - 提供视觉反馈和动画效果
 */
import React, { useEffect, useState } from "react";
import {
  UserIcon,
  UserGroupIcon,
  SparklesIcon,
  ClockIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../ui";

/**
 * 点名结果显示组件
 *
 * @param {Object} props - 组件属性
 * @param {Object} props.currentStudent - 当前被点名的学生
 * @param {boolean} props.isRolling - 是否正在点名
 * @param {Array} props.recentStudents - 最近被点名的学生列表
 * @param {boolean} props.allowRepeat - 是否允许重复点名
 * @param {Function} props.onToggleRepeat - 切换重复模式的回调函数
 * @param {Function} props.onStart - 开始点名的回调函数
 * @param {Function} props.onStop - 停止点名的回调函数
 * @param {Function} props.onReset - 重置点名的回调函数
 * @param {Object} props.stats - 点名统计信息
 * @param {boolean} props.disabled - 是否禁用控制
 */
function RollCallResult({
  currentStudent,
  isRolling,
  recentStudents = [],
  allowRepeat = false,
  onToggleRepeat,
  onStart,
  onStop,
  onReset,
  stats = {},
  disabled = false,
}) {
  const [animationClass, setAnimationClass] = useState("");
  const [showSparkles, setShowSparkles] = useState(false);

  // 当学生改变时触发动画
  useEffect(() => {
    if (currentStudent && !isRolling) {
      setAnimationClass("animate-bounce");
      setShowSparkles(true);

      // 清除动画类
      const timer = setTimeout(() => {
        setAnimationClass("");
        setShowSparkles(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentStudent, isRolling]);

  // 解构统计信息
  const {
    totalStudents = 0,
    calledStudents = 0,
    remainingStudents = 0,
    startTime = null,
    elapsedTime = 0,
  } = stats;

  // 格式化时间（将毫秒转换为分:秒格式）
  const formatTime = (milliseconds) => {
    if (!milliseconds) return "00:00";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // 计算点名进度百分比
  const progressPercentage =
    totalStudents > 0 ? Math.round((calledStudents / totalStudents) * 100) : 0;

  // 如果没有当前学生且不在点名中，显示等待状态
  if (!currentStudent && !isRolling) {
    return (
      <div className="h-full flex flex-col">
        {/* 头部装饰 */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-6 rounded-t-xl">
          <div className="flex items-center justify-center text-white">
            <SparklesIcon
              className={`h-8 w-8 mr-3 ${showSparkles ? "animate-pulse" : ""}`}
            />
            <h3 className="text-2xl font-medium">🎯 准备点名</h3>
            <SparklesIcon
              className={`h-8 w-8 ml-3 ${showSparkles ? "animate-pulse" : ""}`}
            />
          </div>
        </div>
        {/* 等待状态 - 放在最上面 */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-gray-500">
            <UserIcon className="h-24 w-24 mx-auto mb-8 text-gray-300" />
            <h3 className="text-2xl font-medium mb-4">准备开始点名</h3>
            <p className="text-lg">点击"开始点名"按钮开始随机点名</p>
          </div>
        </div>

        {/* 底部控制区域 */}
        <div className="p-6 border-t border-gray-200">
          {/* 控制按钮 */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={onStart}
              disabled={disabled || totalStudents === 0}
              className="flex items-center justify-center flex-1"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              开始点名
            </Button>

            <Button
              variant="secondary"
              onClick={onReset}
              disabled={disabled || (calledStudents === 0 && !isRolling)}
              className="flex items-center justify-center"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              重置
            </Button>
          </div>
          {/* 点名统计信息 */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="flex items-center text-blue-700 mb-1">
                <UserIcon className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">总人数</span>
              </div>
              <div className="text-xl font-bold text-blue-900">
                {totalStudents}
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <div className="flex items-center text-green-700 mb-1">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">已点</span>
              </div>
              <div className="text-xl font-bold text-green-900">
                {calledStudents}
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              <div className="flex items-center text-yellow-700 mb-1">
                <XCircleIcon className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">未点</span>
              </div>
              <div className="text-xl font-bold text-yellow-900">
                {remainingStudents}
              </div>
            </div>
          </div>

          {/* 点名进度条 */}
          <div className="mt-2 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">点名进度</span>
              <span className="text-sm font-medium text-gray-900">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 点名进行中的动画效果
  if (isRolling) {
    return (
      <div className="h-full flex flex-col">
        {/* 头部装饰 */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-6 rounded-t-xl">
          <div className="flex items-center justify-center text-white">
            <SparklesIcon
              className={`h-8 w-8 mr-3 ${showSparkles ? "animate-pulse" : ""}`}
            />
            <h3 className="text-2xl font-medium">🎯 正在点名</h3>
            <SparklesIcon
              className={`h-8 w-8 ml-3 ${showSparkles ? "animate-pulse" : ""}`}
            />
          </div>
        </div>
        {/* 点名动画区域 - 放在最上面 */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            {/* 如果有当前学生，显示学生信息 */}
            {currentStudent ? (
              <>
                {/* 学生头像占位符 */}
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                    <UserIcon className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute inset-0 w-32 h-32 mx-auto border-4 border-blue-300 rounded-full animate-ping opacity-75"></div>
                </div>

                {/* 学生姓名 */}
                <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-pulse">
                  {currentStudent.name}
                </h2>

                {/* 学生详细信息 */}
                <div className="space-y-2 text-gray-600 mb-4">
                  {currentStudent.groupName && (
                    <div className="flex items-center justify-center">
                      <UserGroupIcon className="h-5 w-5 mr-2 text-blue-500" />
                      <span className="text-base">
                        分组: {currentStudent.groupName}
                      </span>
                      {currentStudent.studentId && (
                        <span className="text-base ml-4">
                          学号: {currentStudent.studentId}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center text-sm">
                    <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>正在点名中...</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="relative mb-4">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                    <SparklesIcon className="h-16 w-16 text-white animate-spin" />
                  </div>
                  <div className="absolute inset-0 w-32 h-32 mx-auto border-4 border-blue-300 rounded-full animate-ping opacity-75"></div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2 animate-pulse">
                  正在点名中...
                </h3>
                <p className="text-lg text-gray-600">请稍候，正在随机选择学生</p>
              </>
            )}
          </div>
        </div>

        {/* 底部控制区域 */}
        <div className="p-6 border-t border-gray-200">
          {/* 控制按钮 */}
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={onStop}
              disabled={disabled}
              className="flex items-center justify-center flex-1"
            >
              <StopIcon className="h-5 w-5 mr-2" />
              停止点名
            </Button>

            <Button
              variant="secondary"
              onClick={onReset}
              disabled={disabled}
              className="flex items-center justify-center"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              重置
            </Button>
          </div>
          {/* 点名统计信息 */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="flex items-center text-blue-700 mb-1">
                <UserIcon className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">总人数</span>
              </div>
              <div className="text-xl font-bold text-blue-900">
                {totalStudents}
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <div className="flex items-center text-green-700 mb-1">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">已点</span>
              </div>
              <div className="text-xl font-bold text-green-900">
                {calledStudents}
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              <div className="flex items-center text-yellow-700 mb-1">
                <XCircleIcon className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">未点</span>
              </div>
              <div className="text-xl font-bold text-yellow-900">
                {remainingStudents}
              </div>
            </div>
          </div>

          {/* 点名进度条 */}
          <div className="mt-2 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">点名进度</span>
              <span className="text-sm font-medium text-gray-900">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 显示点名结果
  return (
    <div className="h-full flex flex-col">
      {/* 头部装饰 */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-6 rounded-t-xl">
        <div className="flex items-center justify-center text-white">
          <SparklesIcon
            className={`h-8 w-8 mr-3 ${showSparkles ? "animate-pulse" : ""}`}
          />
          <h3 className="text-2xl font-medium">🎯 点名结果</h3>
          <SparklesIcon
            className={`h-8 w-8 ml-3 ${showSparkles ? "animate-pulse" : ""}`}
          />
        </div>
      </div>
      {/* 学生信息展示 */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          {/* 学生头像占位符 */}
          <div className={`relative inline-block mb-4 ${animationClass}`}>
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <UserIcon className="h-12 w-12 text-white" />
            </div>

            {/* 闪烁效果 */}
            {showSparkles && (
              <div className="absolute -top-2 -right-2">
                <SparklesIcon className="h-8 w-8 text-yellow-400 animate-ping" />
              </div>
            )}
          </div>

          {/* 学生姓名 */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {currentStudent.name}
          </h2>

          {/* 学生详细信息 */}
          <div className="space-y-2 text-gray-600">
            {currentStudent.groupName && (
              <div className="flex items-center justify-center">
                <UserGroupIcon className="h-5 w-5 mr-2 text-blue-500" />
                <span className="text-base">
                  分组: {currentStudent.groupName}
                </span>
                {currentStudent.studentId && (
                  <span className="text-base ml-4">
                    学号: {currentStudent.studentId}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-center text-sm">
              <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
              <span>点名时间: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 顶部统计信息和控制按钮 */}
      <div className="p-6 border-t border-gray-200">
        {/* 控制按钮 */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={onStart}
            disabled={disabled || totalStudents === 0}
            className="flex items-center justify-center flex-1"
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            开始点名
          </Button>

          <Button
            variant="secondary"
            onClick={onReset}
            disabled={disabled || (calledStudents === 0 && !isRolling)}
            className="flex items-center justify-center"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            重置
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="flex items-center text-blue-700 mb-1">
              <UserIcon className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">总人数</span>
            </div>
            <div className="text-xl font-bold text-blue-900">
              {totalStudents}
            </div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <div className="flex items-center text-green-700 mb-1">
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">已点</span>
            </div>
            <div className="text-xl font-bold text-green-900">
              {calledStudents}
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
            <div className="flex items-center text-yellow-700 mb-1">
              <XCircleIcon className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">未点</span>
            </div>
            <div className="text-xl font-bold text-yellow-900">
              {remainingStudents}
            </div>
          </div>
        </div>

        {/* 点名进度条 */}
        <div className="mt-2 mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">点名进度</span>
            <span className="text-sm font-medium text-gray-900">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RollCallResult;
