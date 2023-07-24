import { Server as httpServer } from 'http';
import { Server as httpsServer } from 'https';

import { Server as SocketIoServer } from 'socket.io';
import { credentials, Metadata } from '@grpc/grpc-js';
import { IConfig } from 'config';
import { Magic } from '@magic-sdk/admin';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

import { DeprecatedFrontendClient as FrontendClient } from '@quip/pb/matchmaker/frontend';
import { Empty } from '@quip/pb/google/protobuf/empty';
import { ClientToServerEvents, ServerToClientEvents } from './events';
import { StatusUpdate } from '@quip/pb/matchmaker/messages';

export type Server = SocketIoServer<ClientToServerEvents, ServerToClientEvents>;

// TODO: modify function signature to be promise so that broker connection errors throw
export const Server = (
  config: IConfig,
  httpServer: httpServer | httpsServer
): Server => {
  const pubClient = createClient({
    url: `redis://${config.get('sockets.redis.hostname')}:${config.get(
      'sockets.redis.port'
    )}`,
  });
  const subClient = pubClient.duplicate();
  const broker = createClient({
    url: `redis://${config.get('broker.hostname')}:${config.get(
      'broker.port'
    )}`,
  });

  pubClient.on('error', console.error);
  subClient.on('error', console.error);
  broker.on('error', console.error);

  Promise.all([
    pubClient.connect(),
    subClient.connect(),
    broker.connect(),
  ]).then(
    () => {
      console.log('redis pub and sub client connected');
    },
    (err) => {
      console.error(err);
    }
  );

  const io = new SocketIoServer<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
    {
      serveClient: false,
      adapter: createAdapter(pubClient, subClient),
    }
  );

  // setup authentication
  const magic = new Magic();

  io.use((socket, next) => {
    // verify authorization header, assumes format "Bearer "
    const token = socket.handshake.auth?.token?.substring(7);
    try {
      const issuer = magic.token.getIssuer(token);
      socket.data.player = issuer;
      socket.join(issuer);
      next();
    } catch (err) {
      next(err);
    }
  });

  // listen to broker for status and queue updates
  broker
    .subscribe(
      'status_update',
      (message) => {
        const update = StatusUpdate.decode(message);
        io.to(update.targets).emit('statusUpdate', update.status);
      },
      true
    )
    .then(
      () => {
        console.log('subscribed to status updates');
      },
      (err) => console.error(err)
    );

  // create rpc client to send commands to matchmaker
  const host = config.get('matchmaker.frontend.hostname');
  const port = config.get('matchmaker.frontend.port');

  const rpc = new FrontendClient(
    `${host}:${port}`,
    credentials.createInsecure()
  );

  // overwrite close to cleanup redis and matchmaker connections
  const close = io.close.bind(io);
  io.close = (fn?: (err?: Error) => void) => {
    pubClient.disconnect();
    subClient.disconnect();
    broker.disconnect();
    rpc.close();
    close(fn);
  };

  io.on('connection', (socket) => {
    const md = new Metadata();
    md.set('Authorization', socket.handshake.auth.token);

    socket.on('getStatus', (req, cb) => {
      rpc.getStatus(req, md, (err, resp) => {
        cb(err, resp);
      });
    });

    socket.on('startQueue', (req, cb) => {
      rpc.startQueue(req, md, (err) => {
        cb(err);
      });
      return;
    });

    socket.on('stopQueue', (cb) => {
      rpc.stopQueue(Empty.create(), md, (err) => {
        cb(err);
      });
      return;
    });
  });

  return io;
};

export default Server;
