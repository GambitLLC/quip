import { join } from 'path';
import { spawn } from 'child_process';
import { startServer } from './auth';
import config from 'config';

module.exports = async function (globalConfig, projectConfig) {
  // spin up auth server first because it modifies config
  const authServer = await startServer();

  const socketServerProc = spawn(
    'node',
    [join(process.cwd(), 'dist/apps/socket-server')],
    {
      // include env to update config with auth server changes
      env: {
        NODE_CONFIG: JSON.stringify(config.util.toObject()),
        ...process.env,
      },
      stdio: [process.stdin, process.stdout, process.stderr],
    }
  );
  const miniredisProc = spawn('go', [
    'run',
    join(process.cwd(), 'apps/quip-e2e/setup.go'),
  ]);

  const matchmakerProc = spawn(
    join(process.cwd(), 'dist/apps/matchmaker-app'),
    { stdio: [process.stdin, process.stdout, process.stderr] }
  );

  globalThis.__CMDS__ = [
    authServer,
    socketServerProc,
    miniredisProc,
    matchmakerProc,
  ];
};
