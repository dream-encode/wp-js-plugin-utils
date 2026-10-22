/**
 * Formatting helpers for debug entries.
 *
 * Entries hold live references to the values that were dispatched, fetched and emitted.
 * These helpers turn them into text only when the overlay shows or copies them, and they
 * stop at a fixed depth and length so a 1,284 term category tree does not freeze the page.
 */

const MAX_DIFF_PATHS = 30

/**
 * Whether a value is a plain object worth descending into.
 *
 * @since  0.9.0
 * @param  {*} value Value.
 * @return {boolean}
 */
const isPlainObject = ( value ) => {
	if ( null === value || 'object' !== typeof value ) {
		return false
	}

	const proto = Object.getPrototypeOf( value )

	return null === proto || Object.prototype === proto
}

/**
 * List the paths that differ between two states.
 *
 * Plain objects are compared key by key down to `maxDepth`; anything else, arrays
 * included, is compared by identity, which is how a reducer signals a change.
 *
 * @since  0.9.0
 * @param  {*}      prev       Previous state.
 * @param  {*}      next       Next state.
 * @param  {number} [maxDepth] Levels to descend. Default 2.
 * @return {Object[]} `{ path, from, to }` for each change.
 */
export const getChangedPaths = ( prev, next, maxDepth = 2 ) => {
	const changes = []

	const walk = ( a, b, path, depth ) => {
		if ( changes.length >= MAX_DIFF_PATHS || Object.is( a, b ) ) {
			return
		}

		if ( depth < maxDepth && isPlainObject( a ) && isPlainObject( b ) ) {
			const keys = new Set( [ ...Object.keys( a ), ...Object.keys( b ) ] )

			keys.forEach( ( key ) => {
				walk( a[ key ], b[ key ], path ? `${ path }.${ key }` : key, depth + 1 )
			} )

			return
		}

		changes.push( {
			path: path || '(root)',
			from: a,
			to: b
		} )
	}

	walk( prev, next, '', 0 )

	return changes
}

/**
 * One-line summary of a value, for diffs and row subtitles.
 *
 * @since  0.9.0
 * @param  {*}      value       Value.
 * @param  {number} [maxLength] Longest string shown before it is cut. Default 60.
 * @return {string}
 */
export const formatInline = ( value, maxLength = 60 ) => {
	if ( undefined === value ) {
		return 'undefined'
	}

	if ( null === value ) {
		return 'null'
	}

	if ( 'string' === typeof value ) {
		const text = value.length > maxLength ? `${ value.slice( 0, maxLength ) }…` : value

		return JSON.stringify( text )
	}

	if ( 'function' === typeof value ) {
		return `[Function ${ value.name || 'anonymous' }]`
	}

	if ( Array.isArray( value ) ) {
		return `Array(${ value.length })`
	}

	if ( value instanceof Error ) {
		return `${ value.name }: ${ value.message }`
	}

	if ( 'object' === typeof value ) {
		const keys = Object.keys( value )

		if ( keys.length <= 3 ) {
			return `{ ${ keys.map( ( key ) => `${ key }: ${ formatInline( value[ key ], 20 ) }` ).join( ', ' ) } }`
		}

		return `{ ${ keys.length } keys }`
	}

	return String( value )
}

/**
 * Copy a value into plain JSON-safe data, cut to a fixed size.
 *
 * Handles circular references, functions, errors, DOM nodes and `Response` objects, none
 * of which survive `JSON.stringify` on their own.
 *
 * @since  0.9.0
 * @param  {*}      value                Value.
 * @param  {Object} [limits]             Limits.
 * @param  {number} [limits.maxDepth]    Levels kept. Default 5.
 * @param  {number} [limits.maxItems]    Array items and object keys kept per level. Default 25.
 * @param  {number} [limits.maxString]   Characters kept per string. Default 500.
 * @return {*}
 */
