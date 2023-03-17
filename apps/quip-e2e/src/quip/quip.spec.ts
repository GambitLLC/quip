import { Client } from '@quip/sockets';
import config from 'config';
import { newToken } from '../auth';

describe('socket tests', () => {
  it('should connect', async () => {
    const client = Client(config, {
      auth: {
        token: await newToken('asd'),
      },
    });

    await new Promise<void>((resolve, reject) => {
      client.on('connect', resolve);
      client.on('connect_error', reject);
    });
  });
});
