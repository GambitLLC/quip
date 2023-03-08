import { Server as httpServer } from 'http';
import { Server as httpsServer } from 'https';
import { Server } from 'socket.io';
import { QueueUpdate, StatusUpdate } from '@quip/pb/quip-messages';
import {
  MatchmakerClient,
  StartQueueRequest,
  StatusResponse,
} from '@quip/pb/quip-matchmaker';
import { credentials } from '@grpc/grpc-js';
import { Empty } from '@quip/pb/google/protobuf/empty';
import { IConfig } from 'config';

export interface ServerToClientEvents {
  queueUpdate: (update: QueueUpdate) => void;
  statusUpdate: (update: StatusUpdate) => void;
}

// ClientToServerEvents just match all RPC calls clients can make.
// Done because the socket.io server will authenticate the users.
export interface ClientToServerEvents {
  getStatus: (cb: (err: Error, resp: StatusResponse) => void) => void;
  startQueue: (req: StartQueueRequest, cb: (err: Error) => void) => void;
  stopQueue: (cb: (err: Error) => void) => void;
}

export const wrapServer = (
  config: IConfig,
  httpServer: httpServer | httpsServer
): Server => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
    {
      serveClient: false,
      // TODO: redis adapter
    }
  );

  const host = config.get('api.matchmaker.hostname');
  const port = config.get('api.matchmaker.port');

  const rpc = new MatchmakerClient(
    `${host}:${port}`,
    credentials.createInsecure()
  );

  io.on('connection', (socket) => {
    socket.on('getStatus', (cb) => {
      rpc.getStatus(Empty.create(), (err, resp) => {
        cb(err, resp);
      });
    });

    socket.on('startQueue', (req, cb) => {
      rpc.startQueue(req, (err) => {
        cb(err);
      });
      return;
    });

    socket.on('stopQueue', (cb) => {
      rpc.stopQueue(Empty.create(), (err) => {
        cb(err);
      });
      return;
    });
  });

  // io.emit('queueUpdate', QueueUpdate.create());
  // io.emit('statusUpdate', StatusUpdate.create());

  return io;
};

export default wrapServer;
