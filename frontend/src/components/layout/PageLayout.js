import React from 'react';
import NavBar from '../NavBar';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

const PageLayout = ({
  title,
  subtitle,
  children,
  loading = false,
  error = null,
  onErrorDismiss,
  headerActions,
  className = ''
}) => {
  if (loading) {
    return (
      <div>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="text-center">
            <LoadingSpinner size="xl" />
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <NavBar />
      
      <div className="pt-16">
        {/* 页面标题 */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  {subtitle && (
                    <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                  )}
                </div>
                {headerActions && (
                  <div className="flex items-center gap-3">
                    {headerActions}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <ErrorMessage 
              error={error} 
              onDismiss={onErrorDismiss}
            />
          </div>
        )}

        {/* 主要内容 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;