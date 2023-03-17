import { Client } from '@quip/sockets';
import config from 'config';
import { newToken } from '../auth';
import { randomBytes } from 'crypto';

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
    const { client, player } = await newClient();

    await new Promise<void>((resolve) => {
      client.emit('getStatus', (err, status) => {
        expect(err).toBeNull();
        expect(status).toBeTruthy();

        resolve();
      });
    });
  });
});
