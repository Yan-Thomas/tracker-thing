import { existsSync, rmSync } from 'node:fs';
import os from 'node:os';
import { join, resolve } from 'node:path';
import { simpleGit } from 'simple-git';
import { error, info } from '../cli/console.js';
import type { LunariaConfig } from '../config/index.js';

export const git = simpleGit({
	maxConcurrentProcesses: Math.max(2, Math.min(32, os.cpus().length)),
});

/** Creates a clone of the git history to be used on platforms
 * that only allow shallow repositories (e.g. Vercel) and returns
 * `true` if it's running on a shallow repository.
 */
export async function handleShallowRepo({ cloneDir, repository }: LunariaConfig) {
	const gitHostingLinks = getGitHostingLinks(repository);
	const isShallowRepo = (await git.revparse(['--is-shallow-repository'])) === 'true';

	if (isShallowRepo) {
		console.log(
			info(
				"Shallow repository detected. A clone of your repository's history will be downloaded and used. "
			)
		);

		const target = resolve(cloneDir);

		if (existsSync(target)) rmSync(target, { recursive: true, force: true });

		await git.clone(gitHostingLinks.clone(), target, ['--bare', '--filter=blob:none']);
		// Use the clone as the git directory for all tasks
		await git.cwd({ path: target, root: true });
	}

	return isShallowRepo;
}

export async function getFileHistory(path: string) {
	try {
		const log = await git.log({
			file: path,
			strictDate: true,
		});

		return {
			latest: log.latest,
			all: log.all,
		};
	} catch (e) {
		console.error(error('Failed to find commits. Have you made any commits in your branch yet?'));
		process.exit(1);
	}
}

export function getGitHostingLinks(repository: LunariaConfig['repository']) {
	const { name, branch, hosting, rootDir } = repository;

	switch (hosting) {
		case 'github':
			return {
				create: (filePath: string) =>
					`https://github.com/${name}/new/${branch}?filename=${join(rootDir, filePath)}`,
				source: (filePath: string) =>
					`https://github.com/${name}/blob/${branch}/${join(rootDir, filePath)}`,
				history: (filePath: string, sinceDate?: string) =>
					`https://github.com/${name}/commits/${branch}/${join(rootDir, filePath)}${
						sinceDate ? `?since=${sinceDate}` : ''
					}`,
				clone: () => `https://github.com/${name}.git`,
			};

		case 'gitlab':
			return {
				create: (filePath: string) =>
					`https://gitlab.com/${name}/-/new/${branch}?file_name=${join(rootDir, filePath)}`,
				source: (filePath: string) =>
					`https://gitlab.com/${name}/-/blob/${branch}/${join(rootDir, filePath)}`,
				history: (filePath: string, sinceDate?: string) =>
					`https://gitlab.com/${name}/-/commits/${branch}/${join(rootDir, filePath)}${
						sinceDate ? `?since=${sinceDate}` : ''
					}`,
				clone: () => `https://gitlab.com/${name}.git`,
			};
	}
}
