import React, { useState, createContext, useEffect, useContext } from 'react';
import { credentials } from '@grpc/grpc-js';
import { QuipFrontendClient } from '@quip/pb/matchmaker/frontend';
import * as messages from '@quip/pb/matchmaker/messages';

export type Status = 'offline' | 'online' | 'searching' | 'playing';

export interface Matchmaker {
  status: Status;
  startQueue: (config: messages.QueueConfiguration) => void;
}

export const MatchmakerContext = createContext<Matchmaker | null>(null);

export interface MatchmakerProviderProps extends React.PropsWithChildren {
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
    const stream = client.connect();

    stream.on('status', (status) => {
      console.log(status);
    });
    stream.on('data', (msg) => {
      console.log(msg);
    });
    stream.on('end', () => {
      stream.end();
    });
    stream.on('error', (err) => {
      console.error(err);
    });

    return () => client.close();
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
