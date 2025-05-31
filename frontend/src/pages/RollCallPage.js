import React, { useState, useEffect } from 'react';
import NavBar from "../components/NavBar";
import { PlayIcon, StopIcon, ArrowPathIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { PlayIcon as PlayIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import ApiService from '../services/api';

function RollCallPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [history, setHistory] = useState([]);
  const [current, setCurrent] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [rollSpeed, setRollSpeed] = useState(80);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 获取候选学生
  const getCandidates = () => {
    let students = [];
    if (selectedGroups.length > 0) {
      students = groups
        .filter(g => selectedGroups.includes(g.id))
        .flatMap(g => g.students);
    } else if (selectedClass) {
      students = selectedClass.groups.flatMap(g => g.students);
    }
    if (!allowRepeat) {
      students = students.filter(s => !history.some(h => h.student.id === s.id));
    }
    return students;
  };

  // 开始点名
  const handleStart = () => {
    const candidates = getCandidates();
    if (candidates.length === 0) return;
    setIsRolling(true);
    const id = setInterval(() => {
      const idx = Math.floor(Math.random() * candidates.length);
      setCurrent(candidates[idx]);
    }, rollSpeed);
    setIntervalId(id);
  };

  // 停止点名
  const handleStop = async () => {
    clearInterval(intervalId);
    setIsRolling(false);
    if (current && selectedClass) {
      try {
        // 保存点名记录到后端
        const recordData = {
          studentId: current.id,
          classId: selectedClass.id
        };
        await ApiService.createRollCallRecord(recordData);
        
        // 添加到本地历史记录
        const historyRecord = {
          student: current,
          timestamp: new Date(),
          className: selectedClass.name,
          groupName: groups.find(g => g.students.some(s => s.id === current.id))?.name || '未知分组'
        };
        setHistory([...history, historyRecord]);
      } catch (err) {
        console.error('保存点名记录失败:', err);
        setError('保存点名记录失败，请重试');
      }
    }
  };

  // 重置点名
  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setHistory([]);
    setCurrent(null);
    setIsRolling(false);
    clearInterval(intervalId);
  };

  // 格式化时间
  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 并行加载班级数据和历史记录
      const [classesData, historyData] = await Promise.all([
        ApiService.getClasses(),
        // ApiService.getRollCallHistory()
        []
      ]);
      
      setClasses(classesData);
      
      // 转换历史记录格式
      const formattedHistory = historyData.map(record => ({
        student: {
          id: record.student.id,
          name: record.student.name,
          studentId: record.student.studentId
        },
        timestamp: new Date(record.calledAt),
        className: record.classObj.name,
        groupName: record.groupObj.name
      }));
      setHistory(formattedHistory);
      
      // 如果有班级数据，默认选择第一个班级
      if (classesData.length > 0) {
        changeClass(classesData[0]);
      }
    } catch (err) {
      console.error('加载数据失败:', err);
      setError('加载数据失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  };

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = groups.filter(group => selectedGroups.includes(group.id)).flatMap(group => group.students);
    setFilteredStudents(filtered);
  }, [groups, selectedGroups]);

  const changeClass = (cls) => {
    setSelectedClass(cls);
    setGroups(cls.groups);
    setHistory([]);
    setCurrent('');
    setIsRolling(false);
    clearInterval(intervalId);
    // 默认全选新班级所有分组
    const allGroupIds = cls.groups.map(group => group.id);
    setSelectedGroups(allGroupIds);
  }

  const selectAllGroups = () => {
    const allGroupIds = groups.map(group => group.id);
    setSelectedGroups(allGroupIds);
  }

  // 下拉选择班级时切换分组和学生
  const handleClassChange = (e) => {
    const cls = classes.find(c => c.id === Number(e.target.value));
    if (!selectedClass || cls.id !== selectedClass.id) {
      changeClass(cls);
    }
  }

  // 切换分组
  const handleGroupChange = (groupId) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  };

  const handleSelectAllGroups = () => {
    if (selectedGroups.length === groups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(groups.map(g => g.id));
    }
  };

  const removeFromHistory = (index) => {
    const newHistory = [...history];
    newHistory.splice(index, 1);
    setHistory(newHistory);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavBar />
      <div className="w-full max-w-7xl mx-auto pt-20 sm:pt-20 lg:pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">智能点名系统</h1>
          <p className="text-gray-600">公平、随机、高效的课堂点名工具</p>
        </div>
        
        {/* 加载状态 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">加载中...</span>
          </div>
        )}
        
        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          </div>
        )}
        
        {/* 主要内容 */}
        {!loading && !error && (
        
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
           {/* 左侧控制面板 - 弱化 */}
           <div className="lg:w-1/4 space-y-4">
             {/* 班级选择 */}
             <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4">
               <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                 <UserIcon className="w-4 h-4 mr-2 text-blue-500" />
                 班级选择
               </h3>
               <select 
                 className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-transparent transition-all"
                 value={selectedClass?.id || ''}
                 onChange={(e) => {
                   const classId = parseInt(e.target.value);
                   const cls = classes.find(c => c.id === classId);
                   if (cls) {
                     changeClass(cls);
                   }
                 }}
               >
                 <option value="">请选择班级</option>
                 {classes.map(cls => (
                   <option key={cls.id} value={cls.id}>{cls.name}</option>
                 ))}
               </select>
             </div>

             {/* 分组选择 */}
             {selectedClass && (
               <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4">
                 <div className="flex justify-between items-center mb-3">
                   <h3 className="text-sm font-medium text-gray-700 flex items-center">
                     <UserIcon className="w-4 h-4 mr-2 text-green-500" />
                     分组选择
                   </h3>
                   <button
                     onClick={handleSelectAllGroups}
                     className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                   >
                     {selectedGroups.length === groups.length ? '取消全选' : '全选'}
                   </button>
                 </div>
                 <div className="space-y-2">
                   {groups.map(group => (
                     <label key={group.id} className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors">
                       <input
                         type="checkbox"
                         checked={selectedGroups.includes(group.id)}
                         onChange={() => handleGroupChange(group.id)}
                         className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                       />
                       <span className="ml-2 text-sm text-gray-600">
                         {group.name} 
                         <span className="text-xs text-gray-400 ml-1">({group.students.length}人)</span>
                       </span>
                     </label>
                   ))}
                 </div>
               </div>
             )}

             {/* 设置选项 */}
             <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4">
               <h3 className="text-sm font-medium text-gray-700 mb-3">点名设置</h3>
               <div className="space-y-3">
                 <label className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors">
                   <input
                     type="checkbox"
                     checked={allowRepeat}
                     onChange={(e) => setAllowRepeat(e.target.checked)}
                     className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                   />
                   <span className="ml-2 text-sm text-gray-600">允许重复点名</span>
                 </label>
                 <div>
                   <label className="block text-xs font-medium text-gray-600 mb-1">滚动速度</label>
                   <input
                     type="range"
                     min="30"
                     max="150"
                     value={rollSpeed}
                     onChange={(e) => setRollSpeed(parseInt(e.target.value))}
                     className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                   />
                   <div className="flex justify-between text-xs text-gray-400 mt-1">
                     <span>快</span>
                     <span>慢</span>
                   </div>
                 </div>
               </div>
             </div>
           </div>

           {/* 中间点名区域 - 突出显示 */}
           <div className="lg:w-1/2 flex flex-col">
             {/* 主要点名区域 */}
             <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-2xl shadow-2xl border-2 border-blue-200 p-8 lg:p-12">
               {/* 当前点名学生显示 */}
               <div className="text-center mb-8">
                 <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-8">智能点名</h2>
                 <div className={`transition-all duration-300 ${
                   isRolling ? 'animate-pulse' : ''
                 }`}>
                   {current ? (
                     <div className="space-y-6">
                       <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                         <UserIcon className="w-16 h-16 lg:w-20 lg:h-20 text-white" />
                       </div>
                       <div className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                         {current.name}
                       </div>
                       <div className="text-xl lg:text-2xl text-gray-600 bg-white/70 rounded-full px-6 py-2 inline-block">
                         学号: {current.studentId}
                       </div>
                     </div>
                   ) : (
                     <div className="space-y-6">
                       <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                         <UserIcon className="w-16 h-16 lg:w-20 lg:h-20 text-gray-500" />
                       </div>
                       <div className="text-3xl lg:text-4xl font-medium text-gray-500">
                         等待开始点名
                       </div>
                     </div>
                   )}
                 </div>
               </div>

               {/* 点名按钮区域 */}
               <div className="text-center space-y-6">
                 <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                   <button
                     onClick={isRolling ? handleStop : handleStart}
                     disabled={getCandidates().length === 0}
                     className={`relative px-10 py-5 rounded-full font-bold text-xl transition-all transform hover:scale-110 disabled:transform-none shadow-2xl ${
                       isRolling 
                         ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white' 
                         : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                     } disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none flex items-center`}
                   >
                     {isRolling ? (
                       <>
                         <StopIcon className="w-7 h-7 mr-3" />
                         停止点名
                       </>
                     ) : (
                       <>
                         <PlayIconSolid className="w-7 h-7 mr-3" />
                         开始点名
                       </>
                     )}
                   </button>
                   <button
                     onClick={handleReset}
                     className="px-8 py-5 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-full font-bold text-lg transition-all transform hover:scale-110 flex items-center shadow-lg"
                   >
                     <ArrowPathIcon className="w-6 h-6 mr-2" />
                     重置
                   </button>
                 </div>
                 
                 <div className="text-lg text-gray-700 bg-white/70 rounded-full px-6 py-2 inline-block">
                   候选学生: <span className="font-bold text-blue-600">{getCandidates().length}</span> 人
                 </div>
               </div>
             </div>
           </div>

           {/* 右侧历史记录 - 弱化 */}
           <div className="lg:w-1/4">
             <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4 h-full">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-sm font-medium text-gray-700 flex items-center">
                   <ClockIcon className="w-4 h-4 mr-2 text-purple-500" />
                   点名历史
                 </h2>
                 <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                   {history.length}
                 </span>
               </div>
               
               {history.length === 0 ? (
                 <div className="text-center py-8">
                   <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                   <p className="text-sm text-gray-500">暂无记录</p>
                 </div>
               ) : (
                 <div className="space-y-2 overflow-y-auto">
                   {history.map((record, index) => (
                     <div key={index} className="group bg-gray-50/80 hover:bg-gray-100/80 rounded-lg p-3 transition-colors">
                       <div className="flex justify-between items-start">
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center mb-1">
                             <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                               <span className="text-white text-xs font-bold">{index + 1}</span>
                             </div>
                             <div className="min-w-0">
                               <div className="font-medium text-sm text-gray-800 truncate">{record.student.name}</div>
                               <div className="text-xs text-gray-600 truncate">学号: {record.student.studentId}</div>
                             </div>
                           </div>
                           <div className="text-xs text-gray-500 ml-8">
                             <div className="truncate">{record.className} - {record.groupName}</div>
                             <div className="flex items-center mt-1">
                               <ClockIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                               <span className="truncate">{formatTime(record.timestamp)}</span>
                             </div>
                           </div>
                         </div>
                         <button
                           onClick={() => removeFromHistory(index)}
                           className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1 flex-shrink-0"
                           title="删除记录"
                         >
                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                           </svg>
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           </div>
         </div>
        )}
      </div>
      
      {/* 确认重置弹窗 */}
      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={confirmReset}
        title="确认重置"
        message="确定要重置所有点名记录吗？"
        confirmText="重置"
        cancelText="取消"
        type="warning"
      />
    </div>
  );
}

export default RollCallPage;
