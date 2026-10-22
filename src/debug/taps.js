/**
 * Taps that feed the shared debug log.
 *
 * Each tap checks whether the log is active every time it runs and does nothing extra
 * when it is not, so wiring them in permanently costs one property read per action,
 * request or event on a page loaded without the debug flag.
 */

import apiFetch from '@wordpress/api-fetch'

import { DEBUG_KIND_EVENT, DEBUG_KIND_FETCH, DEBUG_KIND_STORE } from './constants'
import { getChangedPaths } from './format'
import { getDebugLog, isDebugActive, logDebugEntry, setDebugStoreState, updateDebugEntry } from './log'

/**
 * Wrap a `@wordpress/data` reducer so every action it handles is logged.
 *
 * The entry records the action and the state paths it changed. An action that changed
 * nothing is still logged, with an empty diff, since a dispatch that was expected to
 * change state and did not is often the bug being looked for. Redux's own `@@` actions
 * are skipped.
 *
 * @since  0.9.0
 * @param  {string}   storeName Store name shown in the log.
 * @param  {Function} reducer   Reducer to wrap.
 * @return {Function} Reducer.
 */
export const withDebugLog = ( storeName, reducer ) => {
	return ( state, action ) => {
		const nextState = reducer( state, action )

		if ( ! isDebugActive() ) {
			return nextState
		}

		setDebugStoreState( storeName, nextState )

		if ( undefined === state || ! action || 'string' !== typeof action.type || action.type.startsWith( '@@' ) ) {
			return nextState
		}

		logDebugEntry( {
			kind: DEBUG_KIND_STORE,
			store: storeName,
			type: action.type,
			action,
			changes: getChangedPaths( state, nextState )
		} )

		return nextState
	}
}

/**
 * Label the requests started while a function runs.
 *
 * `apiFetch` runs its middleware synchronously when it is called, so a request started
 * before the function's first `await` is attributed to `label`. That covers the common
 * shape, an async loader that calls an `api*` helper straight away. The function's
 * return value is passed through untouched.
 *
 * @since  0.9.0
 * @param  {string}   label Name shown as the request initiator.
 * @param  {Function} fn    Function to run.
 * @return {*} Whatever `fn` returns.
 */
export const withDebugInitiator = ( label, fn ) => {
	const log = getDebugLog()

	if ( ! log || ! log.active ) {
		return fn()
	}

	log.initiators.push( label )

	try {
		return fn()
	} finally {
		log.initiators.pop()
	}
}

/**
 * The initiator label in force right now, if any.
 *
 * @since  0.9.0
 * @return {string|null}
 */
const getCurrentInitiator = () => {
	const log = getDebugLog()

	if ( ! log || ! log.initiators.length ) {
		return null
	}

	return log.initiators[ log.initiators.length - 1 ]
}

/**
 * `apiFetch` middleware that logs each request when it starts and settles it in place.
 *
 * With the default `parse: true`, middleware sees the parsed body rather than the
 * response, so a successful request is recorded as `ok` with no status code. A failed
 * request carries the status from the REST error. A caller that passes `parse: false`
 * gets the real status either way.
 *
 * @since  0.9.0
 * @param  {Object}   options apiFetch options.
 * @param  {Function} next    Next middleware.
 * @return {Promise<*>} Result of the next middleware.
 */
export const debugApiFetchMiddleware = ( options, next ) => {
	if ( ! isDebugActive() ) {
		return next( options )
	}

	const started = performance.now()

	const id = logDebugEntry( {
		kind: DEBUG_KIND_FETCH,
		method: ( options.method || 'GET' ).toUpperCase(),
		path: options.path || options.url || '',
		data: options.data,
		initiator: getCurrentInitiator(),
		pending: true
	} )

	const elapsed = () => Math.round( performance.now() - started )

	return next( options ).then(
		( response ) => {
			const isResponse = 'undefined' !== typeof Response && response instanceof Response

			updateDebugEntry( id, {
				pending: false,
				ok: isResponse ? response.ok : true,
				status: isResponse ? response.status : null,
				ms: elapsed(),
				response
			} )

			return response
		},
		( error ) => {
			updateDebugEntry( id, {
				pending: false,
				ok: false,
				status: error?.data?.status ?? null,
				ms: elapsed(),
				response: error
			} )

			throw error
		}
	)
}

/**
 * Register the request middleware once for the page.
 *
 * `apiFetch` is a WordPress global shared by every plugin, so the first plugin to call
 * this covers requests made by all of them. Does nothing unless the log is active.
 *
 * @since  0.9.0
 * @return {boolean} Whether the middleware is installed after the call.
 */
export const installApiFetchDebug = () => {
	const log = getDebugLog()

	if ( ! log || ! log.active ) {
		return false
	}

	if ( ! log.apiFetchInstalled ) {
		apiFetch.use( debugApiFetchMiddleware )

		log.apiFetchInstalled = true
	}

	return true
}

/**
 * Log an event emitted on a plugin's event bus.
 *
 * @since  0.9.0
 * @param  {string} name                Event name.
 * @param  {*}      [payload]           Payload.
 * @param  {Object} [meta]              Extra fields.
 * @param  {number} [meta.listeners]    Listener count at the time of the emit.
 * @param  {string} [meta.source]       Plugin or bus the event came from.
 * @return {number|null} Entry id.
 */
export const logDebugEvent = ( name, payload, meta = {} ) => {
	if ( ! isDebugActive() ) {
		return null
	}

	return logDebugEntry( {
		kind: DEBUG_KIND_EVENT,
		name,
		payload,
		...meta
	} )
}
