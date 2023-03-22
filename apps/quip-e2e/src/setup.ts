process.env.ALLOW_CONFIG_MUTATIONS = 'true';
process.env.NODE_CONFIG_ENV = 'e2e';

import { join } from 'path';
import { spawn } from 'child_process';
import { startServer } from './auth';

module.exports = async function (globalConfig, projectConfig) {
  // spin up authServer first as it modifies config
  const authServer = await startServer();

  // spin up background procs which also modify config
  const backgroundProcs = spawn('go', [
    'run',
    join(process.cwd(), 'apps/quip-e2e/setup.go'),
  ]);

  // wait some time for background procs to modify config
  await new Promise((resolve) => setTimeout(resolve, 500));

  const socketServerProc = spawn(
    'node',
    [join(process.cwd(), 'dist/apps/socket-server')],
    {
      // stdio: [process.stdin, process.stdout, process.stderr],
    }
  );

  const matchmakerProc = spawn(
    join(process.cwd(), 'dist/apps/matchmaker-frontend'),
    {
      stdio: [process.stdin, process.stdout, process.stderr],
    }
  );

  // TODO: launch matchfunction, director, and minimatch?

  globalThis.__CMDS__ = [
    authServer,
    socketServerProc,
    backgroundProcs,
    matchmakerProc,
  ];
};
