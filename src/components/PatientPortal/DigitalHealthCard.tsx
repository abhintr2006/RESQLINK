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
    <div className="space-y-8">
      {/* ABHA National Health Card - Double Bezel */}
      <div className="double-bezel shadow-2xl">
        <div className="double-bezel-inner p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 relative overflow-hidden">
          {/* Subtle Ambient Background Orb */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-18 h-18 rounded-3xl bg-gradient-to-br from-rose-500 via-rose-600 to-amber-500 flex flex-col items-center justify-center text-white font-black shadow-xl shadow-rose-600/30 ring-1 ring-white/30">
                <span className="text-2xl">{patientProfile.bloodGroup.split(' ')[0]}</span>
                <span className="text-[9px] uppercase tracking-widest opacity-90 font-bold">Blood</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-black text-white">{patientProfile.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> ABHA LINKED
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Ayushman Bharat Health Account: <span className="font-mono font-bold text-white tracking-wider">{patientProfile.abhaId}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  {patientProfile.age} Yrs • {patientProfile.gender} • Emergency Auto-Decryption on SOS
                </p>
              </div>
            </div>

            {/* Action Buttons with Button-in-Button architecture */}
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <button
                  onClick={() => {
                    setEditForm(patientProfile);
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-3 pl-4 pr-2 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-lg active:scale-[0.98]"
                >
                  <span>Edit Emergency Medical Card</span>
                  <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center text-rose-400 border border-slate-700">
                    <Edit3 className="w-3.5 h-3.5" />
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition cursor-pointer"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 pl-4 pr-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                  >
                    <span>Save Medical Card</span>
                    <div className="w-7 h-7 rounded-xl bg-emerald-700 flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Asymmetric 2-Column Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Bento: Critical Emergency Indicators */}
        <div className="space-y-6">
          {/* Blood & Organ Donation Card */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" /> Life-Support Telemetry
                </span>
                <span className="text-[10px] text-slate-400 font-bold">108 CAD Match</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Blood Type</span>
                  <p className="text-xl font-black text-rose-400 mt-1">{patientProfile.bloodGroup}</p>
                  <span className="text-[10px] text-slate-500 font-medium">Compatible with O- / O+</span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Organ Donor</span>
                  <p className="text-xl font-black text-emerald-400 mt-1">
                    {patientProfile.organDonor ? 'Registered' : 'No'}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">NOTTO ID Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Red Flag Allergies */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Severe Drug & Food Allergies
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white animate-pulse">
                  ER Red Flag
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                {(isEditing ? editForm.allergies : patientProfile.allergies).map((allergy) => (
                  <span
                    key={allergy}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-rose-950/80 border border-rose-800/80 text-rose-200 flex items-center gap-2 shadow-sm"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>{allergy}</span>
                    {isEditing && (
                      <button
                        onClick={() => removeAllergy(allergy)}
                        className="hover:text-white p-0.5 rounded-full hover:bg-rose-800 cursor-pointer ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add allergy (e.g. Sulfa, Peanuts)"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addAllergy()}
                    className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={addAllergy}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chronic Conditions */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-500" /> Chronic Medical Diagnoses
              </span>

              <div className="flex flex-wrap gap-2.5 pt-1">
                {(isEditing ? editForm.chronicConditions : patientProfile.chronicConditions).map((cond) => (
                  <span
                    key={cond}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-950/80 border border-sky-800/80 text-sky-200 flex items-center gap-2"
                  >
                    <Activity className="w-3.5 h-3.5 text-sky-400" />
                    <span>{cond}</span>
                    {isEditing && (
                      <button
                        onClick={() => removeCondition(cond)}
                        className="hover:text-white p-0.5 rounded-full hover:bg-sky-800 cursor-pointer ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add condition (e.g. Hypertension)"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCondition()}
                    className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={addCondition}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Bento: Active Medications & ICE Emergency Contacts */}
        <div className="space-y-6">
          {/* Ongoing Medications */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-500" /> Active Medications & Dosage
              </span>

              <div className="space-y-2.5 pt-1">
                {(isEditing ? editForm.currentMedications : patientProfile.currentMedications).map((med) => (
                  <div
                    key={med}
                    className="flex items-center justify-between bg-slate-900/90 border border-slate-800 px-4 py-3 rounded-2xl text-xs font-bold text-slate-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <Pill className="w-4 h-4 text-emerald-400" />
                      <span>{med}</span>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => removeMedication(med)}
                        className="text-slate-500 hover:text-rose-400 cursor-pointer p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add medication (e.g. Amlodipine 5mg OD)"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addMedication()}
                    className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={addMedication}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ICE Emergency Contacts with Quick Action */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-indigo-500" /> In Case of Emergency (ICE) Contacts
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Instant SMS Link
                </span>
              </div>

              <div className="space-y-3">
                {patientProfile.emergencyContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-100 text-sm">{contact.name}</span>
                        <span className="text-[11px] text-slate-400">({contact.relation})</span>
                      </div>
                      <p className="text-xs font-mono font-bold text-slate-400 mt-1">{contact.phone}</p>
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                    >
                      <span>Call ICE</span>
                      <div className="w-6 h-6 rounded-lg bg-indigo-600/40 flex items-center justify-center">
                        <Phone className="w-3 h-3 text-indigo-200" />
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DPDP Privacy Guarantee Box */}
          <div className="p-5 rounded-3xl bg-emerald-950/30 border border-emerald-800/40 flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-extrabold text-emerald-300">DPDP Act 2023 Encrypted Vault</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Emergency health data is sealed and decrypted exclusively for the allocated paramedic crew and emergency room physician upon verified SOS activation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
