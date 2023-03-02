import { Server as httpServer } from 'http';
import { Server as httpsServer } from 'https';
import { Server } from 'socket.io';
import { QueueUpdate, StatusUpdate } from 'packages/pb/quip-messages';
import { StartQueueRequest, StatusResponse } from 'packages/pb/quip-matchmaker';

interface ServerToClientEvents {
  queueUpdate: (update: QueueUpdate) => void;
  statusUpdate: (update: StatusUpdate) => void;
}

// ClientToServerEvents just match all RPC calls clients can make.
// Done because the socket.io server will authenticate the users.
interface ClientToServerEvents {
  getStatus: (cb: (resp: StatusResponse) => void) => void;
  startQueue: (req: StartQueueRequest) => void;
  stopQueue: () => void;
}

export default (httpServer: httpServer | httpsServer): Server => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
    {
      serveClient: false,
      // TODO: redis adapter
    }
  );

  io.on('connection', (socket) => {
    socket.on('getStatus', (cb) => {
      cb(StatusResponse.create());
    });

    socket.on('startQueue', (req) => {
      // TODO: send request to matchmaker grpc server
      return;
    });

    socket.on('stopQueue', () => {
      // TODO: send request to matchmaker grpc srver
      return;
    });
  });

  io.emit('queueUpdate', QueueUpdate.create());
  io.emit('statusUpdate', StatusUpdate.create());

  return io;
};
