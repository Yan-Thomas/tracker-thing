import jiti from 'jiti';
import { resolve } from 'node:path';
import { error, highlight } from './cli/console.js';

export function toUtcString(date: string) {
	return new Date(date).toISOString();
}

export function getStringFromFormat(
	format: string,
	placeholders: {
		[part: string]: string;
	}
) {
	let formatResult = format;
	Object.keys(placeholders).forEach((key) => {
		formatResult = formatResult.replace(key, placeholders[key] ?? '');
	});
	return formatResult;
}

/** TODO: Use `jiti.import` instead when available. */
export function loadWithJiti(path: string) {
	// @ts-expect-error
	const loadFile = jiti(process.cwd(), {
		interopDefault: true,
		esmResolve: true,
	});

	try {
		const resolvedPath = resolve(path);
		const file = loadFile(resolvedPath);

		return file;
	} catch (e) {
		console.error(error(`Failed to load module at ${highlight(path)}\n`));
		throw e;
	}
}

export function isRelative(path: string) {
	return path.startsWith('./') || path.startsWith('../');
}

export function removeTrailingSlash(path: string) {
	return path.replace(/\/+$/, '');
}
