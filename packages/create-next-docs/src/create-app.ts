import path from 'node:path';
import fs from 'node:fs/promises';
import pkg from '../package.json';
import type { PackageManager } from './auto-install';
import { autoInstall } from './auto-install';
import { sourceDir, cwd } from './constants';

export type Template = 'contentlayer' | 'next-docs-mdx';

export interface Options {
  outputDir: string;
  template: Template;
  tailwindcss: boolean;
  installDeps: boolean;
  packageManager: PackageManager;
}

export async function create(options: Options): Promise<void> {
  const projectName = path.basename(options.outputDir);
  const dest = path.resolve(cwd, options.outputDir);
  await copy(path.join(sourceDir, `template/${options.template}`), dest);
  await copy(
    path.join(sourceDir, 'static/content'),
    path.join(dest, 'content/docs'),
  );

  if (options.tailwindcss) {
    await copy(path.join(sourceDir, `template/+tailwindcss`), dest);
  }

  const packageJson = createPackageJson(projectName, options);
  await fs.writeFile(path.join(dest, 'package.json'), packageJson);

  const readMe = await getReadme(projectName);

  await fs.writeFile(path.join(dest, 'README.md'), readMe);

  await fs.copyFile(
    path.join(sourceDir, 'static/example.gitignore'),
    path.join(dest, '.gitignore'),
  );

  if (options.installDeps) {
    await autoInstall(options.packageManager, dest);
  }
}

async function getReadme(projectName: string): Promise<string> {
  const template = await fs
    .readFile(path.join(sourceDir, 'static/README.md'))
    .then((res) => res.toString());

  return `# ${projectName}\n\n${template}`;
}

async function copy(
  from: string,
  to: string,
  rename: (s: string) => string = (s) => s,
): Promise<void> {
  const stats = await fs.stat(from);

  if (stats.isDirectory()) {
    const files = await fs.readdir(from);

    await Promise.all(
      files.map((file) =>
        copy(path.join(from, file), path.join(to, rename(file))),
      ),
    );
  } else {
    await fs.mkdir(path.dirname(to), { recursive: true });
    await fs.copyFile(from, to);
  }
}

function createPackageJson(
  projectName: string,
  { template, tailwindcss }: Options,
): string {
  const version = pkg.version;

  const packageJson = {
    name: projectName,
    version: '0.0.0',
    private: true,
    scripts: {
      build: 'next build',
      dev: 'next dev',
      start: 'next start',
    },
    dependencies: {
      next: '14.0.4',
      'next-docs-ui': version,
      'next-docs-zeta': version,
      react: '18.2.0',
      'react-dom': '18.2.0',
    },
    devDependencies: {
      '@types/react': '18.2.0',
      '@types/react-dom': '18.2.1',
      typescript: '5.3.3',
    },
  };

  if (template === 'contentlayer') {
    Object.assign(packageJson.dependencies, {
      contentlayer: '0.3.4',
      'next-contentlayer': '0.3.4',
    });

    // TODO: Remove this after Contentlayer supports unified 11
    Object.assign(packageJson, {
      overrides: {
        unified: '^11.0.4',
        'mdx-bundler': '^10.0.1',
      },
    });
  }

  if (template === 'next-docs-mdx') {
    Object.assign(packageJson.dependencies, {
      'next-docs-mdx': version,
    });
  }

  if (tailwindcss) {
    Object.assign(packageJson.devDependencies, {
      autoprefixer: '10.4.16',
      postcss: '8.4.32',
      tailwindcss: '3.3.7',
    });
  }

  return JSON.stringify(packageJson, undefined, 2);
}
