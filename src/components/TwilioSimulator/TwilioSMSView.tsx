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
    <div className="max-w-6xl mx-auto space-y-4 font-mono">
      {/* Header */}
      <div className="double-bezel shadow-xl">
        <div className="double-bezel-inner p-4 flex flex-wrap items-center justify-between gap-3 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-700/80 text-rose-400 flex items-center justify-center shadow-md">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  TWILIO 2G / LOW-CONNECTIVITY SMS GATEWAY
                </h2>
                <span className="text-[9px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-700/80">
                  SEC 3.3
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                Zero-broadband emergency routing for 2G feature phones and weak-signal urban slums across Bengaluru.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-xl shadow-sm">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>CARRIER GATEWAY: ACTIVE (99.8% SLA)</span>
          </div>
        </div>
      </div>

      {/* 2G Payload Architecture Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Step 1: Citizen 2G Device */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-3.5 flex flex-col justify-between h-full space-y-2.5 bg-slate-950">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Smartphone className="w-4 h-4 text-rose-400" />
                <span>1. CITIZEN 2G / OFFLINE DEVICE</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                When mobile data/WebSocket fails, the client automatically generates a compressed GSM SMS payload.
              </p>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[10px] text-slate-300">
              Encodes: Lat/Lng + Acc + Type + UserID + Time (&lt;160 chars)
            </div>
          </div>
        </div>

        {/* Step 2: Cellular BTS & Twilio API */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-3.5 flex flex-col justify-between h-full space-y-2.5 bg-slate-950">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>2. GSM TOWER &amp; TWILIO GATEWAY</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Standard GSM 900MHz SMS PDU packet traverses the cellular BTS directly to Twilio REST webhook without data plan.
              </p>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[10px] text-cyan-300">
              Latency: ~1.2s - 1.8s carrier delivery receipt
            </div>
          </div>
        </div>

        {/* Step 3: CAD Response Center */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-3.5 flex flex-col justify-between h-full space-y-2.5 bg-slate-950">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>3. CAD INGESTION &amp; DISPATCH</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                CAD engine decodes coordinates, auto-assigns nearest ALS ambulance, and returns confirmation SMS with ETA.
              </p>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[10px] text-emerald-300">
              Bi-directional SMS confirmation returned to citizen
            </div>
          </div>
        </div>
      </div>

      {/* Interactive SMS Test Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Live Payload Encoder */}
        <div className="lg:col-span-5 double-bezel">
          <div className="double-bezel-inner p-4 space-y-3 bg-slate-950">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>SMS FALLBACK TRANSMITTER</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">
                  CITIZEN PHONE NUMBER:
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">
                  EMERGENCY CATEGORY:
                </label>
                <select
                  value={selectedEmergency}
                  onChange={(e) => setSelectedEmergency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="CARDIAC">CARDIAC (Heart Attack)</option>
                  <option value="TRAUMA_ACCIDENT">TRAUMA_ACCIDENT (Road Crash)</option>
                  <option value="STROKE">STROKE (Brain Paralysis)</option>
                  <option value="RESPIRATORY">RESPIRATORY (Breathing)</option>
                  <option value="ELDERLY_FALL">ELDERLY_FALL (Geriatric)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                  <span>ENCODED GSM PAYLOAD:</span>
                  <span className="text-cyan-400">
                    {currentRawEncoded.length} / 160 CHARS
                  </span>
                </div>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-mono text-emerald-400 break-all select-all">
                  {currentRawEncoded}
                </div>
              </div>

              <button
                onClick={handleTestSmsSend}
                disabled={isSending}
                className={`w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer active:scale-95 ${
                  isSending
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                }`}
              >
                {isSending ? (
                  <>
                    <Radio className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>TRANSMITTING GSM 2G PACKET...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>SIMULATE 2G SMS DISPATCH TRIGGER</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Live Twilio Webhook Receipts Log */}
        <div className="lg:col-span-7 double-bezel">
          <div className="double-bezel-inner p-4 space-y-3 bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span>TWILIO DLR WEBHOOK RECEIPTS</span>
              </h3>
              <span className="text-[9px] text-slate-500 font-mono">
                LIVE INGEST STREAM
              </span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {simulatedLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs font-mono">
                  <p>NO SMS TRANSMISSIONS YET</p>
                  <p className="text-[10px] mt-0.5 text-slate-600 font-sans">
                    Click "Simulate 2G SMS Dispatch Trigger" to test carrier transmission.
                  </p>
                </div>
              ) : (
                simulatedLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-mono font-bold text-white text-[11px]">
                          SID: {log.messageSid}
                        </span>
                      </div>
                      <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800 font-bold">
                        {log.status} ({log.carrierLatencyMs}ms)
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono">
                      FROM: <span className="text-slate-200">{log.from}</span> &rarr; TO:{' '}
                      <span className="text-slate-200">{log.to}</span> | BAND:{' '}
                      <span className="text-cyan-300">{log.cellularBand}</span>
                    </div>

                    <div className="p-1.5 bg-slate-950 rounded font-mono text-[10px] text-amber-300 break-all">
                      {log.body}
                    </div>

                    {/* Return SMS Confirmation preview */}
                    <div className="pt-1.5 border-t border-slate-800/60 text-[10px] text-slate-400">
                      <span className="text-emerald-400 font-bold block mb-0.5">
                        RETURN CONFIRMATION SMS:
                      </span>
                      <p className="text-slate-300 bg-slate-950 p-1.5 rounded font-mono text-[9px]">
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
    </div>
  );
};
