import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LogoIcon = () => (
  <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white transform rotate-3">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const isMentor = user?.role === 'mentor';

  // Efek scroll untuk mengubah background navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg group ${
      isActive
        ? 'text-white bg-white/10'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled || isOpen
          ? 'bg-slate-950/80 backdrop-blur-md border-slate-800 py-3' 
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="container flex flex-wrap justify-between items-center mx-auto px-6">
        
        {/* Logo Section */}
        <Link
          to={isAuthenticated ? (isMentor ? "/mentor" : "/portfolio") : "/"}
          className="flex items-center gap-3 group"
        >
          <LogoIcon />
          <span className="self-center text-xl font-bold tracking-tight text-white">
            Vinix<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Port</span>
          </span>
        </Link>

        {/* Desktop Actions (Right Side) */}
        <div className="flex items-center md:order-2">
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-800">
                <div className="text-right hidden lg:block">
                    <p className="text-xs text-slate-400">Signed in as {isMentor ? 'Mentor' : 'User'}</p>
                    <p className="text-sm font-bold text-white">{user?.name.split(' ')[0]}</p>
                </div>
                <button 
                    onClick={handleLogout} 
                    className="text-slate-300 hover:text-white hover:bg-red-500/10 hover:border-red-500/50 border border-transparent px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white font-medium text-sm transition-colors">
                  Masuk
                </Link>
                <Link 
                    to="/register" 
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5"
                >
                  Daftar Gratis
                </Link>
              </>
            )}
          </div>

          {/* Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="inline-flex items-center p-2 ml-3 text-slate-400 rounded-lg md:hidden hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-700 transition-colors"
            aria-controls="mobile-menu"
            aria-expanded={isOpen}
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            )}
          </button>
        </div>

        {/* Desktop Navigation Links (Center) */}
        <div className="hidden md:flex justify-between items-center w-full md:w-auto md:order-1" id="mobile-menu">
          <ul className="flex flex-col mt-4 md:flex-row md:space-x-2 md:mt-0 font-medium">
            {!isAuthenticated && (
              <>
                <li><NavLink to="/" className={navLinkClass} end>Home</NavLink></li>
                <li><NavLink to="/portfolios" className={navLinkClass}>Galeri Portofolio</NavLink></li>
              </>
            )}
            
            {isAuthenticated && !isMentor && (
              <>
                <li><NavLink to="/assessment" className={navLinkClass}>Assessment</NavLink></li>
                <li><NavLink to="/portfolio" className={navLinkClass}>Portfolio</NavLink></li>
                <li><NavLink to="/upload" className={navLinkClass}>Upload</NavLink></li>
                <li><NavLink to="/analytics" className={navLinkClass}>Analytics</NavLink></li>
              </>
            )}

            {isAuthenticated && isMentor && (
              <li><NavLink to="/mentor" className={navLinkClass}>Mentor Dashboard</NavLink></li>
            )}
          </ul>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pt-4 pb-8 bg-slate-950 border-t border-slate-800 shadow-2xl">
            <ul className="flex flex-col space-y-3">
                {!isAuthenticated && (
                    <>
                        <li><NavLink to="/" onClick={() => setIsOpen(false)} className={navLinkClass} end>Home</NavLink></li>
                        <li><NavLink to="/portfolios" onClick={() => setIsOpen(false)} className={navLinkClass}>Galeri Portofolio</NavLink></li>
                    </>
                )}
                {isAuthenticated && !isMentor && (
                    <>
                        <li><NavLink to="/assessment" onClick={() => setIsOpen(false)} className={navLinkClass}>Skill Assessment</NavLink></li>
                        <li><NavLink to="/portfolio" onClick={() => setIsOpen(false)} className={navLinkClass}>My Portfolio</NavLink></li>
                        <li><NavLink to="/upload" onClick={() => setIsOpen(false)} className={navLinkClass}>Upload Project</NavLink></li>
                        <li><NavLink to="/analytics" onClick={() => setIsOpen(false)} className={navLinkClass}>Analytics</NavLink></li>
                    </>
                )}

                {isAuthenticated && isMentor && (
                    <li><NavLink to="/mentor" onClick={() => setIsOpen(false)} className={navLinkClass}>Mentor Dashboard</NavLink></li>
                )}

                <li className="border-t border-slate-800 my-2 pt-4">
                    {isAuthenticated ? (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
                                <span className="text-white font-semibold">{user?.name}</span>
                            </div>
                            <button onClick={handleLogout} className="w-full text-center py-3 bg-red-500/10 text-red-400 rounded-xl font-semibold border border-red-500/20 hover:bg-red-500/20 transition">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <Link to="/login" onClick={() => setIsOpen(false)} className="w-full text-center py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition">
                                Login
                            </Link>
                            <Link to="/register" onClick={() => setIsOpen(false)} className="w-full text-center py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-900/50">
                                Daftar Gratis
                            </Link>
                        </div>
                    )}
                </li>
            </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
