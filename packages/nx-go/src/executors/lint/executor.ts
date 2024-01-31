import { execSync } from 'child_process';
import { LintExecutorSchema } from './schema';
import { ExecutorContext } from '@nx/devkit';

export default async function runExecutor(
  options: LintExecutorSchema,
  context: ExecutorContext
) {
  try {
    execSync('go fmt ./...', { cwd: context.cwd, stdio: [0, 1, 2] });
    return {
      success: true,
    };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
}
