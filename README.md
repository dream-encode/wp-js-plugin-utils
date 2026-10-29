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
| `@dream-encode/wp-js-plugin-utils/debug`            | Shared debug log and its taps (`?debug=1`).            |
| `@dream-encode/wp-js-plugin-utils/debug/overlay`    | `DebugOverlay`, `mountDebugOverlay`. Load lazily.      |
| `@dream-encode/wp-js-plugin-utils/process-status`   | Background process status widget and polling hook.     |
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

## Debug overlay

A floating panel that logs `@wordpress/data` actions, `apiFetch` requests and event bus
emits as they happen. It shows only when the page URL has `debug=1` and the plugin allows
the current user.

The log lives on `window.dreamEncodeDebug` and is shared by every plugin on the page, so
several plugins can feed one timeline and one overlay shows all of it. Every tap checks
whether the log is active each time it runs, so they can stay wired in permanently.

**1. Gate it on the server.** Localize a capability check for the page:

```php
'DEBUG_ALLOWED' => current_user_can( 'manage_woocommerce' ),
```

**2. Activate it and register the request middleware,** first thing in the entry script:

```js
import { activateDebug, installApiFetchDebug } from '@dream-encode/wp-js-plugin-utils/debug'

const DEBUG_ENABLED = activateDebug( { allowed: true === MY_PLUGIN.DEBUG_ALLOWED } )

if ( DEBUG_ENABLED ) {
	installApiFetchDebug()
}
```

**3. Add the taps.**

```js
import { logDebugEvent, withDebugInitiator, withDebugLog } from '@dream-encode/wp-js-plugin-utils/debug'

export const store = createReduxStore( 'my-store', {
	reducer: withDebugLog( 'my-store', reducer ),
	actions,
	selectors
} )

emit: ( event, payload ) => {
	logDebugEvent( event, payload, { listeners: emitter.listenerCount( event ), source: 'my-plugin' } )

	return emitter.emit( event, payload )
}

const terms = await withDebugInitiator( 'ProductTerms', () => apiGetTerms() )
```

`withDebugInitiator` labels requests started before the function first awaits, which covers
an async loader that calls an `api*` helper straight away.

**4. Render the overlay,** loaded lazily so pages without the flag never download it:

```jsx
import { Suspense, lazy } from '@wordpress/element'

const DebugOverlay = DEBUG_ENABLED ? lazy( () => import( '@dream-encode/wp-js-plugin-utils/debug/overlay' ) ) : null

{ DebugOverlay && (
	<Suspense fallback={ null }>
		<DebugOverlay
			title="My Plugin Debug"
			pathAliases={ { 'my-plugin/v1': 'mp/v1' } }
			panels={ [ { key: 'mine', title: 'Mine', render: () => <MyPanel /> } ] }
		/>
	</Suspense>
) }
```

Render it inside the page's `Modal` when there is one: the modal keeps keyboard focus inside
itself and hides everything else from assistive technology. A page with no React tree of its
own can call `mountDebugOverlay( props )` instead.

Built-in tabs are Timeline, Requests and State. `panels` adds tabs after them; a panel can
use the overlay classes `de-debug-sec`, `de-debug-h`, `de-debug-kv`, `de-debug-list` and
`de-debug-badge` (`is-ok`, `is-pending`, `is-err`) to match.

## Process status

Shows the Max Marine Background Processor processes a page starts, on that page. It reads
`max-marine/v1/background-processor/background-processes/status`, so it needs the
Background Processor plugin and a user with `manage_options`.

```jsx
import { getProcessStatusReadout, ProcessStatus, useProcessStatus } from '@dream-encode/wp-js-plugin-utils/process-status'

const PROCESSORS = [ 'elastic_search_product_index_processor' ]

const productIndex = useProcessStatus( { processors: PROCESSORS } )

<Button disabled={ productIndex.isActive } onClick={ () => bulkIndex().then( productIndex.refresh ) }>

<ProcessStatus
	processors={ PROCESSORS }
	title="Product index processes"
	unit="products"
	textDomain={ TEXT_DOMAIN }
/>

<RailSettingsPage
	status={ [ getLogLevelStatus( logLevel ), getProcessStatusReadout( productIndex.activeProcesses ) ] }
/>
```

`variant="inline"` shows one process under the button that starts it. `history` sets how
many finished processes to keep for each processor (default 1). `getLabel` and `getTags`
take a process and return a label or a list of tags, and `unit` can be a function of the
process. `onComplete` is called with a process when one finishes while the page is open.

Every hook and widget asking for the same processors shares one poller. Call `refresh()`
after starting a process, because the Background Processor schedules processes through an
action that returns no process ID. A page rendered in PHP uses the Background Processor
helper `max_marine_background_processor_render_process_status()` instead.
