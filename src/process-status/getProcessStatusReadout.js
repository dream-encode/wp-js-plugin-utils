import { __, _n, sprintf } from '@wordpress/i18n'

import { UNFINISHED_STATUSES } from './constants'
import { formatPercent } from './format'

/**
 * Describe a page's unfinished processes as a status readout for the settings rail.
 *
 * Returns null when nothing is unfinished, so the readout drops out of the rail foot.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object[]} processes            Processes from `useProcessStatus()`.
 * @param  {Object}   [options]
 * @param  {string}   [options.label]      Name for a single process. Defaults to the processor label.
 * @param  {string}   [options.textDomain] Text domain for translated UI strings.
 * @return {Object|null}                   Status readout, as `{ tone, text }`.
 */
const getProcessStatusReadout = ( processes, { label, textDomain = 'default' } = {} ) => {
	const unfinished = ( processes || [] ).filter( ( process ) => UNFINISHED_STATUSES.includes( process.status ) )

	if ( ! unfinished.length ) {
		return null
	}

	if ( unfinished.length > 1 ) {
		return {
			tone: 'busy',
			text: sprintf(
				/* translators: %d: number of unfinished background processes. */
				_n( '%d process active', '%d processes active', unfinished.length, textDomain ),
				unfinished.length
			)
		}
	}

	const process = unfinished[ 0 ]
	const name    = label || process.label

	if ( 'processing' === process.status && Number( process.total_rows ) > 0 ) {
		return {
			tone: 'busy',
			text: sprintf(
				/* translators: 1: process name, 2: percent complete. */
				__( '%1$s · %2$s', textDomain ),
				name,
				formatPercent( process.percent_complete )
			)
		}
	}

	if ( 'processing' === process.status ) {
		return {
			tone: 'busy',
			text: sprintf(
				/* translators: %s: process name. */
				__( '%s running', textDomain ),
				name
			)
		}
	}

	if ( 'scheduled' === process.status ) {
		return {
			tone: 'busy',
			text: sprintf(
				/* translators: %s: process name. */
				__( '%s scheduled', textDomain ),
				name
			)
		}
	}

	return {
		tone: 'busy',
		text: sprintf(
			/* translators: %s: process name. */
			__( '%s queued', textDomain ),
			name
		)
	}
}

export default getProcessStatusReadout
