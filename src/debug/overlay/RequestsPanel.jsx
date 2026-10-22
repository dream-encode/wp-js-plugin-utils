import { Fragment, useMemo } from '@wordpress/element'

import { DEBUG_KIND_FETCH } from '../constants'
import { formatDuration } from '../format'
import EntryDetail from './EntryDetail'
import { getRequestStatus, shortenPath } from './entries'

/**
 * Requests in the order they started, with a bar for when each ran.
 *
 * Bars share one scale, from the first request's start to the latest finish, so
 * requests that ran in parallel overlap and a request that waited on another starts
 * after it ends.
 *
 * @since  0.9.0
 * @param  {Object}   props            Props.
 * @param  {Object[]} props.entries    Entries, newest first.
 * @param  {number}   props.openId     Expanded entry id.
 * @param  {Function} props.toggleOpen Expand or collapse an entry.
 * @param  {Object}   props.aliases    Path aliases.
 * @return {JSX.Element}
 */
const RequestsPanel = ( { entries, openId, toggleOpen, aliases } ) => {
	const requests = useMemo( () => {
		return entries.filter( ( entry ) => DEBUG_KIND_FETCH === entry.kind ).slice().reverse()
	}, [ entries ] )

	if ( ! requests.length ) {
		return (
			<div className="de-debug-body">
				<div className="de-debug-empty">No requests recorded.</div>
			</div>
		)
	}

	const now = Math.round( performance.now() )
	const start = requests[ 0 ].at
	const end = requests.reduce( ( latest, entry ) => Math.max( latest, entry.pending ? now : entry.at + ( entry.ms || 0 ) ), start + 1 )
	const span = end - start

	return (
		<div className="de-debug-body">
			<div className="de-debug-req-head">
				<span>Verb</span>
				<span>Path</span>
				<span style={ { textAlign: 'right' } }>Status</span>
				<span>{ `Timeline, ${ formatDuration( span ) }` }</span>
			</div>
			{ requests.map( ( entry ) => {
				const isOpen = openId === entry.id
				const failed = ! entry.pending && false === entry.ok
				const duration = entry.pending ? now - entry.at : ( entry.ms || 0 )
				const left = ( ( entry.at - start ) / span ) * 100
				const width = ( duration / span ) * 100
				const tone = entry.pending ? 'is-pending' : ( failed ? 'is-err' : 'is-ok' )
				const meta = [ entry.initiator, entry.pending ? 'pending' : formatDuration( duration ) ].filter( Boolean ).join( ' · ' )

				return (
					<Fragment key={ entry.id }>
						<button
							type="button"
							className={ `de-debug-req${ failed ? ' is-err' : '' }` }
							aria-expanded={ isOpen ? 'true' : 'false' }
							onClick={ () => toggleOpen( entry.id ) }
						>
							<span className="de-debug-m">{ entry.method }</span>
							<span className="de-debug-p">
								<span>{ shortenPath( entry.path, aliases ) }</span>
								<span>{ meta }</span>
							</span>
							<span className={ `de-debug-s de-debug-r ${ tone }` }>{ getRequestStatus( entry ) }</span>
							<span className="de-debug-wf" aria-hidden="true">
								<i className={ tone } style={ { left: `${ left }%`, width: `${ width }%` } } />
							</span>
						</button>
						{ isOpen && <EntryDetail entry={ entry } request /> }
					</Fragment>
				)
			} ) }
		</div>
	)
}

export default RequestsPanel
