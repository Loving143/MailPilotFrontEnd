import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Mail, 
  Send, 
  Zap,
  FileText, 
  Target, 
  User, 
  X,
  Plane
} from 'lucide-react';
import Button from '../UI/Button';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Email Management',
      href: '/email',
      icon: Mail,
      children: [
        { name: 'Send Email', href: '/email/send', icon: Send },
        { name: 'Quick Send', href: '/email/quick-send', icon: Zap },
        { name: 'Email Logs', href: '/email/logs', icon: FileText },
      ]
    },
    {
      name: 'Intent Management',
      href: '/intents',
      icon: Target,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
    },
  ];

  const isActiveLink = (href) => {
    if (href === '/dashboard') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden pointer-events-auto"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-600 via-blue-700 to-purple-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-10 right-4 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute top-32 left-8 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute top-64 right-12 w-1.5 h-1.5 bg-white rounded-full"></div>
            <div className="absolute bottom-32 left-6 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute bottom-48 right-8 w-2 h-2 bg-white rounded-full"></div>
          </div>

          {/* Logo */}
          <div className="relative flex items-center justify-between px-6 py-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Mail Pilot</span>
                <p className="text-xs text-blue-100">Professional Email Suite</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden p-2 text-white hover:bg-white/20 rounded-lg"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="relative flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <div key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) => `
                    group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden
                    ${isActive || isActiveLink(item.href)
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }
                  `}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-200
                    ${isActiveLink(item.href)
                      ? 'bg-white/30 shadow-md'
                      : 'bg-white/10 group-hover:bg-white/20'
                    }
                  `}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{item.name}</span>
                  
                  {/* Active indicator */}
                  {isActiveLink(item.href) && (
                    <div className="absolute right-2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
                  )}
                </NavLink>

                {/* Sub-navigation */}
                {item.children && isActiveLink(item.href) && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.name}
                        to={child.href}
                        className={({ isActive }) => `
                          group flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 relative
                          ${isActive
                            ? 'bg-white/30 text-white shadow-md backdrop-blur-sm'
                            : 'text-blue-200 hover:bg-white/10 hover:text-white'
                          }
                        `}
                        onClick={() => {
                          if (window.innerWidth < 1024) {
                            onClose();
                          }
                        }}
                      >
                        <div className={`
                          w-6 h-6 rounded-lg flex items-center justify-center mr-3 transition-all duration-200
                          ${location.pathname === child.href
                            ? 'bg-white/30'
                            : 'bg-white/10 group-hover:bg-white/20'
                          }
                        `}>
                          <child.icon className="w-3 h-3" />
                        </div>
                        <span>{child.name}</span>
                        
                        {/* Active indicator for sub-items */}
                        {location.pathname === child.href && (
                          <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"></div>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="relative px-4 py-4 border-t border-white/20">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 bg-gradient-to-r from-white/30 to-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Welcome back!</p>
                <p className="text-xs text-blue-200 truncate">Professional User</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative px-6 py-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-xs text-blue-200">© 2024 Mail Pilot</p>
              <p className="text-xs text-blue-300 font-medium">All rights reserved</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;