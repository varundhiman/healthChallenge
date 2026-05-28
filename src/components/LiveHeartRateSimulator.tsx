import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Heart, Activity, Play, Square, FastForward, Info, Zap, AlertCircle } from 'lucide-react';
import { generateSimulatedHeartRateHistory } from '../data';

interface LiveHeartRateSimulatorProps {
  currentHour: number;
  onHourLogComplete: (hour: number, bpmData: { bpm: number; timestamp: string }[]) => void;
  hourlyStatus: { [hour: number]: { maxBpm: number; durationAtTargetMinutes: number; success: boolean } };
}

export default function LiveHeartRateSimulator({
  currentHour,
  onHourLogComplete,
  hourlyStatus,
}: LiveHeartRateSimulatorProps) {
  const [bpm, setBpm] = useState(72);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutMinutesElapsed, setWorkoutMinutesElapsed] = useState(0);
  const [heartRateHistory, setHeartRateHistory] = useState<{ bpm: number; timestamp: string }[]>([]);
  const [simulationSpeed, setSimulationSpeed] = useState<'normal' | 'fast'>('normal');

  // Generate initial calm history for the current hour
  useEffect(() => {
    const historical = generateSimulatedHeartRateHistory(currentHour, isWorkoutActive, isWorkoutActive ? 120 : 72);
    setHeartRateHistory(historical);
    if (historical.length > 0) {
      setBpm(historical[historical.length - 1].bpm);
    }
  }, [currentHour]);

  // Live heart rate pulsation effect & drift
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (simulationSpeed === 'normal') {
      interval = setInterval(() => {
        setBpm((prev) => {
          let drift = Math.floor(Math.sin(Date.now() / 1500) * 3);
          // If workout active, keep heart rate elevated
          let base = isWorkoutActive ? 138 : 72;
          let randomVariance = Math.floor(Math.random() * 5) - 2;
          let finalBpm = base + drift + randomVariance;
          if (finalBpm < 50) finalBpm = 50;
          return finalBpm;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isWorkoutActive, simulationSpeed]);

  // Handle active workout step-by-step
  useEffect(() => {
    let workoutInterval: NodeJS.Timeout;

    if (isWorkoutActive) {
      const stepDuration = simulationSpeed === 'fast' ? 1000 : 3000; // fast ticks or realistic 3s
      workoutInterval = setInterval(() => {
        setWorkoutMinutesElapsed((prev) => {
          const next = prev + 1;
          
          // Generate new bpm reading
          const currentBaseHr = 130 + Math.floor(Math.random() * 18); // 130 to 148 BPM
          setBpm(currentBaseHr);

          // Append to history
          const nowIso = new Date().toISOString();
          setHeartRateHistory((prevHistory) => {
            const nextHistory = [...prevHistory.slice(1), { bpm: currentBaseHr, timestamp: nowIso }];
            return nextHistory;
          });

          if (next >= 5) {
            // Completed 5 minutes of high heart rate!
            setIsWorkoutActive(false);
            setWorkoutMinutesElapsed(0);
            
            // Build 60 minutes and finalize log
            const finalFullLog = generateSimulatedHeartRateHistory(currentHour, true, 135);
            onHourLogComplete(currentHour, finalFullLog);
          }
          return next;
        });
      }, stepDuration);
    }

    return () => clearInterval(workoutInterval);
  }, [isWorkoutActive, currentHour, simulationSpeed, onHourLogComplete]);

  const startWorkoutSim = (speed: 'normal' | 'fast') => {
    setSimulationSpeed(speed);
    setIsWorkoutActive(true);
    setWorkoutMinutesElapsed(0);
  };

  const cancelWorkout = () => {
    setIsWorkoutActive(false);
    setWorkoutMinutesElapsed(0);
  };

  // Generate SVG path coordinate points
  const getSvgCoordinates = () => {
    if (heartRateHistory.length === 0) return '';
    const width = 500;
    const height = 140;
    const padding = 10;
    const maxVal = 180;
    const minVal = 40;

    const points = heartRateHistory.map((item, index) => {
      const x = padding + (index / (heartRateHistory.length - 1)) * (width - 2 * padding);
      // inverted scale for target graph height mapping
      const y = height - padding - ((item.bpm - minVal) / (maxVal - minVal)) * (height - 2 * padding);
      return `${x},${y}`;
    });

    return points.join(' ');
  };

  // Check how many target minutes are logged in state
  const targetCompletedMins = heartRateHistory.filter(h => h.bpm >= 130).length;
  const isHourSuccessful = targetCompletedMins >= 5 || (hourlyStatus[currentHour]?.success ?? false);

  return (
    <div id="hr-sync-simulator-card" className="glass-card p-5 sm:p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 flex space-x-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-[10px] font-mono uppercase text-emerald-400">Broadcasting telemetry</span>
      </div>

      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400 border border-emerald-500/10 h-10 w-10 flex items-center justify-center">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-sans font-bold text-white tracking-tight">Live Heart Rate Telemetry</h2>
          <p className="text-xs text-slate-400 font-sans">Hour: <span className="font-mono text-emerald-400 font-bold">{currentHour}:00 - {currentHour}:59</span></p>
        </div>
      </div>

      {/* BPM Meter Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
        <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-850 flex flex-col justify-center items-center text-center relative overflow-hidden col-span-1 min-h-[170px]">
          {/* Concentric Pulse Rings in card backdrop */}
          <div className="absolute w-36 h-36 rounded-full border border-rose-500/10 animate-ping opacity-60 pointer-events-none" />
          <div className="absolute w-28 h-28 rounded-full border border-emerald-500/10 animate-pulse pointer-events-none" />
          
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-widest relative z-10">Live Pulse</span>
          
          <div className="flex items-baseline space-x-1.5 mt-2 relative z-10">
            <motion.div
              animate={{ scale: isWorkoutActive ? [1, 1.3, 1] : [1, 1.15, 1] }}
              transition={{ 
                repeat: Infinity, 
                duration: isWorkoutActive ? (60 / bpm) : (60 / bpm * 1.5), 
                ease: "easeInOut" 
              }}
              className="mr-1 inline-block"
            >
              <Heart className={`w-6 h-6 fill-current ${bpm >= 130 ? 'text-rose-500' : 'text-emerald-400'}`} />
            </motion.div>
            <span className="text-5xl font-mono font-black text-white tracking-tighter transition-all">
              {bpm}
            </span>
            <span className="text-xs font-mono text-slate-400">BPM</span>
          </div>

          <div className="mt-4 flex items-center space-x-1.5 text-[9px] bg-slate-900 border border-slate-850 rounded-full px-2.5 py-1 text-slate-300 font-mono relative z-10 uppercase tracking-wider">
            <span>Zone:</span>
            <span className={bpm >= 130 ? 'text-rose-400 font-extrabold' : 'text-emerald-400 font-semibold'}>
              {bpm >= 130 ? 'Cardio Peak (HIIT)' : bpm >= 100 ? 'Fat Burn / Pace' : 'Active Resting'}
            </span>
          </div>
        </div>

        {/* Dynamic HR Area Chart */}
        <div className="bg-slate-950/40 rounded-2xl p-3 border border-slate-850/60 col-span-1 md:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span>Peak Graph</span>
            <span className="text-rose-400 font-semibold">• 130 BPM Threshold</span>
          </div>

          <div className="relative h-28 w-full mt-2 bg-slate-950 rounded-xl overflow-hidden border border-slate-900/60 flex items-end">
            {/* SVG line */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 140" preserveAspectRatio="none">
              {/* Threshold indicator line at 130 BPM (drawn at y coordinate corresponding to 130 out of 40-180 range) */}
              {/* 130 of 40-180 range is 90/140 which is ~64% from the bottom */}
              <line 
                x1="0" 
                y1="50" 
                x2="500" 
                y2="50" 
                stroke="#ef4444" 
                strokeDasharray="4,4" 
                strokeWidth="1.5" 
                className="opacity-70"
              />
              
              {/* Plot points */}
              {heartRateHistory.length > 0 && (
                <>
                  <polyline
                    fill="none"
                    stroke={isWorkoutActive ? "#f43f5e" : "#22d3ee"}
                    strokeWidth="2.5"
                    points={getSvgCoordinates()}
                  />
                  {/* Fill area below curve */}
                  <path
                    d={`M 10,130 L ${getSvgCoordinates()} L 490,130 Z`}
                    fill={isWorkoutActive ? "url(#neon-pink-gradient)" : "url(#neon-cyan-gradient)"}
                    className="opacity-20"
                  />
                </>
              )}

              {/* Gradients */}
              <defs>
                <linearGradient id="neon-pink-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="neon-cyan-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Labels overlay */}
            <div className="absolute left-2 top-1 font-mono text-[9px] text-rose-400 bg-slate-950/80 px-1 rounded">130 BPM Limit</div>
            <div className="absolute right-2 bottom-1 font-mono text-[9px] text-slate-500">60 mins data</div>
          </div>
        </div>
      </div>

      {/* Hourly Status alert banner */}
      <div className={`p-3.5 rounded-2xl mb-5 flex items-start space-x-3 text-xs border ${
        isHourSuccessful 
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
          : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
      }`}>
        {isHourSuccessful ? (
          <Zap className="w-5 h-5 shrink-0 text-emerald-400" />
        ) : (
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
        )}
        <div className="space-y-1">
          <span className="font-extrabold uppercase tracking-wide font-mono">
            {isHourSuccessful ? 'Hour Challenge Cleared!' : 'Hour Challenge Pending'}
          </span>
          <p className="text-[11px] text-slate-400 leading-normal">
            {isHourSuccessful 
              ? `You successfully raised your heart rate above 130 BPM for ${Math.max(5, targetCompletedMins, hourlyStatus[currentHour]?.durationAtTargetMinutes ?? 0)} minutes during this hour slot!`
              : `Raise your pulse to 130 BPM with a workout simulation for at least 5 minutes in this hour. Current: ${targetCompletedMins}/5 minutes.`}
          </p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="space-y-3">
        <label className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-500 block">Simulation Engines</label>
        
        {isWorkoutActive ? (
          <div className="bg-slate-950 border border-rose-500/20 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center space-x-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <div>
                <span className="text-xs font-mono text-rose-400 font-bold block">HIIT CARDIO SIMULATION ACTIVE</span>
                <span className="text-xs text-slate-400 font-mono">Elapsed At 130+ BPM: {workoutMinutesElapsed} / 5 minutes</span>
              </div>
            </div>

            <button
              onClick={cancelWorkout}
              id="cancel-workout-btn"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 py-2 rounded-xl transition-all font-mono font-bold w-full sm:w-auto"
            >
              Abode / Halt
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Quick Fast Forward Trigger */}
            <button
              onClick={() => startWorkoutSim('fast')}
              id="workout-fast-btn"
              className="group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 cursor-pointer text-slate-950 font-sans font-bold p-3.5 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98"
            >
              <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              <div className="text-left leading-none">
                <span className="text-xs block font-bold">Fast-Sync Workout</span>
                <span className="text-[9px] block font-mono font-medium opacity-80">(Simulates 5min 130BPM in 5secs)</span>
              </div>
            </button>

            {/* Standard Workout Trigger */}
            <button
              onClick={() => startWorkoutSim('normal')}
              id="workout-normal-btn"
              className="bg-slate-800 hover:bg-slate-705 border border-slate-750 text-white font-sans font-medium p-3.5 rounded-2xl flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current text-emerald-400" />
              <div className="text-left leading-none">
                <span className="text-xs block font-semibold text-slate-100">Live Workout Session</span>
                <span className="text-[9px] block font-mono text-slate-400">(Ticks up in real-time)</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
