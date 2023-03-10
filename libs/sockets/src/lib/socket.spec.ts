import { createServer } from 'http';
import { AddressInfo } from 'net';

import { Server as grpcServer, ServerCredentials, status } from '@grpc/grpc-js';
import {
  ServerStatusResponse,
  ServerSurfaceCall,
} from '@grpc/grpc-js/build/src/server-call';
process.env.ALLOW_CONFIG_MUTATIONS = 'true';
import config from 'config';

import {
  MatchmakerService,
  MatchmakerServer,
  StatusResponse,
} from '@quip/pb/quip-matchmaker';
import { Empty } from '@quip/pb/google/protobuf/empty';
import Server from './server';
import Client from './client';

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
    calls.find(
      (elem) => elem.player === call.player && elem.request === call.request
    ) !== undefined
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
  let io: Server,
    grpc: grpcServer,
    // serverSocket: ServerSocket<ClientToServerEvents, ServerToClientEvents>,
    clientSocket: Client;

  async function getClient(player: string): Promise<Client> {
    const client = Client(config, {
      auth: undefined, // TODO: set up auth
    });

    await new Promise<void>((resolve, reject) => {
      client.on('connect', resolve);
      client.on('connect_error', reject);
    });

    return client;
  }

  beforeAll(async () => {
    // wait for matchmaker service to start so that config is set with proper values
    await new Promise<void>((resolve, reject) => {
      grpc = new grpcServer();
      grpc.addService(MatchmakerService, mockMatchmaker);
      grpc.bindAsync(
        'localhost:0',
        ServerCredentials.createInsecure(),
        (err, port) => {
          if (err) {
            reject(err);
            return;
          }

          config.util.extendDeep(config, {
            api: {
              matchmaker: { hostname: 'localhost', port: port },
            },
          });

          grpc.start();
          resolve();
        }
      );
    });

    // wait for socket server to listen
    await new Promise<void>((resolve) => {
      const httpServer = createServer();
      io = Server(config, httpServer);

      httpServer.listen(async () => {
        const { port } = httpServer.address() as AddressInfo;
        config.util.extendDeep(config, {
          api: {
            'socket_io-server': { hostname: 'localhost', port: port },
          },
        });

        clientSocket = await getClient('asdsa');
        resolve();
      });
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  test('should receive status', (done) => {
    clientSocket.emit('getStatus', (err) => {
      if (
        !gotCall({
          player: 'asdsa',
          request: 'getStatus',
        })
      ) {
        done('mock matchmaker did not receive getStatus request');
        return;
      }

      done(err);
    });
  });
});
