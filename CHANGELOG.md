# Changelog

## [NEXT_VERSION] - [UNRELEASED]
* ENH: Webpack - Add `createWebpackConfig` factory abstracting the standard WP plugin webpack config.
* ENH: Webpack - Add default `postcss.config.js` exporting the `@wordpress/postcss-plugins-preset` plugins.
* ENH: Settings - Add `createUseSettings` factory hook for the WP core REST settings endpoint.
* ENH: Settings - Add reusable `AdminSettingsPage` shell component (header, loading, notices, save button).
* ENH: Settings - Add SCSS mixin `de-wp-plugin-utils-settings-page` for the standard settings page layout.
* ENH: Components - Add shared `Notices` component bound to `@wordpress/notices`.
* ENH: Hooks - Add `useValueChangeEffect`, `useBlurableContent`, and `useDebouncedValue`.
* ENH: API - Add `fetchGetOptions` and `fetchPostOptions` helpers for nonce-aware REST calls.
* ENH: Utils - Add string, time, date, and WP URL helpers (`capitalizeFirstLetter`, `secondsToDhms`, `convertTimestampToFriendlyDate`, `wpEditPostLinkFromPostId`, …).
* ENH: Constants - Add shared constants (`LOG_LEVELS`, `MIGRATION_ACTION_SCHEDULER_QUEUE_MODE`, `MIGRATION_RESULTS_PER_PAGE`, …).
* ENH: Data Migrations - Add `registerMigratorSettings`, `registerResultsRenderer`, and `registerMigratorRenderer` wrappers around the `window.maxMarineDataMigrations` registry, plus a `registerOnReady` batch helper.
* TSK: Add Babel-based build (`yarn build` -> `dist/`) and subpath exports map in `package.json`.