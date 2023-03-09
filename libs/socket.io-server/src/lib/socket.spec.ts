import {
  MatchmakerService,
  MatchmakerServer,
  StatusResponse,
} from '@quip/pb/quip-matchmaker';
import { Empty } from '@quip/pb/google/protobuf/empty';
import wrapServer, {
  ClientToServerEvents,
  ServerToClientEvents,
} from './socket';

import { createServer } from 'http';
import { AddressInfo } from 'net';
import { Server as SocketServer } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';

import { Server as grpcServer, ServerCredentials, status } from '@grpc/grpc-js';
import {
  ServerStatusResponse,
  ServerSurfaceCall,
} from '@grpc/grpc-js/build/src/server-call';

process.env.ALLOW_CONFIG_MUTATIONS = 'true';
import importFresh from 'import-fresh';
import { IConfig } from 'config';

interface Call {
  player: string;
  request: string;
}

const calls: Call[] = [];

function trackCall(
  call: ServerSurfaceCall,
  req: string
): ServerStatusResponse | null {
  const player = call.metadata.get('Player-Uuid');
  if (player.length < 1) {
    return {
      details: 'Player-Uuid not found',
      code: status.INVALID_ARGUMENT,
    };
  }

  calls.push({
    request: req,
    player: player[0].toString(),
  });

  return null;
}

function gotCall(call: Call): boolean {
  return (
    calls.find((elem) => JSON.stringify(elem) === JSON.stringify(call)) !==
    undefined
  );
}

const mockMatchmaker: MatchmakerServer = {
  getStatus: function (call, cb) {
    const err = trackCall(call, 'getStatus');
    if (err) {
      cb(err, null);
      return;
    }

    cb(null, StatusResponse.create());
    return;
  },
  startQueue: function (call, cb) {
    const err = trackCall(call, 'startQueue');
    if (err) {
      cb(err, null);
      return;
    }

    cb(null, Empty.create());
    return;
  },
  stopQueue: function (call, cb) {
    const err = trackCall(call, 'stopQueue');
    if (err) {
      cb(err, null);
      return;
    }

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
