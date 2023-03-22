import { Client } from '@quip/sockets';
import config from 'config';
import { newToken } from '../auth';
import { randomBytes } from 'crypto';
import { StartQueueRequest } from '@quip/pb/quip-matchmaker';
import { rejects } from 'assert';

describe('socket tests', () => {
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

  it('should get status', async () => {
    const { client } = await newClient();

    await new Promise<void>((resolve, reject) => {
      client.emit('getStatus', (err, status) => {
        if (err) reject(err);
        else if (!status) reject('status is undefined/null');
        else resolve();
      });
    });
  });

  it('should be able to queue', async () => {
    const { client } = await newClient();

    await new Promise<void>((resolve, reject) => {
      client.emit(
        'startQueue',
        StartQueueRequest.create({
          gamemode: 'test',
        }),
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });

  it('should get queue started update', async () => {
    const { client } = await newClient();

    await new Promise<void>((resolve, reject) => {
      client.on('queueUpdate', (update) => {
        if (update.started) resolve();
      });

      client.emit(
        'startQueue',
        StartQueueRequest.create({
          gamemode: 'test',
        }),
        (err) => {
          if (err) reject(err);
        }
      );
    });
  });

  it.failing('should not be able to double queue', async () => {
    const { client } = await newClient();

    await new Promise<void>((resolve, reject) => {
      client.emit(
        'startQueue',
        StartQueueRequest.create({
          gamemode: 'test',
        }),
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    await new Promise<void>((resolve, reject) => {
      client.emit(
        'startQueue',
        StartQueueRequest.create({
          gamemode: 'test',
        }),
        (err) => {
          if (err) reject();
          else resolve();
        }
      );
    });
  });

  it('should be able to stop queue', async () => {
    const { client } = await newClient();

    await new Promise<void>((resolve, reject) => {
      client.emit('stopQueue', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
});
