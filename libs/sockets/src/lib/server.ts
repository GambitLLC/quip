import { Server as httpServer } from 'http';
import { Server as httpsServer } from 'https';

import { Server as SocketIoServer } from 'socket.io';
import { credentials, Metadata } from '@grpc/grpc-js';
import { IConfig } from 'config';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import { MatchmakerClient } from '@quip/pb/quip-matchmaker';
import { Empty } from '@quip/pb/google/protobuf/empty';
import { ClientToServerEvents, ServerToClientEvents } from './events';

export type Server = SocketIoServer<ClientToServerEvents, ServerToClientEvents>;

export const Server = (
  config: IConfig,
  httpServer: httpServer | httpsServer
): Server => {
  const io = new SocketIoServer<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
    {
      serveClient: false,
      // TODO: redis adapter
    }
  );

  const host = config.get('api.matchmaker.hostname');
  const port = config.get('api.matchmaker.port');

  const rpc = new MatchmakerClient(
    `${host}:${port}`,
    credentials.createInsecure()
  );

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

  io.on('connection', (socket) => {
    // TODO: authenticate socket
    // TODO: get metadata from socket authentication
    const md = new Metadata();
    md.set('Player-Uuid', socket.data.player);

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
