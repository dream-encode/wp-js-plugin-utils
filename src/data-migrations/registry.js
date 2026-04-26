/**
 * Lightweight wrappers around the global window registry exposed by
 * `max-marine-data-migrations`. Provides a typed-ish API for plugins
 * extending Data Migrations to register migrator settings UIs, custom
 * migrator renderers, and per-migrator results renderers.
 *
 * The Data Migrations plugin is responsible for initializing
 * `window.maxMarineDataMigrations` and the `register*` functions on it
 * before any consumer code runs (its admin scripts populate the slot in
 * a `domReady` handler). These helpers will no-op silently if the host
 * plugin has not been loaded.
 */

const NAMESPACE = 'maxMarineDataMigrations'

const getRegistry = () => {
	if ( typeof window === 'undefined' ) {
		return null
	}

	return window[ NAMESPACE ] || null
}

/**
 * Ensure the registry namespace and a property collection exist on `window`.
 *
 * @param  {string}  bucket  Property name to ensure on the registry.
 * @return {Object|null}
 */
const ensureRegistry = ( bucket ) => {
	if ( typeof window === 'undefined' ) {
		return null
	}

	window[ NAMESPACE ] = window[ NAMESPACE ] || {}

	if ( bucket && ! window[ NAMESPACE ][ bucket ] ) {
		window[ NAMESPACE ][ bucket ] = {}
	}

	return window[ NAMESPACE ]
}

/**
 * Register a migrator settings React component for a migrator key.
 *
 * @param  {string}    migratorKey
 * @param  {Function}  Component
 */
export const registerMigratorSettings = ( migratorKey, Component ) => {
	const registry = ensureRegistry( 'migratorSettings' )

	if ( ! registry ) {
		return
	}

	if ( typeof registry.registerMigratorSettings === 'function' ) {
		registry.registerMigratorSettings( migratorKey, Component )

		return
	}

	registry.migratorSettings[ migratorKey ] = Component
}

/**
 * Register a results renderer React component for a migrator key.
 *
 * @param  {string}    rendererKey
 * @param  {Function}  Component
 */
export const registerResultsRenderer = ( rendererKey, Component ) => {
	const registry = ensureRegistry( 'resultsRenderers' )

	if ( ! registry ) {
		return
	}

	if ( typeof registry.registerResultsRenderer === 'function' ) {
		registry.registerResultsRenderer( rendererKey, Component )

		return
	}

	registry.resultsRenderers[ rendererKey ] = Component
}

/**
 * Register a custom migrator renderer React component for a migrator key.
 *
 * @param  {string}    migratorKey
 * @param  {Function}  Component
 */
export const registerMigratorRenderer = ( migratorKey, Component ) => {
	const registry = ensureRegistry( 'migratorRenderers' )

	if ( ! registry ) {
		return
	}

	if ( typeof registry.registerMigratorRenderer === 'function' ) {
		registry.registerMigratorRenderer( migratorKey, Component )

		return
	}

	registry.migratorRenderers[ migratorKey ] = Component
}

/**
 * Get the registered settings component for a migrator, if any.
 *
 * @param  {string}  migratorKey
 * @return {Function|null}
 */
export const getMigratorSettingsComponent = ( migratorKey ) => {
	const registry = getRegistry()

	return registry?.migratorSettings?.[ migratorKey ] || null
}

/**
 * Get the registered results renderer for a migrator, if any.
 *
 * @param  {string}  rendererKey
 * @return {Function|null}
 */
export const getResultsRenderer = ( rendererKey ) => {
	const registry = getRegistry()

	return registry?.resultsRenderers?.[ rendererKey ] || null
}

/**
 * Get the registered custom migrator renderer for a migrator, if any.
 *
 * @param  {string}  migratorKey
 * @return {Function|null}
 */
export const getMigratorRenderer = ( migratorKey ) => {
	const registry = getRegistry()

	return registry?.migratorRenderers?.[ migratorKey ] || null
}
