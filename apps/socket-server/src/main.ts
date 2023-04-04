import { createServer } from 'http';
import { Server } from '@quip/sockets';
import config from 'config';

const httpServer = createServer();
Server(config, httpServer);

const PORT = config.get('sockets.server.port');
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
