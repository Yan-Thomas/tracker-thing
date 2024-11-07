import { z } from 'zod';
import { BaseLunariaConfigSchema, FileSchema, LocaleSchema } from '../config/schema.js';

export const LunariaPreSetupSchema = BaseLunariaConfigSchema.extend({
	sourceLocale: LocaleSchema.optional(),
	locales: z.array(LocaleSchema).nonempty().optional(),
	files: z.array(FileSchema).nonempty().optional(),
});
