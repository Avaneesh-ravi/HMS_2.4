import React from 'react';
import { ChevronLeft, LogOut, Hospital } from 'lucide-react';
import { BrandingSettings } from '../../../types';

interface SidebarNavEntry {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface AdminSidebarProps {
  sidebarCollapsed: boolean;
  activeSection: string;
  setActiveSection: (id: string) => void;
  brandingSettings: BrandingSettings;
  sidebarItems: SidebarNavEntry[];
  onClose?: () => void;
  onLogout?: () => void;
  getEffectiveHospitalId: () => string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  sidebarCollapsed,
  activeSection,
  setActiveSection,
  brandingSettings,
  sidebarItems,
  onClose,
  onLogout,
  getEffectiveHospitalId
}) => {
  return (
    <aside className={`no-print admin-sidebar-nav bg-gradient-to-b from-teal-700 to-teal-900 shadow-2xl transition-all duration-300 flex-shrink-0 flex flex-col ${sidebarCollapsed ? 'w-20' : 'w-[260px]'}`}>
      {/* Logo/Brand Section */}
      <div className="p-6 border-b border-white/20 flex items-center justify-between">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              {brandingSettings.logo ? (
                <img src={brandingSettings.logo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Hospital className="w-6 h-6 text-teal-700" />
              )}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-lg font-bold text-white truncate" title={brandingSettings.hospitalName}>
                {brandingSettings.hospitalName}
              </h2>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto overflow-hidden">
            {brandingSettings.logo ? (
              <img src={brandingSettings.logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Hospital className="w-6 h-6 text-teal-700" />
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
              activeSection === item.id
                ? 'bg-white text-teal-700 font-semibold shadow-lg border-l-4 border-white'
                : 'text-white hover:bg-white/10'
            } ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            {item.icon}
            {!sidebarCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 space-y-2 border-t border-white/20">
        <button
          onClick={() => {
            if (onClose) {
              onClose();
            } else {
              const hid = getEffectiveHospitalId();
              const p = window.location.pathname;
              let formUrl = `../../frontend/feedback-form.php?hospital_id=${hid}`;
              if (p.includes('api/frontend')) {
                formUrl = `feedback-form.php?hospital_id=${hid}`;
              } else if (!p.includes('api/backend/admin')) {
                formUrl = `api/frontend/feedback-form.php?hospital_id=${hid}`;
              }
              window.location.href = formUrl;
            }
          }}
          className={`w-full text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm flex items-center gap-2 cursor-pointer ${sidebarCollapsed ? 'justify-center' : ''}`}
          title="Return to Feedback Form"
        >
          <ChevronLeft className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && 'Back to Form'}
        </button>
        <button
          onClick={() => {
            if (onLogout) {
              onLogout();
            } else {
              const p = window.location.pathname;
              if (p.includes('api/backend/admin')) {
                window.location.href = 'logout.php';
              } else if (p.includes('api/frontend')) {
                window.location.href = '../backend/admin/login.php';
              } else {
                window.location.href = 'api/backend/admin/login.php';
              }
            }
          }}
          className={`w-full bg-red-500/20 text-white px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors text-sm flex items-center gap-2 cursor-pointer ${sidebarCollapsed ? 'justify-center' : ''}`}
          title="Logout to Hospital Login"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
};
