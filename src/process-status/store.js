import apiFetch from '@wordpress/api-fetch'
import { addQueryArgs } from '@wordpress/url'

import {
	POLL_RETRY_MS,
	POLL_RUNNING_MS,
	POLL_SCHEDULED_MAX_MS,
	PROCESS_STATUS_REST_PATH,
	RUNNING_STATUSES
} from './constants'

/**
 * Process status pollers, one per distinct filter, shared by every hook and widget on
 * the page that asks for the same processes.
 *
 * @since  [NEXT_VERSION]
 * @type   {Map<string, Object>}
 */
const pollers = new Map()

let pageListenersInstalled = false

const EMPTY_STATE = Object.freeze( {
	processes: [],
	isLoaded: false,
	error: null,
	updatedAt: 0,
	serverOffset: 0
} )

/**
 * Normalize a filter so equal filters share one poller.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object}    filter
 * @param  {string[]}  [filter.processors] Processor keys.
 * @param  {string}    [filter.group]      Processor group.
 * @param  {number}    [filter.history]    Finished processes per processor.
 * @return {Object}                        `{ processors, group, history }`.
 */
export const normalizeProcessStatusFilter = ( { processors = [], group = '', history = 1 } = {} ) => {
	return {
		processors: [ ...new Set( ( processors || [] ).filter( Boolean ) ) ].sort(),
		group: group || '',
		history: Math.max( 0, Number( history ) || 0 )
	}
}

/**
 * Key identifying a filter.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object} filter Filter, normalized or not.
 * @return {string}
 */
export const getProcessStatusFilterKey = ( filter ) => {
	const { processors, group, history } = normalizeProcessStatusFilter( filter )

	return JSON.stringify( [ processors, group, history ] )
}

/**
 * Whether the page is in a background tab.
 *
 * @since  [NEXT_VERSION]
 * @return {boolean}
 */
const isPageHidden = () => {
	return 'undefined' !== typeof document && 'hidden' === document.visibilityState
}

/**
 * How long to wait before the next poll, or null to stop until asked again.
 *
 * Polls every few seconds while anything is waiting for a runner or working. With only
 * scheduled processes on record, it waits until just after the soonest one is due.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object[]} processes  Processes from the last response.
 * @param  {number}   serverTime Server time of the last response, in seconds.
 * @return {number|null}
 */
export const getNextPollDelay = ( processes, serverTime ) => {
	if ( processes.some( ( process ) => RUNNING_STATUSES.includes( process.status ) ) ) {
		return POLL_RUNNING_MS
	}

	const scheduledTimes = processes
		.filter( ( process ) => 'scheduled' === process.status )
		.map( ( process ) => Number( process.scheduled_time ) || serverTime )

	if ( ! scheduledTimes.length ) {
		return null
	}

	const untilDue = ( ( Math.min( ...scheduledTimes ) - serverTime ) * 1000 ) + 2000

	return Math.min( POLL_SCHEDULED_MAX_MS, Math.max( POLL_RUNNING_MS, untilDue ) )
}

/**
 * Tell a poller's subscribers that its state changed.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object} poller  Poller.
 * @param  {Object} changes State changes.
 * @return {void}
 */
const updatePollerState = ( poller, changes ) => {
	poller.state = {
		...poller.state,
		...changes
	}

	poller.listeners.forEach( ( listener ) => listener() )
}

/**
 * Stop a poller's pending timer.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object} poller Poller.
 * @return {void}
 */
const clearPollerTimer = ( poller ) => {
	if ( poller.timer ) {
		clearTimeout( poller.timer )

		poller.timer = null
	}
}

/**
 * Schedule a poller's next request. A hidden page polls again when it is shown.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object}      poller Poller.
 * @param  {number|null} delay  Delay in milliseconds, or null to stop.
 * @return {void}
 */
const schedulePoll = ( poller, delay ) => {
	clearPollerTimer( poller )

	poller.dueWhileHidden = false

	if ( null === delay || ! poller.listeners.size ) {
		return
	}

	if ( isPageHidden() ) {
		poller.dueWhileHidden = true

		return
	}

	poller.timer = setTimeout( () => {
		fetchPoller( poller )
	}, delay )
}

/**
 * Request a poller's processes now.
 *
 * A request asked for while another is in flight runs again once that one settles,
 * so a refresh after a cancel never resolves with the answer from before it.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object} poller Poller.
 * @return {Promise<void>}
 */
