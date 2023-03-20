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

export const Server = async (
  config: IConfig,
  httpServer: httpServer | httpsServer
): Promise<Server> => {
  const pubClient = createClient({
    url: `redis://${config.get('redis.hostname')}:${config.get('redis.port')}`,
  });
  const subClient = pubClient.duplicate();

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
        next();
      },
      (err) => {
        next(err);
      }
    );
  });

  // listen to broker for status and queue updates
  subClient
    .subscribe<true>('status_update', (message) => {
      const update = StatusUpdate.decode(message);
      console.log(update);
      io.to(update.targets).emit('statusUpdate', update);
    })
    .catch((err) => console.error(err));

  subClient
    .subscribe<true>('queue_update', (message) => {
      const update = QueueUpdate.decode(message);
      console.log(update);
      io.to(update.targets).emit('queueUpdate', update);
    })
    .catch((err) => console.error(err));

  // create rpc client to send commands to matchmaker
  const host = config.get('api.matchmaker.hostname');
  const port = config.get('api.matchmaker.port');

  const rpc = new MatchmakerClient(
    `${host}:${port}`,
    credentials.createInsecure()
  );

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

  // io.emit('queueUpdate', QueueUpdate.create());
  // io.emit('statusUpdate', StatusUpdate.create());

  return io;
};

export default Server;
