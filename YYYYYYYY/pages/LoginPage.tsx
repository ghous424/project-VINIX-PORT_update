import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loginMentor } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const registrationMessage = location.state?.message;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const isMentorEmail = email.toLowerCase() === 'mentor@vinixport.com' || email.toLowerCase() === 'test.mentor@vinixport.com';

            if (isMentorEmail) {
                await loginMentor(email, password);
                navigate('/mentor');
            } else {
                await login(email, password);
                navigate('/portfolio');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
            
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]"></div>
                    <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[100px]"></div>
                </div>
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                
                {/* Header Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white transform rotate-3">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </Link>
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h2>
                    <p className="text-slate-400">Sign in to continue your journey</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-2xl p-8">
                    
                    {/* Alerts */}
                    {registrationMessage && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-3">
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>{registrationMessage}</span>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-3">
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>{error}</span>
                        </div>
                    )}
                    
                    {/* Demo Hint */}
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Demo Account</p>
                        </div>
                        <div className="grid grid-cols-1 gap-1 text-sm font-mono text-slate-400">
                            <div className="flex justify-between">
                                <span>User Email:</span>
                                <span className="text-slate-300 select-all cursor-copy">john.doe@example.com</span>
                            </div>
                            <div className="flex justify-between">
                                <span>User Pass:</span>
                                <span className="text-slate-300 select-all cursor-copy">password123</span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                                Mentor Demo
                            </div>
                            <div className="flex justify-between">
                                <span>Mentor Email:</span>
                                <span className="text-slate-300 select-all cursor-copy">mentor@vinixport.com</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Mentor Pass:</span>
                                <span className="text-slate-300 select-all cursor-copy">password123</span>
                            </div>
                        </div>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password"className="block text-sm font-medium text-slate-300">Password</label>
                                <a href="#" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                            </div>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        
                        <div className="flex items-center">
                            <input 
                                id="remember-me" 
                                name="remember-me" 
                                type="checkbox" 
                                className="w-4 h-4 text-blue-600 bg-slate-950 border-slate-800 rounded focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer" 
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400 cursor-pointer select-none">Remember me</label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {loading && (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-slate-500 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-bold text-white hover:text-blue-400 transition-colors">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;