import { createServer } from 'http';
import { wrapServer } from '@quip/sockets';
import config from 'config';

const httpServer = createServer();
wrapServer(config, httpServer);

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
