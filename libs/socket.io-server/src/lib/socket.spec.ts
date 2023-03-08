import {
  MatchmakerService,
  MatchmakerServer,
  StatusResponse,
} from '@quip/pb/quip-matchmaker';
import { Empty } from '@quip/pb/google/protobuf/empty';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { Server as SocketServer, Socket as ServerSocket } from 'socket.io';
import { Server as grpcServer, ServerCredentials } from '@grpc/grpc-js';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import wrapServer, {
  ClientToServerEvents,
  ServerToClientEvents,
} from './socket';

const mockMatchmaker: MatchmakerServer = {
  getStatus: function (call, cb) {
    cb(null, StatusResponse.create());
    return;
  },
  startQueue: function (call, cb) {
    cb(null, Empty.create());
    return;
  },
  stopQueue: function (call, cb) {
    cb(null, Empty.create());
    return;
  },
};

describe('socket listener', () => {
  let io: SocketServer,
    grpc: grpcServer,
    serverSocket: ServerSocket<ClientToServerEvents, ServerToClientEvents>,
    clientSocket: ClientSocket<ServerToClientEvents, ClientToServerEvents>;

  beforeAll((done) => {
    grpc = new grpcServer();
    grpc.addService(MatchmakerService, mockMatchmaker);
    grpc.bindAsync('0.0.0.0:50051', ServerCredentials.createInsecure(), () => {
      grpc.start();
    });

    const httpServer = createServer();
    io = wrapServer(httpServer);

    httpServer.listen(() => {
      const { port } = httpServer.address() as AddressInfo;
      clientSocket = Client(`http://localhost:${port}`);
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  test('should receive status', (done) => {
    clientSocket.emit('getStatus', (err) => {
      done(err);
    });
  });
});