export const toSafeData = ( value, { maxDepth = 5, maxItems = 25, maxString = 500 } = {} ) => {
	const seen = new WeakSet()

	const copy = ( input, depth ) => {
		if ( null === input || 'boolean' === typeof input || 'number' === typeof input ) {
			return input
		}

		if ( undefined === input ) {
			return '[undefined]'
		}

		if ( 'string' === typeof input ) {
			return input.length > maxString ? `${ input.slice( 0, maxString ) }… (${ input.length } chars)` : input
		}

		if ( 'function' === typeof input ) {
			return `[Function ${ input.name || 'anonymous' }]`
		}

		if ( 'object' !== typeof input ) {
			return String( input )
		}

		if ( 'undefined' !== typeof Element && input instanceof Element ) {
			return `[Element ${ input.tagName.toLowerCase() }${ input.id ? `#${ input.id }` : '' }]`
		}

		if ( 'undefined' !== typeof Response && input instanceof Response ) {
			return `[Response ${ input.status } ${ input.statusText }]`
		}

		if ( seen.has( input ) ) {
			return '[Circular]'
		}

		if ( depth >= maxDepth ) {
			return Array.isArray( input ) ? `[Array(${ input.length })]` : '[Object]'
		}

		seen.add( input )

		if ( input instanceof Error ) {
			const error = {
				name: input.name,
				message: input.message
			}

			if ( input.code ) {
				error.code = input.code
			}

			if ( input.data ) {
				error.data = copy( input.data, depth + 1 )
			}

			return error
		}

		if ( Array.isArray( input ) ) {
			const items = input.slice( 0, maxItems ).map( ( item ) => copy( item, depth + 1 ) )

			if ( input.length > maxItems ) {
				items.push( `… ${ input.length - maxItems } more` )
			}

			return items
		}

		const keys = Object.keys( input )
		const output = {}

		keys.slice( 0, maxItems ).forEach( ( key ) => {
			output[ key ] = copy( input[ key ], depth + 1 )
		} )

		if ( keys.length > maxItems ) {
			output[ '…' ] = `${ keys.length - maxItems } more keys`
		}

		return output
	}

	return copy( value, 0 )
}

/**
 * Pretty-printed preview of a value, cut to a fixed size.
 *
 * @since  0.9.0
 * @param  {*}      value    Value.
 * @param  {Object} [limits] Same limits as `toSafeData`.
 * @return {string}
 */
export const formatPreview = ( value, limits = {} ) => {
	const data = toSafeData( value, limits )

	if ( 'string' === typeof data ) {
		return data
	}

	return JSON.stringify( data, null, 2 )
}

/**
 * Wall clock time with milliseconds, `14:02:13.671`.
 *
 * @since  0.9.0
 * @param  {number} time Milliseconds since the epoch.
 * @return {string}
 */
export const formatClock = ( time ) => {
	const date = new Date( time )
	const pad = ( number, size = 2 ) => String( number ).padStart( size, '0' )

	return `${ pad( date.getHours() ) }:${ pad( date.getMinutes() ) }:${ pad( date.getSeconds() ) }.${ pad( date.getMilliseconds(), 3 ) }`
}

/**
 * Duration in milliseconds, with a thousands separator.
 *
 * @since  0.9.0
 * @param  {number} ms Milliseconds.
 * @return {string}
 */
export const formatDuration = ( ms ) => {
	return `${ Math.round( ms ).toLocaleString( 'en-US' ) } ms`
}

/**
 * The whole log as JSON text, for pasting into a bug report.
 *
 * @since  0.9.0
 * @param  {Object[]} entries Entries, newest first.
 * @return {string}
 */
export const serializeDebugEntries = ( entries ) => {
	const data = entries.map( ( entry ) => ( {
		...toSafeData( entry, { maxDepth: 6, maxItems: 50, maxString: 2000 } ),
		time: formatClock( entry.time )
	} ) )

	return JSON.stringify( data, null, 2 )
}
