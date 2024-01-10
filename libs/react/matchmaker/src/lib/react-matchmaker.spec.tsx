import { render, screen, waitFor } from '@testing-library/react';

// add custom jest matchers from jest-dom
import '@testing-library/jest-dom';

import {
  Matchmaker,
  MatchmakerProvider,
  MatchmakerProviderProps,
  useMatchmaker,
} from './react-matchmaker';

import {
  PlayerUpdate,
  QuipFrontendServer,
  QuipFrontendService,
} from '@quip/pb/matchmaker/frontend';

import { Server, ServerCredentials, ServerWritableStream } from '@grpc/grpc-js';
import React from 'react';
import { Empty } from '@quip/pb/google/protobuf/empty';
import { PlayerState } from '@quip/pb/matchmaker/messages';

interface mockQuipFrontendServer {
  // start begins listening port and returns the port
  start: () => Promise<number>;

  // stop gracefully stops the grpc server
  stop: (callback: (error?: Error) => void) => void;

  // Mock methods of QuipFrontendServer
  connect: jest.Mock<void, [ServerWritableStream<Empty, PlayerUpdate>]>;
  getPlayer: jest.Mock;
  startQueue: jest.Mock;
  stopQueue: jest.Mock;
}

function mockFrontendServer(): mockQuipFrontendServer {
  const server = new Server();

  const connect = jest.fn(
    (call: ServerWritableStream<Empty, PlayerUpdate>): void => {
      // TODO: add callbacks to send status update as desired
      call.write({
        player: {
          id: 'asd',
          state: PlayerState.ONLINE,
        },
        update: {
          queueStarted: {
            id: 'asd',
            config: {
              gamemode: 'test',
            },
            startTime: new Date(),
          },
        },
      });
      return;
    }
  );

  const getPlayer = jest.fn();
  const startQueue = jest.fn();
  const stopQueue = jest.fn();

  const impl: QuipFrontendServer = {
    connect,
    getPlayer,
    startQueue,
    stopQueue,
  };
  server.addService(QuipFrontendService, impl);

  return {
    start: async () => {
      return new Promise<number>((resolve, reject) =>
        server.bindAsync(
          'localhost:0',
          ServerCredentials.createInsecure(),
          (err, port) => {
            if (err) {
              return reject(err);
            }
            server.start();
            resolve(port);
          }
        )
      );
    },
    stop: (cb) => server.tryShutdown(cb),
    connect,
    getPlayer,
    startQueue,
    stopQueue,
  };
}

describe('MatchmakerProvider', () => {
  it('should call connect on server', async () => {
    const server = mockFrontendServer();
    const port = await server.start();

    render(
      <MatchmakerProvider address={`localhost:${port}`}></MatchmakerProvider>
    );

    await waitFor(() => expect(server.connect).toHaveBeenCalled());
  });
});

describe('useMatchmaker', () => {
  function TestComponent() {
    const matchmaker = useMatchmaker();
    if (matchmaker.error) {
      return <p>Error: {matchmaker.error.message}</p>;
    }
    return <p>Status: {matchmaker.status}</p>;
  }

  it('should render successfully in MatchmakerProvider', () => {
    const { baseElement } = render(
      <MatchmakerProvider>
        <TestComponent></TestComponent>
      </MatchmakerProvider>
    );
    expect(baseElement).toBeTruthy();
  });

  it('should throw error outside of MatchmakerProvider', async () => {
    // Hide expected uncaught error message thrown by React (suggests adding ErrorBoundary)
    const spy = jest.spyOn(console, 'error').mockImplementation(() => null);

    expect(() => {
      render(<TestComponent />);
    }).toThrowError();

    spy.mockRestore();
  });

  it('should have error set', async () => {
    // Hide expected uncaught error message thrown by React (suggests adding ErrorBoundary)
    const spy = jest.spyOn(console, 'error').mockImplementation(() => null);

    const server = mockFrontendServer();
    const port = await server.start();
    server.connect.mockImplementation((call) => {
      call.emit('error', new Error('some error'));
    });

    const wrapper = ({ children }: React.PropsWithChildren) => (
      <MatchmakerProvider address={`localhost:${port}`}>
        {children}
      </MatchmakerProvider>
    );

    const { rerender } = render(<TestComponent />, { wrapper });

    await waitFor(() => {
      rerender(<TestComponent />);
      expect(screen.getByText(/^Error:/)).toBeVisible();
    });

    spy.mockRestore();
  });
});
