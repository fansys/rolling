/**
 * 点名历史记录组件
 *
 * 功能说明：
 * - 以小标签形式显示历史点名记录
 * - 使用多种随机颜色展示
 * - 显示学生姓名和点名时间
 *
 * 使用场景：
 * - 点名页面中的历史记录查看
 * - 提供简洁的点名数据回顾
 */
import React from "react";

/**
 * 点名历史记录组件
 *
 * @param {Object} props - 组件属性
 * @param {Array} props.history - 历史记录列表
 * @param {boolean} props.loading - 是否正在加载
 */
function RollCallHistory({ history = [], loading = false }) {

  // 定义多种颜色
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-green-100 text-green-800 border-green-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-yellow-100 text-yellow-800 border-yellow-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-red-100 text-red-800 border-red-200',
    'bg-orange-100 text-orange-800 border-orange-200',
    'bg-teal-100 text-teal-800 border-teal-200',
    'bg-cyan-100 text-cyan-800 border-cyan-200'
  ];

  // 获取随机颜色
  const getRandomColor = (index) => {
    return colors[index % colors.length];
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // 渲染历史记录标签
  const renderHistoryTag = (item, index) => {
    const student = item.student;
    const colorClass = getRandomColor(index);

    return (
      <div
        key={item.id}
        className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border transition-all duration-200 hover:shadow-md ${colorClass} m-1`}
      >
        <span className="bg-white bg-opacity-30 rounded-full px-2 py-1 text-xs font-bold mr-2">
          #{index + 1}
        </span>
        <span className="font-semibold">{student.name}</span>
        {student.studentId && (
          <>
            <span className="mx-1">•</span>
            <span className="text-xs opacity-75">{student.studentId}</span>
          </>
        )}
        <span className="mx-2">•</span>
        <span className="text-xs opacity-75">
          {formatDate(item.timestamp).split(' ')[1]}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 历史记录标签 */}
      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500 text-sm">暂无历史记录</p>
          </div>
        ) : (
          <div className="p-3">
            <div className="flex flex-wrap">
              {history.map((item, index) => renderHistoryTag(item, index))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RollCallHistory;
