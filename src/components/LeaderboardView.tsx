import React from 'react';
import { motion } from 'motion/react';
import { Award, Zap, Trophy, TrendingUp, CheckCircle, Flame } from 'lucide-react';
import { LeaderboardEntry, Challenge, User, ChallengeProgress } from '../types';
import { MOCK_COMPETITORS, getCompetitorDailyProgress } from '../data';

interface LeaderboardViewProps {
  challenge: Challenge;
  currentUser: User;
  currentUserProgress: ChallengeProgress;
}

export default function LeaderboardView({ challenge, currentUser, currentUserProgress }: LeaderboardViewProps) {
  // Compute leaderboard entries
  const getLeaderboardData = (): LeaderboardEntry[] => {
    // Collect progress for all mock competitors for this challenge
    const todayStr = currentUserProgress.date;
    const entries: { userId: string; name: string; avatar: string; score: number; isCurrentUser: boolean }[] = [];

    // 1. Current user
    entries.push({
      userId: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar,
      score: currentUserProgress.totalCompletedHours,
      isCurrentUser: true,
    });

    // 2. Mock competitors
    MOCK_COMPETITORS.forEach(comp => {
      const prog = getCompetitorDailyProgress(comp.id, challenge.id, todayStr);
      entries.push({
        userId: comp.id,
        name: comp.name,
        avatar: comp.avatar,
        score: prog.totalCompletedHours,
        isCurrentUser: false,
      });
    });

    // Sort descending by score
    const sorted = [...entries].sort((a, b) => b.score - a.score);

    // Assign rank with duplicate score handling smoothly
    return sorted.map((item, index) => ({
      userId: item.userId,
      userName: item.name,
      userAvatar: item.avatar,
      score: item.score,
      rank: index + 1,
      isCurrentUser: item.isCurrentUser,
    }));
  };

  const leaderboard = getLeaderboardData();
  const topThree = leaderboard.slice(0, 3);
  const userRankEntry = leaderboard.find(l => l.isCurrentUser);

  return (
    <div id="leaderboard-section" className="space-y-6">
      {/* Visual Podium representation */}
      <div className="glass-card p-5 shadow-xl">
        <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-slate-400 mb-6 flex items-center space-x-2">
          <Trophy className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
          <span>Active Challenge Podium</span>
        </h3>

        <div className="flex items-end justify-center space-x-2 sm:space-x-4 pt-4 pb-2">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="flex flex-col items-center">
              <span className="text-xl mb-1">{topThree[1].userAvatar}</span>
              <span className="text-[11px] font-semibold text-slate-300 max-w-[80px] truncate text-center mb-1">
                {topThree[1].userName.split(' ')[0]}
              </span>
              <div className="w-16 sm:w-20 bg-slate-950/70 border border-slate-850 rounded-t-xl h-16 flex flex-col items-center justify-center relative shadow-lg">
                <span className="text-xs font-mono text-slate-500 font-bold block mb-1">2ND</span>
                <div className="bg-slate-900 text-[10px] font-mono px-1.5 py-0.5 rounded text-slate-300 border border-slate-800">
                  {topThree[1].score} hrs
                </div>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">{topThree[0].userAvatar}</span>
              <span className="text-[12px] font-extrabold text-white max-w-[90px] truncate text-center mb-1 flex items-center justify-center">
                {topThree[0].userName.split(' ')[0]}
                {topThree[0].isCurrentUser && <span className="ml-1 text-[9px] bg-cyan-400 text-slate-950 font-bold px-1 rounded uppercase">YOU</span>}
              </span>
              <div className="w-20 sm:w-24 bg-gradient-to-t from-slate-950/90 to-cyan-450/10 border border-cyan-400/20 rounded-t-2xl h-24 flex flex-col items-center justify-center relative shadow-lg shadow-cyan-400/5">
                <div className="absolute -top-3.5 bg-cyan-400 p-1.5 rounded-full text-slate-950 shadow-md">
                  <Trophy className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-mono text-cyan-400 font-extrabold block mb-1 tracking-wider">🏆 1ST</span>
                <div className="bg-cyan-400 text-[10px] text-slate-950 font-black px-2.5 py-0.5 rounded-full font-mono shadow-sm uppercase">
                  {topThree[0].score} hrs
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="flex flex-col items-center">
              <span className="text-xl mb-1">{topThree[2].userAvatar}</span>
              <span className="text-[11px] font-semibold text-slate-300 max-w-[80px] truncate text-center mb-1">
                {topThree[2].userName.split(' ')[0]}
              </span>
              <div className="w-16 sm:w-20 bg-slate-950/70 border border-slate-850 rounded-t-xl h-12 flex flex-col items-center justify-center relative shadow-lg">
                <span className="text-xs font-mono text-slate-500 font-bold block mb-1">3RD</span>
                <div className="bg-slate-900/80 text-[10px] font-mono px-1.5 py-0.5 rounded text-slate-300 border border-slate-800">
                  {topThree[2].score} hrs
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Complete Rankings List */}
      <div className="glass-card p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-sans font-bold text-white tracking-tight">Challenge Rankings</h3>
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="font-sans">Goal: {challenge.targetBpm} BPM</span>
          </div>
        </div>

        <div className="space-y-2">
          {leaderboard.map((entry) => {
            let badgeStyle = "bg-slate-950/70 text-slate-400 border border-slate-800";
            if (entry.rank === 1) badgeStyle = "bg-cyan-400/10 text-cyan-455 border border-cyan-400/20";
            if (entry.rank === 2) badgeStyle = "bg-slate-300/10 text-slate-300 border border-slate-300/20";
            if (entry.rank === 3) badgeStyle = "bg-amber-600/10 text-amber-500 border border-amber-600/20";

            return (
              <div 
                key={entry.userId}
                id={`ranked-user-${entry.userId}`}
                className={`py-3 px-4 rounded-2xl flex items-center justify-between border transition-all ${
                  entry.isCurrentUser 
                    ? 'bg-slate-900/70 border-cyan-400/30 shadow-sm' 
                    : 'bg-slate-950/45 border-slate-850 hover:bg-slate-950/70 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Rank circle */}
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[11px] font-extrabold ${badgeStyle}`}>
                    {entry.rank}
                  </div>
                  {/* Avatar & Info */}
                  <span className="text-lg">{entry.userAvatar}</span>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-sm font-semibold font-sans ${entry.isCurrentUser ? 'text-cyan-400' : 'text-slate-100'}`}>
                        {entry.userName}
                      </span>
                      {entry.isCurrentUser && (
                        <span className="text-[9px] bg-cyan-455/10 border border-cyan-400/20 text-cyan-400 font-mono font-bold px-1.5 py-0.2 rounded-full uppercase">
                          YOU
                        </span>
                      )}
                    </div>
                    {/* Progress fraction calculated over target active hours (13 total active tracked hours: 8am - 8pm) */}
                    <p className="text-[10px] text-slate-405 font-mono">
                      Completion: {entry.score}/13 slots ({(entry.score / 13 * 100).toFixed(0)}%)
                    </p>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-slate-200">
                    {entry.score} hrs
                  </span>
                  <div className="flex items-center justify-end text-[9px] text-cyan-455 font-mono font-bold">
                    <CheckCircle className="w-2.5 h-2.5 mr-0.5 inline" />
                    <span>Sync</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic score summary */}
        {userRankEntry && (
          <div className="mt-4 pt-4 border-t border-slate-850 text-xs text-slate-400 flex items-center justify-between px-1">
            <span className="font-sans">Your Position: <strong className="text-white">Rank #{userRankEntry.rank}</strong></span>
            <span className="font-sans text-right">Needs <strong className="text-cyan-405">{Math.max(0, 10 - currentUserProgress.totalCompletedHours)} more active hours</strong> to clear tier!</span>
          </div>
        )}
      </div>
    </div>
  );
}
