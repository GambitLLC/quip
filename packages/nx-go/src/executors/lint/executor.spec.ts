jest.mock('child_process');

import { LintExecutorSchema } from './schema';
import executor from './executor';
import { ExecutorContext } from '@nx/devkit';

const options: LintExecutorSchema = {};

describe('Lint Executor', () => {
  afterEach(() => jest.clearAllMocks());

  it('can run', async () => {
    const output = await executor(options, { cwd: '' } as ExecutorContext);
    expect(output.success).toBe(true);
  });
});
