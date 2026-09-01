import { __, sprintf } from '@wordpress/i18n'

/**
 * Describe a plugin log level as a status readout for the settings rail.
 *
 * Debug is called out in amber because it is the level that costs something to leave
 * switched on, and a settings page is usually the only place that gets noticed.
 *
 * @since  [NEXT_VERSION]
 * @param  {string}  level         Configured log level.
 * @param  {string}  [textDomain]  Text domain for translated UI strings.
 * @return {Object}                Status readout, as `{ tone, text }`.
 */
const getLogLevelStatus = ( level, textDomain = 'default' ) => {
	if ( ! level || 'off' === level ) {
		return {
			tone: 'neutral',
			text: __( 'Logging off', textDomain )
		}
	}

	const label = level.charAt( 0 ).toUpperCase() + level.slice( 1 )

	return {
		tone: 'debug' === level ? 'warn' : 'ok',
		text: sprintf(
			/* translators: %s: configured log level, such as Error or Debug. */
			__( 'Logging: %s', textDomain ),
			label
		)
	}
}

export default getLogLevelStatus
