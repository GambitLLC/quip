import { Server as httpServer } from 'http';
import { Server as httpsServer } from 'https';
import { Server } from 'socket.io';

export default (httpServer: httpServer | httpsServer): Server => {
  const io = new Server(httpServer, {
    serveClient: false,
    // TODO: redis adapter
  });

  io.on('connection', (socket) => {
    return;
  });

  return io;
};
