import { render, screen, waitFor } from '@testing-library/react';

// add custom jest matchers from jest-dom
import '@testing-library/jest-dom';

import {
  Matchmaker,
  MatchmakerProvider,
  useMatchmaker,
} from './react-matchmaker';

import {
  Request,
  Response,
  QuipFrontendServer,
  QuipFrontendService,
} from '@quip/pb/matchmaker/frontend';

import { Server, ServerCredentials, ServerDuplexStream } from '@grpc/grpc-js';

interface mockFrontendServer {
  start: () => Promise<number>;
  stop: (callback: (error?: Error) => void) => void;

  connect: jest.Mock;
}

function mockFrontendServer(): mockFrontendServer {
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
  const mock: QuipFrontendServer = {
    connect,
  };
  server.addService(QuipFrontendService, mock);

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

    await waitFor(() => expect(server.connect.mock.calls).toHaveLength(1));
  });
});

describe('useMatchmaker', () => {
  function TestComponent() {
    const matchmaker = useMatchmaker();
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
    jest.spyOn(console, 'error').mockImplementation(() => null);

    expect(() => {
      render(<TestComponent />);
    }).toThrowError();
  });
});
