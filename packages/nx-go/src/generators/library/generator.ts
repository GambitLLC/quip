import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  names,
  Tree,
} from '@nx/devkit';
import * as path from 'path';
import { LibraryGeneratorSchema } from './schema';

export async function libraryGenerator(
  tree: Tree,
  options: LibraryGeneratorSchema
) {
  const projectDirectory = options.directory || 'internal';
  const projectRoot = `${projectDirectory}/${options.name}`;
  addProjectConfiguration(tree, options.name, {
    root: projectRoot,
    projectType: 'library',
    sourceRoot: projectRoot,
    targets: {
      lint: {
        executor: '@quip/nx-go:lint',
      },
    },
  });
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    packageName: names(options.name).fileName.split('-').join('_'),
    template: '',
  });
  await formatFiles(tree);
}

export default libraryGenerator;
