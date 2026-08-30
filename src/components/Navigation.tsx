import React, { useState } from 'react';
import { useResqLink } from '../context/ResqLinkContext';
import { LanguageCode, UserRole } from '../types';
import {
  ShieldAlert,
  Radio,
  Building2,
  Users,
  Languages,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  Activity,
  Sparkles,
  LogOut,
  Zap,
} from 'lucide-react';

interface NavigationProps {
  onOpenDPDPModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onOpenDPDPModal }) => {
  const {
    language,
    setLanguage,
    activeAlert,
    alertHistory,
    userRole,
    setUserRole,
    adminViewTab,
    setAdminViewTab,
    authUser,
    logout,
  } = useResqLink();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const activeCount =
    (activeAlert && activeAlert.status !== 'RESOLVED' && activeAlert.status !== 'CANCELLED' ? 1 : 0) +
    alertHistory.filter(
      (a) => a.status === 'ALERTING' || a.status === 'CONFIRMED' || a.status === 'DISPATCHED' || a.status === 'EN_ROUTE'
    ).length;

  const roleConfigs = {
    admin: {
      label: 'Admin (Command Superuser)',
      shortLabel: 'Admin CAD',
      badge: 'All-Access Command',
      badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      icon: Radio,
    },
    hospital: {
      label: 'Hospital ER Medical Staff',
      shortLabel: 'Hospital ER',
      badge: 'Trauma Bay Terminal',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      icon: Building2,
    },
    patient: {
      label: 'Citizen & Patient',
      shortLabel: 'Citizen Lifeline',
      badge: 'Emergency SOS Portal',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      icon: Users,
    },
  };

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    if (role === 'admin') {
      setAdminViewTab('admin');
    }
    setIsRoleDropdownOpen(false);
  };

  return (
    <header className="sticky top-[37px] z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Tactical Brand Identity */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => {
            if (userRole === 'admin') setAdminViewTab('admin');
          }}
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white shadow-lg shadow-rose-600/30 ring-1 ring-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-rose-500/50">
            <ShieldAlert className="w-4.5 h-4.5" />
            {activeAlert && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-slate-950 rounded-full animate-ping"></span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-rose-200 bg-clip-text text-transparent">
                RESQLINK
              </span>
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-700/60 text-rose-300 shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                CAD v2.4
              </span>
              {activeCount > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-600/50 text-amber-300">
                  <Activity className="w-2.5 h-2.5 animate-spin" />
                  {activeCount} ACTIVE
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Emergency Response Network • KSSEM Bengaluru
            </p>
          </div>
        </div>

        {/* Center: Admin Dashboard Switcher (Visible ONLY for Admin) */}
        {userRole === 'admin' ? (
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setAdminViewTab('admin')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                adminViewTab === 'admin'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-white/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Admin Hub</span>
            </button>

            <button
              onClick={() => setAdminViewTab('hospital')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                adminViewTab === 'hospital'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hospital ER</span>
            </button>

            <button
              onClick={() => setAdminViewTab('patient')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                adminViewTab === 'patient'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-white/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Patient Portal</span>
            </button>
          </nav>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold shadow-inner">
            {userRole === 'hospital' && (
              <>
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-indigo-300 font-bold">Hospital Emergency Portal</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/40">
                  Protected
                </span>
              </>
            )}
            {userRole === 'patient' && (
              <>
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-bold">Citizen Emergency Portal</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                  Citizen
                </span>
              </>
            )}
          </div>
        )}

        {/* Right Controls: Role Switcher Dropdown, DPDP, Language, Sign Out */}
        <div className="flex items-center gap-2">
          {/* Interactive Role Switcher with Tactical HUD look */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen((p) => !p)}
              className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 text-xs font-bold text-slate-100 transition-all duration-200 cursor-pointer shadow-md hover:border-slate-600 active:scale-[0.98]"
              title="Switch user perspective"
            >
              <span className="text-slate-400 text-[10px] font-mono uppercase font-bold tracking-wider">Role:</span>
              <span className="flex items-center gap-1.5">
                {userRole === 'admin' && <Radio className="w-3.5 h-3.5 text-rose-400" />}
                {userRole === 'hospital' && <Building2 className="w-3.5 h-3.5 text-indigo-400" />}
                {userRole === 'patient' && <Users className="w-3.5 h-3.5 text-emerald-400" />}
                <span className="font-extrabold">{roleConfigs[userRole].shortLabel}</span>
              </span>
              <div className="w-4.5 h-4.5 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 ml-0.5">
                <ChevronDown className="w-3 h-3" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-2xl border border-slate-700 rounded-2xl shadow-2xl p-1.5 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 flex items-center justify-between">
                  <span>Switch Role View</span>
                  <Sparkles className="w-3 h-3 text-rose-400" />
                </div>
                {(userRole === 'admin' ? (['admin', 'hospital', 'patient'] as UserRole[]) : [userRole]).map((role) => {
                  const cfg = roleConfigs[role];
                  const Icon = cfg.icon;
                  const isSelected = userRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => handleRoleSelect(role)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-rose-600/20 text-rose-100 border border-rose-500/40 shadow-inner'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-rose-500/30 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold">{cfg.label}</div>
                          <div className="text-[9px] text-slate-400 font-normal">{cfg.badge}</div>
                        </div>
                      </div>
                      {isSelected && <UserCheck className="w-3.5 h-3.5 text-rose-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* DPDP 2023 Consent Notice Pill */}
          <button
            onClick={onOpenDPDPModal}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 rounded-xl hover:bg-emerald-900/40 transition cursor-pointer"
            title="DPDP Act 2023 & MeitY AI Governance Notice"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>DPDP 2023</span>
          </button>

          {/* Multilingual Switcher Pill */}
          <div className="flex items-center bg-slate-900/90 rounded-xl p-0.5 border border-slate-800 shadow-inner">
            <Languages className="w-3 h-3 text-slate-400 ml-1.5 mr-1" />
            {(['en', 'kn', 'hi'] as LanguageCode[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                  language === lang
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'kn' ? 'KN' : 'HI'}
              </button>
            ))}
          </div>

          {/* Sign out */}
          <button
            onClick={() => void logout()}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-mono font-bold text-slate-400 hover:text-rose-300 bg-slate-900/90 border border-slate-800 rounded-xl hover:bg-slate-800/80 transition cursor-pointer"
            title={`Sign out ${authUser?.displayName || 'user'}`}
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">EXIT</span>
          </button>
        </div>
      </div>
    </header>
  );
};
