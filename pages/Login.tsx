import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/mockService';
import { Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Login Modes: 'login' | 'register' | 'adminCode'
  const [mode, setMode] = useState<'login' | 'register' | 'adminCode'>('login');
  
  const [adminCode, setAdminCode] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'adminCode') {
          // Special Admin Flow
          if (!adminCode) throw new Error("관리자 코드를 입력해주세요.");
          const adminEmail = 'admin@pms.com';
          
          try {
              // Try standard login first
              await db.login(adminEmail, adminCode);
          } catch (loginError: any) {
              // If user not found, try to create it automatically
              if (loginError.code === 'auth/invalid-credential' || loginError.code === 'auth/user-not-found') {
                   // Check if we should register. In a real app we might not want this,
                   // but for this "Admin Code" demo feature, it bootstraps the admin account.
                   // NOTE: We assume 'auth/invalid-credential' might mean user doesn't exist in some providers, 
                   // but specifically firebase often returns invalid-credential for wrong password too.
                   // Let's try to REGISTER. If email in use (wrong password), it will fail there.
                   try {
                       await db.register(adminEmail, adminCode, 'Administrator');
                   } catch (regError: any) {
                       if (regError.code === 'auth/email-already-in-use') {
                           throw new Error("관리자 코드가 올바르지 않습니다.");
                       }
                       throw regError;
                   }
              } else {
                  throw loginError;
              }
          }
      } else if (mode === 'register') {
          if (!name) throw new Error("이름을 입력해주세요.");
          await db.register(email, password, name);
      } else {
          // Normal Login
          await db.login(email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (err.code === 'auth/email-already-in-use') {
          setError('이미 사용 중인 이메일입니다.');
      } else if (err.code === 'auth/weak-password') {
          setError('비밀번호는 6자리 이상이어야 합니다.');
      } else {
          setError(err.message || '인증 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-dark-surface rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-dark-border">
        <div className="text-center mb-8">
           <div className="bg-primary/10 text-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-black">
             {mode === 'adminCode' ? <ShieldCheck size={32} /> : '∞'}
           </div>
           <h1 className="text-2xl font-black text-gray-900 dark:text-white">
               {mode === 'register' ? '계정 생성' : mode === 'adminCode' ? '관리자 접속' : '환영합니다'}
           </h1>
           <p className="text-gray-500 dark:text-gray-400 mt-2">
               {mode === 'register' ? '새로운 계정을 만들어 프로젝트에 참여하세요' : 
                mode === 'adminCode' ? '발급받은 관리자 코드를 입력하세요' : 
                'ProjectFlow PMS에 로그인하세요'}
           </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
           
           {/* Normal & Register Inputs */}
           {mode !== 'adminCode' && (
             <>
                {mode === 'register' && (
                    <div className="animate-in slide-in-from-top-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이름</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                            placeholder="홍길동"
                            required={mode === 'register'}
                        />
                    </div>
                )}
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이메일</label>
                    <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">비밀번호</label>
                    <div className="relative">
                        <input 
                        type={showPwd ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                        required
                        />
                        <button 
                        type="button" 
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                        {showPwd ? <EyeOff size={20}/> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
             </>
           )}

           {/* Admin Code Input */}
           {mode === 'adminCode' && (
               <div className="animate-in fade-in">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">관리자 코드</label>
                   <input 
                    type="password" 
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 outline-none transition-all font-mono tracking-widest"
                    placeholder="••••••••"
                    required
                    autoFocus
                   />
               </div>
           )}

           {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}

           <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
           >
             {loading ? '처리 중...' : (
                 mode === 'register' ? '회원가입' : 
                 mode === 'adminCode' ? '관리자 접속' : '로그인'
             )}
             {mode === 'adminCode' && !loading && <ArrowRight size={18} />}
           </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border text-center flex flex-col gap-3">
           {mode !== 'adminCode' && (
               <button 
                 onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                 className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors font-medium"
               >
                 {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
               </button>
           )}

           <button 
             onClick={() => { 
                 setMode(mode === 'adminCode' ? 'login' : 'adminCode'); 
                 setError(''); 
             }}
             className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors inline-flex items-center justify-center gap-1 mx-auto
                 ${mode === 'adminCode' 
                    ? 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800' 
                    : 'text-primary bg-primary/5 hover:bg-primary/10'
                 }`}
           >
             {mode === 'adminCode' ? '일반 로그인으로 돌아가기' : '관리자 코드로 접속'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default Login;