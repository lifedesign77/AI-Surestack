import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await login();
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('ログインに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-24 h-16 bg-brand-600 rounded-[50%] flex items-center justify-center transform -rotate-6 shadow-lg">
             <span className="text-white text-xl font-black italic tracking-tighter">ISHIGAMI</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-xl font-bold tracking-tight text-slate-900 leading-relaxed">
          石上車輛株式会社<br/>問い合わせ管理システム<br/>(デモ版)
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-xl rounded-2xl border border-slate-100 text-center">
          
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200 font-bold mb-6 text-left">
              {error}
            </div>
          )}

          <p className="text-sm text-slate-600 mb-8">
            パスワード不要ですぐにお試しいただけます。
          </p>

          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 rounded-lg bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {isLoading ? 'ログイン処理中...' : 'デモ環境にログイン'}
          </button>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
             <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
               © 2024 Ishigami Sharyo Co., Ltd.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;