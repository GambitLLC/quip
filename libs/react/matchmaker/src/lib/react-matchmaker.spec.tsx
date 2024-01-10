import { cleanup, render, screen, waitFor } from '@testing-library/react';

// add custom jest matchers from jest-dom
import '@testing-library/jest-dom';

import {
  Matchmaker,
  MatchmakerProvider,
  useMatchmaker,
} from './react-matchmaker';

import {
  PlayerUpdate,
  QuipFrontendServer,
  QuipFrontendService,
} from '@quip/pb/matchmaker/frontend';

import { Server, ServerCredentials, ServerWritableStream } from '@grpc/grpc-js';
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

let cleanupFns: ((cb: (err?: Error) => void) => void)[] = [];

function mockFrontendServer(): mockQuipFrontendServer {
  const server = new Server();

  const connect = jest.fn(
    (call: ServerWritableStream<Empty, PlayerUpdate>): void => {
      console.log('original mock');
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
            cleanupFns.push((cb: (error?: Error) => void) => {
              server.tryShutdown(cb);
            });
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

// cleanup any mounted React trees
afterEach(cleanup);

afterAll(() => {
  const promise = Promise.all(
    cleanupFns.map(
      (cleanup) =>
        new Promise<void>((resolve, reject) => {
          cleanup((err) => {
            if (err) {
              return reject(err);
            }
            resolve();
          });
        })
    )
  );
  cleanupFns = [];

  return promise;
});

describe('MatchmakerProvider', () => {
  it('should call connect on server', async () => {
    const server = mockFrontendServer();
    const port = await server.start();

    function TestComponent() {
      useMatchmaker();
      return <div />;
    }
    render(
      <MatchmakerProvider address={`localhost:${port}`}>
        <TestComponent></TestComponent>
      </MatchmakerProvider>
    );

    await waitFor(() => expect(server.connect).toHaveBeenCalled());

    cleanup();
  });
});

describe('useMatchmaker', () => {
  function WatchMatchmaker({
    port,
    cb,
  }: {
    port: number;
    cb: (mm: Matchmaker) => void;
  }) {
    function Consumer() {
      const mm = useMatchmaker();
      cb(mm);
      return <p>{mm.status}</p>;
    }

    const ui = (
      <MatchmakerProvider address={`localhost:${port}`}>
        <Consumer />
      </MatchmakerProvider>
    );

    return ui;
  }

  it('should throw error outside of MatchmakerProvider', async () => {
    // Hide expected uncaught error message thrown by React (suggests adding ErrorBoundary)
    const spy = jest.spyOn(console, 'error').mockImplementation(() => null);

    function TestComponent() {
      useMatchmaker();
      return <div />;
    }

    expect(() => {
      render(<TestComponent />);
    }).toThrowError();

    spy.mockRestore();
  });

  it('should render successfully in MatchmakerProvider', () => {
    function TestComponent() {
      useMatchmaker();
      return <p>Renders</p>;
    }

    const { baseElement } = render(
      <MatchmakerProvider>
        <TestComponent></TestComponent>
      </MatchmakerProvider>
    );
    expect(baseElement).toBeTruthy();
    expect(screen.getByText('Renders')).toBeVisible();
  });

  it.only('should have error set', async () => {
    // Hide expected uncaught error message thrown by React (suggests adding ErrorBoundary)
    const spy = jest.spyOn(console, 'error').mockImplementation(() => null);

    const server = mockFrontendServer();
    server.connect.mockImplementation((call) => {
      // TODO: fix Jest ReferenceError
      call.emit('error', new Error('some error'));
      return;
    });
    const port = await server.start();

    let mm: Matchmaker | null = null;

    const ui = (
      <WatchMatchmaker
        port={port}
        cb={(m: Matchmaker) => {
          mm = m;
        }}
      />
    );
    const { rerender } = render(ui);

    await waitFor(() => {
      expect(server.connect).toBeCalled();
      rerender(ui);
      expect(mm?.error).toBeTruthy();
    });

    spy.mockRestore();
  });
});
