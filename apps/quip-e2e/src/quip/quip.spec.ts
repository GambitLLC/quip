import { Client } from '@quip/sockets';
import config from 'config';

describe('socket tests', () => {
  it('should connect', (done) => {
    const client = Client(config, {
      auth: {
        token: 'asd', // TODO: generate token
      },
    });
    client.on('connect', done);
    client.on('connect_error', done);
  });
});
