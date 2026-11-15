import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export interface MainLayoutProps {
  therapistName?: string;
  onLogout?: () => void;
}

export function MainLayout({ therapistName, onLogout }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      <Sidebar therapistName={therapistName} onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

