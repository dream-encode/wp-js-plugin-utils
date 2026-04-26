# @dream-encode/wp-plugin-utils

Common JS functionality used by custom WP plugins.

## Install

```bash
yarn add @dream-encode/wp-plugin-utils
```

The package declares `@wordpress/*`, `react`, `webpack`, and the related
loaders/plugins as peer dependencies. Plugins consuming this package are
expected to provide their own versions.

## Subpath exports

| Import path                                         | Description                                            |
| --------------------------------------------------- | ------------------------------------------------------ |
| `@dream-encode/wp-plugin-utils`                     | All modules grouped under namespaces.                  |
| `@dream-encode/wp-plugin-utils/webpack`             | `createWebpackConfig` factory (CommonJS).              |
| `@dream-encode/wp-plugin-utils/postcss`             | Default PostCSS config (CommonJS).                     |
| `@dream-encode/wp-plugin-utils/settings`            | `createUseSettings`, `AdminSettingsPage`.              |
| `@dream-encode/wp-plugin-utils/settings/styles`     | SCSS partial with the settings-page styles mixin.      |
| `@dream-encode/wp-plugin-utils/data-migrations`     | Registry helpers for the Data Migrations plugin.       |
| `@dream-encode/wp-plugin-utils/components`          | Shared components (`Notices`).                         |
| `@dream-encode/wp-plugin-utils/hooks`               | `useValueChangeEffect`, `useBlurableContent`, …        |
| `@dream-encode/wp-plugin-utils/api`                 | `fetchGetOptions`, `fetchPostOptions`.                 |
| `@dream-encode/wp-plugin-utils/utils`               | Strings, dates, time, WP url helpers.                  |
| `@dream-encode/wp-plugin-utils/constants`           | Shared constants (`LOG_LEVELS`, …).                    |

## Webpack config

```js
// webpack.config.js
const createWebpackConfig = require( '@dream-encode/wp-plugin-utils/webpack' )

module.exports = createWebpackConfig( {
	context: __dirname,
	appVersion: require( './package.json' ),
	sentry: true,
	entry: {
		'admin-settings-page': [
			'./admin/assets/src/js/admin-settings-page.js',
			'./admin/assets/src/scss/admin-settings-page.scss'
		]
	}
} )
```

## Settings hook + page shell

```jsx
import { createUseSettings, AdminSettingsPage } from '@dream-encode/wp-plugin-utils/settings'

const useSettings = createUseSettings( {
	optionName: 'my_plugin_settings',
	textDomain: 'my-plugin',
	fields: [
		{ key: 'plugin_log_level', defaultValue: 'off' },
		{ key: 'feature_flag_x', defaultValue: false }
	]
} )

const SettingsPage = () => {
	const settings = useSettings()

	return (
		<AdminSettingsPage
			title="My Plugin"
			appVersion={ APP_VERSION }
			textDomain="my-plugin"
			settings={ settings }
		>
			{ ( s ) => (
				/* Render your fields, reading from `s.pluginLogLevel`, etc. */
				null
			) }
		</AdminSettingsPage>
	)
}
```

Use the SCSS mixin to style the page:

```scss
@use "@dream-encode/wp-plugin-utils/settings/styles" as utils;

.settings_page_my-plugin-settings {
	@include utils.de-wp-plugin-utils-settings-page;
}
```

## Data Migrations registry

```js
import domReady from '@wordpress/dom-ready'
import {
	registerMigratorSettings,
	registerResultsRenderer
} from '@dream-encode/wp-plugin-utils/data-migrations'

import MyMigratorSettings from './components/MyMigratorSettings'
import MyResultsRenderer from './components/MyResultsRenderer'

domReady( () => {
	registerMigratorSettings( 'my_migrator', MyMigratorSettings )
	registerResultsRenderer( 'my_migrator', MyResultsRenderer )
} )
```
