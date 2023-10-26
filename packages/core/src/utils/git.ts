import fs from 'fs';
import os from 'os';
import { join, resolve } from 'path';
import { simpleGit } from 'simple-git';
import { GitHostingUrl } from '../types';
import { TrackerThingConfig } from './config';

const git = simpleGit({
	maxConcurrentProcesses: Math.max(2, Math.min(32, os.cpus().length)),
});

/** Creates a clone of the git history to be used on platforms
 * that only allow shallow repositores (e.g. Vercel) and returns
 * `true` if it's running on a shallow repository.
 */
export async function handleShallowRepo({ cloneDir, repository }: TrackerThingConfig) {
	const isShallowRepo = await git.revparse(['--is-shallow-repository']);
	if (isShallowRepo === 'true') {
		console.info(
			'A shallow repository was detected: a clone of your repository will be downloaded and used instead.'
		);

		const target = resolve(cloneDir);

		if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });

		const remote = `${repository}.git`;

		await git.clone(remote, target, ['--bare', '--filter=blob:none']);
		// Use the clone as the git directory for all tasks
		await git.cwd({ path: target, root: true });
	}
	return isShallowRepo === 'true';
}

export async function getPageHistory(filePath: string) {
	const log = await git.log({
		file: filePath,
		strictDate: true,
	});

	return {
		latest: log.latest,
		all: log.all,
	};
}

/* TODO: Looks like we aren't getting a URL with proper '//' in the https:// part, although the link works anyway. Gotta investigate. */
export function getGitHostingUrl({
	type = 'blob',
	refName = 'main',
	query = '',
	repository,
	rootDir,
	filePath,
}: GitHostingUrl) {
	return (join(repository, type, refName, rootDir, filePath) + query).replaceAll('\\', '/');
}