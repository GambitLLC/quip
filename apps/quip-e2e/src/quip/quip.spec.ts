import { Client } from '@quip/sockets';
import config from 'config';
import { newToken } from '../auth';
import { randomBytes } from 'crypto';
import { StartQueueRequest } from '@quip/pb/quip-matchmaker';
import { QueueUpdate, Status, statusToJSON } from '@quip/pb/quip-messages';

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

  sockets[player] = client;

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

    await new Promise<void>((resolve, reject) => {
      client.emit('getStatus', (err, status) => {
        if (err) reject(err);
        else if (!status) reject('status is undefined/null');
        else if (status.status != Status.IDLE)
          reject(`status is ${statusToJSON(status.status)}, expected IDLE`);
        else resolve();
      });
    });
  });
});

describe('queueing', () => {
  it.failing('should fail to start queue for invalid gamemode', async () => {
    const { client } = await newClient();

    const err = await client.emitWithAck(
      'startQueue',
      StartQueueRequest.create({
        gamemode: 'invalid gamemode zzz',
      })
    );
    if (err) throw err;
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

    it('should have not received an error', () => {
      if (err) throw err;
    });

    it('should have received queue started update', async () => {
      await queueStartedUpdate;
    });

    it('should have searching status', async () => {
      await new Promise<void>((resolve, reject) => {
        client.emit('getStatus', (err, status) => {
          if (err) return reject(err);
          if (!status) return reject('status is undefined/null');
          if (status.status != Status.SEARCHING)
            return reject(
              `status is ${statusToJSON(status.status)}, expected SEARCHING`
            );
          resolve();
        });
      });
    });

    it.failing('should not be able to start queue again', async () => {
      const err = await client.emitWithAck(
        'startQueue',
        StartQueueRequest.create({
          gamemode: 'test',
        })
      );
      if (err) throw err;
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
        if (err) throw err;
      });

      it('should have received queue stopped update', async () => {
        await queueStoppedUpdate;
      });

      it('should be status idle', async () => {
        await new Promise<void>((resolve, reject) => {
          client.emit('getStatus', (err, status) => {
            if (err) return reject(err);
            if (!status) return reject('status is undefined/null');
            if (status.status != Status.IDLE)
              return reject(
                `status is ${statusToJSON(status.status)}, expected IDLE`
              );
            resolve();
          });
        });
      });
    });
  });
});

describe('match tests', () => {
  it('should get match started', async () => {
    const { client } = await newClient();

    await new Promise<void>((resolve, reject) => {
      client.on('queueUpdate', (update) => {
        if (update.found) resolve();
      });

      client
        .emitWithAck(
          'startQueue',
          StartQueueRequest.create({
            gamemode: 'test',
          })
        )
        .then((err) => (err ? reject(err) : null));
    });
  }, 20000);
});
