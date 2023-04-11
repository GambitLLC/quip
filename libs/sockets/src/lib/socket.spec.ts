import { createServer } from 'http';
import { AddressInfo } from 'net';

import { Server as grpcServer, ServerCredentials, status } from '@grpc/grpc-js';
import {
  ServerStatusResponse,
  ServerSurfaceCall,
} from '@grpc/grpc-js/build/src/server-call';
import { RedisMemoryServer } from 'redis-memory-server';
process.env.ALLOW_CONFIG_MUTATIONS = 'true';
import config from 'config';

import {
  FrontendService,
  FrontendServer,
  StatusResponse,
} from '@quip/pb/quip-frontend';
import { Empty } from '@quip/pb/google/protobuf/empty';
import Server from './server';
import Client from './client';
import { exportJWK, generateKeyPair, KeyLike, SignJWT } from 'jose';
import { randomBytes } from 'crypto';

interface Call {
  player: string;
  request: string;
}

const calls: Call[] = [];

function trackCall(
  call: ServerSurfaceCall,
  req: string
): ServerStatusResponse | null {
  const player = call.metadata.get('Player-Id');
  if (player.length < 1) {
    return {
      details: 'Player-Id not found',
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

const mockFrontend: FrontendServer = {
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

// spin up http server to provide jwksT
const alg = 'RS256';
let publicKey: KeyLike, privateKey: KeyLike;
beforeAll(async () => {
  ({ publicKey, privateKey } = await generateKeyPair(alg));
  const jwk = await exportJWK(publicKey);
  jwk.alg = alg;

  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ keys: [jwk] }));
  });

  await new Promise<void>((resolve) => {
    server.listen(() => {
      const { port } = server.address() as AddressInfo;

      config.util.extendDeep(config, {
        auth: {
          jwks_uri: `http://localhost:${port}/`,
        },
      });

      resolve();
    });
  });
});

describe('socket listener', () => {
  let io: Server,
    grpc: grpcServer,
    redis: RedisMemoryServer,
    sockets: Client[] = [];

  async function getClient(player: string): Promise<Client> {
    // create token holding player info
    const token = await new SignJWT({})
      .setProtectedHeader({ alg })
      .setSubject(player)
      .setIssuer(config.get('auth.issuer'))
      .setAudience(config.get('auth.audience'))
      .sign(privateKey);

    const client = Client(config, {
      auth: {
        token,
      },
    });

    await new Promise<void>((resolve, reject) => {
      client.on('connect', resolve);
      client.on('connect_error', reject);
    });

    sockets.push(client);

    return client;
  }

  beforeAll(async () => {
    // spin up in memory redis to act as broker
    redis = new RedisMemoryServer();

    const host = await redis.getHost();
    const port = await redis.getPort();

    config.util.extendDeep(config, {
      sockets: {
        redis: {
          hostname: host,
          port: port,
        },
      },
      broker: {
        hostname: host,
        port: port,
      },
    });

    // wait for matchmaker service to start so that config is set with proper values
    await new Promise<void>((resolve, reject) => {
      grpc = new grpcServer();
      grpc.addService(FrontendService, mockFrontend);
      grpc.bindAsync(
        'localhost:0',
        ServerCredentials.createInsecure(),
        (err, port) => {
          if (err) {
            reject(err);
            return;
          }

          config.util.extendDeep(config, {
            matchmaker: {
              frontend: { hostname: 'localhost', port: port },
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
          sockets: {
            server: { hostname: 'localhost', port: port },
          },
        });

        // clientSocket = await getClient('abc');
        resolve();
      });
    });
  });

  afterAll(async () => {
    // clientSocket?.close();
    sockets.forEach((client) => client.close());
    sockets = [];

    await new Promise<void>((resolve) => {
      io.close((err) => {
        if (err) console.warn(err);
        resolve();
      });
    });

    await new Promise<void>((resolve) => {
      grpc.tryShutdown((err) => {
        if (err) console.warn(err);
        resolve();
      });
    });

    await redis.stop();
  });

  test('should receive status', async () => {
    const player = randomBytes(18).toString('hex');
    const client = await getClient(player);

    await new Promise<void>((resolve, reject) => {
      client.emit('getStatus', (err) => {
        if (
          !gotCall({
            player: player,
            request: 'getStatus',
          })
        ) {
          reject('mock matchmaker did not receive getStatus request');
          return;
        }

        if (err) reject(err);
        else resolve();
      });
    });
  });
});
