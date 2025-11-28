import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const MentorProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'mentor') {
      // Jika user bukan mentor, arahkan ke halaman analytics biasa
      navigate('/analytics');
    }
  }, [user, navigate]);

  // Hanya tampilkan konten jika user adalah mentor
  if (user?.role === 'mentor') {
    return <>{children}</>;
  }

  // Jika belum login atau bukan mentor, tampilkan spinner atau pesan
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200">
      <div className="flex flex-col items-center gap-4">
        {user ? (
          <>
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="animate-pulse">Anda bukan mentor, mengalihkan...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 border-4 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="animate-pulse">Memeriksa status login...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default MentorProtectedRoute;