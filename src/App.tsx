/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Activity, LogOut, RefreshCw, Smartphone, TrendingUp, Calendar, Zap, Award, CheckCircle } from 'lucide-react';
import { User, Group, Challenge, ChallengeProgress } from './types';
import { INITIAL_GROUPS, INITIAL_CHALLENGES, getCompetitorDailyProgress } from './data';
import WelcomeScreen from './components/WelcomeScreen';
import LiveHeartRateSimulator from './components/LiveHeartRateSimulator';
import LeaderboardView from './components/LeaderboardView';
import GroupsSection from './components/GroupsSection';
import ChallengeOverview from './components/ChallengeOverview';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  
  const [activeGroupId, setActiveGroupId] = useState('group_elite');
  const [activeChallengeId, setActiveChallengeId] = useState('challenge_hourly_130');

  // Currently inspected/selected hour block in the 24h timeline
  const [selectedHour, setSelectedHour] = useState(10); // defaults to 10 AM focus
  const [userProgress, setUserProgress] = useState<ChallengeProgress | null>(null);

  const activeDate = '2026-05-28'; // Fixed operational day matching platform timing

  // Load user data and state from localStorage on startup
  useEffect(() => {
    const storedUser = localStorage.getItem('pulse_user');
    const storedGroups = localStorage.getItem('pulse_groups');
    const storedChallenges = localStorage.getItem('pulse_challenges');
    const storedProgress = localStorage.getItem(`pulse_progress_${activeChallengeId}_${activeDate}`);

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedGroups) {
      setGroups(JSON.parse(storedGroups));
    }
    if (storedChallenges) {
      setChallenges(JSON.parse(storedChallenges));
    }

    // Initialize progress if exists, otherwise generate basic template later
    if (storedProgress) {
      setUserProgress(JSON.parse(storedProgress));
    }
  }, [activeChallengeId]);

  // Set up default blank progress record for the user if none exists
  useEffect(() => {
    if (!user) return;

    const storedProgress = localStorage.getItem(`pulse_progress_${activeChallengeId}_${activeDate}`);
    if (storedProgress) {
      setUserProgress(JSON.parse(storedProgress));
      return;
    }

    // Otherwise create default clean slate template
    const hourlyTimeline: ChallengeProgress['hourlyTimeline'] = {};
    for (let hour = 0; hour < 24; hour++) {
      hourlyTimeline[hour] = {
        maxBpm: 0,
        durationAtTargetMinutes: 0,
        success: false
      };
    }

    const initialProg: ChallengeProgress = {
      userId: user.id,
      challengeId: activeChallengeId,
      date: activeDate,
      hourlyTimeline,
      totalCompletedHours: 0,
      overallSuccess: false
    };

    setUserProgress(initialProg);
    localStorage.setItem(`pulse_progress_${activeChallengeId}_${activeDate}`, JSON.stringify(initialProg));
  }, [user, activeChallengeId]);

  // Log in user handler
  const handleConnectComplete = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('pulse_user', JSON.stringify(newUser));
  };

  // Sign out / reset account handler
  const handleDisconnect = () => {
    localStorage.removeItem('pulse_user');
    localStorage.removeItem(`pulse_progress_${activeChallengeId}_${activeDate}`);
    setUser(null);
    setUserProgress(null);
  };

  // Save changes to localStorage on any state change
  const saveProgressToStorage = (updatedProgress: ChallengeProgress) => {
    setUserProgress(updatedProgress);
    localStorage.setItem(`pulse_progress_${activeChallengeId}_${activeDate}`, JSON.stringify(updatedProgress));
  };

  // Callback when a simulated hour log session finishes
  const handleHourLogComplete = (hour: number, bpmData: { bpm: number; timestamp: string }[]) => {
    if (!userProgress) return;

    // Analyze target metrics
    const activeChallenge = challenges.find(c => c.id === activeChallengeId) || challenges[0];
    const thresholdBpm = activeChallenge.targetBpm;
    const requiredMinutes = activeChallenge.durationMinutes;

    // Count compliant heart rate logs (for simulation, each array slot represents 1 minute)
    const minutesAtTarget = bpmData.filter(pt => pt.bpm >= thresholdBpm).length;
    const isSuccess = minutesAtTarget >= requiredMinutes;
    const maxBpm = bpmData.reduce((max, pt) => (pt.bpm > max ? pt.bpm : max), 0);

    const updatedTimeline = {
      ...userProgress.hourlyTimeline,
      [hour]: {
        maxBpm,
        durationAtTargetMinutes: minutesAtTarget,
        success: isSuccess
      }
    };

    // Calculate sum of successful hourly slots inside active zone (8 AM to 8 PM)
    const activeTrackedHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    let totalCompletedHours = 0;
    activeTrackedHours.forEach((hr) => {
      if (updatedTimeline[hr]?.success) {
        totalCompletedHours++;
      }
    });

    const isDailyTargetMet = totalCompletedHours >= 10;

    const nextProgress: ChallengeProgress = {
      ...userProgress,
      hourlyTimeline: updatedTimeline,
      totalCompletedHours,
      overallSuccess: isDailyTargetMet
    };

    saveProgressToStorage(nextProgress);
  };

  // Reset entire day timeline back to resting values
  const handleResetProgress = () => {
    if (!userProgress) return;

    const hourlyTimeline: ChallengeProgress['hourlyTimeline'] = {};
    for (let hour = 0; hour < 24; hour++) {
      hourlyTimeline[hour] = {
        maxBpm: 0,
        durationAtTargetMinutes: 0,
        success: false
      };
    }

    const resetProg: ChallengeProgress = {
      ...userProgress,
      hourlyTimeline,
      totalCompletedHours: 0,
      overallSuccess: false
    };

    saveProgressToStorage(resetProg);
  };

  // Fast Full Day Generator: Simulates completing a realistic high-activity day
  const handleSimulateFullDay = () => {
    if (!userProgress) return;

    const activeTrackedHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const hourlyTimeline = { ...userProgress.hourlyTimeline };

    // Set 11 of the 13 active hours to succeed deterministically (to make user rank #1 or #2!)
    activeTrackedHours.forEach((hour, idx) => {
      // 11 slots are successful, 2 fail/resting to retain realistic human behavior
      const isSuccessfulBlock = idx !== 2 && idx !== 7; 

      if (isSuccessfulBlock) {
        hourlyTimeline[hour] = {
          maxBpm: Math.floor(134 + Math.random() * 21), // 134 to 155 BPM
          durationAtTargetMinutes: Math.floor(6 + Math.random() * 12), // 6 to 18 active minutes
          success: true
        };
      } else {
        hourlyTimeline[hour] = {
          maxBpm: Math.floor(82 + Math.random() * 15), // active but didn't reach target
          durationAtTargetMinutes: Math.floor(1 + Math.random() * 2), // missed target duration
          success: false
        };
      }
    });

    const totalCompletedHours = activeTrackedHours.filter(hr => hourlyTimeline[hr]?.success).length;

    const simulatedProg: ChallengeProgress = {
      ...userProgress,
      hourlyTimeline,
      totalCompletedHours,
      overallSuccess: totalCompletedHours >= 10
    };

    saveProgressToStorage(simulatedProg);
  };

  // Group creation handler
  const handleCreateGroup = (newGroup: Group) => {
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    localStorage.setItem('pulse_groups', JSON.stringify(updatedGroups));
    setActiveGroupId(newGroup.id);
  };

  // Challenge creation handler
  const handleCreateChallenge = (newChallenge: Challenge) => {
    const updatedChallenges = [...challenges, newChallenge];
    setChallenges(updatedChallenges);
    localStorage.setItem('pulse_challenges', JSON.stringify(updatedChallenges));
    
    // Update parent group link
    const updatedGroups = groups.map((g) => {
      if (g.id === newChallenge.groupId) {
        return {
          ...g,
          challengeIds: [...g.challengeIds, newChallenge.id]
        };
      }
      return g;
    });
    setGroups(updatedGroups);
    localStorage.setItem('pulse_groups', JSON.stringify(updatedGroups));

    setActiveChallengeId(newChallenge.id);
  };

  // Screen routing branch
  if (!user || !userProgress) {
    return (
      <WelcomeScreen 
        onComplete={handleConnectComplete} 
        initialEmail="varundhiman@gmail.com" 
      />
    );
  }

  const activeGroup = groups.find(g => g.id === activeGroupId) || groups[0];
  const activeChallenge = challenges.find(c => c.id === activeChallengeId) || challenges[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      
      {/* Decorative Blur Backdrops */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* DASHBOARD HEADER */}
      <header className="border-b border-slate-900 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo with Heart Wave animation */}
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <div className="bg-emerald-500/15 p-2 rounded-xl text-emerald-400 border border-emerald-500/10">
                <Heart className="w-5 h-5 animate-pulse text-emerald-400" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-sans font-black tracking-tighter sleek-gradient-text uppercase">VITAL.TRACK</span>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                  PulseSync
                </span>
              </div>
              <p className="text-[9px] font-mono text-slate-500 tracking-wider">SECURE HEALTHTRACK CLIENT</p>
            </div>
          </div>

          {/* Sync status & User badge */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 md:space-x-2 bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-xl text-xs text-slate-400">
              <span className="text-emerald-400 font-extrabold text-xs">
                {user.healthProvider === 'apple' ? '🍎' : '🤖'}
              </span>
              <span className="font-mono text-[11px]">
                Linked: <strong className="text-slate-200">
                  {user.healthProvider === 'apple' ? 'Apple Health Kit' : 'Google Health Fit'}
                </strong>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>

            {/* Profile Info dropdown or inline button */}
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-850 p-1 pr-3 rounded-full">
              <span className="text-lg bg-slate-950 p-1.5 w-8 h-8 rounded-full flex items-center justify-center border border-slate-800">
                {user.avatar}
              </span>
              <div className="text-left select-none max-w-[120px] truncate">
                <span className="text-xs font-semibold text-slate-200 block truncate leading-none">
                  {user.name}
                </span>
                <span className="text-[9px] font-mono text-slate-500 block truncate">
                  {user.email}
                </span>
              </div>
            </div>

            {/* Switch Account */}
            <button
              onClick={handleDisconnect}
              id="disconnect-account-btn"
              title="Switch Health Provider Account"
              className="p-2.2 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 hover:border-slate-700 hover:text-rose-400 transition-all cursor-pointer text-slate-400"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD WORKSPACE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 relative">
        
        {/* Banner with challenge state */}
        <div className="bg-slate-900/60 p-4.5 rounded-3xl border border-slate-850 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-rose-500/10 p-2.5 rounded-2xl text-rose-450 border border-rose-500/15">
              <Award className="w-5.5 h-5.5 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Currently Tracking Challenge Target</span>
              <h2 className="text-lg font-sans font-extrabold text-white leading-normal mt-0.5">{activeChallenge.name}</h2>
              <p className="text-xs text-slate-405 font-sans">
                {activeChallenge.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-2xl shrink-0 w-full md:w-auto justify-center">
            <TrendingUp className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <div className="font-mono text-xs">
              <span className="text-slate-500">Day Performance: </span>
              <strong className="text-white text-sm">{userProgress.totalCompletedHours} / 13</strong>
              <span className="text-slate-500"> Hours ({((userProgress.totalCompletedHours / 13) * 100).toFixed(0)}%)</span>
            </div>
          </div>
        </div>

        {/* DOUBLE COLUMN CORE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: PROGRESS & SIMULATOR (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Day Timeline widget */}
            <ChallengeOverview
              progress={userProgress}
              challenge={activeChallenge}
              selectedHour={selectedHour}
              onSelectHour={setSelectedHour}
              onResetProgress={handleResetProgress}
              onSimulateFullDay={handleSimulateFullDay}
            />

            {/* 2. Live Simulator tracking widget */}
            <LiveHeartRateSimulator
              currentHour={selectedHour}
              onHourLogComplete={handleHourLogComplete}
              hourlyStatus={userProgress.hourlyTimeline}
            />

          </div>

          {/* RIGHT: LEADERBOARD & PODIUM (lg:col-span-1) */}
          <div className="lg:col-span-1">
            <LeaderboardView
              challenge={activeChallenge}
              currentUser={user}
              currentUserProgress={userProgress}
            />
          </div>

        </div>

        {/* COMPREHENSIVE BOTTOM SECTION: GROUP MANAGEMENTS */}
        <div className="w-full">
          <GroupsSection
            groups={groups}
            activeGroupId={activeGroupId}
            onSelectGroup={(id) => {
              setActiveGroupId(id);
              // Auto select the first challenge under the selected group
              const grp = groups.find(g => g.id === id);
              const challengesInGrp = challenges.filter(c => c.groupId === id);
              if (challengesInGrp.length > 0) {
                setActiveChallengeId(challengesInGrp[0].id);
              }
            }}
            onCreateGroup={handleCreateGroup}
            challenges={challenges}
            activeChallengeId={activeChallengeId}
            onSelectChallenge={setActiveChallengeId}
            onCreateChallenge={handleCreateChallenge}
            currentUser={user}
          />
        </div>

      </main>

    </div>
  );
}
