/* eslint-disable eslint-comments/disable-enable-pair -- safe  */

/* eslint-disable @typescript-eslint/no-unsafe-member-access -- safe  */

/* eslint-disable @typescript-eslint/ban-ts-comment  -- safe */

/* eslint-disable @typescript-eslint/no-unsafe-assignment  -- safe */
// @ts-nocheck -- safe don't check
import commonPrettierOptions from '@envoy1084/style-guide/prettier/next';

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  ...commonPrettierOptions,
  plugins: [...commonPrettierOptions.plugins, 'prettier-plugin-tailwindcss'],
};

// eslint-disable-next-line import/no-default-export -- safe
export default config;
