import { render, screen, waitFor } from '@testing-library/react';

// add custom jest matchers from jest-dom
import '@testing-library/jest-dom';

import {
  Matchmaker,
  MatchmakerProvider,
  useMatchmaker,
} from './react-matchmaker';

import {
  GetPlayerRequest,
  PlayerUpdate,
  QuipFrontendServer,
  QuipFrontendService,
  StartQueueRequest,
  StopQueueRequest,
} from '@quip/pb/matchmaker/frontend';

import {
  Server,
  ServerCredentials,
  ServerUnaryCall,
  ServerWritableStream,
  sendUnaryData,
} from '@grpc/grpc-js';
import { Empty } from '@quip/pb/google/protobuf/empty';
import {
  MatchAssignment,
  Player,
  PlayerState,
  QueueAssignment,
} from '@quip/pb/matchmaker/messages';
import React from 'react';
import { randomUUID } from 'crypto';

type MockUnaryRPC<Request, Response> = jest.Mock<
  void,
  [ServerUnaryCall<Request, Response>, sendUnaryData<Response>]
>;

interface mockQuipFrontendServer {
  // start begins listening port and returns the port
  start: () => Promise<number>;

  // stop gracefully stops the grpc server
  stop: (callback: (error?: Error) => void) => void;

  // Mock methods of QuipFrontendServer
  connect: jest.Mock<void, [ServerWritableStream<Empty, PlayerUpdate>]>;
  getPlayer: MockUnaryRPC<GetPlayerRequest, Player>;
  startQueue: MockUnaryRPC<StartQueueRequest, Empty>;
  stopQueue: MockUnaryRPC<StopQueueRequest, Empty>;
}

let cleanupFns: ((cb: (err?: Error) => void) => void)[] = [];

