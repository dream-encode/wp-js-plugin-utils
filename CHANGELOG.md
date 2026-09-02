# Changelog

## [NEXT_VERSION] - [UNRELEASED]
* BUG: Settings - A link to a settings section that is gated behind another setting always landed on the first section instead. `useActiveSection` read the URL hash once, as the page mounted, which is before `/wp/v2/settings` has answered and therefore before any conditional section exists to match against, so the requested key looked unknown and was discarded. The requested key is now held and adopted the moment its section appears. It is dropped as soon as the reader picks a section themselves, so a section arriving late can never pull them away from what they are already reading.

## [0.6.2] - 2026-09-01
* ENH: Settings - The rail page now says what it is doing while settings load. `/wp/v2/settings` returns every registered option on the site, so on a large install that request can take several seconds, and until now the pane rendered an empty `Placeholder` holding nothing but a spinner, which reads as a broken page rather than a loading one. The pane now shows a spinner beside "Loading settings…" instead.
* TWK: Settings - The section rail now sits 1rem in from the left edge of the screen rather than flush against the admin menu.

## [0.6.1] - 2026-09-01
* ENH: Settings - The rail stylesheet now carries the layout for an actions section: `de-settings__action` rows with a description on the left and the button on the right, sized and separated the same way in every plugin that has one. Several plugins had each rolled their own copy of this nested inside the stacked layout, where it no longer matched anything.

## [0.6.0] - 2026-09-01
* FEA: Settings - Added `RailSettingsPage`, a settings page shell built around a vertical section rail. Sections are declared as an array rather than nested as panels, and that one list drives the rail, the open pane, the unsaved markers and the deep link. Each entry takes a `key`, a `title`, and optionally a `group` heading, a `description`, a `badge` count, and a `type` of "actions". One section shows at a time in a pane that runs the full width of the screen, and a sticky header carries the title, the version, Discard and a single Save that names how many fields it will write. The open section is written to the URL hash, so a link can point at one section rather than at the top of the page. An actions section hides Save while it is open, because nothing on such a section is written by Save; edits made elsewhere stay reachable through the unsaved count, which opens the first section holding one. The rail takes an optional status readout for its foot, moves under the arrow keys as a single tab stop, and collapses to a horizontal strip below 1100px. Ships with `de-wp-plugin-utils-settings-rail` and `de-wp-plugin-utils-settings-rail-page` mixins in `settings/styles/_settings-rail.scss`. The existing stacked `AdminSettingsPage` is unchanged and still exported.
* ENH: Settings - `createUseSettings` now keeps the values it loaded, so it can report what has been edited since. It returns `isDirty`, `dirtyCount`, `dirtyFields`, `dirtySections` and `discardChanges`, and rebases that baseline after a successful save. Field definitions accept a `section` naming the settings section the field belongs to, which is what lets a rail mark an edited section that is off screen without listing every field twice. Values are compared with object keys sorted, because a value rebuilt through a spread carries the same keys in a different order and would otherwise read as an edit.
* BUG: Settings - A save whose request rejected left the page saving forever. `saveSettings` awaited `apiFetch` without catching, so a network failure or a REST error skipped the call that clears the saving state, and the Save button stayed busy and disabled with no way back except a reload. The rejection is now caught, the saving state cleared, and the error surfaced as a notice carrying the message, with the edits left in place so the save can be retried.

## [0.4.0] - 2026-04-28
* FEA: Process component.
* FEA: Progress component.

## [0.3.0] - 2026-04-28
* FEA: Notifications Drawer.

## [0.2.6] - 2026-04-27
* BUG: Remove API exports, as the fetchOptions is now dead code.

## [0.2.5] - 2026-04-26
* BUG: Webpack - Another fix.

## [0.2.4] - 2026-04-26
* BUG: Webpack - Fix sass imports.

## [0.2.3] - 2026-04-26
* BUG: Maybe fix sass.

## [0.2.2] - 2026-04-26
* BUG: Webpack - user modern API in sass loader.

## [0.2.1] - 2026-04-26
* BUG: Add lock file.

## [0.2.0] - 2026-04-26
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

## [0.1.0] - 2026-04-46
* Initial release.