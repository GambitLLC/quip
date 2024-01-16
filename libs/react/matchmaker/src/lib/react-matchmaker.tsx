import React, { useState, createContext, useEffect, useContext } from 'react';
import { Metadata, credentials } from '@grpc/grpc-js';
import {
  PlayerUpdate,
  QuipFrontendClient,
  StartQueueRequest,
} from '@quip/pb/matchmaker/frontend';
import * as messages from '@quip/pb/matchmaker/messages';
import { Empty } from '@quip/pb/google/protobuf/empty';

export type QuipStatus =
  | 'offline'
  | 'online'
  | 'idle'
  | 'searching'
  | 'playing';

export interface Matchmaker {
  /**
   * status is the current state of the QuipFrontendClient.
   */
  status: QuipStatus;

  /**
   * queueAssignment contains queue details while player is in queue.
   */
  queueAssignment?: messages.QueueAssignment;

  /**
   * matchAssignment will contain match details while player is in a game.
   */
  matchAssignment?: messages.MatchAssignment;

  // TODO: is there a better way of handling errors? perhaps useMatchmaker
  // should register subscribers or MatchmakerProvider takes in an onError?...
  /**
   * error is the most recent error message from the QuipFrontendClient connect method.
   */
  error?: Error;
  /**
   * errorUpdatedAt is the timestamp error was last updated.
   */
  errorUpdatedAt?: number;

  getPlayer: () => Promise<messages.Player>;

  /**
   * startQueue asynchronously attempts to start queue for the
   * currently logged in user.
   */
  startQueue: (config: StartQueueRequest) => Promise<void>;

  stopQueue: () => Promise<void>;
}

export const MatchmakerContext = createContext<Matchmaker | null>(null);

// TODO: create some AuthContext and Provider

export interface MatchmakerProviderProps extends React.PropsWithChildren {
  /**
   * address of the QuipFrontendServer to connect to.
   */
  address?: string;
}

export function MatchmakerProvider({
  address,
  children,
}: MatchmakerProviderProps) {
  const [client] = useState(
    () =>
      new QuipFrontendClient(
        address || 'localhost:8080',
        credentials.createInsecure()
        // credentials.createInsecure().compose(
        //   credentials.createFromMetadataGenerator((opts, cb) => {
        //     const md = new Metadata();
        //     md.set('Authorization', `Bearer id`);

        //     cb(null, md);
        //   })
        // )
      )
  );

  // TODO: compose into call credentials
  const md = new Metadata();
  md.set('Authorization', `Bearer id`);

  const [matchmaker, setMatchmaker] = useState<Matchmaker>({
    status: 'offline',
    getPlayer: () =>
      new Promise<messages.Player>((resolve, reject) =>
        client.getPlayer({}, md, (err, resp) => {
          if (err) return reject(err);
          resolve(resp);
        })
      ),
    startQueue: (req: StartQueueRequest) =>
      new Promise<void>((resolve, reject) =>
        client.startQueue(req, md, (err, _) => {
          if (err) return reject(err);
          resolve();
        })
      ),
    stopQueue: () =>
      new Promise<void>((resolve, reject) =>
        client.stopQueue({}, md, (err, _) => {
          if (err) return reject(err);
          resolve();
        })
      ),
  });

  useEffect(() => {
    const stream = client.connect(Empty.create(), md);
    stream.on('status', (status) => {
      // grpc status
      // console.log('status', status);
    });
    stream.on('data', (msg: PlayerUpdate) => {
      // TODO: confirm update is for current player?
      setMatchmaker((matchmaker) => {
        let status = matchmaker.status;
        switch (msg.player?.state) {
          default:
            return matchmaker;
          case messages.PlayerState.OFFLINE:
            status = 'offline';
            break;
          case messages.PlayerState.ONLINE:
            status = 'online';
            break;
          case messages.PlayerState.IDLE:
            status = 'idle';
            break;
          case messages.PlayerState.SEARCHING:
            status = 'searching';
            break;
          case messages.PlayerState.PLAYING:
            status = 'playing';
            break;
        }
        return {
          ...matchmaker,
          status,
          queueAssignment: msg.player.queueAssignment,
          matchAssignment: msg.player.matchAssignment,
        };
      });
      // console.log('data', msg);
    });
    stream.on('end', () => {
      // TODO: reconnect?
      stream.cancel();
      client.close();
    });
    stream.on('error', (err) => {
      // console.error('error', err);
      setMatchmaker((matchmaker) => ({
        ...matchmaker,
        error: err,
        errorUpdatedAt: Date.now(),
      }));
    });

    return () => {
      stream?.cancel();
      client.close();
    };
  }, [client]);

  return (
    <MatchmakerContext.Provider value={matchmaker}>
      {children}
    </MatchmakerContext.Provider>
  );
}

// useMatchmaker hook provides a null safety check for MatchmakerContext.
export function useMatchmaker() {
  const matchmakerContext = useContext(MatchmakerContext);

  if (matchmakerContext == null) {
    throw new Error(
      'useMatchmaker has to be used within <MatchmakerContext.Provider>'
    );
  }

  return matchmakerContext;
}
