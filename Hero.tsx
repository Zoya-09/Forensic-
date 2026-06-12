import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Zap, Lock } from 'lucide-react';

interface HeroProps {
  onReportClick: () => void;
}

export default function Hero({ onReportClick }: HeroProps) {
  return (
    <div className="relative pt-16 pb-20 overflow-hidden">
      {/* Background blobs for premium feel */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl opacity-50 z-0"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-rose-50 rounded-full blur-3xl opacity-30 z-0"></div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-8"
        >
          <ShieldCheck size={14} />
          Your Safety, Our Priority
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight"
        >
          Cybercrime Reporting, <br />
          <span className="text-indigo-600">Unified & Secure.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto"
        >
          Report cybercrimes instantly. Our advanced forensic platform automatically tracks location and notifies nearest authorities for immediate action.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onReportClick}
            className="group flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-lg font-bold hover:bg-indigo-700 transition-all shadow-indigo-100 shadow-2xl hover:-translate-y-1 active:scale-95"
          >
            Report Crime Now
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="flex items-center gap-6 text-sm font-medium text-slate-400 mt-4 sm:mt-0">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-400" />
              Instant Action
            </div>
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-emerald-400" />
              Secure Record
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
