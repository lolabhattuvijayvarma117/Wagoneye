import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrainFront, FileText, Bot, Users, Settings, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const navigation = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Reports', to: '/reports', icon: FileText },
    { name: 'Ask AI', to: '/ask-ai', icon: Bot },
    { name: 'Users', to: '/users', icon: Users },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <div className="h-full bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 justify-between">
        <div className="flex items-center gap-2 text-brand-400">
          <TrainFront className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-white">WagonEye</span>
        </div>
        <button className="lg:hidden text-slate-400 hover:text-white" onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group',
                  isActive
                    ? 'bg-brand-600/10 text-brand-400'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                )
              }
            >
              <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <img
            src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff"
            alt="User avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-200">Admin User</span>
            <span className="text-xs text-slate-500">admin@wagoneye.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
