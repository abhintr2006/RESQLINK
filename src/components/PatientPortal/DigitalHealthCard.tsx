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
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-rose-500/20">
            {patientProfile.bloodGroup.split(' ')[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">{patientProfile.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                <FileCheck2 className="w-3 h-3" /> ABHA Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ABHA ID: <span className="font-mono text-slate-300">{patientProfile.abhaId}</span> • {patientProfile.age} yrs • {patientProfile.gender}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => {
                setEditForm(patientProfile);
                setIsEditing(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-rose-400" />
              <span>Edit Emergency Card</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Save Card
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Critical Medical Info */}
        <div className="space-y-6">
          {/* Blood & Organ Donation */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" /> Critical Health Data
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Blood Group</span>
                <p className="text-lg font-bold text-rose-400 mt-1">{patientProfile.bloodGroup}</p>
                <span className="text-[10px] text-slate-500">Universal Matching Enabled</span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Organ Donor</span>
                <p className="text-lg font-bold text-emerald-400 mt-1">
                  {patientProfile.organDonor ? 'Registered Donor' : 'Not Registered'}
                </p>
                <span className="text-[10px] text-slate-500">NOTTO Registry Linked</span>
              </div>
            </div>
          </div>

          {/* Allergies & Adverse Reactions */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Known Drug & Food Allergies
              </h3>
              <span className="text-[11px] text-rose-400 font-bold">ER Red Flag</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(isEditing ? editForm.allergies : patientProfile.allergies).map((allergy) => (
                <span
                  key={allergy}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/80 border border-rose-800 text-rose-300 flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  {allergy}
                  {isEditing && (
                    <button
                      onClick={() => removeAllergy(allergy)}
                      className="hover:text-rose-100 ml-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
              {(isEditing ? editForm.allergies : patientProfile.allergies).length === 0 && (
                <p className="text-xs text-slate-500 italic">No known allergies reported.</p>
              )}
            </div>

            {isEditing && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add allergy (e.g. Aspirin, Latex)"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addAllergy()}
                  className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-rose-500"
                />
                <button
                  onClick={addAllergy}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            )}
          </div>

          {/* Chronic Conditions */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-500" /> Chronic Medical Conditions
            </h3>

            <div className="flex flex-wrap gap-2 pt-1">
              {(isEditing ? editForm.chronicConditions : patientProfile.chronicConditions).map((cond) => (
                <span
                  key={cond}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-950/80 border border-sky-800 text-sky-300 flex items-center gap-1.5"
                >
                  <Activity className="w-3 h-3 text-sky-400" />
                  {cond}
                  {isEditing && (
                    <button
                      onClick={() => removeCondition(cond)}
                      className="hover:text-sky-100 ml-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            {isEditing && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add condition (e.g. Type-2 Diabetes)"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCondition()}
                  className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={addCondition}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Medications & ICE Contacts */}
        <div className="space-y-6">
          {/* Current Medications */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-500" /> Ongoing Medications & Dosage
            </h3>

            <div className="space-y-2 pt-1">
              {(isEditing ? editForm.currentMedications : patientProfile.currentMedications).map((med) => (
                <div
                  key={med}
                  className="flex items-center justify-between bg-slate-950/80 border border-slate-800/80 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Pill className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{med}</span>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => removeMedication(med)}
                      className="text-slate-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add medication (e.g. Metformin 500mg BD)"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMedication()}
                  className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={addMedication}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            )}
          </div>

          {/* ICE Emergency Contacts */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-500" /> Emergency (ICE) Contacts
              </h3>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Auto-SMS on SOS
              </span>
            </div>

            <div className="space-y-3">
              {patientProfile.emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 text-sm">{contact.name}</span>
                      <span className="text-[11px] text-slate-400">({contact.relation})</span>
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">{contact.phone}</p>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-semibold transition"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call ICE
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* DPDP Compliance Card */}
          <div className="bg-emerald-950/30 border border-emerald-800/40 p-4 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-emerald-300">DPDP Act 2023 Encrypted Vault</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Emergency health data is only decrypted and transmitted to the allocated paramedic and emergency room physician upon verified SOS dispatch. Zero commercial sharing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
