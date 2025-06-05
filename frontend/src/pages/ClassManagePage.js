/**
 * 重构后的班级管理页面
 * 
 * 功能说明：
 * - 班级的创建、编辑、删除操作
 * - 班级信息的展示和管理
 * - 集成通用 UI 组件和自定义 Hook
 * - 提供友好的用户交互体验
 * 
 * 重构优势：
 * 1. 使用 useDataManager Hook 统一数据管理
 * 2. 采用通用 UI 组件提高一致性
 * 3. 集成错误处理和加载状态
 * 4. 代码结构清晰，易于维护
 */
import React, { useState } from 'react';
import { 
  PageLayout,
  Button,
  Modal,
  Input,
  ErrorMessage,
  ConfirmDialog
} from '../components';
import { useDataManager, useForm, useConfirmDialog } from '../hooks';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

/**
 * 班级表单组件
 */
function ClassForm({ isOpen, onClose, onSubmit, initialData = null, loading = false }) {
  // 使用 useForm Hook 管理表单状态
  const { values, errors, handleChange, handleSubmit, reset } = useForm(
    {
      name: initialData?.name || '',
      description: initialData?.description || ''
    },
    {
      name: {
        required: true,
        minLength: 2,
        maxLength: 50
      },
      description: {
        maxLength: 200
      }
    }
  );

  // 处理表单提交
  const handleFormSubmit = async (formData) => {
    try {
      await onSubmit(formData);
      reset();
      onClose();
    } catch (error) {
      console.error('提交表单失败:', error);
    }
  };

  // 处理模态框关闭
  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initialData ? '编辑班级' : '添加班级'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* 班级名称 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            班级名称 *
          </label>
          <Input
            name="name"
            value={values.name}
            onChange={handleChange}
            placeholder="请输入班级名称"
            error={errors.name}
            disabled={loading}
          />
        </div>

        {/* 班级描述 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            班级描述
          </label>
          <textarea
            name="description"
            value={values.description}
            onChange={handleChange}
            placeholder="请输入班级描述（可选）"
            rows={3}
            disabled={loading}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.description ? 'border-red-300' : 'border-gray-300'}
              ${loading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
            `}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* 表单按钮 */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            取消
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            {initialData ? '更新' : '创建'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * 班级卡片组件
 */
function ClassCard({ classItem, onEdit, onDelete }) {
  // 计算班级统计信息
  const groupCount = classItem.groups?.length || 0;
  const studentCount = classItem.groups?.reduce(
    (total, group) => total + (group.students?.length || 0), 
    0
  ) || 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* 班级头部信息 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {classItem.name}
          </h3>
          {classItem.description && (
            <p className="text-gray-600 text-sm">
              {classItem.description}
            </p>
          )}
        </div>
        
        {/* 操作按钮 */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(classItem)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(classItem)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 班级统计信息 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center text-gray-600">
          <UserGroupIcon className="h-5 w-5 mr-2 text-blue-500" />
          <div>
            <div className="text-sm text-gray-500">分组数量</div>
            <div className="font-semibold">{groupCount}</div>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600">
          <AcademicCapIcon className="h-5 w-5 mr-2 text-green-500" />
          <div>
            <div className="text-sm text-gray-500">学生总数</div>
            <div className="font-semibold">{studentCount}</div>
          </div>
        </div>
      </div>

      {/* 分组列表预览 */}
      {groupCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500 mb-2">分组列表:</div>
          <div className="flex flex-wrap gap-2">
            {classItem.groups.slice(0, 3).map((group) => (
              <span 
                key={group.id}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {group.name} ({group.students?.length || 0})
              </span>
            ))}
            {groupCount > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{groupCount - 3} 个分组
              </span>
            )}
          </div>
        </div>
      )}

      {/* 创建时间 */}
      {classItem.createdAt && (
        <div className="mt-4 text-xs text-gray-400">
          创建时间: {new Date(classItem.createdAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

/**
 * 重构后的班级管理页面组件
 */
function ClassManagePage() {
  // 使用数据管理 Hook
  const {
    data: classes,
    loading,
    error,
    create: createClass,
    update: updateClass,
    remove: deleteClass
  } = useDataManager('/api/classes');

  // 使用确认对话框 Hook
  const {
    isOpen: deleteConfirmOpen,
    data: deleteTarget,
    openDialog: openDeleteConfirm,
    closeDialog: closeDeleteConfirm,
    confirmAction: confirmDelete
  } = useConfirmDialog();

  // 本地状态
  const [formModal, setFormModal] = useState({ isOpen: false, data: null });
  const [formLoading, setFormLoading] = useState(false);

  // 打开添加班级表单
  const handleAddClass = () => {
    setFormModal({ isOpen: true, data: null });
  };

  // 打开编辑班级表单
  const handleEditClass = (classItem) => {
    setFormModal({ isOpen: true, data: classItem });
  };

  // 关闭表单模态框
  const handleCloseForm = () => {
    setFormModal({ isOpen: false, data: null });
  };

  // 处理表单提交
  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (formModal.data) {
        // 编辑班级
        await updateClass(formModal.data.id, formData);
      } else {
        // 创建班级
        await createClass(formData);
      }
    } finally {
      setFormLoading(false);
    }
  };

  // 处理删除班级
  const handleDeleteClass = (classItem) => {
    openDeleteConfirm(classItem);
  };

  // 确认删除班级
  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteClass(deleteTarget.id);
      confirmDelete();
    }
  };

  // 页面操作按钮
  const pageActions = (
    <Button
      variant="primary"
      onClick={handleAddClass}
      disabled={loading}
    >
      <PlusIcon className="h-5 w-5 mr-2" />
      添加班级
    </Button>
  );

  return (
    <PageLayout
      title="班级管理"
      subtitle="管理所有班级信息，包括班级的创建、编辑和删除"
      loading={loading}
      error={error}
      actions={pageActions}
    >
      {/* 班级列表 */}
      {classes.length === 0 ? (
        <div className="text-center py-12">
          <UserGroupIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无班级</h3>
          <p className="text-gray-500 mb-6">开始创建您的第一个班级</p>
          <Button variant="primary" onClick={handleAddClass}>
            <PlusIcon className="h-5 w-5 mr-2" />
            创建班级
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              onEdit={handleEditClass}
              onDelete={handleDeleteClass}
            />
          ))}
        </div>
      )}

      {/* 班级表单模态框 */}
      <ClassForm
        isOpen={formModal.isOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={formModal.data}
        loading={formLoading}
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="删除班级"
        message={`确定要删除班级 "${deleteTarget?.name}" 吗？删除后该班级下的所有分组和学生信息也将被删除，此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />
    </PageLayout>
  );
}

export default ClassManagePage;