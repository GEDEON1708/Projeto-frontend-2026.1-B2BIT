import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { useAuthStore } from '../../../stores/auth-store';

type Tab = 'login' | 'register';

export function AuthPage() {
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const user = useAuthStore((state) => state.user);

  const title = useMemo(() => (activeTab === 'login' ? 'Login' : 'Cadastrar'), [activeTab]);

  if (user) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-[820px] rounded-[32px] border border-[#31476a] bg-[linear-gradient(90deg,rgba(3,11,25,0.96)_0%,rgba(2,8,23,0.96)_45%,rgba(3,11,25,0.96)_100%)] px-6 py-10 shadow-glow sm:px-10 md:px-16">
        <div className="mx-auto max-w-[480px]">
          <h1 className="text-center text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Mini Twitter
          </h1>

          <div className="mt-10 border-b border-[#31476a]">
            <div className="grid grid-cols-2">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`pb-4 text-lg font-semibold transition ${
                  activeTab === 'login'
                    ? 'border-b-2 border-brand-400 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`pb-4 text-lg font-semibold transition ${
                  activeTab === 'register'
                    ? 'border-b-2 border-brand-400 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Cadastrar
              </button>
            </div>
          </div>

          <div className="mt-12" aria-label={title}>
            {activeTab === 'login' ? (
              <LoginForm onGoToRegister={() => setActiveTab('register')} />
            ) : (
              <RegisterForm onGoToLogin={() => setActiveTab('login')} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
