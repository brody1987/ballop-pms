import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Settings, 
  Search, 
  Bell, 
  HelpCircle, 
  Menu,
  X,
  LogOut,
  PlusCircle
} from 'lucide-react';
import { db } from '../services/mockService';
import { User, Notification } from '../types';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(db.getCurrentUser());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth
    const interval = setInterval(() => {
        const u = db.getCurrentUser();
        if (u && !user) {
            setUser(u);
        }
    }, 500);

    const u = db.getCurrentUser();
    if (!u) {
      // Allow some time for Firebase to init
      setTimeout(() => {
          if (!db.getCurrentUser()) {
              navigate('/');
          }
      }, 1000);
    } else {
        setUser(u);
    }
    
    // Load notifications
    db.getNotifications().then(setNotifications);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    db.logout();
    navigate('/');
  };

  const navItems = [
    { label: '대시보드', icon: LayoutDashboard, path: '/dashboard' },
    { label: '프로젝트', icon: FolderOpen, path: '/projects' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ label: '관리자 설정', icon: Settings, path: '/admin' });
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 text-primary p-2 rounded-lg">
               <span className="font-bold text-xl">∞</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">ProjectFlow</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Workspace</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-dark-border">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm border-b border-gray-200 dark:border-dark-border flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-gray-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 h-10 w-80 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="프로젝트, 파일 검색..." 
                className="bg-transparent border-none outline-none text-sm ml-2 w-full text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell size={20} className="text-gray-500 dark:text-gray-400" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <HelpCircle size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role === 'admin' ? '관리자' : '사용자'}</p>
              </div>
              <img 
                src={user?.avatar} 
                alt="User" 
                className="h-9 w-9 rounded-full bg-gray-300 object-cover ring-2 ring-white dark:ring-dark-bg"
              />
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
           <div className="fixed inset-0 z-50 flex md:hidden">
             <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
             <div className="relative bg-white dark:bg-dark-surface w-64 h-full flex flex-col p-4 shadow-2xl animate-in slide-in-from-left">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="font-bold text-lg">메뉴</h2>
                 <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
               </div>
               <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
                <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mt-4">
                  <LogOut size={20} />
                  <span>로그아웃</span>
                </button>
               </nav>
             </div>
           </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
           {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;