/**
 * Build fetch GET options with the WP REST nonce header.
 *
 * @param  {string}  nonce  WP REST nonce.
 * @return {Object}
 */
export const fetchGetOptions = ( nonce ) => {
	return {
		headers: {
			'X-WP-Nonce': nonce
		}
	}
}

/**
 * Build fetch POST options with the WP REST nonce header.
 *
 * @param  {Object}  postData  Body to JSON-encode.
 * @param  {string}  nonce     WP REST nonce.
 * @return {Object}
 */
export const fetchPostOptions = ( postData, nonce ) => {
	return {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': nonce
		},
		body: JSON.stringify( postData )
	}
}
