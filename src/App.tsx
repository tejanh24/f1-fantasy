import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Car, 
  Plus, 
  ChevronRight, 
  LogOut, 
  LayoutDashboard, 
  Settings,
  ShieldCheck,
  Zap,
  DollarSign,
  User as UserIcon,
  Copy,
  Check
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Driver, Constructor, User, League, Standing, Team } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BUDGET_LIMIT = 100;

const safeFetch = async (url: string, options?: RequestInit) => {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type");
    
    if (res.ok) {
      if (contentType && contentType.includes("application/json")) {
        return await res.json();
      }
      return { success: true };
    } else {
      const errorData = contentType?.includes("application/json") ? await res.json() : null;
      const errorMessage = errorData?.error || errorData?.message || `Error: ${res.status} ${res.statusText}`;
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    console.error("Fetch error:", error);
    throw error;
  }
};

function RaceResults({ 
  races, 
  onEdit 
}: { 
  races: any[], 
  onEdit?: (race: any) => void 
}) {
  const [expandedRaceId, setExpandedRaceId] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Trophy className="w-5 h-5 text-f1-red" /> RACE RESULTS
      </h3>
      <div className="grid gap-4">
        {races.map((race) => {
          const results = JSON.parse(race.results_json);
          const isExpanded = expandedRaceId === race.id;

          return (
            <div key={race.id} className="f1-card p-6 transition-all">
              <div className="flex justify-between items-start mb-4">
                <button 
                  onClick={() => setExpandedRaceId(isExpanded ? null : race.id)}
                  className="text-left hover:text-f1-red transition-colors"
                >
                  <h4 className="text-xl font-bold italic flex items-center gap-2">
                    {race.race_name}
                    <ChevronRight className={cn("w-5 h-5 transition-transform", isExpanded && "rotate-90")} />
                  </h4>
                  <p className="text-xs text-white/40 font-mono">
                    Processed: {new Date(race.processed_at).toLocaleDateString()}
                  </p>
                </button>
                {onEdit && (
                  <button 
                    onClick={() => onEdit(race)}
                    className="text-xs font-bold uppercase text-f1-red hover:text-white transition-colors"
                  >
                    EDIT RESULT
                  </button>
                )}
              </div>
              
              {isExpanded && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm border-t border-white/10 pt-4"
                >
                  <div>
                    <div className="text-xs font-bold text-white/40 mb-2 uppercase tracking-wider">Top 10 Finishers</div>
                    <div className="space-y-1">
                      {results.finishers.map((id: string, i: number) => {
                        let pts = i < 10 ? 10 - i : 0;
                        if (i < 10 && id === results.fastestLapDriverId) pts += 5;
                        if (id === results.poleDriverId) pts += 5;

                        return (
                          <div key={i} className="flex items-center justify-between gap-2 p-1 hover:bg-white/5 rounded">
                            <div className="flex items-center gap-2">
                              <span className={cn("font-mono font-bold w-6 text-right", i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-white/40")}>
                                {i + 1}
                              </span>
                              <span>{id}</span> 
                              {id === results.fastestLapDriverId && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 rounded font-bold">FL</span>}
                              {id === results.poleDriverId && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 rounded font-bold">POLE</span>}
                            </div>
                            <span className="font-mono font-bold text-f1-red">+{pts} pts</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/40">Pole Position</span>
                        <div className="text-right">
                          <div className="font-bold">{results.poleDriverId}</div>
                          <div className="text-xs text-f1-red font-mono">+5 pts</div>
                        </div>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/40">Fastest Lap</span>
                        <div className="text-right">
                          <div className="font-bold">{results.fastestLapDriverId}</div>
                          <div className="text-xs text-f1-red font-mono">+5 pts (if top 10)</div>
                        </div>
                      </div>
                    </div>
                    
                    {results.dnfs && results.dnfs.length > 0 && (
                      <div>
                        <div className="text-xs font-bold text-white/40 mb-2 uppercase tracking-wider">DNFs</div>
                        <div className="space-y-1">
                          {results.dnfs.map((id: string) => (
                            <div key={id} className="flex items-center justify-between gap-2 p-1 hover:bg-white/5 rounded">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold w-6 text-right text-f1-red">DNF</span>
                                <span>{id}</span> 
                              </div>
                              <span className="font-mono font-bold text-f1-red">-5 pts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
        {races.length === 0 && (
          <div className="text-center p-8 text-white/20 italic border border-dashed border-white/10 rounded-xl">
            No race results yet.
          </div>
        )}
      </div>
    </div>
  );
}

function AdminPanel({ 
  drivers, 
  onBack, 
  onSuccess,
  teamsLocked,
  onToggleLock
}: { 
  drivers: Driver[], 
  onBack: () => void, 
  onSuccess: () => void,
  teamsLocked: boolean,
  onToggleLock: () => void
}) {
  const [raceName, setRaceName] = useState('');
  const [poleDriverId, setPoleDriverId] = useState('');
  const [fastestLapDriverId, setFastestLapDriverId] = useState('');
  const [finishers, setFinishers] = useState<string[]>(Array(10).fill(''));
  const [dnfs, setDnfs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [view, setView] = useState<'race' | 'leagues' | 'history'>('race');
  const [races, setRaces] = useState<any[]>([]);
  const [editingRaceId, setEditingRaceId] = useState<number | null>(null);

  useEffect(() => {
    fetchLeagues();
    fetchRaces();
  }, []);

  const fetchRaces = async () => {
    try {
      const data = await safeFetch('/api/races');
      if (data) setRaces(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditRace = (race: any) => {
    const results = JSON.parse(race.results_json);
    setRaceName(race.race_name);
    setPoleDriverId(results.poleDriverId);
    setFastestLapDriverId(results.fastestLapDriverId);
    setFinishers(results.finishers);
    setDnfs(results.dnfs || []);
    setEditingRaceId(race.id);
    setView('race');
  };

  const fetchLeagues = async () => {
    try {
      const data = await safeFetch('/api/admin/leagues');
      if (data) setLeagues(data);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteLeague = async (id: number) => {
    if (!confirm("Are you sure you want to delete this league? This cannot be undone.")) return;
    try {
      await safeFetch(`/api/admin/leagues/${id}`, { method: 'DELETE' });
      fetchLeagues();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!raceName || !poleDriverId || !fastestLapDriverId || finishers.some(f => !f)) {
      setError("Please fill in all required fields (Race Name, Pole, Fastest Lap, and Top 10)");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await safeFetch('/api/admin/process-race', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raceName,
          poleDriverId,
          fastestLapDriverId,
          finishers,
          dnfs,
          raceId: editingRaceId
        })
      });
      onSuccess();
      if (editingRaceId) {
        setEditingRaceId(null);
        setRaceName('');
        setPoleDriverId('');
        setFastestLapDriverId('');
        setFinishers(Array(10).fill(''));
        setDnfs([]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDnf = (id: string) => {
    if (dnfs.includes(id)) {
      setDnfs(dnfs.filter(d => d !== id));
    } else {
      setDnfs([...dnfs, id]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 py-8 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-white/50 hover:text-white">← BACK</button>
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleLock}
            className={cn(
              "px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition-colors",
              teamsLocked ? "bg-f1-red text-white" : "bg-emerald-500 text-white"
            )}
          >
            {teamsLocked ? "UNLOCK TEAMS" : "LOCK TEAMS"}
          </button>
          <div className="flex bg-white/5 rounded-lg p-1">
            <button 
              onClick={() => {
                setView('race');
                setEditingRaceId(null);
                setRaceName('');
                setPoleDriverId('');
                setFastestLapDriverId('');
                setFinishers(Array(10).fill(''));
                setDnfs([]);
              }}
              className={cn("px-4 py-2 rounded text-xs font-bold uppercase", view === 'race' && "bg-white/10")}
            >
              Race
            </button>
            <button 
              onClick={() => setView('history')}
              className={cn("px-4 py-2 rounded text-xs font-bold uppercase", view === 'history' && "bg-white/10")}
            >
              History
            </button>
            <button 
              onClick={() => setView('leagues')}
              className={cn("px-4 py-2 rounded text-xs font-bold uppercase", view === 'leagues' && "bg-white/10")}
            >
              Leagues
            </button>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-black italic">ADMIN DASHBOARD</h2>

      {view === 'leagues' ? (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">ALL LEAGUES</h3>
          <div className="grid gap-4">
            {leagues.map(l => (
              <div key={l.id} className="f1-card p-4 flex justify-between items-center">
                <div>
                  <div className="font-bold">{l.name}</div>
                  <div className="text-xs text-white/40 font-mono">CODE: {l.invite_code}</div>
                </div>
                <button 
                  onClick={() => deleteLeague(l.id)}
                  className="text-f1-red hover:text-white text-xs font-bold uppercase"
                >
                  DELETE
                </button>
              </div>
            ))}
            {leagues.length === 0 && <div className="text-white/40 italic">No leagues found.</div>}
          </div>
        </div>
      ) : view === 'history' ? (
        <RaceResults races={races} onEdit={handleEditRace} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-f1-red/20 border border-f1-red text-f1-red p-4 rounded-lg text-sm font-bold">
              {error}
            </div>
          )}

          <div className="f1-card p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold">{editingRaceId ? `EDITING: ${raceName}` : 'NEW RACE RESULT'}</h3>
              {editingRaceId && (
                <button 
                  type="button"
                  onClick={() => {
                    setEditingRaceId(null);
                    setRaceName('');
                    setPoleDriverId('');
                    setFastestLapDriverId('');
                    setFinishers(Array(10).fill(''));
                    setDnfs([]);
                  }}
                  className="text-xs text-white/40 hover:text-white"
                >
                  CANCEL EDIT
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Race Name</label>
                <input 
                  value={raceName}
                  onChange={e => setRaceName(e.target.value)}
                  className="f1-input w-full" 
                  placeholder="e.g. Bahrain GP" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Pole Position</label>
                <select 
                  value={poleDriverId}
                  onChange={e => setPoleDriverId(e.target.value)}
                  className="f1-input w-full"
                >
                  <option value="">Select Driver</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Fastest Lap</label>
                <select 
                  value={fastestLapDriverId}
                  onChange={e => setFastestLapDriverId(e.target.value)}
                  className="f1-input w-full"
                >
                  <option value="">Select Driver</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/10 pb-2">Top 10 Finishers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {finishers.map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="font-mono font-bold text-f1-red w-8">P{i+1}</span>
                    <select 
                      value={finishers[i]}
                      onChange={e => {
                        const newF = [...finishers];
                        newF[i] = e.target.value;
                        setFinishers(newF);
                      }}
                      className="f1-input flex-1"
                    >
                      <option value="">Select Driver</option>
                      {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/10 pb-2">DNFs (Did Not Finish)</h3>
              <div className="flex flex-wrap gap-2">
                {drivers.map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDnf(d.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                      dnfs.includes(d.id) 
                        ? "bg-f1-red border-f1-red text-white" 
                        : "bg-white/5 border-white/10 text-white/40 hover:border-white/30"
                    )}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="f1-button w-full py-4 text-lg"
          >
            {loading ? 'PROCESSING...' : 'AWARD POINTS'}
          </button>
        </form>
      )}
    </motion.div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'dashboard' | 'league' | 'draft' | 'admin' | 'results'>('landing');
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [constructors, setConstructors] = useState<Constructor[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamsLocked, setTeamsLocked] = useState(false);

  // Draft state
  const [draftDrivers, setDraftDrivers] = useState<string[]>([]);
  const [draftConstructors, setDraftConstructors] = useState<string[]>([]);

  const [races, setRaces] = useState<any[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('f1_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setView('dashboard');
        fetchLeagues(parsed.id);
      } catch (e) {
        localStorage.removeItem('f1_user');
      }
    }
    
    const init = async () => {
      try {
        await fetchMarketData();
        await fetchRaces();
        await fetchLockStatus();
      } catch (err: any) {
        setError("Failed to load game data. " + (err.message || ""));
      }
    };
    init();
  }, []);

  const fetchLockStatus = async () => {
    try {
      const data = await safeFetch('/api/settings/lock');
      if (data) setTeamsLocked(data.locked);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRaces = async () => {
    try {
      const data = await safeFetch('/api/races');
      if (data) setRaces(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMarketData = async () => {
    try {
      const [dData, cData] = await Promise.all([
        safeFetch('/api/drivers'),
        safeFetch('/api/constructors')
      ]);
      console.log("Fetched drivers:", dData?.length);
      console.log("Fetched constructors:", cData?.length);
      if (dData && Array.isArray(dData)) setDrivers(dData);
      if (cData && Array.isArray(cData)) setConstructors(cData);
    } catch (err: any) {
      console.error("Market data fetch failed:", err);
      throw err;
    }
  };

  const fetchLeagues = async (userId: number) => {
    try {
      const data = await safeFetch(`/api/leagues/${userId}`);
      if (data) setLeagues(data);
    } catch (err: any) {
      setError("Failed to fetch leagues. " + (err.message || ""));
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;

    try {
      const userData = await safeFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      
      if (userData) {
        setUser(userData);
        localStorage.setItem('f1_user', JSON.stringify(userData));
        setView('dashboard');
        fetchLeagues(userData.id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeague = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('leagueName') as string;

    try {
      const data = await safeFetch('/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, adminId: user.id })
      });
      
      if (data) {
        await fetchLeagues(user.id);
        (e.target as HTMLFormElement).reset();
      }
    } catch (err: any) {
      setError("Failed to create league. " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeague = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const inviteCode = formData.get('inviteCode') as string;

    try {
      const data = await safeFetch('/api/leagues/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode, userId: user.id })
      });
      
      if (data) {
        await fetchLeagues(user.id);
        (e.target as HTMLFormElement).reset();
      }
    } catch (err: any) {
      setError("Failed to join league. " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const openLeague = async (league: League) => {
    setSelectedLeague(league);
    setLoading(true);
    setError(null);
    try {
      const [sData, tData] = await Promise.all([
        safeFetch(`/api/leagues/${league.id}/standings`),
        safeFetch(`/api/teams/${user?.id}/${league.id}`)
      ]);
      
      if (sData) setStandings(sData);
      setMyTeam(tData); // tData can be null if no team exists
      
      if (tData) {
        setDraftDrivers([tData.driver1_id, tData.driver2_id, tData.driver3_id, tData.driver4_id, tData.driver5_id].filter(Boolean));
        setDraftConstructors([tData.constructor1_id, tData.constructor2_id].filter(Boolean));
      } else {
        setDraftDrivers([]);
        setDraftConstructors([]);
      }
      
      setView('league');
    } catch (err: any) {
      setError("Failed to open league. " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const saveTeam = async () => {
    if (!user || !selectedLeague || draftDrivers.length !== 5 || draftConstructors.length !== 2) return;
    setLoading(true);
    setError(null);
    try {
      const data = await safeFetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          leagueId: selectedLeague.id,
          driver1Id: draftDrivers[0],
          driver2Id: draftDrivers[1],
          driver3Id: draftDrivers[2],
          driver4Id: draftDrivers[3],
          driver5Id: draftDrivers[4],
          constructor1Id: draftConstructors[0],
          constructor2Id: draftConstructors[1]
        })
      });
      
      if (data) {
        await openLeague(selectedLeague);
      }
    } catch (err: any) {
      setError("Failed to save team. " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const currentSpend = () => {
    const dPrice = draftDrivers.reduce((acc, id) => acc + (drivers.find(d => d.id === id)?.price || 0), 0);
    const cPrice = draftConstructors.reduce((acc, id) => acc + (constructors.find(c => c.id === id)?.price || 0), 0);
    return dPrice + cPrice;
  };

  const toggleDriver = (id: string) => {
    if (draftDrivers.includes(id)) {
      setDraftDrivers(draftDrivers.filter(d => d !== id));
    } else if (draftDrivers.length < 5) {
      const driver = drivers.find(d => d.id === id);
      if (driver && currentSpend() + driver.price <= BUDGET_LIMIT) {
        setDraftDrivers([...draftDrivers, id]);
      }
    }
  };

  const toggleConstructor = (id: string) => {
    if (draftConstructors.includes(id)) {
      setDraftConstructors(draftConstructors.filter(c => c !== id));
    } else if (draftConstructors.length < 2) {
      const c = constructors.find(item => item.id === id);
      if (c && currentSpend() + c.price <= BUDGET_LIMIT) {
        setDraftConstructors([...draftConstructors, id]);
      }
    }
  };

  const toggleLock = async () => {
    try {
      const data = await safeFetch('/api/settings/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: !teamsLocked })
      });
      if (data) setTeamsLocked(data.locked);
    } catch (e) {
      console.error(e);
    }
  };

  const logout = () => {
    localStorage.removeItem('f1_user');
    setUser(null);
    setView('landing');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-f1-dark/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="bg-f1-red p-1.5 rounded-md">
              <Zap className="w-6 h-6 text-white fill-current" />
            </div>
            <span className="text-xl font-display font-black tracking-tighter italic">F1 FANTASY PRO</span>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              {user.email === 'teluguf1tejarace@gmail.com' && user.name === 'teluguf1' && (
                <button 
                  onClick={() => setView('admin')}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors text-xs font-bold uppercase tracking-wider"
                >
                  <Settings className="w-4 h-4 text-f1-red" /> Admin
                </button>
              )}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold">{user.name}</span>
                <span className="text-xs text-white/50">{user.email}</span>
              </div>
              <button 
                onClick={logout}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4">
        <AnimatePresence mode="wait">
          {view === 'admin' && (
            <AdminPanel 
              drivers={drivers} 
              onBack={() => setView('dashboard')} 
              onSuccess={() => {
                setView('dashboard');
                // Refresh data if needed
              }}
              teamsLocked={teamsLocked}
              onToggleLock={toggleLock}
            />
          )}

          {view === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <h1 className="text-6xl md:text-8xl font-black italic mb-6 leading-none">
                RACE YOUR <br /> <span className="text-f1-red">FRIENDS.</span>
              </h1>
              <p className="text-xl text-white/60 max-w-2xl mb-12">
                Build your ultimate F1 team, join private leagues, and prove who's the best strategist on the grid.
              </p>

              <div className="f1-card p-8 w-full max-w-md">
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <div className="bg-f1-red/20 border border-f1-red text-f1-red text-xs p-3 rounded-lg font-bold uppercase tracking-wider">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Full Name</label>
                    <input name="name" required className="f1-input w-full" placeholder="Max Verstappen" autoComplete="off"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Email Address</label>
                    <input name="email" type="email" required className="f1-input w-full" placeholder="max@redbull.com" autoComplete="off"/>
                  </div>
                  <button type="submit" disabled={loading} className="f1-button w-full mt-4">
                    {loading ? 'CONNECTING...' : 'START PLAYING'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8 py-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-3xl">YOUR LEAGUES</h2>
                  <p className="text-white/50">Compete with your friends in private groups</p>
                </div>
                <button 
                  onClick={() => setView('results')}
                  className="f1-button flex items-center gap-2 text-sm px-4 py-2"
                >
                  <Trophy className="w-4 h-4" /> VIEW RACE RESULTS
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Create/Join Card */}
                <div className="f1-card p-6 flex flex-col gap-6">
                  <div>
                    <h3 className="text-lg mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-f1-red" /> CREATE LEAGUE
                    </h3>
                    <form onSubmit={handleCreateLeague} className="space-y-3">
                      <input name="leagueName" required className="f1-input w-full text-sm" placeholder="League Name" />
                      <button className="f1-button w-full text-sm py-2">CREATE</button>
                    </form>
                  </div>
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-f1-red" /> JOIN LEAGUE
                    </h3>
                    <form onSubmit={handleJoinLeague} className="space-y-3">
                      <input name="inviteCode" required className="f1-input w-full text-sm" placeholder="Invite Code (e.g. AB12CD)" />
                      <button className="f1-button w-full text-sm py-2 bg-white text-f1-dark hover:bg-white/90">JOIN</button>
                    </form>
                  </div>
                </div>

                {/* League List */}
                <div className="md:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {leagues.map(league => (
                      <button 
                        key={league.id}
                        onClick={() => openLeague(league)}
                        className="f1-card p-6 text-left group hover:bg-f1-gray/50"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-white/10 p-2 rounded-lg">
                            <Trophy className="w-6 h-6 text-f1-red" />
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-f1-red transition-colors" />
                        </div>
                        <h3 className="text-xl font-bold mb-1">{league.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                          <span>CODE: {league.invite_code}</span>
                        </div>
                      </button>
                    ))}
                    {leagues.length === 0 && (
                      <div className="col-span-full flex flex-col items-center justify-center p-12 f1-card border-dashed">
                        <Users className="w-12 h-12 text-white/10 mb-4" />
                        <p className="text-white/30">You haven't joined any leagues yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8 py-8"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('dashboard')}
                  className="text-sm text-white/50 hover:text-white flex items-center gap-1"
                >
                  ← BACK TO DASHBOARD
                </button>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                  <h1 className="text-5xl italic">RACE RESULTS</h1>
                  <p className="text-white/50">Official Race Classifications & Points</p>
                </div>
              </div>

              <RaceResults races={races} />
            </motion.div>
          )}

          {view === 'league' && selectedLeague && (
            <motion.div 
              key="league"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8 py-8"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('dashboard')}
                  className="text-sm text-white/50 hover:text-white flex items-center gap-1"
                >
                  ← BACK TO DASHBOARD
                </button>
                <div className="flex items-center gap-2 bg-f1-gray/50 px-3 py-1 rounded-full border border-white/10">
                  <span className="text-xs font-mono text-white/40 uppercase tracking-tighter">Invite Code:</span>
                  <span className="text-xs font-mono font-bold text-f1-red">{selectedLeague.invite_code}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(selectedLeague.invite_code);
                    }}
                    className="p-1 hover:text-f1-red transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                  <h1 className="text-5xl italic">{selectedLeague.name}</h1>
                  <p className="text-white/50">League Standings & Team Management</p>
                </div>
                <button 
                  onClick={() => setView('draft')}
                  disabled={teamsLocked}
                  className="f1-button flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {teamsLocked ? (
                    <>
                      <ShieldCheck className="w-5 h-5" /> TEAMS LOCKED
                    </>
                  ) : (
                    <>
                      <Car className="w-5 h-5" /> {myTeam ? 'MANAGE TEAM' : 'DRAFT TEAM'}
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Standings */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-f1-red" /> STANDINGS
                  </h3>
                  <div className="f1-card overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-white/5 text-xs font-mono text-white/40">
                        <tr>
                          <th className="px-6 py-3">POS</th>
                          <th className="px-6 py-3">PLAYER</th>
                          <th className="px-6 py-3">TEAM</th>
                          <th className="px-6 py-3 text-right">POINTS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {standings.map((s, idx) => (
                          <tr key={idx} className={cn("hover:bg-white/5 transition-colors", s.name === user?.name && "bg-f1-red/10")}>
                            <td className="px-6 py-4 font-mono font-bold text-lg">
                              {idx + 1}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold">{s.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex -space-x-2">
                                {[s.driver1_id, s.driver2_id, s.driver3_id, s.driver4_id, s.driver5_id].map(id => {
                                  const d = drivers.find(item => item.id === id);
                                  return d ? (
                                    <img 
                                      key={id}
                                      src={d.image} 
                                      className="w-8 h-8 rounded-full border-2 border-f1-dark bg-f1-gray" 
                                      alt={d.name}
                                    />
                                  ) : null;
                                })}
                                {[s.constructor1_id, s.constructor2_id].map(id => {
                                  const c = constructors.find(item => item.id === id);
                                  return c ? (
                                    <img 
                                      key={id}
                                      src={c.image} 
                                      className="w-8 h-8 rounded-full border-2 border-f1-dark bg-f1-gray object-contain p-1" 
                                      alt={c.name}
                                    />
                                  ) : null;
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-f1-red">
                              {s.points}
                            </td>
                          </tr>
                        ))}
                        {standings.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-white/20">
                              No teams drafted yet. Be the first!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* My Team Summary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-f1-red" /> YOUR TEAM
                  </h3>
                  {myTeam ? (
                    <div className="f1-card p-6 space-y-6">
                      <div className="space-y-4">
                        {[myTeam.driver1_id, myTeam.driver2_id, myTeam.driver3_id, myTeam.driver4_id, myTeam.driver5_id].map((id, i) => {
                          const d = drivers.find(item => item.id === id);
                          return d ? (
                            <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                              <img src={d.image} className="w-12 h-12 rounded-full bg-f1-gray" alt="" />
                              <div>
                                <div className="text-xs text-white/40 uppercase font-mono">Driver {i + 1}</div>
                                <div className="font-bold">{d.name}</div>
                              </div>
                            </div>
                          ) : null;
                        })}
                        {[myTeam.constructor1_id, myTeam.constructor2_id].map((id, i) => {
                          const c = constructors.find(item => item.id === id);
                          return c ? (
                            <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                              <img src={c.image} className="w-12 h-12 rounded-lg bg-f1-gray object-contain p-2" alt="" />
                              <div>
                                <div className="text-xs text-white/40 uppercase font-mono">Constructor {i + 1}</div>
                                <div className="font-bold">{c.name}</div>
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                      <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="text-sm text-white/40">Total Points</span>
                        <span className="text-2xl font-mono font-bold text-f1-red">{myTeam.points}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="f1-card p-12 text-center flex flex-col items-center gap-4">
                      <Car className="w-12 h-12 text-white/10" />
                      <p className="text-sm text-white/40">You haven't drafted a team for this league yet.</p>
                      <button 
                        onClick={() => setView('draft')} 
                        disabled={teamsLocked}
                        className="f1-button text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {teamsLocked ? "TEAMS LOCKED" : "DRAFT NOW"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'draft' && selectedLeague && (
            <motion.div 
              key="draft"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 py-8"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('league')}
                  className="text-sm text-white/50 hover:text-white flex items-center gap-1"
                >
                  ← BACK TO LEAGUE
                </button>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-white/40 uppercase font-mono">Budget Remaining</span>
                    <span className={cn(
                      "text-2xl font-mono font-bold",
                      BUDGET_LIMIT - currentSpend() < 0 ? "text-f1-red" : "text-emerald-400"
                    )}>
                      ${(BUDGET_LIMIT - currentSpend()).toFixed(1)}M
                    </span>
                  </div>
                  <button 
                    onClick={saveTeam}
                    disabled={draftDrivers.length !== 5 || draftConstructors.length !== 2 || currentSpend() > BUDGET_LIMIT || teamsLocked}
                    className="f1-button disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {teamsLocked ? "LOCKED" : "SAVE TEAM"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Selection Area */}
                <div className="lg:col-span-2 space-y-12">
                  {/* Drivers */}
                  <section>
                    <h3 className="text-2xl italic mb-6 flex items-center gap-3">
                      <UserIcon className="w-6 h-6 text-f1-red" /> SELECT 5 DRIVERS
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {drivers.map(driver => {
                        const isSelected = draftDrivers.includes(driver.id);
                        const canSelect = isSelected || (draftDrivers.length < 5 && currentSpend() + driver.price <= BUDGET_LIMIT);
                        
                        return (
                          <button
                            key={driver.id}
                            onClick={() => toggleDriver(driver.id)}
                            disabled={!canSelect && !isSelected}
                            className={cn(
                              "f1-card p-4 flex items-center gap-4 text-left relative group",
                              isSelected && "border-f1-red bg-f1-red/10",
                              !canSelect && !isSelected && "opacity-40 grayscale"
                            )}
                          >
                            <img src={driver.image} className="w-16 h-16 rounded-full bg-f1-gray" alt={driver.name} />
                            <div className="flex-1">
                              <div className="text-xs text-white/40 font-mono uppercase">
                                {constructors.find(c => c.id === driver.constructor_id)?.name}
                              </div>
                              <div className="font-bold text-lg">{driver.name}</div>
                              <div className="text-f1-red font-mono font-bold">${driver.price}M</div>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-f1-red p-1 rounded-full">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* Constructors */}
                  <section>
                    <h3 className="text-2xl italic mb-6 flex items-center gap-3">
                      <Car className="w-6 h-6 text-f1-red" /> SELECT 2 CONSTRUCTORS
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {constructors.map(c => {
                        const isSelected = draftConstructors.includes(c.id);
                        const canSelect = isSelected || (draftConstructors.length < 2 && currentSpend() + c.price <= BUDGET_LIMIT);

                        return (
                          <button
                            key={c.id}
                            onClick={() => toggleConstructor(c.id)}
                            disabled={!canSelect && !isSelected}
                            className={cn(
                              "f1-card p-4 flex items-center gap-4 text-left relative group",
                              isSelected && "border-f1-red bg-f1-red/10",
                              !canSelect && !isSelected && "opacity-40 grayscale"
                            )}
                          >
                            <img src={c.image} className="w-20 h-12 object-contain bg-f1-gray rounded-lg p-2" alt={c.name} />
                            <div className="flex-1">
                              <div className="font-bold text-lg">{c.name}</div>
                              <div className="text-f1-red font-mono font-bold">${c.price}M</div>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-f1-red p-1 rounded-full">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>

                {/* Preview Sidebar */}
                <div className="space-y-6">
                  <div className="sticky top-24">
                    <h3 className="text-lg font-bold mb-4">TEAM PREVIEW</h3>
                    <div className="f1-card p-6 space-y-6">
                      <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                          <span className="text-xs text-white/40 uppercase font-mono">Drivers ({draftDrivers.length}/5)</span>
                          {draftDrivers.map(id => {
                            const d = drivers.find(item => item.id === id);
                            return d ? (
                              <div key={id} className="flex items-center justify-between bg-white/5 p-2 rounded">
                                <span className="text-sm font-bold">{d.name}</span>
                                <span className="text-xs font-mono text-f1-red">${d.price}M</span>
                              </div>
                            ) : null;
                          })}
                          {draftDrivers.length === 0 && <div className="text-xs text-white/20 italic p-2 border border-dashed border-white/10 rounded">No drivers selected</div>}
                        </div>

                        <div className="flex flex-col gap-2">
                          <span className="text-xs text-white/40 uppercase font-mono">Constructors ({draftConstructors.length}/2)</span>
                          {draftConstructors.map(id => {
                            const c = constructors.find(item => item.id === id);
                            return c ? (
                              <div key={id} className="flex items-center justify-between bg-white/5 p-2 rounded">
                                <span className="text-sm font-bold">{c.name}</span>
                                <span className="text-xs font-mono text-f1-red">${c.price}M</span>
                              </div>
                            ) : null;
                          })}
                          {draftConstructors.length === 0 && <div className="text-xs text-white/20 italic p-2 border border-dashed border-white/10 rounded">No constructors selected</div>}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/10 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/40">Total Spend</span>
                          <span className="font-mono font-bold">${currentSpend().toFixed(1)}M</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/40">Remaining</span>
                          <span className={cn("font-mono font-bold", BUDGET_LIMIT - currentSpend() < 0 ? "text-f1-red" : "text-emerald-400")}>
                            ${(BUDGET_LIMIT - currentSpend()).toFixed(1)}M
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 bg-f1-dark">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-white/30 text-xs font-mono">
          <p>© 2026 F1 FANTASY PRO. NOT AFFILIATED WITH FORMULA 1.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-f1-red transition-colors">RULES</a>
            <a href="#" className="hover:text-f1-red transition-colors">SCORING</a>
            <a href="#" className="hover:text-f1-red transition-colors">SUPPORT</a>
          </div>
        </div>
        <div className="text-center text-xs text-white/20 mt-4">
          Debug: Drivers: {drivers.length} | Constructors: {constructors.length} | User: {user ? user.name : 'None'}
        </div>
      </footer>
    </div>
  );
}
