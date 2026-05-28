import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Shield, Check, Activity, Smartphone, User, ArrowRight, Sparkles } from 'lucide-react';
import { User as UserType } from '../types';

interface WelcomeScreenProps {
  onComplete: (user: UserType) => void;
  initialEmail?: string;
}

export default function WelcomeScreen({ onComplete, initialEmail = 'user@pulse.com' }: WelcomeScreenProps) {
  const [name, setName] = useState('Varun Dhiman');
  const [provider, setProvider] = useState<'apple' | 'google' | null>(null);
  const [shareHeart, setShareHeart] = useState(true);
  const [shareSteps, setShareSteps] = useState(true);
  const [shareSleep, setShareSleep] = useState(false);
  
  const [step, setStep] = useState<'info' | 'provider' | 'permissions' | 'connecting'>('info');

  const handleNext = () => {
    if (step === 'info') {
      setStep('provider');
    } else if (step === 'provider') {
      if (!provider) {
        // Force choosing a target provider for authorization
        setProvider('apple');
      }
      setStep('permissions');
    } else if (step === 'permissions') {
      setStep('connecting');
      // Simulate real OAuth synchronization
      setTimeout(() => {
        const newUser: UserType = {
          id: 'current_user',
          name: name.trim() || 'Health Champion',
          avatar: provider === 'apple' ? '🍎' : '🤖',
          email: initialEmail,
          healthProvider: provider,
          sharedData: {
            heartRate: shareHeart,
            steps: shareSteps,
            sleep: shareSleep,
          },
          points: 100, // starting point check-in bonus
        };
        onComplete(newUser);
      }, 2400);
    }
  };

  return (
    <div id="welcome-container" className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Progress Bar top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800 overflow-hidden">
          <motion.div 
            className="h-full bg-cyan-400"
            animate={{ 
              width: step === 'info' ? '25%' : step === 'provider' ? '50%' : step === 'permissions' ? '75%' : '100%' 
            }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* STEP 1: WELCOME & NAME */}
        {step === 'info' && (
          <div id="step-info" className="space-y-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-cyan-500/10 p-2.5 rounded-2xl border border-cyan-500/20">
                <Heart className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono font-bold block">CARDIO LEAGUE GATEWAY</span>
                <h1 className="text-xl font-sans font-black tracking-tighter sleek-gradient-text uppercase">VITAL.TRACK</h1>
              </div>
            </div>

            <p className="text-xs text-slate-405 leading-relaxed font-sans">
              Step into hourly and daily cardio challenges. Compete with groups, spike your heart rate at least once an hour, and monitor dynamic daily bio-metrics.
            </p>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 block">Set Your Athlete Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/70 text-slate-100 placeholder-slate-650 rounded-xl py-2.5 pl-11 pr-4 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 outline-none text-xs transition-all font-sans"
                  placeholder="Enter athlete username"
                />
              </div>
            </div>

            <div className="bg-slate-950/50 p-4 border border-slate-850 rounded-2xl flex items-start space-x-3">
              <Shield className="w-4.5 h-4.5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-404 space-y-1 font-sans">
                <span className="font-semibold text-slate-200">Security & Privacy Commitment</span>
                <p>All data stays local to your sandbox simulator. Choose exactly which credentials and tracking modules you share next.</p>
              </div>
            </div>

            <button
              onClick={handleNext}
              id="next-provider-btn"
              className="w-full bg-cyan-400 hover:bg-cyan-350 active:bg-cyan-500 text-slate-950 font-sans font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-cyan-400/10"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: PROVIDER SELECTION */}
        {step === 'provider' && (
          <div id="step-provider" className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-sans font-bold text-white">Sync Bio-Metrics Account</h2>
              <p className="text-xs text-slate-400">Select your preferred health synchronization standard to access live HR tracking.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setProvider('apple')}
                id="provider-apple"
                className={`p-4 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                  provider === 'apple' 
                    ? 'bg-slate-950 border-cyan-400 text-white shadow shadow-cyan-405/10' 
                    : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-rose-500/10 p-2 rounded-xl text-rose-450">
                    <span className="text-xl">🍎</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-200 block font-sans">Apple Health Kit</span>
                    <span className="text-xs font-mono text-slate-500">iOS & Apple Watch Core</span>
                  </div>
                </div>
                {provider === 'apple' && (
                  <div className="bg-cyan-400 text-slate-950 rounded-full p-1">
                    <Check className="w-3.5 h-3.5 stroke-[3] text-slate-955" />
                  </div>
                )}
              </button>

              <button
                onClick={() => setProvider('google')}
                id="provider-google"
                className={`p-4 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                  provider === 'google' 
                    ? 'bg-slate-950 border-cyan-400 text-white shadow shadow-cyan-405/10' 
                    : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500/10 p-2 rounded-xl text-blue-400">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-200 block font-sans">Google Health Fit</span>
                    <span className="text-xs font-mono text-slate-500">Android & WearOS Integration</span>
                  </div>
                </div>
                {provider === 'google' && (
                  <div className="bg-cyan-400 text-slate-955 rounded-full p-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep('info')}
                className="text-xs font-mono text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                ← Back
              </button>
              <button
                onClick={handleNext}
                id="next-permissions-btn"
                className="bg-cyan-400 hover:bg-cyan-350 text-slate-950 font-sans font-bold py-2.5 px-5 rounded-xl flex items-center space-x-1.5 transition-all text-sm cursor-pointer shadow-md shadow-cyan-400/10"
              >
                <span>Select Share Types</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PRIVACY & TOGGLES */}
        {step === 'permissions' && (
          <div id="step-permissions" className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-sans font-bold text-white">Privileges & Permissions</h2>
              <p className="text-xs text-slate-400">Manage what telemetry datasets {provider === 'apple' ? 'Apple Health Kit' : 'Google Health Fit'} can securely broadcast.</p>
            </div>

            <div className="space-y-3">
              {/* Heart rate - Required */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-cyan-500/10 p-2 rounded-lg text-cyan-400">
                    <Heart className="w-4.5 h-4.5 animate-pulse text-cyan-400" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-500 uppercase font-black">Starter Scope</span>
                    <h3 className="text-sm font-medium text-slate-200">Heart Rate Telemetry</h3>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
                  MANDATORY
                </div>
              </div>

              {/* Steps - Optional */}
              <div className="p-3.5 rounded-2xl bg-slate-950/30 border border-slate-900/60 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-slate-800/80 p-2 rounded-lg text-slate-400">
                    <Activity className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-500 uppercase">Optional Module</span>
                    <h3 className="text-sm font-medium text-slate-300">Pace & Steps Counts</h3>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={shareSteps}
                    onChange={() => setShareSteps(!shareSteps)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-400 peer-checked:after:bg-slate-950" />
                </label>
              </div>

              {/* Sleep - Optional */}
              <div className="p-3.5 rounded-2xl bg-slate-950/30 border border-slate-900/60 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-slate-800/80 p-2 rounded-lg text-slate-400">
                    <Smartphone className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-500 uppercase">Optional Module</span>
                    <h3 className="text-sm font-medium text-slate-300">Daily Sleep Diagnostics</h3>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={shareSleep}
                    onChange={() => setShareSleep(!shareSleep)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-400 peer-checked:after:bg-slate-950" />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep('provider')}
                className="text-xs font-mono text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                ← Back
              </button>
              <button
                onClick={handleNext}
                id="grant-permissions-btn"
                className="bg-cyan-400 hover:bg-cyan-350 text-slate-950 font-sans font-bold py-2.5 px-5 rounded-xl flex items-center space-x-1.5 transition-all text-sm cursor-pointer shadow-md shadow-cyan-400/10"
              >
                <span>Authorize & Connect</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SIMULATED CONNECTION PROGRESS */}
        {step === 'connecting' && (
          <div id="step-connecting" className="text-center py-8 space-y-6">
            <div className="relative inline-block w-24 h-24">
              <motion.div 
                className="absolute inset-0 rounded-full border-4 border-slate-800" 
              />
              <motion.div 
                className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-sans font-extrabold text-white">Establishing Integration</h2>
              <p className="text-xs font-mono text-slate-500">
                Contacting {provider === 'apple' ? 'iOS Secure Enclave API' : 'Google Fit REST Scope'}...
              </p>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850 max-w-xs mx-auto">
              <p className="text-xs text-slate-400 font-mono text-left space-y-1">
                <span className="text-cyan-400 block">✓ Shared Token verified successfully</span>
                <span className="text-slate-400 block">• Heart_Rate segment sync initialized...</span>
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
