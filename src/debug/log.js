/**
 * The shared debug log.
 *
 * One log serves every plugin on the page. It lives on `window.dreamEncodeDebug` and is
 * created by whichever script reaches it first, the same way the edit product registry
 * is, so two plugins that both bundle this package still write to the same timeline and
 * a single overlay shows all of it.
 *
 * Nothing is recorded until `activateDebug()` has switched the log on for the page.
 */

import { DEBUG_LOG_VERSION, DEBUG_MAX_ENTRIES, DEBUG_NAMESPACE, DEBUG_QUERY_PARAM } from './constants'

const EMPTY_SNAPSHOT = Object.freeze( {
	entries: [],
	stores: {},
	paused: false
} )

/**
 * Build a new, inactive log.
 *
 * @since  [NEXT_VERSION]
 * @return {Object}
 */
const createLog = () => {
	return {
		version: DEBUG_LOG_VERSION,
		active: false,
		paused: false,
		sequence: 0,
		entries: [],
		stores: {},
		initiators: [],
		apiFetchInstalled: false,
		overlayOwner: null,
		listeners: new Set(),
		notifyQueued: false,
		snapshot: EMPTY_SNAPSHOT
	}
}

/**
 * Get the page-wide log, creating it if nothing has yet.
 *
 * Returns null outside a browser, and null if the global has been claimed by something
 * that is not this log.
 *
 * @since  [NEXT_VERSION]
 * @return {Object|null}
 */
export const getDebugLog = () => {
	if ( 'undefined' === typeof window ) {
		return null
	}

	if ( ! window[ DEBUG_NAMESPACE ] ) {
		window[ DEBUG_NAMESPACE ] = createLog()
	}

	const log = window[ DEBUG_NAMESPACE ]

	if ( ! log || log.version !== DEBUG_LOG_VERSION || ! Array.isArray( log.entries ) ) {
		return null
	}

	return log
}

/**
 * Whether the page URL asks for debug output.
 *
 * @since  [NEXT_VERSION]
 * @param  {string} [param] Query parameter to read. Default `debug`.
 * @return {boolean}
 */
export const isDebugRequested = ( param = DEBUG_QUERY_PARAM ) => {
	if ( 'undefined' === typeof window ) {
		return false
	}

	return '1' === new URLSearchParams( window.location.search ).get( param )
}

/**
 * Switch the log on for this page when the URL asks for it and the caller allows it.
 *
 * `allowed` is the server-side half of the gate: pass the result of a capability check
 * that PHP localized for the current user. Once any plugin has activated the log it stays
 * active for the page, so a second plugin calling this with `allowed` false does not turn
 * it off for the first.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object}  [options]         Options.
 * @param  {boolean} [options.allowed] Whether the current user may see debug output. Default true.
 * @param  {string}  [options.param]   Query parameter to read. Default `debug`.
 * @return {boolean} Whether the log is active after the call.
 */
export const activateDebug = ( { allowed = true, param = DEBUG_QUERY_PARAM } = {} ) => {
	const log = getDebugLog()

	if ( ! log ) {
		return false
	}

	if ( allowed && isDebugRequested( param ) ) {
		log.active = true
	}

	return log.active
}

/**
 * Whether the log is recording for this page.
 *
 * @since  [NEXT_VERSION]
 * @return {boolean}
 */
export const isDebugActive = () => {
	if ( 'undefined' === typeof window ) {
		return false
	}

	const log = window[ DEBUG_NAMESPACE ]

	return Boolean( log && log.active )
}

/**
 * Rebuild the snapshot and tell subscribers, once per microtask.
 *
 * Entries are written from inside reducers and fetch middleware, which can run while
 * React is rendering. Deferring the notification keeps a subscriber from being updated
 * in the middle of another component's render, and folds a burst of dispatches into one
 * re-render of the overlay.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object} log The log.
 * @return {void}
 */
