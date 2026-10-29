import { __, sprintf } from '@wordpress/i18n'

/**
 * Format a count with the viewer's digit grouping.
 *
 * @since  [NEXT_VERSION]
 * @param  {number} value Count.
 * @return {string}
 */
export const formatCount = ( value ) => {
	return ( Number( value ) || 0 ).toLocaleString()
}

/**
 * Format a percentage, rounded down so a process never reads 100% before it finishes.
 *
 * @since  [NEXT_VERSION]
 * @param  {number} value Percentage.
 * @return {string}
 */
export const formatPercent = ( value ) => {
	return `${ Math.floor( Number( value ) || 0 ) }%`
}

/**
 * Format a duration as `12s`, `6m 41s` or `1h 02m`.
 *
 * @since  [NEXT_VERSION]
 * @param  {number} seconds Duration in seconds.
 * @return {string}
 */
export const formatElapsed = ( seconds ) => {
	const total = Math.max( 0, Math.round( Number( seconds ) || 0 ) )

	if ( total < 60 ) {
		return `${ total }s`
	}

	const minutes = Math.floor( total / 60 )

	if ( minutes < 60 ) {
		return `${ minutes }m ${ String( total % 60 ).padStart( 2, '0' ) }s`
	}

	return `${ Math.floor( minutes / 60 ) }h ${ String( minutes % 60 ).padStart( 2, '0' ) }m`
}

/**
 * Format a timestamp as `today at 2:48 PM` or `Oct 27 at 11:15 PM`.
 *
 * @since  [NEXT_VERSION]
 * @param  {number} timestamp    Unix timestamp in seconds.
 * @param  {number} now          Current Unix timestamp in seconds.
 * @param  {string} [textDomain] Text domain for translated UI strings.
 * @return {string}
 */
export const formatWhen = ( timestamp, now, textDomain = 'default' ) => {
	if ( ! timestamp ) {
		return ''
	}

	const date  = new Date( Number( timestamp ) * 1000 )
	const today = new Date( Number( now ) * 1000 )
	const time  = date.toLocaleTimeString( undefined, { hour: 'numeric', minute: '2-digit' } )

	if ( date.toDateString() === today.toDateString() ) {
		return sprintf(
			/* translators: %s: time of day. */
			__( 'today at %s', textDomain ),
			time
		)
	}

	const day = date.toLocaleDateString( undefined, {
		month: 'short',
		day: 'numeric',
		year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric'
	} )

	return sprintf(
		/* translators: 1: date, 2: time of day. */
		__( '%1$s at %2$s', textDomain ),
		day,
		time
	)
}
