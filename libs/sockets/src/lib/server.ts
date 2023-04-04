import { Server as httpServer } from 'http';
import { Server as httpsServer } from 'https';

import { Server as SocketIoServer } from 'socket.io';
import { credentials, Metadata } from '@grpc/grpc-js';
import { IConfig } from 'config';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

import { MatchmakerClient } from '@quip/pb/quip-matchmaker';
import { Empty } from '@quip/pb/google/protobuf/empty';
import { ClientToServerEvents, ServerToClientEvents } from './events';
import { QueueUpdate, StatusUpdate } from '@quip/pb/quip-messages';

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
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const jwks = createRemoteJWKSet(new URL(config.get('auth.jwks_uri')));

    jwtVerify(token, jwks, {
      issuer: config.get('auth.issuer'),
      audience: config.get('auth.audience'),
    }).then(
      ({ payload }) => {
        socket.data.player = payload.sub;
        socket.join(payload.sub);
        next();
      },
      (err) => {
        next(err);
      }
    );
  });

  // listen to broker for status and queue updates
  broker
    .subscribe(
      'status_update',
      (message) => {
        const update = StatusUpdate.decode(message);
        io.to(update.targets).emit('statusUpdate', update);
      },
      true
    )
    .then(
      () => {
        console.log('subscribed to status updates');
      },
      (err) => console.error(err)
    );

  broker
    .subscribe(
      'queue_update',
      (message) => {
        const update = QueueUpdate.decode(message);
        io.to(update.targets).emit('queueUpdate', update);
      },
      true
    )
    .then(
      () => {
        console.log('subscribed to queue updates');
      },
      (err) => console.error(err)
    );

  // create rpc client to send commands to matchmaker
  const host = config.get('matchmaker.frontend.hostname');
  const port = config.get('matchmaker.frontend.port');

  const rpc = new MatchmakerClient(
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
    md.set('Player-Id', socket.data.player);

    socket.on('getStatus', (cb) => {
      rpc.getStatus(Empty.create(), md, (err, resp) => {
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