const notify = ( log ) => {
	log.snapshot = {
		entries: log.entries,
		stores: log.stores,
		paused: log.paused
	}

	if ( log.notifyQueued ) {
		return
	}

	log.notifyQueued = true

	queueMicrotask( () => {
		log.notifyQueued = false

		log.listeners.forEach( ( listener ) => listener() )
	} )
}

/**
 * Add an entry to the log.
 *
 * Every entry gets an `id`, a wall clock `time` and `at`, the milliseconds since the page
 * started loading, which is what the request waterfall is drawn against.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object} entry      Entry fields.
 * @param  {string} entry.kind `store`, `fetch`, `event` or any custom kind.
 * @return {number|null} The entry id, or null when nothing was recorded.
 */
export const logDebugEntry = ( entry ) => {
	const log = getDebugLog()

	if ( ! log || ! log.active || log.paused ) {
		return null
	}

	log.sequence += 1

	const record = {
		id: log.sequence,
		time: Date.now(),
		at: Math.round( performance.now() ),
		...entry
	}

	log.entries = [ record, ...log.entries ].slice( 0, DEBUG_MAX_ENTRIES )

	notify( log )

	return record.id
}

/**
 * Merge fields into an entry already in the log.
 *
 * Used to settle a request that was logged when it started.
 *
 * @since  [NEXT_VERSION]
 * @param  {number|null} id     Entry id.
 * @param  {Object}      fields Fields to merge.
 * @return {boolean} Whether an entry was updated.
 */
export const updateDebugEntry = ( id, fields ) => {
	const log = getDebugLog()

	if ( ! log || null === id ) {
		return false
	}

	let found = false

	log.entries = log.entries.map( ( entry ) => {
		if ( entry.id !== id ) {
			return entry
		}

		found = true

		return {
			...entry,
			...fields
		}
	} )

	if ( found ) {
		notify( log )
	}

	return found
}

/**
 * Record the latest state of a data store, for the State tab.
 *
 * @since  [NEXT_VERSION]
 * @param  {string} storeName Store name.
 * @param  {*}      state     Current state.
 * @return {void}
 */
export const setDebugStoreState = ( storeName, state ) => {
	const log = getDebugLog()

	if ( ! log || ! log.active ) {
		return
	}

	log.stores = {
		...log.stores,
		[ storeName ]: state
	}

	notify( log )
}

/**
 * Empty the log. Store snapshots are kept, since they describe the page as it is now.
 *
 * @since  [NEXT_VERSION]
 * @return {void}
 */
export const clearDebugLog = () => {
	const log = getDebugLog()

	if ( ! log ) {
		return
	}

	log.entries = []

	notify( log )
}

/**
 * Stop or resume recording.
 *
 * @since  [NEXT_VERSION]
 * @param  {boolean} paused Whether to pause.
 * @return {void}
 */
export const setDebugPaused = ( paused ) => {
	const log = getDebugLog()

	if ( ! log ) {
		return
	}

	log.paused = Boolean( paused )

	notify( log )
}

/**
 * Subscribe to changes. Shaped for `useSyncExternalStore`.
 *
 * @since  [NEXT_VERSION]
 * @param  {Function} listener Called after changes.
 * @return {Function} Unsubscribe.
 */
export const subscribeDebugLog = ( listener ) => {
	const log = getDebugLog()

	if ( ! log ) {
		return () => {}
	}

	log.listeners.add( listener )

	return () => {
		log.listeners.delete( listener )
	}
}

/**
 * The current snapshot: `entries` newest first, `stores` and `paused`.
 *
 * The same object is returned until something changes, as `useSyncExternalStore`
 * requires.
 *
 * @since  [NEXT_VERSION]
 * @return {Object}
 */
export const getDebugLogSnapshot = () => {
	const log = getDebugLog()

	if ( ! log ) {
		return EMPTY_SNAPSHOT
	}

	return log.snapshot
}
