/**
 * Capitalize the first letter of every word.
 *
 * @param  {string}  string  String.
 * @return {string}
 */
export const capitalizeFirstLetter = ( string ) => {
	return string.toLowerCase()
		.replace( /\b[a-z]/g, ( letter ) => {
			return letter.toUpperCase()
		} )
}

/**
 * Trim the trailing slash from a string.
 *
 * @param  {string}  string  String.
 * @return {string}
 */
export const trimTrailingSlash = ( string ) => {
	return string.replace( /\/$/, '' )
}

/**
 * Add leading zeroes to a number.
 *
 * @param  {number}  num     Number.
 * @param  {number}  places  Total places.
 * @return {string}
 */
export const zeroPadNumber = ( num, places ) => {
	return String( num ).padStart( places, '0' )
}
