import { createServer } from 'http';
import socketListener from './socket';

const httpServer = createServer();
socketListener(httpServer);

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
