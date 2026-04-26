import domReady from '@wordpress/dom-ready'

import {
	registerMigratorSettings,
	registerResultsRenderer,
	registerMigratorRenderer
} from './registry'

/**
 * Register a batch of Data Migrations extensions on `domReady`.
 *
 * @param  {Object}  registrations                       Registration map.
 * @param  {Object}  [registrations.migratorSettings]    Map of migrator key -> Component.
 * @param  {Object}  [registrations.resultsRenderers]    Map of renderer key -> Component.
 * @param  {Object}  [registrations.migratorRenderers]   Map of migrator key -> Component.
 */
const registerOnReady = ( registrations = {} ) => {
	const {
		migratorSettings = {},
		resultsRenderers = {},
		migratorRenderers = {}
	} = registrations

	domReady( () => {
		Object.entries( migratorSettings ).forEach( ( [ key, Component ] ) => {
			registerMigratorSettings( key, Component )
		} )

		Object.entries( resultsRenderers ).forEach( ( [ key, Component ] ) => {
			registerResultsRenderer( key, Component )
		} )

		Object.entries( migratorRenderers ).forEach( ( [ key, Component ] ) => {
			registerMigratorRenderer( key, Component )
		} )
	} )
}

export default registerOnReady
