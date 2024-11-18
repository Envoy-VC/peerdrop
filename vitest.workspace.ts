import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
	'./packages/schema/vitest.config.ts',
	'./packages/template/vitest.config.ts',
	'./packages/react-wrapper/vitest.config.ts',
]);
