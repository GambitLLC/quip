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

import { Magic } from '@magic-sdk/admin';
const magic = new Magic();

import { FrontendService, FrontendServer } from '@quip/pb/matchmaker/frontend';
import { Status } from '@quip/pb/matchmaker/messages';
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
  const player = magic.token.getIssuer(
    call.metadata.get('authorization')[0].toString().substring(7)
  );

  if (player.length < 1) {
    return {
      details: 'Player-Id not found',
      code: status.INVALID_ARGUMENT,
    };
  }

  calls.push({
    request: req,
    player: player,
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

    cb(null, Status.create());
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

import { randomUUID } from 'crypto';

import Web3 from 'web3';
const web3 = new Web3();

export function generateDIDToken(): { player: string; token: string } {
  const account = web3.eth.accounts.create();
  const { address, sign } = account;
  const player = `did:ethr:${address}`;
  const claim = JSON.stringify({
    iat: Math.floor(Date.now() / 1000),
    ext: Math.floor(Date.now() / 1000) + 1000,
    iss: player,
    sub: 'sub',
    aud: 'aud',
    nbf: Math.floor(Date.now() / 1000),
    tid: randomUUID(),
    add: 'add',
  });
  return {
    player,
    token: Buffer.from(JSON.stringify([sign(claim).signature, claim])).toString(
      'base64'
    ),
  };
}

describe('socket listener', () => {
  let io: Server,
    grpc: grpcServer,
    redis: RedisMemoryServer,
    sockets: Client[] = [];

  async function getClient(): Promise<{ client: Client; player: string }> {
    const { player, token } = generateDIDToken();

    const client = Client(config, {
      auth: {
        token: `Bearer ${token}`,
      },
    });

    await new Promise<void>((resolve, reject) => {
      client.on('connect', resolve);
      client.on('connect_error', reject);
    });

    sockets.push(client);

    return { client, player };
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
    const { player, client } = await getClient();

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
