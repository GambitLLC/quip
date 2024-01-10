import React, { useState, createContext, useEffect, useContext } from 'react';
import { ClientReadableStream, StatusObject, credentials } from '@grpc/grpc-js';
import { PlayerUpdate, QuipFrontendClient } from '@quip/pb/matchmaker/frontend';
import * as messages from '@quip/pb/matchmaker/messages';
import { Empty } from '@quip/pb/google/protobuf/empty';

export type QuipStatus = 'offline' | 'online' | 'searching' | 'playing';

export interface Matchmaker {
  /**
   * status is the current state of the QuipFrontendClient.
   */
  status: QuipStatus;

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

  /**
   * startQueue asynchronously attempts to start queue for the
   * currently logged in user.
   */
  startQueue: (config: messages.QueueConfiguration) => void;
}

export const MatchmakerContext = createContext<Matchmaker | null>(null);

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
      )
  );

  const [matchmaker, setMatchmaker] = useState<Matchmaker>({
    status: 'offline',
    startQueue: () => {
      return;
    },
  });

  useEffect(() => {
    const stream = client.connect(Empty.create());
    stream.on('status', (status) => {
      // grpc status
      // console.log('status', status);
    });
    stream.on('data', (msg) => {
      // console.log('data', msg);?
    });
    stream.on('end', () => {
      // console.log('stream ended');
      // stream = null;
      // TODO: reconnenct?
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
