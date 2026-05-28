import React from 'react';
import { motion } from 'motion/react';
import { Clock, Check, Moon, Zap, AlertCircle, Info, Calendar } from 'lucide-react';
import { ChallengeProgress, Challenge } from '../types';

interface ChallengeOverviewProps {
  progress: ChallengeProgress;
  challenge: Challenge;
  selectedHour: number;
  onSelectHour: (hour: number) => void;
  onResetProgress: () => void;
  onSimulateFullDay: () => void;
}

export default function ChallengeOverview({
  progress,
  challenge,
  selectedHour,
  onSelectHour,
  onResetProgress,
  onSimulateFullDay,
}: ChallengeOverviewProps) {
  // Hours usually active: 8 AM to 8 PM (inclusive)
  const activeTrackedHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  const getHourVisualState = (hour: number) => {
    const isSleeping = hour < 8 || hour > 20;
    const hourData = progress.hourlyTimeline[hour];
    const isSuccess = hourData?.success ?? false;
    const isSelected = hour === selectedHour;

    return {
      isSleeping,
      isSuccess,
      isSelected,
      maxBpm: hourData?.maxBpm ?? 0,
      duration: hourData?.durationAtTargetMinutes ?? 0,
    };
  };

  const completedHoursCount = progress.totalCompletedHours;
  // Goal is to achieve success in at least 10 active slots out of 13
  const targetCompletedGoal = 10;
  const targetMet = completedHoursCount >= targetCompletedGoal;

  return (
    <div className="glass-card p-5 sm:p-6 shadow-xl space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-sans font-bold text-white">Daily 24-Hour Progress Track</h3>
            <p className="text-xs text-slate-400">
              Selected Challenge Focus: <strong className="text-emerald-400">{challenge.name}</strong>
            </p>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center space-x-2">
          {/* Fast track daily sync */}
          <button
            onClick={onSimulateFullDay}
            id="ff-simulate-day-btn"
            className="text-xs bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-sans font-extrabold px-3 py-1.8 rounded-xl transition-all cursor-pointer flex items-center space-x-1"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Fast-Sync Daily logs</span>
          </button>

          <button
            onClick={onResetProgress}
            id="reset-health-progress-btn"
            className="text-xs bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-white px-3 py-1.8 rounded-xl font-mono transition-all cursor-pointer"
          >
            Reset Day
          </button>
        </div>
      </div>

      {/* Interactive Hours Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400">
            Click an Hour Block to Inspect Bio-Logs / Simulate Workout
          </label>
          <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase">
            Active Zone: 08:00 - 20:59
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2.5">
          {Array.from({ length: 24 }).map((_, hour) => {
            const { isSleeping, isSuccess, isSelected, maxBpm, duration } = getHourVisualState(hour);
            
            let bgStyle = "bg-slate-950/80 border-slate-850 text-slate-500 hover:border-slate-800";
            if (isSleeping) {
              bgStyle = "bg-slate-950/20 border-slate-950/40 text-slate-700 cursor-not-allowed";
            } else if (isSuccess) {
              bgStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/15";
            } else if (maxBpm > 0) {
              // Attempted but not yet success (or resting logs)
              bgStyle = "bg-amber-500/5 border-amber-500/20 text-amber-400 hover:bg-amber-500/10";
            }

            if (isSelected && !isSleeping) {
              bgStyle += " ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900";
            }

            return (
              <motion.button
                key={hour}
                disabled={isSleeping}
                onClick={() => onSelectHour(hour)}
                id={`btn-clock-hour-${hour}`}
                whileHover={!isSleeping ? { scale: 1.04 } : {}}
                whileTap={!isSleeping ? { scale: 0.98 } : {}}
                className={`py-3 px-2 rounded-xl border text-center relative flex flex-col justify-between items-center h-20 cursor-pointer select-none transition-all ${bgStyle}`}
              >
                {/* Visual indicator for current slot */}
                <span className="font-mono text-xs font-black">
                  {hour.toString().padStart(2, '0')}:00
                </span>

                <div className="my-1.5 flex items-center justify-center">
                  {isSleeping ? (
                    <Moon className="w-3.5 h-3.5 opacity-40 text-slate-700" />
                  ) : isSuccess ? (
                    <div className="bg-emerald-500 text-slate-950 rounded-full p-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : maxBpm > 0 ? (
                    <span className="text-[9px] font-bold text-amber-400/90 font-mono">{maxBpm}BPM</span>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-600 font-bold">—</span>
                  )}
                </div>

                <div className="w-full text-center">
                  {!isSleeping && maxBpm > 0 ? (
                    <span className={`text-[9px] font-mono font-bold block truncate ${isSuccess ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {duration}m active
                    </span>
                  ) : (
                    <span className="text-[8px] font-mono text-slate-600 block">
                      {isSleeping ? 'Sleep' : 'Pending'}
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Diagnostic progress readout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        
        {/* Metric A */}
        <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Goal Targets Completed</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-mono font-black text-white">{completedHoursCount}</span>
              <span className="text-slate-500 text-xs font-mono">/ {activeTrackedHours.length} hours</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-xs font-mono font-black border px-2.5 py-1 rounded-lg block ${
              targetMet 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              {targetMet ? '🥇 MET' : '🏋️‍♂️ IN PROGRESS'}
            </span>
          </div>
        </div>

        {/* Metric B */}
        <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl flex items-start space-x-3">
          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 leading-normal space-y-1">
            <p className="font-semibold text-slate-200">How challenges are analyzed:</p>
            <p>
              Your connected Apple/Google Health logs are parsed hourly. To earn credit, our algorithm verifies that heart rate telemetry remained above <strong className="text-emerald-400">{challenge.targetBpm} BPM</strong> for at least <strong className="text-emerald-400">{challenge.durationMinutes}</strong> minutes.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
