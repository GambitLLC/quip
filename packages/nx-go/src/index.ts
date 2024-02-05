import {
  CreateDependencies,
  CreateDependenciesContext,
  DependencyType,
  RawProjectGraphDependency,
} from '@nx/devkit';
import { execSync } from 'child_process';
import { extname } from 'path';

export const createDependencies: CreateDependencies = (
  _opts: unknown,
  context: CreateDependenciesContext
): RawProjectGraphDependency[] => {
  const projectRootsToNames = new Map();
  for (const [name, project] of Object.entries(context.projects)) {
    projectRootsToNames.set(project.root, project.name || name);
  }

  const results = [];
  const module = execSync('go list -m', {
    encoding: 'utf-8',
    cwd: context.workspaceRoot,
  }).trim();

  for (const [project, files] of Object.entries(
    context.fileMap.projectFileMap
  )) {
    for (const fileData of files) {
      if (extname(fileData.file) != '.go') continue;

      const pkgDataJson = execSync('go list -json ' + fileData.file, {
        encoding: 'utf-8',
        cwd: context.workspaceRoot,
      });
      const pkgData: GoPackageData = JSON.parse(pkgDataJson);

      const imports =
        pkgData.Imports || pkgData.TestImports || pkgData.XTestImports || [];

      results.push(
        ...imports
          .filter((target) => target.startsWith(module))
          // slice module out and forward slash
          .map((target) => target.slice(module.length + 1))
          .map((target) => projectRootsToNames.get(target))
          .filter((target) => target != undefined && target != project)
          .map((target) => ({
            source: project,
            target,
            sourceFile: fileData.file,
            // sourceFile: `${project} -> ${target}`,
            type: DependencyType.static,
          }))
      );
    }
  }

  return results;
};

interface GoPackageData {
  Module?: {
    Path?: string;
  };
  Imports?: string[];
  TestImports?: string[];
  XTestImports?: string[];
}
