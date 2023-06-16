import { Client } from '@quip/sockets';
import config from 'config';
import { generateDIDToken } from '../auth';
import { BackendClient, DeleteMatchRequest } from '@quip/pb/matchmaker/backend';
import { StartQueueRequest } from '@quip/pb/matchmaker/frontend';
import { State, Status } from '@quip/pb/matchmaker/messages';
import * as grpc from '@grpc/grpc-js';

const sockets: Map<string, Client> = new Map();

async function newClient(): Promise<{ client: Client; player: string }> {
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
    const status = await new Promise<Status>((resolve, reject) => {
      client.emit('getStatus', (err, status) => {
        if (err) reject(err);
        resolve(status);
      });
    });

    expect(status?.state).toBe(State.IDLE);
    expect(status.searching).toBeUndefined();
    expect(status.matched).toBeUndefined();
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
    let err: Error, client: Client;
    let statusUpdate: Promise<Status>;

    beforeAll(async () => {
      ({ client } = await newClient());

      statusUpdate = new Promise<Status>((resolve) => {
        client.on('statusUpdate', (update) => {
          if (update.state == State.SEARCHING) resolve(update);
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

    it('should receive status searching update', async () => {
      const update = await statusUpdate;
      expect(update?.state).toBe(State.SEARCHING);
    });

    it('should get status searching response', async () => {
      const status = await new Promise<Status>((resolve, reject) => {
        client.emit('getStatus', (err, status) => {
          if (err) reject(err);
          resolve(status);
        });
      });

      expect(status?.state).toBe(State.SEARCHING);
      expect(status?.searching?.gamemode).toBe(gamemode);
      expect(status?.matched).toBeUndefined();
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

      beforeAll(async () => {
        statusUpdate = new Promise<Status>((resolve) => {
          client.on('statusUpdate', (update) => {
            resolve(update);
          });
        });

        err = await client.emitWithAck('stopQueue');
      });

      it('should not have errored', () => {
        expect(err).toBeNull();
      });

      it('should receive status idle update', async () => {
        const update = await statusUpdate;
        expect(update?.state).toBe(State.IDLE);
      });

      it('should get status idle response', async () => {
        const status = await new Promise<Status>((resolve, reject) => {
          client.emit('getStatus', (err, status) => {
            if (err) reject(err);
            resolve(status);
          });
        });

        expect(status?.state).toBe(State.IDLE);
        expect(status?.searching).toBeUndefined();
        expect(status?.matched).toBeUndefined();
      });
    });
  });
});

describe('match tests', () => {
  let client: Client;
  let statusUpdate: Promise<Status>;
  let matchId: string;

  beforeAll(async () => {
    ({ client } = await newClient());

    statusUpdate = new Promise<Status>((resolve) => {
      client.on('statusUpdate', (update) => {
        // check status here because Status.SEARCHING is also sent out once
        if (update.state == State.PLAYING && update.matched) {
          matchId = update.matched.matchId;
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

  it('should receive status playing update', async () => {
    await statusUpdate;
  }, 20000);

  it('should get status playing response', async () => {
    const status = await new Promise<Status>((resolve, reject) => {
      client.emit('getStatus', (err, status) => {
        if (err) reject(err);
        resolve(status);
      });
    });

    expect(status?.state).toBe(State.PLAYING);
    expect(status?.matched).not.toBeUndefined();
    expect(status.matched.connection).toBeTruthy();
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
      statusUpdate = new Promise<Status>((resolve) => {
        client.on('statusUpdate', (update) => {
          // check status here because Status.SEARCHING is also sent out once
          if (update.state == State.IDLE) {
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

    it('should receive status idle update', async () => {
      await statusUpdate;
    });
    it('should get status idle response', async () => {
      const status = await new Promise<Status>((resolve, reject) => {
        client.emit('getStatus', (err, status) => {
          if (err) reject(err);
          resolve(status);
        });
      });

      expect(status?.state).toBe(State.IDLE);
      expect(status?.matched).toBeUndefined();
      expect(status?.searching).toBeUndefined();
    });
  });

  // TODO: test matches expiring/being unhealthy
});