const fetchPoller = ( poller ) => {
	clearPollerTimer( poller )

	if ( poller.inFlight ) {
		poller.fetchAgain = true

		return poller.inFlight
	}

	const { processors, group, history } = poller.filter

	poller.inFlight = apiFetch( {
		path: addQueryArgs( `${ PROCESS_STATUS_REST_PATH }/status`, {
			processors: processors.join( ',' ),
			group,
			history
		} )
	} )
		.then( ( response ) => {
			const data       = response?.data || {}
			const processes  = Array.isArray( data.processes ) ? data.processes : []
			const clientTime = Math.floor( Date.now() / 1000 )
			const serverTime = Number( data.server_time ) || clientTime

			updatePollerState( poller, {
				processes,
				isLoaded: true,
				error: null,
				updatedAt: Date.now(),
				serverOffset: serverTime - clientTime
			} )

			schedulePoll( poller, getNextPollDelay( processes, serverTime ) )
		} )
		.catch( ( error ) => {
			updatePollerState( poller, {
				isLoaded: true,
				error: error?.message || String( error )
			} )

			schedulePoll( poller, POLL_RETRY_MS )
		} )
		.finally( () => {
			poller.inFlight = null

			if ( poller.fetchAgain ) {
				poller.fetchAgain = false

				fetchPoller( poller )
			}
		} )

	return poller.inFlight
}

/**
 * Poll again when the page comes back into view or regains focus, for pollers that
 * missed a poll while hidden or have not answered for a while.
 *
 * @since  [NEXT_VERSION]
 * @return {void}
 */
const installPageListeners = () => {
	if ( pageListenersInstalled || 'undefined' === typeof window ) {
		return
	}

	pageListenersInstalled = true

	const resume = () => {
		if ( isPageHidden() ) {
			return
		}

		pollers.forEach( ( poller ) => {
			const isStale = Date.now() - poller.state.updatedAt > POLL_RUNNING_MS

			if ( poller.dueWhileHidden || isStale ) {
				fetchPoller( poller )
			}
		} )
	}

	document.addEventListener( 'visibilitychange', resume )
	window.addEventListener( 'focus', resume )
}

/**
 * Subscribe to the processes matching a filter. The first subscriber starts polling and
 * the last one to leave stops it.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object}   filter   Filter.
 * @param  {Function} listener Called whenever the state changes.
 * @return {Function}          Unsubscribes.
 */
export const subscribeProcessStatus = ( filter, listener ) => {
	installPageListeners()

	const key = getProcessStatusFilterKey( filter )

	let poller = pollers.get( key )

	if ( ! poller ) {
		poller = {
			key,
			filter: normalizeProcessStatusFilter( filter ),
			state: EMPTY_STATE,
			listeners: new Set(),
			timer: null,
			inFlight: null,
			fetchAgain: false,
			dueWhileHidden: false
		}

		pollers.set( key, poller )
	}

	poller.listeners.add( listener )

	if ( ! poller.state.isLoaded && ! poller.inFlight ) {
		fetchPoller( poller )
	}

	return () => {
		poller.listeners.delete( listener )

		if ( ! poller.listeners.size ) {
			clearPollerTimer( poller )

			pollers.delete( key )
		}
	}
}

/**
 * Current state for a filter.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object} filter Filter.
 * @return {Object}        `{ processes, isLoaded, error, updatedAt, serverOffset }`.
 */
export const getProcessStatusSnapshot = ( filter ) => {
	return pollers.get( getProcessStatusFilterKey( filter ) )?.state || EMPTY_STATE
}

/**
 * Poll a filter now, for a page that has just started or changed a process.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object} filter Filter.
 * @return {Promise<void>}
 */
export const refreshProcessStatus = ( filter ) => {
	const poller = pollers.get( getProcessStatusFilterKey( filter ) )

	if ( ! poller ) {
		return Promise.resolve()
	}

	return fetchPoller( poller )
}

/**
 * Call one of the Background Processor's per-process routes.
 *
 * The routes answer 200 with a `code` and `message` when they refuse, so that shape is
 * turned into a rejection.
 *
 * @since  [NEXT_VERSION]
 * @param  {number} processId Process ID.
 * @param  {string} action    Route suffix.
 * @return {Promise<Object>}
 */
const callProcessRoute = async ( processId, action ) => {
	const response = await apiFetch( {
		path: `${ PROCESS_STATUS_REST_PATH }/${ Number( processId ) }/${ action }`
	} )

	if ( response?.code && response?.message ) {
		throw new Error( response.message )
	}

	return response
}

/**
 * Cancel a process and the prerequisite processes under it.
 *
 * @since  [NEXT_VERSION]
 * @param  {number} processId Process ID.
 * @return {Promise<Object>}
 */
export const cancelProcess = ( processId ) => {
	return callProcessRoute( processId, 'cancel' )
}

/**
 * Retry a failed process.
 *
 * @since  [NEXT_VERSION]
 * @param  {number} processId Process ID.
 * @return {Promise<Object>}
 */
export const retryProcess = ( processId ) => {
	return callProcessRoute( processId, 'retry-failed' )
}
