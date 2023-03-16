import { join } from 'path';
import { spawn } from 'child_process';

module.exports = async function (globalConfig, projectConfig) {
  const socketServerProc = spawn('node', [
    join(process.cwd(), 'dist/apps/socket-server'),
  ]);
  const miniredisProc = spawn('go', [
    'run',
    join(process.cwd(), 'apps/quip-e2e/setup.go'),
  ]);

  globalThis.__CMDS__ = [socketServerProc, miniredisProc];
};
