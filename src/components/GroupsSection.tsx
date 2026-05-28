import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Shield, PlusCircle, Check, Info, Award, Heart, CheckCircle2, ChevronRight } from 'lucide-react';
import { Group, Challenge, User } from '../types';

interface GroupsSectionProps {
  groups: Group[];
  activeGroupId: string;
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: (group: Group) => void;
  challenges: Challenge[];
  activeChallengeId: string;
  onSelectChallenge: (challengeId: string) => void;
  onCreateChallenge: (challenge: Challenge) => void;
  currentUser: User;
}

export default function GroupsSection({
  groups,
  activeGroupId,
  onSelectGroup,
  onCreateGroup,
  challenges,
  activeChallengeId,
  onSelectChallenge,
  onCreateChallenge,
  currentUser,
}: GroupsSectionProps) {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [challengeName, setChallengeName] = useState('');
  const [challengeDesc, setChallengeDesc] = useState('');
  const [targetBpm, setTargetBpm] = useState(130);
  const [durationMinutes, setDurationMinutes] = useState(5);

  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];
  const groupChallenges = challenges.filter((c) => c.groupId === activeGroupId);

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    const newGroup: Group = {
      id: `group_${Date.now()}`,
      name: groupName.trim(),
      description: groupDescription.trim() || 'A high performance cardio competition circle.',
      creatorId: currentUser.id,
      members: [currentUser.id],
      challengeIds: [],
    };

    onCreateGroup(newGroup);
    setGroupName('');
    setGroupDescription('');
    setShowCreateGroup(false);
  };

  const handleCreateChallengeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeName.trim() || !activeGroupId) return;

    const newChallenge: Challenge = {
      id: `challenge_${Date.now()}`,
      name: challengeName.trim(),
      description: challengeDesc.trim() || `Raise heart rate above ${targetBpm} BPM for ${durationMinutes} minutes.`,
      targetBpm: Number(targetBpm),
      durationMinutes: Number(durationMinutes),
      intervalType: 'hourly',
      groupId: activeGroupId,
      creatorId: currentUser.id,
    };

    onCreateChallenge(newChallenge);
    setChallengeName('');
    setChallengeDesc('');
    setTargetBpm(130);
    setDurationMinutes(5);
    setShowCreateChallenge(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. SECTION: GROUPS */}
      <div className="glass-card p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-slate-400 flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Active Group Leagues</span>
          </h3>
          <button
            onClick={() => setShowCreateGroup(!showCreateGroup)}
            id="toggle-create-group-btn"
            className="text-xs bg-slate-950 hover:bg-slate-850 border border-slate-800 text-emerald-400 hover:text-emerald-300 font-mono font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Group</span>
          </button>
        </div>

        {/* Create Group Form modal style inline */}
        {showCreateGroup && (
          <motion.form
            onSubmit={handleCreateGroupSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            id="create-group-form"
            className="p-4 rounded-2xl bg-slate-950 border border-slate-850/70 space-y-3.5"
          >
            <span className="text-xs font-mono font-bold text-slate-355 block">Create Competitive Group</span>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">Group League Name</label>
              <input
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 rounded-lg px-3 py-1.5 border border-slate-800 text-xs focus:border-emerald-500 outline-none"
                placeholder="e.g. Office Pulse Warriors"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">Motto & Target Description</label>
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 rounded-lg px-3 py-1.5 border border-slate-800 text-xs focus:border-emerald-500 outline-none h-12"
                placeholder="e.g. Challenging physical health logs every single day."
              />
            </div>

            <div className="flex justify-end space-x-2 text-xs pt-1">
              <button 
                type="button" 
                onClick={() => setShowCreateGroup(false)} 
                className="px-3 py-1.5 border border-slate-800 rounded hover:bg-slate-900 transition text-slate-400 font-mono font-semibold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                id="submit-group-btn"
                className="px-3.5 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-400 transition cursor-pointer"
              >
                Add Group
              </button>
            </div>
          </motion.form>
        )}

        {/* Group list */}
        <div className="space-y-2">
          {groups.map((g) => {
            const isActive = g.id === activeGroupId;
            return (
              <button
                key={g.id}
                onClick={() => onSelectGroup(g.id)}
                id={`btn-select-group-${g.id}`}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isActive 
                    ? 'bg-gradient-to-r from-slate-955/80 to-slate-950/50 border-cyan-400 ring-1 ring-cyan-400/20 shadow-md' 
                    : 'bg-slate-955/30 border-slate-850/60 hover:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <span className={`text-[13px] font-bold font-sans ${isActive ? 'text-cyan-400' : 'text-slate-200'}`}>
                    {g.name}
                  </span>
                  {isActive && <div className="text-[9px] bg-cyan-400/10 border border-cyan-455/20 text-cyan-400 font-mono font-bold px-1.5 py-0.5 rounded">ACTIVE</div>}
                </div>
                <p className="text-[11px] text-slate-405 leading-normal line-clamp-2 mt-1 font-sans">
                  {g.description}
                </p>
                <div className="flex items-center space-x-3 mt-2 pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-500">
                  <span>Members: <strong className="text-slate-350">{g.id === 'group_elite' ? 4 : g.id === 'group_office' ? 4 : 5}</strong></span>
                  <span>Challenges: <strong className="text-slate-355">{challenges.filter(c => c.groupId === g.id).length}</strong></span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SECTION: ACTIVE CHALLENGES */}
      <div className="glass-card p-5 shadow-lg space-y-4 col-span-1 lg:col-span-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-slate-400">
              Challenges Hosted Under <span className="sleek-gradient-text">"{activeGroup.name}"</span>
            </h3>
            <p className="text-[11px] text-slate-450 font-sans">Join, track, and complete group health requirements to sync rankings.</p>
          </div>
          
          <button
            onClick={() => setShowCreateChallenge(!showCreateChallenge)}
            id="toggle-create-challenge-btn"
            className="text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-955 font-bold px-3.5 py-1.8 rounded-xl flex items-center justify-center space-x-1.5 transition-all self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Host Challenge</span>
          </button>
        </div>

        {/* Create Challenge Form overlay/inset */}
        {showCreateChallenge && (
          <motion.form
            onSubmit={handleCreateChallengeSubmit}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            id="create-challenge-form"
            className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/20 space-y-4"
          >
            <span className="text-xs font-mono font-bold text-emerald-400 block pb-1 border-b border-slate-900">Define Custom Challenge Specs</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">Challenge Label</label>
                <input
                  type="text"
                  required
                  value={challengeName}
                  onChange={(e) => setChallengeName(e.target.value)}
                  className="w-full bg-slate-900 text-slate-100 rounded-lg px-3 py-1.5 border border-slate-800 text-xs focus:border-emerald-500 outline-none"
                  placeholder="e.g. Cardio Spike 130"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">Brief Goal Statement</label>
                <input
                  type="text"
                  value={challengeDesc}
                  onChange={(e) => setChallengeDesc(e.target.value)}
                  className="w-full bg-slate-900 text-slate-100 rounded-lg px-3 py-1.5 border border-slate-800 text-xs focus:border-emerald-500 outline-none"
                  placeholder="e.g. Hold 130BPM once per hour slot for 5 mins"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold flex items-center justify-between">
                  <span>Target Heart Rate Threshold</span>
                  <span className="text-emerald-400">{targetBpm} BPM</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="160"
                  step="5"
                  value={targetBpm}
                  onChange={(e) => setTargetBpm(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold flex items-center justify-between">
                  <span>Time Frame (Duration)</span>
                  <span className="text-emerald-400">{durationMinutes} Minutes</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 text-xs pt-1.5 border-t border-slate-900">
              <button 
                type="button" 
                onClick={() => setShowCreateChallenge(false)} 
                className="px-3.5 py-1.8 border border-slate-850 rounded-lg hover:bg-slate-900 text-slate-400 font-mono"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                id="submit-challenge-btn"
                className="px-4 py-1.8 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-400 transition"
              >
                Build Challenge
              </button>
            </div>
          </motion.form>
        )}

        {/* Existing challenges listed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {groupChallenges.map((c) => {
            const isSelected = c.id === activeChallengeId;
            return (
              <div
                key={c.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-slate-950 border-cyan-400/80 shadow-md ring-1 ring-cyan-405/20' 
                    : 'bg-slate-950/40 border-slate-850/60 hover:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-mono text-cyan-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                        Hourly Interval
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5 font-sans">{c.name}</h4>
                    </div>
                    {isSelected && (
                      <div className="bg-cyan-405 text-slate-950 rounded-full p-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3] text-slate-950" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-sans">
                    {c.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[10px] font-mono">
                    <span className="text-slate-500">Goal:</span>
                    <strong className="text-cyan-400">≥{c.targetBpm} BPM</strong>
                    <span className="text-slate-500">for</span>
                    <strong className="text-cyan-400">{c.durationMinutes}m</strong>
                  </div>

                  {!isSelected && (
                    <button
                      onClick={() => onSelectChallenge(c.id)}
                      id={`btn-track-challenge-${c.id}`}
                      className="text-[10px] font-mono font-bold text-slate-300 hover:text-white flex items-center space-x-0.5"
                    >
                      <span>Track Board</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {groupChallenges.length === 0 && (
            <div className="col-span-full py-8 text-center bg-slate-950/20 border border-slate-850 border-dashed rounded-3xl">
              <span className="text-lg">🏋️‍♀️</span>
              <p className="text-xs text-slate-450 font-sans mt-2">No active challenges hosted in this league.</p>
              <button 
                onClick={() => setShowCreateChallenge(true)} 
                className="mt-3 text-xs bg-slate-850 hover:bg-slate-800 border border-slate-800 py-1 px-3 rounded-lg text-cyan-400 font-mono transition-all"
              >
                Create First Challenge
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
