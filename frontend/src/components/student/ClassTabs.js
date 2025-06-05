import React from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useForm } from '../../hooks/useForm';

const ClassTabs = ({
  classes,
  activeTab,
  onTabChange,
  onAddClass,
  onDeleteClass,
  loading = false
}) => {
  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset
  } = useForm(
    { name: '' },
    async (formData) => {
      await onAddClass(formData);
      reset();
    },
    (values) => {
      const errors = {};
      if (!values.name?.trim()) {
        errors.name = '班级名称不能为空';
      }
      return errors;
    }
  );

  if (loading) {
    return (
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-20 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex space-x-1 overflow-x-auto">
          {classes.map((cls) => (
            <div key={cls.id} className="flex items-center group">
              <button
                onClick={() => onTabChange(cls.id)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
                  ${activeTab === cls.id
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {cls.name}
              </button>
              
              {classes.length > 1 && (
                <button
                  onClick={() => onDeleteClass(cls.id)}
                  className="ml-1 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="删除班级"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              placeholder="新班级名称"
              value={values.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              className="w-32"
            />
            <Button
              type="submit"
              size="sm"
              icon={PlusIcon}
              loading={isSubmitting}
              disabled={!values.name?.trim()}
            >
              添加班级
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClassTabs;