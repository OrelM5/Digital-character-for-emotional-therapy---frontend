import { NavLink } from 'react-router-dom';
import {
  Users,
  PlusCircle,
  Archive,
  User,
  LogOut,
  Heart,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/patients', label: 'מטופלים', icon: Users },
  { to: '/sessions/new', label: 'מפגש חדש', icon: PlusCircle },
  { to: '/history', label: 'ארכיון', icon: Archive },
  { to: '/profile', label: 'הפרופיל שלי', icon: User },
];

export interface SidebarProps {
  therapistName?: string;
  onLogout?: () => void;
}

export function Sidebar({ therapistName, onLogout }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen bg-white border-l border-gray-200 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-therapy-medium rounded-lg p-2">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Therapist</p>
            <p className="font-bold text-therapy-medium text-sm leading-tight">Back-Office</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-therapy-soft text-therapy-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              ].join(' ')
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-gray-200">
        {therapistName && (
          <div className="mb-3 px-3">
            <p className="text-xs text-gray-500">מחובר כ</p>
            <p className="text-sm font-medium text-gray-900 truncate">{therapistName}</p>
          </div>
        )}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            התנתק
          </button>
        )}
      </div>
    </aside>
  );
}

