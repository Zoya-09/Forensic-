import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db, auth } from '../lib/firebase.ts';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { MapPin, Shield, AlertCircle, Loader2, Send, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils.ts';

const reportSchema = z.object({
  type: z.string().min(1, 'Please select a crime type'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  isEmergency: z.boolean(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface ReportingFormProps {
  onSuccess: () => void;
}

export default function ReportingForm({ onSuccess }: ReportingFormProps) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [ip, setIp] = useState<string>('Detecting...');
  const [nearbyStation, setNearbyStation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: '',
      description: '',
      isEmergency: false,
    }
  });

  useEffect(() => {
    // 1. Detect IP
    fetch('/api/ip')
      .then(res => res.json())
      .then(data => setIp(data.ip))
      .catch(() => setIp('Unable to detect'));

    // 2. Get Geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setError('Location permission denied. Precise tracking disabled.')
      );
    }
  }, []);

  const onSubmit = async (data: ReportFormValues) => {
    if (!location) {
      setError('Precise location is required for emergency reporting.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Analyze with Gemini
      const analysisRes = await fetch('/api/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: data.description }),
      });
      const analysis = await analysisRes.json();

      // Submit to Firestore
      const reportRef = collection(db, 'reports');
      await addDoc(reportRef, {
        userId: auth.currentUser?.uid || 'anonymous',
        type: analysis.category || data.type,
        description: data.description,
        isEmergency: data.isEmergency,
        location: {
          lat: location.lat,
          lng: location.lng,
          address: 'Auto-detected via forensics', // In real app, would reverse-geocode
        },
        ip: ip,
        createdAt: serverTimestamp(),
        status: 'reported',
        assessment: analysis.assessment || 'Under investigation',
      });

      onSuccess();
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const crimeTypes = [
    'Phishing / Social Engineering',
    'Identity Theft',
    'Financial Fraud',
    'Cyber Bullying / Harassment',
    'Malware / Ransomware',
    'Data Breach',
    'Online Stalking',
    'Other'
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
      {error && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-600 text-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Type of Crime</label>
        <select
          {...register('type')}
          className={cn(
            "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none",
            errors.type && "border-rose-500 ring-rose-500"
          )}
        >
          <option value="">Select Category</option>
          {crimeTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {errors.type && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.type.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Incident Details</label>
        <textarea
          {...register('description')}
          placeholder="Describe what happened, including any links, emails, or suspects..."
          rows={5}
          className={cn(
            "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none",
            errors.description && "border-rose-500 ring-rose-500"
          )}
        />
        {errors.description && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
            <MapPin size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Your Location</p>
            <p className="text-sm font-medium truncate w-32 md:w-auto">
              {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Waiting for GPS...'}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Secured IP</p>
            <p className="text-sm font-medium">{ip}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
        <input
          type="checkbox"
          {...register('isEmergency')}
          id="isEmergency"
          className="w-5 h-5 accent-amber-600 rounded"
        />
        <label htmlFor="isEmergency" className="text-sm font-bold text-amber-900 cursor-pointer">
          Urgent Attention: This is an ongoing threat.
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-indigo-100 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <>
            <span>Submit Secure Report</span>
            <Send size={18} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      <p className="text-center text-[11px] text-slate-400">
        By submitting, you agree that your metadata (IP, Location, Device Info) will be shared with the relevant cyber forensic team.
      </p>
    </form>
  );
}
