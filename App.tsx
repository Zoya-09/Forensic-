/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { auth } from './lib/firebase.ts';
import { onAuthStateChanged, User } from 'firebase/auth';
import Navbar from './components/Navbar.tsx';
import Hero from './components/Hero.tsx';
import ReportingForm from './components/ReportingForm.tsx';
import ReportTracker from './components/ReportTracker.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, FileText, Map, Activity } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'report' | 'track'>('home');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
      
      <main className="pt-20 px-4 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Hero onReportClick={() => setActiveTab('report')} />
              
              <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                    <Shield size={24} />
                  </div>
                  <h3 className="text-xl font-medium mb-3">Premium Security</h3>
                  <p className="text-slate-500 leading-relaxed">
                    End-to-end encrypted reporting with forensic-grade data protection. Your safety is our highest priority.
                  </p>
                </div>
                
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 text-rose-600">
                    <Map size={24} />
                  </div>
                  <h3 className="text-xl font-medium mb-3">Instant Tracking</h3>
                  <p className="text-slate-500 leading-relaxed">
                    Automatic device tracking and geolocation to identify nearby help and alert local law enforcement immediately.
                  </p>
                </div>
                
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-600">
                    <Activity size={24} />
                  </div>
                  <h3 className="text-xl font-medium mb-3">Live Updates</h3>
                  <p className="text-slate-500 leading-relaxed">
                    Track your report status in real-time through our unified dashboard. Stay informed at every step of the investigation.
                  </p>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-2xl mx-auto py-8">
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Report an Incident</h2>
                  <p className="text-slate-500">Provide details about the crime. We'll automatically secure your location and IP.</p>
                </div>
                <ReportingForm onSuccess={() => setActiveTab('track')} />
              </div>
            </motion.div>
          )}

          {activeTab === 'track' && (
            <motion.div
              key="track"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ReportTracker user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 px-4 border-t border-slate-100 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold italic">F</div>
            <span className="font-bold text-lg tracking-tight">Forensico</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 Forensico. All reports are handled with maximum confidentiality.</p>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">Emergency: 112</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

