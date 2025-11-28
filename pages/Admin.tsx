import React, { useEffect, useState } from 'react';
import { db } from '../services/mockService';
import { User } from '../types';
import { Shield, Lock, Save, User as UserIcon, Database, Check } from 'lucide-react';

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser] = useState(db.getCurrentUser());
  const [configJson, setConfigJson] = useState('');
  const [isConfigSaved, setIsConfigSaved] = useState(false);

  useEffect(() => {
    db.getUsers().then(setUsers);
    setConfigJson(db.getConfig());
  }, []);

  const handlePermissionToggle = (userId: string, type: 'read' | 'write') => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          permissions: {
            ...u.permissions,
            [type]: !u.permissions[type]
          }
        };
      }
      return u;
    });
    setUsers(updatedUsers);
    const targetUser = updatedUsers.find(u => u.id === userId);
    if (targetUser) {
        db.updateUserPermissions(userId, targetUser.permissions);
    }
  };

  const handleSaveConfig = () => {
      try {
          db.updateConfig(configJson);
          setIsConfigSaved(true);
          setTimeout(() => setIsConfigSaved(false), 2000);
      } catch (e) {
          alert("Invalid JSON format. Please check the configuration.");
      }
  };

  if (currentUser?.role !== 'admin') {
    return <div className="p-8 text-center text-red-500 font-bold">접근 권한이 없습니다. 관리자 전용입니다.</div>;
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-3 mb-8">
         <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Shield size={24} />
         </div>
         <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">관리자 설정</h1>
            <p className="text-gray-500 dark:text-gray-400">사용자 및 시스템 권한 관리</p>
         </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm mb-8">
        <div className="p-6 border-b border-gray-200 dark:border-dark-border flex justify-between items-center">
            <h2 className="font-bold text-lg">사용자 관리</h2>
            <button className="text-sm bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-colors">
                새 사용자 추가
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">사용자</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">역할</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">읽기 권한</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">쓰기 권한</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">작업</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <img src={user.avatar} className="w-10 h-10 rounded-full bg-gray-200" alt="" />
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <input 
                                    type="checkbox" 
                                    checked={user.permissions.read}
                                    onChange={() => handlePermissionToggle(user.id, 'read')}
                                    className="w-5 h-5 rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
                                />
                            </td>
                            <td className="px-6 py-4 text-center">
                                 <input 
                                    type="checkbox" 
                                    checked={user.permissions.write}
                                    onChange={() => handlePermissionToggle(user.id, 'write')}
                                    className="w-5 h-5 rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
                                />
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-gray-400 hover:text-primary transition-colors">
                                    <Lock size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* System Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
            <h2 className="font-bold text-lg mb-4">알림 설정</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">지연 알림용 관리자 이메일</label>
                    <div className="flex gap-2">
                        <input 
                            type="email" 
                            defaultValue="admin@pms.com" 
                            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none" 
                        />
                        <button className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
                            업데이트
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Firebase Config */}
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
            <div className="flex items-center gap-2 mb-4">
                <Database size={20} className="text-orange-500" />
                <h2 className="font-bold text-lg">Firebase 설정</h2>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Configuration JSON
                    </label>
                    <textarea 
                        value={configJson}
                        onChange={(e) => setConfigJson(e.target.value)}
                        className="w-full h-48 font-mono text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-primary/50 outline-none resize-none text-gray-600 dark:text-gray-300"
                        spellCheck={false}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Firebase Console에서 발급받은 web config 객체를 붙여넣으세요. 변경 사항 적용을 위해 페이지가 새로고침됩니다.
                    </p>
                </div>
                <div className="flex justify-end">
                    <button 
                        onClick={handleSaveConfig}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isConfigSaved ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-primary-hover'}`}
                    >
                        {isConfigSaved ? <Check size={16} /> : <Save size={16} />}
                        {isConfigSaved ? '저장됨' : '저장 및 연결'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;