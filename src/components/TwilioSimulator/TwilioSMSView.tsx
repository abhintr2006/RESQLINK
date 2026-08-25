import React, { useState } from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import { TwilioSmsService, TwilioSmsPayload } from '../../services/twilioSmsService';
import {
  MessageSquareCode,
  Radio,
  Send,
  CheckCircle2,
  Cpu,
  Smartphone,
  Server,
  Zap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const TwilioSMSView: React.FC = () => {
  const { selectedPreset, activeAlert } = useResqLink();
  const [phoneNumber, setPhoneNumber] = useState<string>('+91 98450 11223');
  const [selectedEmergency, setSelectedEmergency] = useState<string>('CARDIAC');
  const [simulatedLogs, setSimulatedLogs] = useState<TwilioSmsPayload[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);

  const sampleCoord = {
    latitude: selectedPreset.latitude,
    longitude: selectedPreset.longitude,
    accuracy: 18,
    timestamp: Date.now(),
    provider: 'CELL_TRIANGULATION' as const,
  };

  const currentRawEncoded = TwilioSmsService.encodeSmsPayload(
    activeAlert?.id || 'TEST-9921',
    sampleCoord,
    selectedEmergency as any,
    'Srushti V'
  );

  const handleTestSmsSend = async () => {
    setIsSending(true);
    const result = await TwilioSmsService.sendEmergencySmsFallback(
      `SMS-${Math.floor(1000 + Math.random() * 9000)}`,
      sampleCoord,
      selectedEmergency as any,
      phoneNumber
    );
    setSimulatedLogs((prev) => [result, ...prev]);
    setIsSending(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center shadow-lg">
            <MessageSquareCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">
                Twilio 2G / Low-Connectivity SMS Gateway
              </h2>
              <span className="text-[10px] bg-rose-900/60 text-rose-300 px-2 py-0.5 rounded-full border border-rose-700 font-mono">
                Fallback Protocol (Section 3.3)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Zero-broadband emergency routing for 2G feature phones and weak-signal urban slums across Bengaluru.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-xl">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Twilio SMS Gateway: ACTIVE (99.8% SLA)</span>
        </div>
      </div>

      {/* 2G Payload Architecture Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: Citizen 2G Device */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Smartphone className="w-4 h-4 text-rose-400" />
              <span>1. Citizen 2G / Offline Device</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When data packets (HTTP/WebSocket) fail or mobile data is disabled, the app automatically formats an ultra-compact GSM SMS payload.
            </p>
          </div>
          <div className="mt-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300">
            Encodes: Lat/Lng + Acc + Type + UserID + Timestamp (&lt;160 chars)
          </div>
        </div>

        {/* Step 2: Cellular BTS & Twilio API */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>2. GSM Tower &amp; Twilio Gateway</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Standard GSM 900MHz SMS PDU packet traverses the cellular tower directly to Twilio REST API Webhook without requiring Internet data pack.
            </p>
          </div>
          <div className="mt-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono text-indigo-300">
            Latency: ~1.2s - 1.8s carrier delivery receipt
          </div>
        </div>

        {/* Step 3: CAD Response Center */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>3. CAD Ingestion &amp; Dispatch</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              The CAD engine decodes coordinates, assigns the nearest available ALS ambulance, and replies via SMS with driver contact and ETA.
            </p>
          </div>
          <div className="mt-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono text-emerald-300">
            Bi-directional SMS confirmation returned to citizen
          </div>
        </div>
      </div>

      {/* Interactive SMS Test Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Live Payload Encoder */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Interactive SMS Fallback Transmitter</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">
                Citizen Phone Number (Sender):
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">
                Emergency Category:
              </label>
              <select
                value={selectedEmergency}
                onChange={(e) => setSelectedEmergency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="CARDIAC">CARDIAC (Heart Attack)</option>
                <option value="TRAUMA_ACCIDENT">TRAUMA_ACCIDENT (Road Crash)</option>
                <option value="STROKE">STROKE (Brain Paralysis)</option>
                <option value="RESPIRATORY">RESPIRATORY (Breathing)</option>
                <option value="ELDERLY_FALL">ELDERLY_FALL (Geriatric)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold mb-1">
                <span>Raw Encoded SMS Payload:</span>
                <span className="text-indigo-400 font-mono">
                  {currentRawEncoded.length} / 160 Chars (1 SMS)
                </span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 break-all select-all">
                {currentRawEncoded}
              </div>
            </div>

            <button
              onClick={handleTestSmsSend}
              disabled={isSending}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition ${
                isSending
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              }`}
            >
              {isSending ? (
                <>
                  <Radio className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Transmitting over GSM 2G Tower...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Simulate 2G SMS Dispatch Trigger</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Twilio Webhook Receipts Log */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Twilio Delivery Receipts &amp; DLR Webhooks</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              Live Ingest Stream
            </span>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {simulatedLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <p>No SMS fallback transmissions yet.</p>
                <p className="text-[10px] mt-1 text-slate-600">
                  Click "Simulate 2G SMS Dispatch Trigger" to test carrier transmission.
                </p>
              </div>
            ) : (
              simulatedLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-mono font-bold text-white">
                        SID: {log.messageSid}
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                      {log.status} ({log.carrierLatencyMs}ms)
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    FROM: <span className="text-slate-200">{log.from}</span> &rarr; TO:{' '}
                    <span className="text-slate-200">{log.to}</span> | BAND:{' '}
                    <span className="text-indigo-300">{log.cellularBand}</span>
                  </div>

                  <div className="p-2 bg-slate-900/90 rounded-lg font-mono text-[11px] text-amber-300 break-all">
                    {log.body}
                  </div>

                  {/* Return SMS Confirmation preview */}
                  <div className="mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-semibold block mb-0.5">
                      Return Dispatch Confirmation SMS:
                    </span>
                    <p className="text-slate-300 bg-slate-900/60 p-2 rounded-lg font-mono text-[10px]">
                      {TwilioSmsService.generateCitizenConfirmationSms('SMS-9921', 4)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
