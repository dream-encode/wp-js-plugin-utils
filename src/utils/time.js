import { zeroPadNumber } from './strings'

/**
 * Convert seconds to a human readable format.
 * Example: "3 days, 11 hours, 2 minutes, 58 seconds".
 *
 * @param  {number}  seconds  Seconds remaining.
 * @return {string|false}
 */
export const secondsToDhms = ( seconds ) => {
	if ( seconds <= 0 ) {
		return false
	}

	seconds = Number( seconds )

	const d = Math.floor( seconds / ( 3600 * 24 ) )
	const h = Math.floor( seconds % ( 3600 * 24 ) / 3600 )
	const m = Math.floor( seconds % 3600 / 60 )
	const s = Math.floor( seconds % 60 )

	const dDisplay = d > 0 ? d + ( 1 === d ? ' day, ' : ' days, ' ) : ''
	const hDisplay = h > 0 ? h + ( 1 === h ? ' hour, ' : ' hours, ' ) : ''
	const mDisplay = m > 0 ? m + ( 1 === m ? ' minute, ' : ' minutes, ' ) : ''
	const sDisplay = s > 0 ? s + ( 1 === s ? ' second' : ' seconds' ) : ''

	return dDisplay + hDisplay + mDisplay + sDisplay
}

/**
 * Convert seconds to a human readable format, using toISOString.
 * Example: "2:58".
 *
 * @param  {number}  seconds  Seconds remaining.
 * @return {string|false}
 */
export const secondsToDhmsShortIso = ( seconds ) => {
	if ( seconds <= 0 ) {
		return false
	}

	if ( seconds < 3600 ) {
		return new Date( seconds * 1000 ).toISOString().substring( 14, 19 )
	}

	return new Date( seconds * 1000 ).toISOString().substring( 11, 16 )
}

/**
 * Convert seconds to a human readable format, but a bit shorter.
 * Example: "11:02:59".
 *
 * @param  {number}  seconds  Seconds remaining.
 * @return {string|false}
 */
export const secondsToDhmsShort = ( seconds ) => {
	if ( seconds <= 0 ) {
		return false
	}

	seconds = Number( seconds )

	const h = Math.floor( seconds % ( 3600 * 24 ) / 3600 )
	const m = Math.floor( seconds % 3600 / 60 )
	const s = Math.floor( seconds % 60 )

	const hDisplay = h > 0 ? h + ':' : ''
	const mDisplay = ( h > 0 ) ? zeroPadNumber( m, 2 ) + ':' : ( m > 0 ) ? m + ':' : zeroPadNumber( m, 1 ) + ':'
	const sDisplay = seconds > 0 ? zeroPadNumber( s, 2 ) : ''

	return hDisplay + mDisplay + sDisplay
}

/**
 * Add a number of seconds to the current time.
 *
 * @param  {number}  seconds  Seconds to add.
 * @return {number}
 */
export const addSecondsToCurrentTime = ( seconds ) => {
	let rawDate = new Date()

	rawDate = new Date( rawDate.getTime() + Number( seconds * 1000 ) )

	return rawDate.getTime() / 1000
}
