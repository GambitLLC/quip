import { Status } from '@quip/pb/matchmaker/messages';
import {
  GetStatusRequest,
  StartQueueRequest,
} from '@quip/pb/matchmaker/frontend';
import { ServiceError } from '@grpc/grpc-js';

export interface ServerToClientEvents {
  // queueUpdate: (update: QueueUpdate) => void;
  statusUpdate: (update: Status) => void;
}

// ClientToServerEvents just match all RPC calls clients can make.
// Allows the socket.io server to authenticate the users.
export interface ClientToServerEvents {
  getStatus: (
    req: GetStatusRequest,
    cb: (err: ServiceError, resp: Status) => void
  ) => void;
  startQueue: (req: StartQueueRequest, cb: (err: ServiceError) => void) => void;
  stopQueue: (cb: (err: ServiceError) => void) => void;
}
