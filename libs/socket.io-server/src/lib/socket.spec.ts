import { StatusResponse } from '@quip/pb/quip-matchmaker';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { Server, Socket as ServerSocket } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import wrapServer, {
  ClientToServerEvents,
  ServerToClientEvents,
} from './socket';

describe('socket listener', () => {
  let io: Server,
    serverSocket: ServerSocket<ClientToServerEvents, ServerToClientEvents>,
    clientSocket: ClientSocket<ServerToClientEvents, ClientToServerEvents>;

  beforeAll((done) => {
    const httpServer = createServer();
    io = wrapServer(httpServer);

    httpServer.listen(() => {
      const { port } = httpServer.address() as AddressInfo;
      clientSocket = Client(`http://localhost:${port}`);
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  test('should receive status', (done) => {
    clientSocket.emit('getStatus', (resp: StatusResponse) => {
      done();
    });
  });
});
