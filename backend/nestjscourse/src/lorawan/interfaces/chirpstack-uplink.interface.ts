export interface ChirpstackUplink {
  deduplicationId: string;
  time: string;
  deviceInfo: {
    tenantId: string;
    tenantName: string;
    applicationId: string;
    applicationName: string;
    deviceProfileId: string;
    deviceProfileName: string;
    deviceName: string;
    devEui: string;
  };
  devAddr: string;
  fPort: number;
  data: string; 
  object?: any;
  rxInfo: any[];
  txInfo: any;
}
