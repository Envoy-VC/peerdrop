import commonPrettierOptions from '@envoy1084/style-guide/prettier';

/** @type {import('prettier').Config} */
const config = {
  ...commonPrettierOptions,
  plugins: [...commonPrettierOptions.plugins],
  importOrderParserPlugins: ['typescript', 'decorators'],
};

// eslint-disable-next-line import/no-default-export -- safes
export default config;
