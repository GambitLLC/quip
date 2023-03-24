process.env.ALLOW_CONFIG_MUTATIONS = 'true';
process.env.NODE_CONFIG_ENV = 'e2e';

import { join } from 'path';
import { execSync, spawn } from 'child_process';
import { startServer } from './auth';

module.exports = async function (globalConfig, projectConfig) {
  // spin up authServer first as it modifies config
  const authServer = await startServer();

  // spin up background procs which also modify config
  const backgroundProcs = spawn(join(process.cwd(), `dist/apps/e2e-setup`), {
    stdio: [process.stdin, process.stdout, process.stderr],
  });

  try {
    // wait for validator to confirm config values have been set
    execSync(join(process.cwd(), 'dist/apps/e2e-validate'));
  } catch (err) {
    // make sure to end background procs if validate fails
    authServer.kill();
    backgroundProcs.kill();
    throw err;
  }

  const socketServerProc = spawn(
    'node',
    [join(process.cwd(), 'dist/apps/socket-server')],
    {
      stdio: [process.stdin, process.stdout, process.stderr],
    }
  );

  // launch all matchmaker processes
  // TODO: launch minimatch?
  const apps = ['matchmaker-frontend', 'matchfunction', 'director'];
  const procs = apps.map((app) =>
    spawn(join(process.cwd(), `dist/apps/${app}`), {
      stdio: [process.stdin, process.stdout, process.stderr],
    })
  );

  globalThis.__CMDS__ = [
    authServer,
    socketServerProc,
    backgroundProcs,
    ...procs,
  ];
};
