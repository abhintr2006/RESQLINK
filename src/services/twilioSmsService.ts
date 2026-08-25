import { EmergencyCategory, GeoCoordinate } from '../types';

export interface TwilioSmsPayload {
  to: string;
  from: string;
  body: string;
  characterCount: number;
  messageSid: string;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';
  carrierLatencyMs: number;
  cellularBand: 'GSM_2G_900MHz' | 'EDGE_2.5G' | 'SMS_PDU';
  timestamp: string;
}

export class TwilioSmsService {
  private static TWILIO_VIRTUAL_NUMBER = '+91 80009 11200';
  private static DISPATCH_CENTRAL_GATEWAY = '+91 80 108 0000';

  /**
   * Compresses the critical emergency payload into a robust standard SMS (<160 chars)
   * Format: RESQ#[ALERT_ID]#[LAT,LNG]#[CATEGORY]#[EPOCH_TIME]
   */
  public static encodeSmsPayload(
    alertId: string,
    coord: GeoCoordinate,
    category: EmergencyCategory,
    userName?: string
  ): string {
    const lat = coord.latitude.toFixed(5);
    const lng = coord.longitude.toFixed(5);
    const timeShort = new Date().toISOString().substring(11, 19); // HH:MM:SS
    const name = userName ? userName.substring(0, 10) : 'CITIZEN';

    return `RESQ#${alertId}#LOC:${lat},${lng}#ACC:${Math.round(coord.accuracy)}m#TYPE:${category}#USR:${name}#TIME:${timeShort}#URGENT_108_DISPATCH`;
  }

  /**
   * Simulates cellular SMS delivery via Twilio API Gateway with realistic carrier latency
   */
  public static async sendEmergencySmsFallback(
    alertId: string,
    coord: GeoCoordinate,
    category: EmergencyCategory,
    userPhone: string = '+91 98765 43210'
  ): Promise<TwilioSmsPayload> {
    const rawBody = this.encodeSmsPayload(alertId, coord, category);
    const messageSid = `SM${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
    const latency = 1200 + Math.floor(Math.random() * 800); // 1.2s to 2.0s SMS delivery

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          to: this.DISPATCH_CENTRAL_GATEWAY,
          from: userPhone,
          body: rawBody,
          characterCount: rawBody.length,
          messageSid,
          status: 'DELIVERED',
          carrierLatencyMs: latency,
          cellularBand: 'GSM_2G_900MHz',
          timestamp: new Date().toISOString(),
        });
      }, latency);
    });
  }

  /**
   * Generates return SMS confirmation sent to the citizen's phone
   */
  public static generateCitizenConfirmationSms(alertId: string, responderEta: number): string {
    return `[RESQLINK BENGALURU] SOS #${alertId} confirmed. Ambulance KA-05-EM-9921 dispatched. ETA ~${responderEta} mins. Paramedic contact: +919845012345. Keep phone line clear.`;
  }
}
