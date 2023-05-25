process.env.ALLOW_CONFIG_MUTATIONS = 'true';
process.env.NODE_CONFIG_ENV = 'e2e';

import { join } from 'path';
import { execSync, spawn } from 'child_process';
import { createWriteStream } from 'fs';

module.exports = async function (globalConfig, projectConfig) {
  const outputStream = createWriteStream('build/e2e/stdout.log');
  const errorStream = createWriteStream('build/e2e/stderr.log');

  await Promise.all([
    new Promise((resolve) => {
      outputStream.on('open', resolve);
    }),
    new Promise((resolve) => {
      errorStream.on('open', resolve);
    }),
  ]);

  // spin up background procs which modify config
  const backgroundProcs = spawn(
    join(process.cwd(), `build/e2e/bin/e2e-setup`),
    {
      stdio: ['pipe', outputStream, errorStream],
    }
  );

  try {
    // wait for validator to confirm config values have been set
    execSync(join(process.cwd(), 'build/e2e/bin/e2e-validate'));
  } catch (err) {
    // make sure to end background procs if validate fails
    backgroundProcs.kill();
    outputStream.close();
    errorStream.close();
    throw err;
  }

  const socketServerProc = spawn(
    'node',
    [join(process.cwd(), 'dist/apps/socket-server')],
    {
      stdio: ['pipe', outputStream, errorStream],
    }
  );

  // launch minimatch
  const minimatchApps = ['minimatch', 'default-evaluator', 'synchronizer'];
  const minimatchProcs = minimatchApps.map((app) =>
    spawn(join(process.cwd(), `build/e2e/bin/${app}`), {
      cwd: join(process.cwd(), 'build/e2e/bin/'),
      stdio: ['pipe', outputStream, errorStream],
    })
  );

  // launch all matchmaker processes
  const apps = [
    'matchmaker-frontend',
    'matchmaker-backend',
    'matchfunction',
    'director',
  ];
  const procs = apps.map((app) =>
    spawn(join(process.cwd(), `dist/apps/${app}`), {
      stdio: ['pipe', outputStream, errorStream],
    })
  );

  globalThis.__CMDS__ = [
    socketServerProc,
    backgroundProcs,
    ...minimatchProcs,
    ...procs,
    {
      kill: () => {
        outputStream.close();
        errorStream.close();
      },
    },
  ];
};
