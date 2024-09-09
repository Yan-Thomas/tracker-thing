import type { EntryFileType, File } from '../config/types.js';

export type Dictionary = {
	[k: string]: string | Dictionary;
};

type FileGitData = {
	latestChange: {
		message: string;
		date: string;
		hash: string;
	};
	latestTrackedChange: {
		message: string;
		date: string;
		hash: string;
	};
};

type MissingStatus = 'missing';
type OutdatedStatus = 'outdated';
type UpToDateStatus = 'up-to-date';
type FileStatus = MissingStatus | OutdatedStatus | UpToDateStatus;

type BaseLocalizationEntry = {
	lang: string;
	path: string;
	status: FileStatus;
};

type MissingLocalizationEntry = BaseLocalizationEntry & { status: MissingStatus };

type ExistingLocalizationEntry = BaseLocalizationEntry & {
	git: FileGitData;
	status: OutdatedStatus | UpToDateStatus;
};

type DictionaryLocalizationEntry = ExistingLocalizationEntry & {
	missingKeys: string[];
};

export type StatusLocalizationEntry<T extends EntryFileType = EntryFileType> =
	| MissingLocalizationEntry
	| (T extends 'dictionary' ? DictionaryLocalizationEntry : ExistingLocalizationEntry);

// TODO: Test if the correct properties will be shown per status entry once this is implemented.
export type StatusEntry<T extends EntryFileType = EntryFileType> = File & {
	source: {
		path: string;
		lang: string;
		git: FileGitData;
	};
	localizations: StatusLocalizationEntry<T>[];
};

export type LunariaStatus = StatusEntry[];
