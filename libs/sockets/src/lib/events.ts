import { QueueUpdate, StatusUpdate } from '@quip/pb/quip-messages';
import { StartQueueRequest, StatusResponse } from '@quip/pb/quip-matchmaker';

export interface ServerToClientEvents {
  queueUpdate: (update: QueueUpdate) => void;
  statusUpdate: (update: StatusUpdate) => void;
}

// ClientToServerEvents just match all RPC calls clients can make.
// Allows the socket.io server to authenticate the users.
export interface ClientToServerEvents {
  getStatus: (cb: (err: Error, resp: StatusResponse) => void) => void;
  startQueue: (req: StartQueueRequest, cb: (err: Error) => void) => void;
  stopQueue: (cb: (err: Error) => void) => void;
}
