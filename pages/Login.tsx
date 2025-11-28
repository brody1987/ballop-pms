import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/mockService';
import { Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isRegistering) {
          if (!name) throw new Error("이름을 입력해주세요.");
          await db.register(email, password, name);
      } else {
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
             ∞
           </div>
           <h1 className="text-2xl font-black text-gray-900 dark:text-white">
               {isRegistering ? '계정 생성' : '환영합니다'}
           </h1>
           <p className="text-gray-500 dark:text-gray-400 mt-2">
               {isRegistering ? '새로운 계정을 만들어 프로젝트에 참여하세요' : 'ProjectFlow PMS에 로그인하세요'}
           </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
           {isRegistering && (
             <div className="animate-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이름</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    placeholder="홍길동"
                    required={isRegistering}
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

           {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}

           <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
           >
             {loading ? '처리 중...' : (isRegistering ? '회원가입' : '로그인')}
           </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border text-center">
           <button 
             onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
             className="text-sm text-primary hover:underline font-medium"
           >
             {isRegistering ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default Login;