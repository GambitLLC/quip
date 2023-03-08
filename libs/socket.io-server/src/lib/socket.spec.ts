import {
  MatchmakerService,
  MatchmakerServer,
  StatusResponse,
} from '@quip/pb/quip-matchmaker';
import { Empty } from '@quip/pb/google/protobuf/empty';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { Server as SocketServer } from 'socket.io';
import { Server as grpcServer, ServerCredentials } from '@grpc/grpc-js';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import wrapServer, {
  ClientToServerEvents,
  ServerToClientEvents,
} from './socket';

process.env.ALLOW_CONFIG_MUTATIONS = 'true';
import importFresh from 'import-fresh';
import { IConfig } from 'config';

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
  let config: IConfig;
  let io: SocketServer,
    grpc: grpcServer,
    // serverSocket: ServerSocket<ClientToServerEvents, ServerToClientEvents>,
    clientSocket: ClientSocket<ServerToClientEvents, ClientToServerEvents>;

  beforeAll(async () => {
    const wait = new Promise((resolve) => {
      grpc = new grpcServer();
      grpc.addService(MatchmakerService, mockMatchmaker);
      grpc.bindAsync(
        'localhost:0',
        ServerCredentials.createInsecure(),
        (err, port) => {
          expect(err).toBeNull;
          process.env.NODE_CONFIG = JSON.stringify({
            api: {
              matchmaker: { hostname: 'localhost', port: port },
            },
          });

          config = importFresh('config');
          grpc.start();
          resolve(null);
        }
      );
    });

    await wait;
    return new Promise<void>((done) => {
      const httpServer = createServer();
      io = wrapServer(config, httpServer);

      httpServer.listen(() => {
        const { port } = httpServer.address() as AddressInfo;
        clientSocket = Client(`http://localhost:${port}`);
        // io.on('connection', (socket) => {
        //   serverSocket = socket;
        // });
        clientSocket.on('connect', done);
      });
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
