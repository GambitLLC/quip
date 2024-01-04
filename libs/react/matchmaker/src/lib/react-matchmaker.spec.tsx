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
  Request,
  Response,
  QuipFrontendServer,
  QuipFrontendService,
} from '@quip/pb/matchmaker/frontend';

import { Server, ServerCredentials, ServerDuplexStream } from '@grpc/grpc-js';
import React from 'react';

interface mockQuipFrontendServer {
  // start begins listening port and returns the port
  start: () => Promise<number>;

  // stop gracefully stops the grpc server
  stop: (callback: (error?: Error) => void) => void;

  /**
   * connect is a mock of QuipFrontendServer's connect method
   */
  connect: jest.Mock<void, [ServerDuplexStream<Request, Response>]>;
}

function mockFrontendServer(): mockQuipFrontendServer {
  const server = new Server();

  const connect = jest.fn(
    (call: ServerDuplexStream<Request, Response>): void => {
      // TODO: add callbacks to send status update as desired
      call.write({
        statusUpdate: {
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

  const impl: QuipFrontendServer = {
    connect,
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
