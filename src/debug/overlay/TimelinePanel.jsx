import { Fragment, useMemo } from '@wordpress/element'

import { formatClock } from '../format'
import EntryDetail from './EntryDetail'
import { describeEntry, getEntryKind, getSearchText, isFailureEntry } from './entries'

const MAX_ROWS = 300

const KIND_FILTERS = [
	{ kind: 'store', label: 'Store' },
	{ kind: 'fetch', label: 'Requests' },
	{ kind: 'event', label: 'Events' },
	{ kind: 'note', label: 'Notes' }
]

/**
 * Every entry, newest first, with kind, failure and text filters.
 *
 * Only the first 300 matching rows are drawn, since a full log redrawn on every
 * keystroke in a form would slow the form down.
 *
 * @since  0.9.0
 * @param  {Object}   props                Props.
 * @param  {Object[]} props.entries        Entries, newest first.
 * @param  {Object}   props.layout         Overlay layout, holding the filters.
 * @param  {Function} props.updateLayout   Layout updater.
 * @param  {string}   props.query          Filter text.
 * @param  {Function} props.setQuery       Filter text setter.
 * @param  {number}   props.openId         Expanded entry id.
 * @param  {Function} props.toggleOpen     Expand or collapse an entry.
 * @param  {Object}   props.aliases        Path aliases.
 * @return {JSX.Element}
 */
const TimelinePanel = ( { entries, layout, updateLayout, query, setQuery, openId, toggleOpen, aliases } ) => {
	const visible = useMemo( () => {
		const needle = query.trim().toLowerCase()

		return entries.filter( ( entry ) => {
			if ( ! layout.kinds[ getEntryKind( entry ) ] ) {
				return false
			}

			if ( layout.errorsOnly && ! isFailureEntry( entry ) ) {
				return false
			}

			if ( needle && ! getSearchText( entry, aliases ).includes( needle ) ) {
				return false
			}

			return true
		} )
	}, [ entries, layout.kinds, layout.errorsOnly, query, aliases ] )

	const toggleKind = ( kind ) => {
		updateLayout( {
			kinds: {
				...layout.kinds,
				[ kind ]: ! layout.kinds[ kind ]
			}
		} )
	}

	const rows = visible.slice( 0, MAX_ROWS )

	return (
		<>
			<div className="de-debug-filters">
				{ KIND_FILTERS.map( ( filter ) => (
					<button
						key={ filter.kind }
						type="button"
						className={ `de-debug-chip is-${ filter.kind }` }
						aria-pressed={ layout.kinds[ filter.kind ] ? 'true' : 'false' }
						onClick={ () => toggleKind( filter.kind ) }
					>
						{ filter.label }
					</button>
				) ) }
				<button
					type="button"
					className="de-debug-chip is-err"
					aria-pressed={ layout.errorsOnly ? 'true' : 'false' }
					onClick={ () => updateLayout( { errorsOnly: ! layout.errorsOnly } ) }
				>
					Errors only
				</button>
				<input
					type="search"
					className="de-debug-search"
					placeholder="Filter by action, path or key"
					aria-label="Filter entries"
					value={ query }
					onChange={ ( event ) => setQuery( event.target.value ) }
				/>
			</div>
			<div className="de-debug-body">
				{ ! entries.length && (
					<div className="de-debug-empty">No entries. New entries appear as the page runs.</div>
				) }
				{ entries.length > 0 && ! visible.length && (
					<div className="de-debug-empty">No entries match the current filters.</div>
				) }
				{ rows.map( ( entry ) => {
					const kind = getEntryKind( entry )
					const failed = isFailureEntry( entry )
					const { title, subtitle, aside, asideTone } = describeEntry( entry, aliases )
					const isOpen = openId === entry.id

					return (
						<Fragment key={ entry.id }>
							<button
								type="button"
								className={ `de-debug-row${ failed ? ' is-err' : '' }` }
								aria-expanded={ isOpen ? 'true' : 'false' }
								onClick={ () => toggleOpen( entry.id ) }
							>
								<span className="de-debug-t">{ formatClock( entry.time ) }</span>
								<span className={ `de-debug-k is-${ failed ? 'err' : kind }` }>{ 'note' === kind ? entry.kind : kind }</span>
								<span className="de-debug-main">
									<span className="de-debug-ti">{ title }</span>
									{ subtitle && <span className="de-debug-su">{ subtitle }</span> }
								</span>
								<span className={ `de-debug-r ${ asideTone }` }>{ aside }</span>
							</button>
							{ isOpen && <EntryDetail entry={ entry } /> }
						</Fragment>
					)
				} ) }
				{ visible.length > MAX_ROWS && (
					<div className="de-debug-more">{ `Showing ${ MAX_ROWS } of ${ visible.length } matching entries. Narrow the filter to see older ones.` }</div>
				) }
			</div>
		</>
	)
}

export default TimelinePanel