function mockFrontendServer(): mockQuipFrontendServer {
  const server = new Server();

  const mock: mockQuipFrontendServer = {
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
    stop: (cb: (err?: Error) => void) => server.tryShutdown(cb),
    connect: jest.fn((call) => {
      return;
    }),
    getPlayer: jest.fn((call, cb) => {
      cb(null, Player.create());
    }),
    startQueue: jest.fn((call, cb) => {
      cb(null, Empty.create());
    }),
    stopQueue: jest.fn((call, cb) => {
      cb(null, Empty.create());
    }),
  };

  const impl: QuipFrontendServer = {
    connect: mock.connect,
    getPlayer: mock.getPlayer,
    startQueue: mock.startQueue,
    stopQueue: mock.stopQueue,
  };
  server.addService(QuipFrontendService, impl);

  return mock;
}

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
  it('should automatically connect to QuipFrontendServer', async () => {
    const server = mockFrontendServer();
    const port = await server.start();

    render(<MatchmakerProvider address={`localhost:${port}`} authToken="" />);
    await waitFor(() => expect(server.connect).toHaveBeenCalled());
  });

  it('should connect with credentials from AuthProvider', async () => {
    const server = mockFrontendServer();
    const auth = new Promise<string>((resolve, reject) => {
      server.connect.mockImplementation((call) => {
        const val = call.metadata.get('Authorization');
        if (val.length < 1) return reject('Authorization metadata not found');
        resolve(val[0].toString());
      });
    });

    const port = await server.start();

    const token = randomUUID();

    render(
      <MatchmakerProvider address={`localhost:${port}`} authToken={token} />
    );

    expect(await auth).toStrictEqual(token);

    // TODO: validate token matches expected token provided by AuthProvider
  });

  it('should not connect multiple times on rerender', async () => {
    const server = mockFrontendServer();
    const port = await server.start();

    const wrapper = ({ children }: { children: React.ReactElement }) => (
      <MatchmakerProvider address={`localhost:${port}`} authToken="">
        {children}
      </MatchmakerProvider>
    );

    const { rerender } = render(<div />, { wrapper });
    for (let i = 0; i < 10; i++) rerender(<p>{i}</p>);

    await waitFor(() => expect(server.connect).toHaveBeenCalledTimes(1));
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
      <MatchmakerProvider address={`localhost:${port}`} authToken="">
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
      <MatchmakerProvider authToken="">
        <TestComponent></TestComponent>
      </MatchmakerProvider>
    );
    expect(baseElement).toBeTruthy();
    expect(screen.getByText('Renders')).toBeVisible();
  });

  it('should have error set', async () => {
    const server = mockFrontendServer();
    server.connect.mockImplementation((call) => {
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
      rerender(ui);
      expect(mm?.error).toBeTruthy();
    });
  });

  it('should update status', async () => {
    const server = mockFrontendServer();
    const connected = new Promise<(state: PlayerState) => void>((resolve) => {
      server.connect.mockImplementation((c) => {
        resolve((state) => {
          c.write(
            PlayerUpdate.fromJSON({
              player: {
                state,
              },
            })
          );
        });
      });
    });

    const port = await server.start();

    let mm = {} as Matchmaker;
    const ui = (
      <WatchMatchmaker
        port={port}
        cb={(m: Matchmaker) => {
          mm = m;
        }}
      />
    );
    const { rerender } = render(ui);

    const sendState = await connected;

    sendState(PlayerState.OFFLINE);
    await waitFor(() => {
      rerender(ui);
      expect(mm?.status).toEqual('offline');
    });

    sendState(PlayerState.IDLE);
    await waitFor(() => {
      rerender(ui);
      expect(mm?.status).toEqual('idle');
    });

    sendState(PlayerState.ONLINE);
    await waitFor(() => {
      rerender(ui);
      expect(mm?.status).toEqual('online');
    });

    sendState(PlayerState.SEARCHING);
    await waitFor(() => {
      rerender(ui);
      expect(mm?.status).toEqual('searching');
    });

    sendState(PlayerState.PLAYING);
    await waitFor(() => {
      rerender(ui);
      expect(mm?.status).toEqual('playing');
    });
  });

  it('should update queueAssignment and matchAssignment', async () => {
    const server = mockFrontendServer();
    const connected = new Promise<
      (queue?: QueueAssignment, match?: MatchAssignment) => void
    >((resolve) => {
      server.connect.mockImplementation((c) => {
        resolve((queue, match) => {
          c.write(
            PlayerUpdate.fromJSON({
              player: {
                queueAssignment: queue,
                matchAssignment: match,
              },
            })
          );
        });
      });
    });

    const port = await server.start();

    let mm = {} as Matchmaker;
    const ui = (
      <WatchMatchmaker
        port={port}
        cb={(m: Matchmaker) => {
          mm = m;
        }}
      />
    );
    const { rerender } = render(ui);

    const sendAssignment = await connected;

    const qa = QueueAssignment.create({
      id: randomUUID(),
      startTime: new Date(),
    });

    sendAssignment(qa, undefined);
    await waitFor(() => {
      rerender(ui);
      expect(mm?.queueAssignment).toStrictEqual(qa);
      expect(mm?.matchAssignment).toBeUndefined();
    });

    const ma = MatchAssignment.create({
      id: randomUUID(),
    });

    sendAssignment(undefined, ma);
    await waitFor(() => {
      rerender(ui);
      expect(mm?.queueAssignment).toBeUndefined();
      expect(mm?.matchAssignment).toStrictEqual(ma);
    });
  });

  it('should call grpc methods on the server', async () => {
    const server = mockFrontendServer();
    const port = await server.start();

    let mm = {} as Matchmaker;

    const ui = (
      <WatchMatchmaker
        port={port}
        cb={(m: Matchmaker) => {
          mm = m;
        }}
      />
    );
    render(ui);

    // wait for matchmaker to be set by context
    await waitFor(() => {
      expect(mm.getPlayer).toBeTruthy();
    });

    await mm?.getPlayer();
    expect(server.getPlayer).toBeCalled();

    await mm?.startQueue(StartQueueRequest.create());
    expect(server.startQueue).toBeCalled();

    await mm?.stopQueue();
    expect(server.stopQueue).toBeCalled();
  });
});
