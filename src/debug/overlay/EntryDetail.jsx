import { Fragment } from '@wordpress/element'

import { DEBUG_KIND_EVENT, DEBUG_KIND_FETCH, DEBUG_KIND_STORE } from '../constants'
import { formatDuration, formatInline, formatPreview } from '../format'
import { getEntryKind, getRequestStatus } from './entries'

/**
 * Store entry detail: the changed paths, then the action.
 *
 * @since  0.9.0
 * @param  {Object} props       Props.
 * @param  {Object} props.entry Entry.
 * @return {JSX.Element}
 */
const StoreDetail = ( { entry } ) => {
	const changes = entry.changes || []

	return (
		<>
			<p className="de-debug-h">{ `Changed in ${ entry.store }` }</p>
			{ changes.length ? (
				<div className="de-debug-diff">
					{ changes.map( ( change ) => (
						<Fragment key={ change.path }>
							<span className="de-debug-diff-key">{ change.path }</span>
							<span>
								<span className="de-debug-from">{ formatInline( change.from, 80 ) }</span>
								{ ' → ' }
								<span className="de-debug-to">{ formatInline( change.to, 80 ) }</span>
							</span>
						</Fragment>
					) ) }
				</div>
			) : (
				<pre className="de-debug-pre">No state change</pre>
			) }
			<p className="de-debug-h">Action</p>
			<pre className="de-debug-pre">{ formatPreview( entry.action, { maxDepth: 4 } ) }</pre>
		</>
	)
}

/**
 * Request entry detail.
 *
 * @since  0.9.0
 * @param  {Object} props       Props.
 * @param  {Object} props.entry Entry.
 * @return {JSX.Element}
 */
const FetchDetail = ( { entry } ) => {
	return (
		<>
			<p className="de-debug-h">Request</p>
			<pre className="de-debug-pre">{ `${ entry.method } /${ String( entry.path ).replace( /^\/+/, '' ) }` }</pre>
			{ undefined !== entry.data && (
				<>
					<p className="de-debug-h">Body</p>
					<pre className="de-debug-pre">{ formatPreview( entry.data ) }</pre>
				</>
			) }
			<p className="de-debug-h">{ entry.pending ? 'Response' : ( entry.ok ? 'Response' : 'Error' ) }</p>
			<pre className="de-debug-pre">{ entry.pending ? 'Waiting for a response' : formatPreview( entry.response ) }</pre>
			<p className="de-debug-h">Timing</p>
			<pre className="de-debug-pre">{ entry.pending ? `Started at ${ formatDuration( entry.at ) } after page load` : `${ getRequestStatus( entry ) } after ${ formatDuration( entry.ms || 0 ) }, started ${ formatDuration( entry.at ) } after page load` }</pre>
			{ entry.initiator && (
				<>
					<p className="de-debug-h">Started by</p>
					<pre className="de-debug-pre">{ entry.initiator }</pre>
				</>
			) }
		</>
	)
}

/**
 * Event entry detail.
 *
 * @since  0.9.0
 * @param  {Object} props       Props.
 * @param  {Object} props.entry Entry.
 * @return {JSX.Element}
 */
const EventDetail = ( { entry } ) => {
	return (
		<>
			<p className="de-debug-h">Payload</p>
			<pre className="de-debug-pre">{ undefined === entry.payload ? 'No payload' : formatPreview( entry.payload ) }</pre>
			{ 'number' === typeof entry.listeners && (
				<>
					<p className="de-debug-h">Listeners at emit</p>
					<pre className="de-debug-pre">{ String( entry.listeners ) }</pre>
				</>
			) }
			{ entry.source && (
				<>
					<p className="de-debug-h">Source</p>
					<pre className="de-debug-pre">{ entry.source }</pre>
				</>
			) }
		</>
	)
}

/**
 * Expanded view of one entry.
 *
 * @since  0.9.0
 * @param  {Object}  props           Props.
 * @param  {Object}  props.entry     Entry.
 * @param  {boolean} [props.request] Whether it sits in the Requests tab.
 * @return {JSX.Element}
 */
const EntryDetail = ( { entry, request = false } ) => {
	const kind = getEntryKind( entry )

	let body = null

	if ( DEBUG_KIND_STORE === kind ) {
		body = <StoreDetail entry={ entry } />
	} else if ( DEBUG_KIND_FETCH === kind ) {
		body = <FetchDetail entry={ entry } />
	} else if ( DEBUG_KIND_EVENT === kind ) {
		body = <EventDetail entry={ entry } />
	} else {
		body = <pre className="de-debug-pre">{ formatPreview( entry ) }</pre>
	}

	return (
		<div className={ `de-debug-detail${ request ? ' is-request' : '' }` }>
			{ body }
		</div>
	)
}

export default EntryDetail
