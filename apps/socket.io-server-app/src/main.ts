import { createServer } from 'http';
import { wrapServer } from '@quip/socket.io-server';

const httpServer = createServer();
wrapServer(httpServer);

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
