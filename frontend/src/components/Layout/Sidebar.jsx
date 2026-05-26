import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CalendarCheck, 
  FileText, 
  DollarSign,
  TrendingUp,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'hr_manager', 'employee'] },
    { path: '/employees', icon: Users, label: 'Employees', roles: ['admin', 'hr_manager'] },
    { path: '/departments', icon: Building2, label: 'Departments', roles: ['admin', 'hr_manager'] },
    { path: '/attendance', icon: CalendarCheck, label: 'Attendance', roles: ['admin', 'hr_manager', 'employee'] },
    { path: '/leaves', icon: FileText, label: 'Leave Requests', roles: ['admin', 'hr_manager', 'employee'] },
    { path: '/payroll', icon: DollarSign, label: 'Payroll', roles: ['admin', 'hr_manager', 'employee'] },
    { path: '/performance', icon: TrendingUp, label: 'Performance', roles: ['admin', 'hr_manager', 'employee'] },
    { path: '/reports', icon: BarChart3, label: 'Reports', roles: ['admin', 'hr_manager'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || 'employee')
  );

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white z-30
        transition-all duration-300 shadow-xl
        ${sidebarOpen ? 'w-64' : 'w-20'}
        ${sidebarOpen ? 'lg:w-64' : 'lg:w-20'}
      `}>
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold">HR System</h1>
                <p className="text-xs text-gray-400">SmartTech Ltd</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-700 transition-colors hidden lg:block"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 px-3">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
                ${!sidebarOpen && 'justify-center'}
              `}
              title={!sidebarOpen ? item.label : ''}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Info at bottom */}
        {sidebarOpen && user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">
                  {user.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{user.username}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role === 'hr_manager' ? 'HR Manager' : user.role === 'admin' ? 'Admin' : 'Employee'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;