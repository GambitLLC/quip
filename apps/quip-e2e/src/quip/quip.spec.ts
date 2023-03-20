import { Client } from '@quip/sockets';
import config from 'config';
import { newToken } from '../auth';
import { randomBytes } from 'crypto';
import { StartQueueRequest } from '@quip/pb/quip-matchmaker';

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

    await new Promise<void>((resolve) => {
      client.emit('getStatus', (err, status) => {
        expect(err).toBeNull();
        expect(status).toBeTruthy();
        resolve();
      });
    });
  });

  it('should be able to queue', async () => {
    const { client } = await newClient();

    await new Promise<void>((resolve) => {
      client.emit('startQueue', StartQueueRequest.create({}), (err) => {
        expect(err).toBeNull();
        resolve();
      });
    });
  });

  it('should get queue started update', async () => {
    const { client } = await newClient();

    await new Promise<void>((resolve, reject) => {
      client.on('queueUpdate', (update) => {
        console.log('got queue update');
        resolve();
      });

      client.emit('startQueue', StartQueueRequest.create({}), (err) => {
        if (err) reject();
        else resolve();
      });
    });
  });

  it.failing('should not be able to double queue', async () => {
    const { client } = await newClient();

    await new Promise<void>((resolve) => {
      client.emit('startQueue', StartQueueRequest.create({}), (err) => {
        expect(err).toBeNull();
        resolve();
      });
    });

    await new Promise<void>((resolve, reject) => {
      client.emit('startQueue', StartQueueRequest.create({}), (err) => {
        if (err) reject();
        else resolve();
      });
    });
  });

  it('should be able to stop queue', async () => {
    const { client } = await newClient();

    await new Promise<void>((resolve) => {
      client.emit('stopQueue', (err) => {
        expect(err).toBeNull();
        resolve();
      });
    });
  });
});
