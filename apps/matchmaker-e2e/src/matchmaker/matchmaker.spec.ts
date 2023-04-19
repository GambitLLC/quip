import { Client } from '@quip/sockets';
import config from 'config';
import { newToken } from '../auth';
import { randomBytes } from 'crypto';
import { BackendClient, DeleteMatchRequest } from '@quip/pb/matchmaker/backend';
import {
  StartQueueRequest,
  StatusResponse,
} from '@quip/pb/matchmaker/frontend';
import {
  QueueUpdate,
  Status,
  StatusUpdate,
} from '@quip/pb/matchmaker/messages';
import * as grpc from '@grpc/grpc-js';

const sockets: Map<string, Client> = new Map();

async function newClient(): Promise<{ client: Client; player: string }> {
  const player = randomBytes(10).toString('hex');
  const client = Client(config, {
    auth: {
      token: await newToken(player),
    },
  });

  await new Promise<void>((resolve, reject) => {
    client.on('connect', resolve);
    client.on('connect_error', reject);
  });

  sockets.set(player, client);

  return { client, player };
}

afterAll(() => {
  sockets.forEach((client) => client.close());
  sockets.clear();
});

describe('socket connection', () => {
  it('should connect with valid token', async () => {
    const { client, player } = await newClient();
    expect(client).not.toBeNull();
    expect(player).not.toBeUndefined();
  });

  it.failing('should not connect without token', async () => {
    const client = Client(config);
    await new Promise<void>((resolve, reject) => {
      client.on('connect', resolve);
      client.on('connect_error', reject);
    });
  });

  it('should get status idle response', async () => {
    const { client } = await newClient();
    const status = await new Promise<StatusResponse>((resolve, reject) => {
      client.emit('getStatus', (err, status) => {
        if (err) reject(err);
        resolve(status);
      });
    });

    expect(status?.status).toBe(Status.IDLE);
    expect(status.queue).toBeUndefined();
    expect(status.match).toBeUndefined();
  });
});

describe('queueing', () => {
  it('should fail to start queue for invalid gamemode', async () => {
    const { client } = await newClient();

    const err = await client.emitWithAck(
      'startQueue',
      StartQueueRequest.create({
        config: {
          gamemode: 'invalid gamemode zzz',
        },
      })
    );
    expect(err?.code).toBe(grpc.status.INVALID_ARGUMENT);
  });

  describe('valid start queue', () => {
    const gamemode = 'test_100x1';
    let err: Error, client: Client, player: string;
    let queueStartedUpdate: Promise<QueueUpdate>;
    let statusUpdate: Promise<StatusUpdate>;

    beforeAll(async () => {
      ({ client, player } = await newClient());

      // register listener for queue updates
      queueStartedUpdate = new Promise<QueueUpdate>((resolve) => {
        client.on('queueUpdate', (update) => {
          if (update.targets.includes(player) && update.started) {
            resolve(update);
          }
        });
      });

      statusUpdate = new Promise<StatusUpdate>((resolve) => {
        client.on('statusUpdate', (update) => {
          if (update.targets.includes(player)) {
            resolve(update);
          }
        });
      });

      // send start queue message
      err = await client.emitWithAck(
        'startQueue',
        StartQueueRequest.create({
          config: {
            gamemode,
          },
        })
      );
    });

    it('should not have received an error', () => {
      expect(err).toBeNull();
    });

    it('should have received queue started update', async () => {
      await queueStartedUpdate;
    });

    it('should receive status searching update', async () => {
      const update = await statusUpdate;
      expect(update?.status).toBe(Status.SEARCHING);
    });

    it('should get status searching response', async () => {
      const status = await new Promise<StatusResponse>((resolve, reject) => {
        client.emit('getStatus', (err, status) => {
          if (err) reject(err);
          resolve(status);
        });
      });

      expect(status?.status).toBe(Status.SEARCHING);
      expect(status?.queue?.gamemode).toBe(gamemode);
      expect(status.match).toBeUndefined();
    });

    it('should not be able to start queue again', async () => {
      const err = await client.emitWithAck(
        'startQueue',
        StartQueueRequest.create({
          config: {
            gamemode: 'test',
          },
        })
      );

      expect(err?.code).toBe(grpc.status.FAILED_PRECONDITION);
    });

    describe('stopping queue', () => {
      let err: Error;
      let queueStoppedUpdate: Promise<QueueUpdate>;

      beforeAll(async () => {
        queueStoppedUpdate = new Promise<QueueUpdate>((resolve) => {
          client.on('queueUpdate', (update) => {
            if (update.targets.includes(player) && update.finished) {
              resolve(update);
            }
          });
        });

        statusUpdate = new Promise<StatusUpdate>((resolve) => {
          client.on('statusUpdate', (update) => {
            if (update.targets.includes(player)) {
              resolve(update);
            }
          });
        });

        err = await client.emitWithAck('stopQueue');
      });

      it('should not have errored', () => {
        expect(err).toBeNull();
      });

      it('should receive queue stopped update', async () => {
        await queueStoppedUpdate;
      });

      it('should receive status idle update', async () => {
        const update = await statusUpdate;
        expect(update?.status).toBe(Status.IDLE);
      });

      it('should get status idle response', async () => {
        const status = await new Promise<StatusResponse>((resolve, reject) => {
          client.emit('getStatus', (err, status) => {
            if (err) reject(err);
            resolve(status);
          });
        });

        expect(status?.status).toBe(Status.IDLE);
        expect(status.queue).toBeUndefined();
        expect(status.match).toBeUndefined();
      });
    });
  });
});

