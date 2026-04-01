export interface DownlinkPayload {
  applicationId: string;
  devEui: string;
  confirmed: boolean;
  fPort: number;
  data: string;
}

export abstract class IDownlinkPort {
  abstract send(payload: DownlinkPayload): void;
}
