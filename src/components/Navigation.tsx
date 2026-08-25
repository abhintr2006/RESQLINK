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
  } = useResqLink();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const roleConfigs = {
    admin: {
      label: 'Admin (All Access)',
      shortLabel: 'Admin',
      badgeColor: 'bg-rose-950/90 text-rose-300 border-rose-800',
      icon: Radio,
    },
    hospital: {
      label: 'Hospital Staff',
      shortLabel: 'Hospital',
      badgeColor: 'bg-indigo-950/90 text-indigo-300 border-indigo-800',
      icon: Building2,
    },
    patient: {
      label: 'Patient / Citizen',
      shortLabel: 'Patient',
      badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-800',
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
    <header className="bg-slate-950/90 backdrop-blur border-b border-slate-800/80 sticky top-[41px] z-40">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => {
            if (userRole === 'admin') setAdminViewTab('admin');
          }}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white shadow-lg shadow-rose-500/25">
            <ShieldAlert className="w-6 h-6" />
            {activeAlert && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-slate-950 rounded-full animate-ping"></span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-rose-200 bg-clip-text text-transparent">
                RESQLINK
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300">
                Bengaluru
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Multi-Role Emergency Response System
            </p>
          </div>
        </div>

        {/* Center: Admin Dashboard Switcher (Visible ONLY for Admin) */}
        {userRole === 'admin' ? (
          <nav className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setAdminViewTab('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                adminViewTab === 'admin'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Admin Hub</span>
            </button>

            <button
              onClick={() => setAdminViewTab('hospital')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                adminViewTab === 'hospital'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hospital Dashboard</span>
            </button>

            <button
              onClick={() => setAdminViewTab('patient')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                adminViewTab === 'patient'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Patient Dashboard</span>
            </button>
          </nav>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            {userRole === 'hospital' && (
              <>
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span className="text-indigo-300">Hospital Emergency Portal (Restricted Access)</span>
              </>
            )}
            {userRole === 'patient' && (
              <>
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Patient Emergency Portal (Restricted Access)</span>
              </>
            )}
          </div>
        )}

        {/* Right Controls: Role Switcher Dropdown, DPDP, Language */}
        <div className="flex items-center gap-2.5">
          {/* Interactive Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen((p) => !p)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-700/80 text-xs font-bold text-slate-200 transition cursor-pointer shadow-sm"
              title="Switch active user role"
            >
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Role:</span>
              <span className="flex items-center gap-1">
                {userRole === 'admin' && <Radio className="w-3.5 h-3.5 text-rose-400" />}
                {userRole === 'hospital' && <Building2 className="w-3.5 h-3.5 text-indigo-400" />}
                {userRole === 'patient' && <Users className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{roleConfigs[userRole].shortLabel}</span>
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-1.5 z-50 space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Switch Active Role
                </div>
                {(['admin', 'hospital', 'patient'] as UserRole[]).map((role) => {
                  const cfg = roleConfigs[role];
                  const Icon = cfg.icon;
                  const isSelected = userRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => handleRoleSelect(role)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? 'bg-rose-600/20 text-rose-200 border border-rose-500/40'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{cfg.label}</span>
                      </div>
                      {isSelected && <UserCheck className="w-4 h-4 text-rose-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* DPDP 2023 Consent Notice Button */}
          <button
            onClick={onOpenDPDPModal}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-emerald-300 bg-emerald-950/50 border border-emerald-800/60 rounded-xl hover:bg-emerald-900/40 transition cursor-pointer"
            title="DPDP Act 2023 & MeitY AI Governance Notice"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>DPDP 2023</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-800">
            <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            {(['en', 'kn', 'hi'] as LanguageCode[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  language === lang
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'kn' ? 'ಕನ್ನಡ' : 'हिन्दी'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
