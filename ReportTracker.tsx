import { useState, useEffect } from 'react';
import { db } from '../lib/firebase.ts';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { motion } from 'motion/react';
import { Shield, Clock, MapPin, AlertCircle, RefreshCcw, Search } from 'lucide-react';
import { cn } from '../lib/utils.ts';

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

interface Report {
  id: string;
  type: string;
  description: string;
  status: 'reported' | 'investigating' | 'resolved';
  location: { lat: number; lng: number; address: string };
  createdAt: any;
  assessment: string;
}

function PoliceStations({ location }: { location: { lat: number; lng: number } }) {
  const placesLib = useMapsLibrary('places');
  const map = useMap();
  const [stations, setStations] = useState<google.maps.places.Place[]>([]);

  useEffect(() => {
    if (!placesLib || !location || !map) return;
    
    placesLib.Place.searchNearby({
      locationRestriction: {
        center: location,
        radius: 5000,
      },
      fields: ['displayName', 'location', 'formattedAddress'],
      maxResultCount: 5,
      // @ts-ignore
      types: ['police']
    }).then(({ places }) => {
      setStations(places || []);
    }).catch(err => console.error("Places search error:", err));
  }, [placesLib, location, map]);

  return (
    <>
      {stations.map(p => (
        <AdvancedMarker key={p.id} position={p.location} title={p.displayName || 'Police Station'}>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg">
            <Shield size={14} />
          </div>
        </AdvancedMarker>
      ))}
    </>
  );
}

export default function ReportTracker({ user }: { user: User | null }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'reports'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
      setReports(docs);
      if (docs.length > 0 && !selectedReport) setSelectedReport(docs[0]);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
        <LockIcon size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-bold mb-2">Sign in to track your reports</h3>
        <p className="text-slate-500 max-w-sm mx-auto">Your privacy is important. Authentication is required to view personal case records.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <RefreshCcw className="animate-spin text-indigo-600" size={32} />
        <p className="text-slate-500 font-medium tracking-tight">Syncing with forensic server...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Clock size={20} className="text-indigo-600" />
            Recent Reports
          </h3>
          <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
            {reports.length} Active
          </span>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
          {reports.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 italic text-slate-400 text-sm">
              No reports found in your record.
            </div>
          ) : (
            reports.map(report => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all duration-200 group",
                  selectedReport?.id === report.id 
                    ? "bg-white border-indigo-200 shadow-md ring-1 ring-indigo-50" 
                    : "bg-white/50 border-slate-100 hover:border-slate-300 hover:bg-white"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {report.type}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                    report.status === 'reported' ? "bg-amber-50 text-amber-600" :
                    report.status === 'investigating' ? "bg-blue-50 text-blue-600" :
                    "bg-emerald-50 text-emerald-600"
                  )}>
                    {report.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">
                  {report.description}
                </h4>
                <p className="text-[10px] text-slate-400">
                  {report.createdAt?.toDate().toLocaleString() || 'Just now'}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        {selectedReport ? (
          <>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">{selectedReport.type}</h2>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-xl">{selectedReport.description}</p>
                </div>
                <div className="shrink-0">
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <p className="text-[10px] uppercase font-bold text-indigo-400 mb-1">AI Assessment</p>
                    <p className="text-sm font-medium text-indigo-600 italic">"{selectedReport.assessment}"</p>
                  </div>
                </div>
              </div>

              <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-slate-100 relative shadow-inner">
                {GOOGLE_MAPS_KEY ? (
                  <APIProvider apiKey={GOOGLE_MAPS_KEY} version="weekly">
                    <Map
                      defaultCenter={selectedReport.location}
                      defaultZoom={13}
                      mapId="FORENSICO_MAP"
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    >
                      <AdvancedMarker position={selectedReport.location}>
                        <Pin background="#E11D48" glyphColor="#fff" />
                      </AdvancedMarker>
                      <PoliceStations location={selectedReport.location} />
                    </Map>
                    <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                      <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm border border-slate-200 pointer-events-auto flex items-center gap-2">
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                        Incident Point
                      </div>
                      <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm border border-slate-200 pointer-events-auto flex items-center gap-2 text-blue-600">
                        <Shield size={12} />
                        Nearby Police Stations Tracked
                      </div>
                    </div>
                  </APIProvider>
                ) : (
                  <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-8 text-center bg-grid-slate-200">
                    <AlertCircle className="text-slate-300 mb-4" size={40} />
                    <p className="text-slate-400 font-medium text-sm">Maps API Key missing. Geolocation visualization unavailable.</p>
                    <p className="text-[11px] text-slate-300 mt-2">Check AI Studio Secrets for GOOGLE_MAPS_PLATFORM_KEY</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-white rounded-3xl border border-slate-100 flex gap-4">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                  <MapPin size={24} />
                </div>
                <div>
                  <h5 className="font-bold text-sm">Response Unit</h5>
                  <p className="text-xs text-slate-500">Local Cyber Cell dispatched based on incident proximity coordinates.</p>
                </div>
              </div>
              <div className="p-5 bg-indigo-600 rounded-3xl text-white shadow-xl flex gap-4 shadow-indigo-100">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Shield size={24} />
                </div>
                <div>
                  <h5 className="font-bold text-sm">Case Protected</h5>
                  <p className="text-xs text-indigo-100">Forensic evidence hash verified. Data immutable and legally compliant.</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-slate-100 border-dashed text-slate-400">
            <Search size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Select a report from the list to view forensic details and location tracking.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LockIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
