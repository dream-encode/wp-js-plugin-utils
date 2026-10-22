/**
 * How each kind of entry reads in a row.
 */

import { DEBUG_KIND_EVENT, DEBUG_KIND_FETCH, DEBUG_KIND_NOTE, DEBUG_KIND_STORE } from '../constants'
import { formatDuration, formatInline } from '../format'

const KNOWN_KINDS = [ DEBUG_KIND_STORE, DEBUG_KIND_FETCH, DEBUG_KIND_EVENT ]

/**
 * Whether a value holds something: not empty, null, false, or an empty array or object.
 *
 * @since  0.9.0
 * @param  {*} value Value.
 * @return {boolean}
 */
const hasValue = ( value ) => {
	if ( ! value ) {
		return false
	}

	if ( 'object' === typeof value ) {
		return Object.keys( value ).length > 0
	}

	return true
}

/**
 * The kind a row is filtered and coloured by. Unknown kinds are notes.
 *
 * @since  0.9.0
 * @param  {Object} entry Entry.
 * @return {string}
 */
export const getEntryKind = ( entry ) => {
	return KNOWN_KINDS.includes( entry.kind ) ? entry.kind : DEBUG_KIND_NOTE
}

/**
 * Whether an entry records something going wrong.
 *
 * Requests count when they failed. Store actions count when they set a key named like
 * `error` or `errors` to something, or set any value to the string `error`, which is how
 * status fields usually record a failure. Any entry can also say so itself with
 * `level: 'error'`.
 *
 * @since  0.9.0
 * @param  {Object} entry Entry.
 * @return {boolean}
 */
export const isFailureEntry = ( entry ) => {
	if ( 'error' === entry.level ) {
		return true
	}

	if ( DEBUG_KIND_FETCH === entry.kind ) {
		return false === entry.ok
	}

	if ( DEBUG_KIND_STORE === entry.kind && Array.isArray( entry.changes ) ) {
		return entry.changes.some( ( change ) => {
			if ( 'error' === change.to ) {
				return true
			}

			const touchesErrors = change.path.split( '.' ).some( ( segment ) => /^errors?$/i.test( segment ) )

			return touchesErrors && hasValue( change.to )
		} )
	}

	return false
}

/**
 * Shorten a REST path with the aliases the overlay was given.
 *
 * @since  0.9.0
 * @param  {string} path    Path.
 * @param  {Object} aliases Map of namespace to short label.
 * @return {string}
 */
export const shortenPath = ( path, aliases = {} ) => {
	const clean = String( path || '' ).replace( /^\/+/, '' )

	const match = Object.keys( aliases ).find( ( namespace ) => clean.startsWith( `${ namespace.replace( /^\/+|\/+$/g, '' ) }/` ) )

	if ( ! match ) {
		return clean
	}

	return `${ aliases[ match ] }/${ clean.slice( match.replace( /^\/+|\/+$/g, '' ).length + 1 ) }`
}

/**
 * Summary of a store entry's changes for its row.
 *
 * @since  0.9.0
 * @param  {Object[]} changes Changes.
 * @return {string}
 */
const summarizeChanges = ( changes = [] ) => {
	if ( ! changes.length ) {
		return 'no state change'
	}

	const [ first ] = changes
	const more = changes.length > 1 ? ` (+${ changes.length - 1 } more)` : ''

	return `${ first.path }: ${ formatInline( first.from, 24 ) } → ${ formatInline( first.to, 24 ) }${ more }`
}

/**
 * Status text for a request.
 *
 * @since  0.9.0
 * @param  {Object} entry Request entry.
 * @return {string}
 */
export const getRequestStatus = ( entry ) => {
	if ( entry.pending ) {
		return 'pending'
	}

	if ( entry.status ) {
		return String( entry.status )
	}

	return entry.ok ? 'OK' : 'failed'
}

/**
 * Title, subtitle and right-hand text of a row.
 *
 * @since  0.9.0
 * @param  {Object} entry   Entry.
 * @param  {Object} aliases Path aliases.
 * @return {Object} `{ title, subtitle, aside, asideTone }`.
 */
export const describeEntry = ( entry, aliases ) => {
	switch ( getEntryKind( entry ) ) {
		case DEBUG_KIND_STORE:
			return {
				title: entry.type,
				subtitle: `${ entry.store } · ${ summarizeChanges( entry.changes ) }`,
				aside: '',
				asideTone: ''
			}
		case DEBUG_KIND_FETCH:
			return {
				title: `${ entry.method } ${ shortenPath( entry.path, aliases ) }`,
				subtitle: entry.initiator || '',
				aside: entry.pending ? 'pending' : `${ getRequestStatus( entry ) } · ${ formatDuration( entry.ms || 0 ) }`,
				asideTone: entry.pending ? 'is-pending' : ( entry.ok ? 'is-ok' : 'is-err' )
			}
		case DEBUG_KIND_EVENT:
			return {
				title: entry.name,
				subtitle: undefined === entry.payload ? 'no payload' : formatInline( entry.payload, 40 ),
				aside: 'number' === typeof entry.listeners ? `${ entry.listeners } ${ 1 === entry.listeners ? 'listener' : 'listeners' }` : '',
				asideTone: 0 === entry.listeners ? 'is-err' : ''
			}
		default:
			return {
				title: entry.title || entry.kind,
				subtitle: entry.message || '',
				aside: '',
				asideTone: ''
			}
	}
}

/**
 * Text searched by the filter box.
 *
 * @since  0.9.0
 * @param  {Object} entry   Entry.
 * @param  {Object} aliases Path aliases.
 * @return {string}
 */
export const getSearchText = ( entry, aliases ) => {
	const { title, subtitle } = describeEntry( entry, aliases )

	return `${ title } ${ subtitle } ${ entry.path || '' } ${ entry.store || '' }`.toLowerCase()
}
