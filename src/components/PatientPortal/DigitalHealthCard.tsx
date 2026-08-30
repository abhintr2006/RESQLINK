import React, { useState } from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import {
  Heart,
  ShieldCheck,
  Phone,
  AlertTriangle,
  Pill,
  Activity,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  FileCheck2,
  Sparkles,
  QrCode,
} from 'lucide-react';

export const DigitalHealthCard: React.FC = () => {
  const { patientProfile, updatePatientProfile } = useResqLink();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(patientProfile);
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');

  const handleSave = () => {
    updatePatientProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(patientProfile);
    setIsEditing(false);
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !editForm.allergies.includes(newAllergy.trim())) {
      setEditForm({
        ...editForm,
        allergies: [...editForm.allergies, newAllergy.trim()],
      });
      setNewAllergy('');
    }
  };

  const removeAllergy = (item: string) => {
    setEditForm({
      ...editForm,
      allergies: editForm.allergies.filter((a) => a !== item),
    });
  };

  const addCondition = () => {
    if (newCondition.trim() && !editForm.chronicConditions.includes(newCondition.trim())) {
      setEditForm({
        ...editForm,
        chronicConditions: [...editForm.chronicConditions, newCondition.trim()],
      });
      setNewCondition('');
    }
  };

  const removeCondition = (item: string) => {
    setEditForm({
      ...editForm,
      chronicConditions: editForm.chronicConditions.filter((c) => c !== item),
    });
  };

  const addMedication = () => {
    if (newMedication.trim() && !editForm.currentMedications.includes(newMedication.trim())) {
      setEditForm({
        ...editForm,
        currentMedications: [...editForm.currentMedications, newMedication.trim()],
      });
      setNewMedication('');
    }
  };

  const removeMedication = (item: string) => {
    setEditForm({
      ...editForm,
      currentMedications: editForm.currentMedications.filter((m) => m !== item),
    });
  };

  return (
    <div className="space-y-4">
      {/* ABHA National Health Card - Double Bezel */}
      <div className="double-bezel shadow-2xl">
        <div className="double-bezel-inner p-4 sm:p-5 bg-slate-950 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 via-rose-700 to-amber-600 flex flex-col items-center justify-center text-white font-mono font-extrabold shadow-lg">
                <span className="text-xl leading-none">{patientProfile.bloodGroup.split(' ')[0]}</span>
                <span className="text-[8px] uppercase tracking-widest opacity-90">BLOOD</span>
              </div>
              <div className="space-y-0.5 font-mono">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{patientProfile.name}</h2>
                  <span className="px-2 py-0.2 rounded text-[9px] font-bold bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 flex items-center gap-1">
                    <FileCheck2 className="w-3 h-3 text-emerald-400" /> ABHA LINKED
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  ABHA ID: <span className="font-bold text-white tracking-wider">{patientProfile.abhaId}</span>
                </p>
                <p className="text-[10px] text-slate-400">
                  {patientProfile.age} Yrs &bull; {patientProfile.gender} &bull; Emergency Auto-Decryption on SOS
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 font-mono">
              {!isEditing ? (
                <button
                  onClick={() => {
                    setEditForm(patientProfile);
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5 text-rose-400" />
                  <span>EDIT MEDICAL CARD</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> CANCEL
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> SAVE
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Asymmetric 2-Column Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
        {/* Left Bento: Critical Emergency Indicators */}
        <div className="space-y-4">
          {/* Blood & Organ Donation Card */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-4 space-y-3 bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> LIFE-SUPPORT TELEMETRY
                </span>
                <span className="text-[9px] text-slate-400 font-bold">108 CAD MATCH</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">BLOOD TYPE</span>
                  <p className="text-lg font-extrabold text-rose-400 mt-0.5">{patientProfile.bloodGroup}</p>
                  <span className="text-[9px] text-slate-500 font-sans">Compatible with O- / O+</span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">ORGAN DONOR</span>
                  <p className="text-lg font-extrabold text-emerald-400 mt-0.5">
                    {patientProfile.organDonor ? 'REGISTERED' : 'NO'}
                  </p>
                  <span className="text-[9px] text-slate-500 font-sans">NOTTO Registry Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Red Flag Allergies */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-4 space-y-3 bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> SEVERE DRUG &amp; FOOD ALLERGIES
                </span>
                <span className="px-2 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider bg-rose-600 text-white animate-pulse">
                  ER RED FLAG
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {(isEditing ? editForm.allergies : patientProfile.allergies).map((allergy) => (
                  <span
                    key={allergy}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-950/80 border border-rose-800/80 text-rose-200 flex items-center gap-1.5 shadow-sm"
                  >
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>{allergy}</span>
                    {isEditing && (
                      <button
                        onClick={() => removeAllergy(allergy)}
                        className="hover:text-white p-0.5 rounded-full hover:bg-rose-800 cursor-pointer ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="Add allergy (e.g. Sulfa, Peanuts)"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addAllergy()}
                    className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={addAllergy}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> ADD
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chronic Conditions */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-4 space-y-3 bg-slate-950">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-500" /> CHRONIC MEDICAL DIAGNOSES
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {(isEditing ? editForm.chronicConditions : patientProfile.chronicConditions).map((cond) => (
                  <span
                    key={cond}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-950/80 border border-cyan-800/80 text-cyan-200 flex items-center gap-1.5"
                  >
                    <Activity className="w-3 h-3 text-cyan-400" />
                    <span>{cond}</span>
                    {isEditing && (
                      <button
                        onClick={() => removeCondition(cond)}
                        className="hover:text-white p-0.5 rounded-full hover:bg-cyan-800 cursor-pointer ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="Add condition (e.g. Hypertension)"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCondition()}
                    className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={addCondition}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> ADD
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Bento: Active Medications & ICE Emergency Contacts */}
        <div className="space-y-4">
          {/* Ongoing Medications */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-4 space-y-3 bg-slate-950">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-emerald-500" /> ACTIVE MEDICATIONS &amp; DOSAGE
                </span>
              </div>

              <div className="space-y-2 pt-0.5">
                {(isEditing ? editForm.currentMedications : patientProfile.currentMedications).map((med) => (
                  <div
                    key={med}
                    className="flex items-center justify-between bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl text-xs font-bold text-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <Pill className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{med}</span>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => removeMedication(med)}
                        className="text-slate-500 hover:text-rose-400 cursor-pointer p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="Add medication (e.g. Amlodipine 5mg OD)"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addMedication()}
                    className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={addMedication}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> ADD
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ICE Emergency Contacts with Quick Action */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-4 space-y-3 bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-500" /> IN CASE OF EMERGENCY (ICE) CONTACTS
                </span>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800">
                  SMS LINKED
                </span>
              </div>

              <div className="space-y-2">
                {patientProfile.emergencyContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-100 text-xs">{contact.name}</span>
                        <span className="text-[10px] text-slate-400">({contact.relation})</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 mt-0.5">{contact.phone}</p>
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-[11px] font-bold transition active:scale-95"
                    >
                      <Phone className="w-3 h-3 text-indigo-300" />
                      <span>CALL ICE</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DPDP Privacy Guarantee Box */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-[11px] font-bold text-emerald-300">DPDP ACT 2023 ENCRYPTED VAULT</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-sans">
                Health data is sealed and decrypted exclusively for allocated paramedic crew and ER trauma physician upon verified SOS trigger.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
