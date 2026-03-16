import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, User, LogOut, Shield, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 text-2xl font-bold tracking-tighter z-50">
          <Ticket className="text-yellow-500" />
          <span>Ticket<span className="text-yellow-500">Lux</span></span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-yellow-500 transition-colors">Raffles</Link>
          <Link to="/winners" className="text-sm font-medium hover:text-yellow-500 transition-colors">Winners</Link>
          
          {user ? (
            <div className="flex items-center gap-4 ml-4 border-l border-white/10 pl-4">
              {user.role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-2 text-sm font-medium text-yellow-500 hover:text-yellow-400 transition-colors">
                  <Shield size={16} />
                  Admin
                </Link>
              )}
              <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-yellow-500 transition-colors">
                <User size={16} />
                {user.name}
              </Link>
              <button onClick={handleLogout} className="text-white/60 hover:text-white transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 ml-4 border-l border-white/10 pl-4">
              <Link to="/login" className="text-sm font-medium hover:text-yellow-500 transition-colors">Login</Link>
              <Link to="/register" className="text-sm font-medium bg-yellow-500 text-black px-4 py-2 rounded-full hover:bg-yellow-400 transition-colors">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-white/80 hover:text-white z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-zinc-950 border-b border-white/10 p-4 flex flex-col gap-4 shadow-2xl">
          <Link to="/" onClick={closeMenu} className="text-lg font-medium p-2 hover:bg-white/5 rounded-lg">Raffles</Link>
          <Link to="/winners" onClick={closeMenu} className="text-lg font-medium p-2 hover:bg-white/5 rounded-lg">Winners</Link>
          
          <div className="h-px bg-white/10 my-2"></div>
          
          {user ? (
            <div className="flex flex-col gap-2">
              {user.role === 'admin' && (
                <Link to="/admin" onClick={closeMenu} className="flex items-center gap-2 text-lg font-medium text-yellow-500 p-2 hover:bg-white/5 rounded-lg">
                  <Shield size={20} />
                  Admin Dashboard
                </Link>
              )}
              <Link to="/dashboard" onClick={closeMenu} className="flex items-center gap-2 text-lg font-medium p-2 hover:bg-white/5 rounded-lg">
                <User size={20} />
                My Dashboard ({user.name})
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-lg font-medium text-red-400 p-2 hover:bg-white/5 rounded-lg text-left">
                <LogOut size={20} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login" onClick={closeMenu} className="text-lg font-medium p-2 hover:bg-white/5 rounded-lg">Login</Link>
              <Link to="/register" onClick={closeMenu} className="text-lg font-medium bg-yellow-500 text-black p-3 rounded-xl text-center mt-2">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
