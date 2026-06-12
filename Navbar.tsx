import { useState } from 'react';
import { auth } from '../lib/firebase.ts';
import { GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { Shield, Home, FileText, Activity, LogOut, LogIn, Download } from 'lucide-react';
import { cn } from '../lib/utils.ts';

interface NavbarProps {
  activeTab: 'home' | 'report' | 'track';
  setActiveTab: (tab: 'home' | 'report' | 'track') => void;
  user: User | null;
}

export default function Navbar({ activeTab, setActiveTab, user }: NavbarProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = () => signOut(auth);

  const handleDownloadZip = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await fetch('/api/download-zip');
      if (!response.ok) throw new Error('Failed to download ZIP file');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'forensico.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('ZIP download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold italic shadow-indigo-200 shadow-lg">F</div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">Forensico</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-4">
          <button
            onClick={() => setActiveTab('home')}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === 'home' ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <Home size={18} />
            <span className="hidden sm:inline">Home</span>
          </button>
          
          <button
            onClick={() => setActiveTab('report')}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === 'report' ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <FileText size={18} />
            <span className="hidden sm:inline">Report</span>
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === 'track' ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <Activity size={18} />
            <span className="hidden sm:inline">Track</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-indigo-100 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Download full project as ZIP"
          >
            <Download size={14} className={isDownloading ? 'animate-bounce' : ''} />
            <span>{isDownloading ? 'Structuring...' : 'ZIP Download'}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-medium">{user.displayName}</span>
                <span className="text-[10px] text-slate-400">Authenticated</span>
              </div>
              <img src={user.photoURL || ''} alt="avatar" className="w-8 h-8 rounded-full border border-slate-200" />
              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-indigo-100 shadow-xl active:scale-95"
            >
              <LogIn size={18} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
