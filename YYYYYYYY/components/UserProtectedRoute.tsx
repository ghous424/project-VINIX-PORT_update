import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'mentor') {
      // Jika user adalah mentor, arahkan ke halaman mentor
      navigate('/mentor');
    }
  }, [user, navigate]);

  // Hanya tampilkan konten jika user adalah pengguna biasa atau role tidak ditentukan
  if (!user || user.role !== 'mentor') {
    return <>{children}</>;
  }

  // Jika mentor mencoba mengakses halaman user, tampilkan pesan
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="animate-pulse">Anda adalah mentor, mengalihkan ke dashboard mentor...</p>
      </div>
    </div>
  );
};

export default UserProtectedRoute;