import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useSyncExternalStore
} from '@wordpress/element'

import { FINISHED_STATUSES, UNFINISHED_STATUSES } from './constants'
import {
	cancelProcess,
	getProcessStatusFilterKey,
	getProcessStatusSnapshot,
	normalizeProcessStatusFilter,
	refreshProcessStatus,
	retryProcess,
	subscribeProcessStatus
} from './store'

/**
 * Background processes for a set of processors, kept current by polling.
 *
 * Every hook and widget on the page asking for the same processors shares one poller,
 * so a page can read `isActive` to disable its start button and render a widget for the
 * same processes at the cost of one request.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object}    options
 * @param  {string[]}  [options.processors]  Processor keys.
 * @param  {string}    [options.group]       Processor group.
 * @param  {number}    [options.history=1]   Finished processes to keep for each processor.
 * @param  {Function}  [options.onComplete]  Called with a process when one seen unfinished is seen finished.
 * @return {Object} `{ processes, activeProcesses, finishedProcesses, isActive, isLoaded, error, updatedAt, serverOffset, refresh, cancel, retry }`.
 */
const useProcessStatus = ( {
	processors = [],
	group = '',
	history = 1,
	onComplete
} = {} ) => {
	const key = getProcessStatusFilterKey( { processors, group, history } )

	const filter = useMemo( () => normalizeProcessStatusFilter( { processors, group, history } ), [ key ] )

	const subscribe = useCallback( ( listener ) => subscribeProcessStatus( filter, listener ), [ filter ] )
	const getSnapshot = useCallback( () => getProcessStatusSnapshot( filter ), [ filter ] )

	const state = useSyncExternalStore( subscribe, getSnapshot, getSnapshot )

	const activeProcesses = useMemo( () => {
		return state.processes.filter( ( process ) => UNFINISHED_STATUSES.includes( process.status ) )
	}, [ state.processes ] )

	const finishedProcesses = useMemo( () => {
		return state.processes.filter( ( process ) => FINISHED_STATUSES.includes( process.status ) )
	}, [ state.processes ] )

	const onCompleteRef       = useRef( onComplete )
	const previousStatusesRef = useRef( null )

	useEffect( () => {
		onCompleteRef.current = onComplete
	}, [ onComplete ] )

	useEffect( () => {
		if ( ! state.isLoaded ) {
			return
		}

		const previousStatuses = previousStatusesRef.current

		previousStatusesRef.current = new Map( state.processes.map( ( process ) => [ process.id, process.status ] ) )

		if ( ! previousStatuses || 'function' !== typeof onCompleteRef.current ) {
			return
		}

		state.processes.forEach( ( process ) => {
			const wasUnfinished = UNFINISHED_STATUSES.includes( previousStatuses.get( process.id ) )

			if ( wasUnfinished && FINISHED_STATUSES.includes( process.status ) ) {
				onCompleteRef.current( process )
			}
		} )
	}, [ state.processes, state.isLoaded ] )

	const refresh = useCallback( () => refreshProcessStatus( filter ), [ filter ] )

	const cancel = useCallback( async ( processId ) => {
		try {
			await cancelProcess( processId )
		} finally {
			await refreshProcessStatus( filter )
		}
	}, [ filter ] )

	const retry = useCallback( async ( processId ) => {
		try {
			await retryProcess( processId )
		} finally {
			await refreshProcessStatus( filter )
		}
	}, [ filter ] )

	return {
		processes: state.processes,
		activeProcesses,
		finishedProcesses,
		isActive: activeProcesses.length > 0,
		isLoaded: state.isLoaded,
		error: state.error,
		updatedAt: state.updatedAt,
		serverOffset: state.serverOffset,
		refresh,
		cancel,
		retry
	}
}

export default useProcessStatus
