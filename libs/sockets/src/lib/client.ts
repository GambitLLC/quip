import { IConfig } from 'config';
import {
  io,
  ManagerOptions,
  SocketOptions,
  Socket as SocketIoClient,
} from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from './events';

export type Client = SocketIoClient<ServerToClientEvents, ClientToServerEvents>;

export const Client = (
  config: IConfig,
  opts?: Partial<ManagerOptions & SocketOptions>
): Client => {
  const host = config.get('sockets.server.hostname');
  const port = config.get('sockets.server.port');

  const client = io(`http://${host}:${port}`, {
    // TODO: set up preferred default options
    ...opts,
  });

  return client;
};

export default Client;
