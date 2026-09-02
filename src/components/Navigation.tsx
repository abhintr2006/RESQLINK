import React, { useState, useMemo } from 'react';
import { useResqLink } from '../context/ResqLinkContext';
import { LanguageCode, UserRole } from '../types';
import { ALL_INDIAN_LANGUAGES, POPULAR_INDIAN_LANGUAGES } from '../data/languages';
import { t } from '../services/localizationService';
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
  Search,
  Check,
  X,
  Globe,
} from 'lucide-react';

interface NavigationProps {
  onOpenDPDPModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onOpenDPDPModal }) => {
  const {
    language,
    setLanguage,
    activeAlert,
    userRole,
    setUserRole,
    adminViewTab,
    setAdminViewTab,
    authUser,
    logout,
  } = useResqLink();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  const currentLanguageInfo = useMemo(() => {
    return ALL_INDIAN_LANGUAGES.find((l) => l.code === language) || ALL_INDIAN_LANGUAGES[0];
  }, [language]);

  const filteredLanguages = useMemo(() => {
    const q = langSearch.trim().toLowerCase();
    if (!q) return ALL_INDIAN_LANGUAGES;
    return ALL_INDIAN_LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [langSearch]);

  const roleConfigs = {
    admin: {
      label: 'Admin (Command Superuser)',
      shortLabel: 'Admin CAD',
      badge: 'All-Access',
      badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      icon: Radio,
    },
    hospital: {
      label: 'Hospital ER Medical Staff',
      shortLabel: 'Hospital ER',
      badge: 'ER Terminal',
      badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      icon: Building2,
    },
    patient: {
      label: 'Citizen & Patient',
      shortLabel: 'Citizen Lifeline',
      badge: 'SOS Portal',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
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
    <>
      <header className="sticky top-[41px] z-40 bg-slate-950/85 backdrop-blur-2xl border-b border-slate-800/80 shadow-2xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Left: Tactical Brand Identity */}
          <div
            className="flex items-center gap-3.5 cursor-pointer group"
            onClick={() => {
              if (userRole === 'admin') setAdminViewTab('admin');
            }}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white shadow-lg shadow-rose-600/30 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105">
              <ShieldAlert className="w-5 h-5" />
              {activeAlert && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-slate-950 rounded-full animate-ping"></span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-rose-200 bg-clip-text text-transparent">
                  RESQLINK
                </span>
                <span className="text-[9px] uppercase font-black tracking-[0.2em] px-2 py-0.5 rounded-md bg-rose-950/90 border border-rose-800/80 text-rose-300 shadow-sm">
                  Urban AI • CAD
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Emergency Response Network • KSSEM Bengaluru
              </p>
            </div>
          </div>

          {/* Center: Admin Dashboard Switcher (Visible ONLY for Admin) */}
          {userRole === 'admin' ? (
            <nav className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/90 shadow-inner">
              <button
                onClick={() => setAdminViewTab('admin')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-300 cursor-pointer ${
                  adminViewTab === 'admin'
                    ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md shadow-rose-600/30 ring-1 ring-white/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{t('admin_hub', language)}</span>
              </button>

              <button
                onClick={() => setAdminViewTab('hospital')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-300 cursor-pointer ${
                  adminViewTab === 'hospital'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{t('hospital_er', language)}</span>
              </button>

              <button
                onClick={() => setAdminViewTab('patient')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-300 cursor-pointer ${
                  adminViewTab === 'patient'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-600/30 ring-1 ring-white/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t('patient_portal', language)}</span>
              </button>
            </nav>
          ) : (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-semibold shadow-inner">
              {userRole === 'hospital' && (
                <>
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-indigo-300 font-bold">{t('hospital_er', language)} Terminal</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/40">
                    Protected
                  </span>
                </>
              )}
              {userRole === 'patient' && (
                <>
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">{t('patient_portal', language)} Lifeline</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                    Citizen
                  </span>
                </>
              )}
            </div>
          )}

          {/* Right Controls: Role Switcher Dropdown, DPDP, All-India Language Selector */}
          <div className="flex items-center gap-2.5">
            {/* Interactive Role Switcher with Double-Bezel look */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen((p) => !p)}
                className="flex items-center gap-2.5 pl-3 pr-2.5 py-1.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 text-xs font-bold text-slate-100 transition-all duration-300 cursor-pointer shadow-lg hover:border-slate-600 active:scale-[0.98]"
                title="Switch user perspective"
              >
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Role:</span>
                <span className="flex items-center gap-1.5">
                  {userRole === 'admin' && <Radio className="w-3.5 h-3.5 text-rose-400" />}
                  {userRole === 'hospital' && <Building2 className="w-3.5 h-3.5 text-indigo-400" />}
                  {userRole === 'patient' && <Users className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="font-extrabold">{roleConfigs[userRole].shortLabel}</span>
                </span>
                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 ml-0.5">
                  <ChevronDown className="w-3 h-3" />
                </div>
              </button>

              {/* Role Dropdown Menu */}
              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-2xl border border-slate-700 rounded-3xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span>Switch Active Role</span>
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
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-rose-600/20 text-rose-100 border border-rose-500/40 shadow-inner'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-rose-500/30 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-bold">{cfg.label}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{cfg.badge}</div>
                          </div>
                        </div>
                        {isSelected && <UserCheck className="w-4 h-4 text-rose-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => void logout()}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-slate-300 bg-slate-900/90 border border-slate-800 rounded-2xl hover:bg-slate-800 transition cursor-pointer"
              title={`Sign out ${authUser?.displayName || 'user'}`}
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign out</span>
            </button>

            {/* DPDP 2023 Consent Notice Pill */}
            <button
              onClick={onOpenDPDPModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl hover:bg-emerald-900/40 transition cursor-pointer"
              title="DPDP Act 2023 & MeitY AI Governance Notice"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>DPDP 2023</span>
            </button>

            {/* ALL-INDIA 22-LANGUAGE SELECTOR BUTTON */}
            <button
              onClick={() => setIsLangModalOpen(true)}
              className="flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/80 hover:from-slate-850 hover:to-indigo-900/80 border border-indigo-800/60 text-xs font-bold text-slate-100 transition-all duration-300 cursor-pointer shadow-lg hover:border-indigo-600 active:scale-[0.98]"
              title="Select from 22 Official Indian Languages (8th Schedule)"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <div className="flex items-center gap-1">
                <span className="text-white font-extrabold">{currentLanguageInfo.nativeName}</span>
                <span className="text-[10px] text-indigo-300 font-mono">({currentLanguageInfo.code.toUpperCase()})</span>
              </div>
              <div className="w-4 h-4 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 ml-0.5">
                <ChevronDown className="w-3 h-3" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ALL-INDIA MULTILINGUAL MODAL (22 Eighth Schedule Indian Languages + English) */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="double-bezel w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="double-bezel-inner flex flex-col h-full bg-slate-950/95 overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                    <Languages className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white flex items-center gap-2">
                      <span>Indian Emergency Languages (8th Schedule)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded-full border border-indigo-800 font-bold">
                        22 + English
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Select your preferred Indian language for UI, voice synthesis &amp; first-aid guidance.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsLangModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search & Quick Chips */}
              <div className="p-4 border-b border-slate-800/60 space-y-3 bg-slate-900/30">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    placeholder="Search by language name, script (ಕನ್ನಡ, தமிழ்), or state (Karnataka, Kerala)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>

                {/* Popular Quick Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mr-1">
                    Quick Select:
                  </span>
                  {POPULAR_INDIAN_LANGUAGES.map((code) => {
                    const l = ALL_INDIAN_LANGUAGES.find((item) => item.code === code);
                    if (!l) return null;
                    const isSelected = language === code;
                    return (
                      <button
                        key={code}
                        onClick={() => {
                          setLanguage(code);
                          setIsLangModalOpen(false);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {l.nativeName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Languages Grid */}
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredLanguages.map((l) => {
                  const isSelected = language === l.code;
                  return (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setIsLangModalOpen(false);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? 'bg-gradient-to-r from-rose-950/80 to-indigo-950/80 border-rose-500 shadow-lg shadow-rose-600/10 ring-1 ring-rose-500/40'
                          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-white">{l.nativeName}</span>
                          <span className="text-xs font-bold text-slate-400">({l.name})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <span className="text-indigo-400 font-medium">{l.region}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium italic pt-0.5">
                          "{l.sampleGreeting}"
                        </div>
                      </div>

                      <div className="shrink-0 ml-3">
                        {isSelected ? (
                          <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center">
                            <span className="text-[10px] font-mono uppercase font-bold">{l.code}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/50 flex items-center justify-between text-xs text-slate-400 px-5">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Supports Voice TTS in regional dialects &amp; DPDP compliance</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500">MeitY Digital India Bhashini Aligned</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
