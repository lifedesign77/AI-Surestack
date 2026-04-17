import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { InquiryStatus, Inquiry } from '../types';
import SettingsModal from './SettingsModal';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    const loadInquiries = () => {
      setInquiries(storageService.getInquiries());
    };
    
    loadInquiries();
    
    window.addEventListener('storage-updated', loadInquiries);
    return () => {
      window.removeEventListener('storage-updated', loadInquiries);
    };
  }, [location.pathname]); // Re-fetch when route changes as a simple way to stay updated
  
  // Filter unread or important notifications
  const unreadInquiries = inquiries.filter(i => i?.status === InquiryStatus.UNREAD);
  const unreadCount = unreadInquiries.length;

  const navItems = [
    { icon: 'dashboard', label: 'ダッシュボード', path: '/' },
    { icon: 'contact_support', label: '問い合わせ管理', path: '/inquiries' },
    { icon: 'people', label: '顧客情報管理', path: '/customers' },
    { icon: 'handshake', label: '成約管理', path: '/contracts' },
    { icon: 'local_shipping', label: '引き取り管理', path: '/pickups' },
    { icon: 'assessment', label: '日報', path: '/reports' },
    { icon: 'account_tree', label: 'システム設計(UML)', path: '/uml' },
  ];

  const handleNotificationClick = (id: string) => {
    setIsNotificationsOpen(false);
    navigate(`/inquiries/${id}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-tight text-brand-500 flex items-center gap-2">
            <span className="material-icons-outlined">directions_car</span>
            石上車輛
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-8">顧客管理システム v2.0</p>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-600 text-white shadow-lg translate-x-1' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="material-icons-outlined mr-3">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold shadow-md">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name || 'ゲスト'}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role || 'staff'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
              title="ログアウト"
            >
              <span className="material-icons-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative flex flex-col">
        <header className="bg-white shadow-sm sticky top-0 z-10 px-8 py-4 flex justify-between items-center shrink-0">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {location.pathname === '/' ? 'ダッシュボード' : 
               location.pathname === '/inquiries' ? '問い合わせ管理' :
               location.pathname.startsWith('/inquiries/') ? '顧客対応・詳細' :
               location.pathname.startsWith('/customers') ? '顧客情報管理' :
               location.pathname.startsWith('/contracts') ? '成約管理' :
               location.pathname.startsWith('/pickups') ? '引き取り管理' :
               location.pathname.startsWith('/reports') ? '日報' :
               location.pathname.startsWith('/uml') ? 'システム設計(UML)' : 'Ishigami Vehicle'}
            </h2>
            <div className="flex items-center space-x-2">
              
              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`p-2 rounded-full transition-colors relative ${isNotificationsOpen ? 'bg-slate-100 text-brand-600' : 'text-slate-400 hover:text-brand-600 hover:bg-slate-50'}`}
                >
                  <span className="material-icons-outlined text-2xl">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 z-20 overflow-hidden animate-fade-in">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-700">通知</span>
                        {unreadCount > 0 && <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{unreadCount}件の未読</span>}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {unreadInquiries.length > 0 ? (
                          <ul className="divide-y divide-slate-100">
                            {unreadInquiries.map(item => (
                              <li key={item.id} onClick={() => handleNotificationClick(item.id)} className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-xs font-bold text-brand-600">{item?.channel}</span>
                                  <span className="text-[10px] text-slate-400">{item?.timestamp}</span>
                                </div>
                                <p className="text-sm font-bold text-slate-800 line-clamp-1">{item?.subject}</p>
                                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item?.customer?.name}様より</p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-8 text-center text-slate-400">
                            <span className="material-icons-outlined text-4xl mb-2 opacity-50">notifications_off</span>
                            <p className="text-xs">新しい通知はありません</p>
                          </div>
                        )}
                      </div>
                      <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                        <button className="text-xs font-bold text-slate-500 hover:text-brand-600">すべて既読にする</button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Settings Gear */}
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-full transition-colors hover:rotate-45 duration-300"
              >
                <span className="material-icons-outlined text-2xl">settings</span>
              </button>
            </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto w-full flex-1">
          {children}
        </div>

        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </main>
    </div>
  );
};

export default Layout;