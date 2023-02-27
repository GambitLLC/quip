import { createServer } from 'http';
import { AddressInfo } from 'net';
import { Server, Socket as ServerSocket } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import socketListener from './socket';

describe('socket listener', () => {
  let io: Server, serverSocket: ServerSocket, clientSocket: ClientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = socketListener(httpServer);

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

  test('should receive arbitrary event and argument', (done) => {
    const event = 'some event name',
      argument = 'some argument';

    clientSocket.on(event, (arg) => {
      expect(arg).toBe(argument);
      done();
    });
    serverSocket.emit(event, argument);
  });
});
