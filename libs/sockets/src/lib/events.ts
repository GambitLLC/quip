import { QueueUpdate, StatusUpdate } from '@quip/pb/matchmaker/messages';
import {
  StartQueueRequest,
  StatusResponse,
} from '@quip/pb/matchmaker/frontend';
import { ServiceError } from '@grpc/grpc-js';

export interface ServerToClientEvents {
  queueUpdate: (update: QueueUpdate) => void;
  statusUpdate: (update: StatusUpdate) => void;
}

// ClientToServerEvents just match all RPC calls clients can make.
// Allows the socket.io server to authenticate the users.
export interface ClientToServerEvents {
  getStatus: (cb: (err: ServiceError, resp: StatusResponse) => void) => void;
  startQueue: (req: StartQueueRequest, cb: (err: ServiceError) => void) => void;
  stopQueue: (cb: (err: ServiceError) => void) => void;
}
