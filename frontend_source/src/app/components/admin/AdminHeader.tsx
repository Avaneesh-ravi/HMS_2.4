import React from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';

interface AdminHeaderProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  title?: string;
  adminRole?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  title = 'Admin Dashboard',
  adminRole = 'Super Admin'
}) => {
  return (
    <header className="no-print admin-top-header bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-teal-700" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Administrator</p>
          <p className="text-xs text-gray-500">{adminRole}</p>
        </div>
      </div>
    </header>
  );
};
