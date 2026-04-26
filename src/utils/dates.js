import { __ } from '@wordpress/i18n'

/**
 * Convert a timestamp to a human readable date format, using toLocaleString.
 *
 * @param  {number|string}  timestamp  Unix timestamp (seconds).
 * @param  {string}         [textDomain='default']
 * @return {string}
 */
export const convertTimestampToFriendlyDate = ( timestamp, textDomain = 'default' ) => {
	if ( ! timestamp ) {
		return __( 'N/A', textDomain )
	}

	const date = new Date( Number( timestamp ) * 1000 )

	const options = {
		dateStyle: 'full',
		timeStyle: 'short'
	}

	return date.toLocaleString( undefined, options )
}

/**
 * Convert a timestamp to a human readable time format, using toLocaleTimeString.
 *
 * @param  {number}  timestamp  Unix timestamp (seconds).
 * @param  {string}  [textDomain='default']
 * @return {string}
 */
export const convertTimestampToFriendlyTime = ( timestamp, textDomain = 'default' ) => {
	if ( ! timestamp ) {
		return __( 'N/A', textDomain )
	}

	const date = new Date( timestamp * 1000 )

	const options = {
		timeStyle: 'short'
	}

	return date.toLocaleTimeString( undefined, options )
}

/**
 * Convert a UTC MySQL DateTime to a local date time.
 *
 * @param  {string}  utcDateTime  UTC MySQL DateTime.
 * @return {string}
 */
export const convertUTCMySQLDateTimeToLocalDateTime = ( utcDateTime ) => {
	if ( ! utcDateTime ) {
		return ''
	}

	const localDate = new Date( utcDateTime + 'Z' )

	const options = {
		dateStyle: 'full',
		timeStyle: 'short'
	}

	return localDate.toLocaleString( undefined, options )
}

/**
 * Convert a UTC MySQL DateTime to a local time.
 *
 * @param  {string}  utcDateTime  UTC MySQL DateTime.
 * @return {string}
 */
export const convertUTCMySQLDateTimeToLocalTime = ( utcDateTime ) => {
	if ( ! utcDateTime ) {
		return ''
	}

	const localDate = new Date( utcDateTime + 'Z' )

	const options = {
		timeStyle: 'short'
	}

	return localDate.toLocaleTimeString( undefined, options )
}
