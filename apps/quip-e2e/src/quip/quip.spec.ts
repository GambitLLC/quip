import { Client } from '@quip/sockets';
import config from 'config';
import { newToken } from '../auth';
import { randomBytes } from 'crypto';
import { StartQueueRequest, StatusResponse } from '@quip/pb/quip-matchmaker';
import { QueueUpdate, Status } from '@quip/pb/quip-messages';
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

  it('should have idle connection', async () => {
    const { client } = await newClient();
    const status = await new Promise<StatusResponse>((resolve, reject) => {
      client.emit('getStatus', (err, status) => {
        if (err) reject(err);
        resolve(status);
      });
    });

    expect(status?.status).toBe(Status.IDLE);
  });
});

describe('queueing', () => {
  it('should fail to start queue for invalid gamemode', async () => {
    const { client } = await newClient();

    const err = await client.emitWithAck(
      'startQueue',
      StartQueueRequest.create({
        gamemode: 'invalid gamemode zzz',
      })
    );
    expect(err?.code).toBe(grpc.status.INVALID_ARGUMENT);
  });

  describe('valid start queue', () => {
    let err: Error, client: Client, player: string;
    let queueStartedUpdate: Promise<QueueUpdate>;

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

      // send start queue message
      err = await client.emitWithAck(
        'startQueue',
        StartQueueRequest.create({
          gamemode: 'test_100x1',
        })
      );
    });

    it('should not have received an error', () => {
      expect(err).toBeNull();
    });

    it('should have received queue started update', async () => {
      await queueStartedUpdate;
    });

    it('should have searching status', async () => {
      const status = await new Promise<StatusResponse>((resolve, reject) => {
        client.emit('getStatus', (err, status) => {
          if (err) reject(err);
          resolve(status);
        });
      });

      expect(status?.status).toBe(Status.SEARCHING);
    });

    it('should not be able to start queue again', async () => {
      const err = await client.emitWithAck(
        'startQueue',
        StartQueueRequest.create({
          gamemode: 'test',
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
            if (update.targets.includes(player) && update.stopped) {
              resolve(update);
            }
          });
        });

        err = await client.emitWithAck('stopQueue');
      });

      it('should not have errored', () => {
        expect(err).toBeNull();
      });

      it('should have received queue stopped update', async () => {
        await queueStoppedUpdate;
      });

      it('should be status idle', async () => {
        const status = await new Promise<StatusResponse>((resolve, reject) => {
          client.emit('getStatus', (err, status) => {
            if (err) reject(err);
            resolve(status);
          });
        });

        expect(status?.status).toBe(Status.IDLE);
      });
    });
  });
});

describe('match tests', () => {
  let client: Client, player: string;
  let matchFoundUpdate: Promise<QueueUpdate>;

  beforeAll(async () => {
    ({ client, player } = await newClient());

    matchFoundUpdate = new Promise<QueueUpdate>((resolve) => {
      client.on('queueUpdate', (update) => {
        if (update.targets.includes(player) && update.found) resolve(update);
      });
    });

    const err = await client.emitWithAck(
      'startQueue',
      StartQueueRequest.create({
        gamemode: 'test',
      })
    );
    expect(err).toBeNull();
  });

  it('should get match found', async () => {
    await matchFoundUpdate;
  }, 20000);

  it('should have status playing', async () => {
    const status = await new Promise<StatusResponse>((resolve, reject) => {
      client.emit('getStatus', (err, status) => {
        if (err) reject(err);
        resolve(status);
      });
    });

    expect(status?.status).toBe(Status.PLAYING);
  });

  it('should be unable to queue', async () => {
    const err = await client.emitWithAck(
      'startQueue',
      StartQueueRequest.create({
        gamemode: 'test',
      })
    );

    expect(err?.code).toBe(grpc.status.FAILED_PRECONDITION);
  });
});