describe('match tests', () => {
  let client: Client, player: string;
  let matchUpdate: Promise<QueueUpdate>;
  let statusUpdate: Promise<StatusUpdate>;
  let matchId: string;

  beforeAll(async () => {
    ({ client, player } = await newClient());

    matchUpdate = new Promise<QueueUpdate>((resolve) => {
      client.on('queueUpdate', (update) => {
        if (update.targets.includes(player) && update.found) {
          matchId = update.found.matchId;
          resolve(update);
        }
      });
    });

    statusUpdate = new Promise<StatusUpdate>((resolve) => {
      client.on('statusUpdate', (update) => {
        // check status here because Status.SEARCHING is also sent out once
        if (
          update.targets.includes(player) &&
          update.status == Status.PLAYING
        ) {
          resolve(update);
        }
      });
    });

    const err = await client.emitWithAck(
      'startQueue',
      StartQueueRequest.create({
        config: {
          gamemode: 'test',
        },
      })
    );
    expect(err).toBeNull();
  });

  it('should get match found', async () => {
    await matchUpdate;
  }, 20000);

  it('should receive status playing update', async () => {
    await statusUpdate;
  });

  it('should get status playing response', async () => {
    const status = await new Promise<StatusResponse>((resolve, reject) => {
      client.emit('getStatus', (err, status) => {
        if (err) reject(err);
        resolve(status);
      });
    });

    expect(status?.status).toBe(Status.PLAYING);
    expect(status.match).not.toBeUndefined();
    expect(status.match.connection).toBeTruthy();
  });

  it('should be unable to queue', async () => {
    const err = await client.emitWithAck(
      'startQueue',
      StartQueueRequest.create({
        config: {
          gamemode: 'test',
        },
      })
    );

    expect(err?.code).toBe(grpc.status.FAILED_PRECONDITION);
  });

  describe('match ending', () => {
    beforeAll(async () => {
      matchUpdate = new Promise<QueueUpdate>((resolve) => {
        client.on('queueUpdate', (update) => {
          if (update.targets.includes(player) && update.finished)
            resolve(update);
        });
      });

      statusUpdate = new Promise<StatusUpdate>((resolve) => {
        client.on('statusUpdate', (update) => {
          // check status here because Status.SEARCHING is also sent out once
          if (update.targets.includes(player) && update.status == Status.IDLE) {
            resolve(update);
          }
        });
      });

      // send delete match request that a gameserver would when games end
      const host = config.get('matchmaker.backend.hostname');
      const port = config.get('matchmaker.backend.port');

      const rpc = new BackendClient(
        `${host}:${port}`,
        grpc.credentials.createInsecure()
      );

      const err = await new Promise<Error>((resolve) => {
        rpc.deleteMatch(
          DeleteMatchRequest.create({
            matchId,
          }),
          (err) => {
            resolve(err);
          }
        );
      });

      expect(err).toBeNull();
    });

    it('should receive match finished update', async () => {
      await matchUpdate;
    });
    it('should receive status idle update', async () => {
      await statusUpdate;
    });
    it('should get status idle response', async () => {
      const status = await new Promise<StatusResponse>((resolve, reject) => {
        client.emit('getStatus', (err, status) => {
          if (err) reject(err);
          resolve(status);
        });
      });

      expect(status?.status).toBe(Status.IDLE);
      expect(status.match).toBeUndefined();
      expect(status.queue).toBeUndefined();
    });
  });

  // TODO: test matches expiring/being unhealthy
});
