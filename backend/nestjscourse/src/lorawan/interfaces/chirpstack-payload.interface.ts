export interface ChirpStackUplinkPayload {
  deviceInfo: {
    applicationId: string;
    applicationName: string;
    devEui: string;
    deviceName: string;
    deviceProfileName: string;
    tags: Record<string, string>;
  };
  devAddr: string;
  adr: boolean;
  dr: number;
  fCnt: number;
  fPort: number;
  confirmed: boolean;
  data?: string;
  object?: Record<string, any>;
  rxInfo: Array<{
    gatewayId: string;
    rssi: number;
    snr: number;
    location?: { latitude: number; longitude: number; altitude: number };
  }>;
  txInfo: {
    frequency: number;
    modulation: any;
  };
}

export interface ChirpStackJoinPayload {
  deviceInfo: {
    applicationId: string;
    devEui: string;
    deviceName: string;
  };
  devAddr: string;
  time: string;
}
