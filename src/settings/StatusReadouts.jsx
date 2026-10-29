/**
 * Turn the `status` prop into a list of readouts, dropping any without text.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object|Object[]|null} status One readout or a list of them, each `{ tone, text }`.
 * @return {Object[]}
 */
export const normalizeStatusReadouts = ( status ) => {
	return ( Array.isArray( status ) ? status : [ status ] ).filter( ( readout ) => !! readout?.text )
}

/**
 * Status readouts, each a coloured dot and a line of text.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object}               props
 * @param  {Object|Object[]|null} props.status One readout or a list of them, each `{ tone, text }`.
 * @return {JSX.Element[]}
 */
const StatusReadouts = ( { status } ) => {
	return normalizeStatusReadouts( status ).map( ( readout, index ) => (
		<span key={ index } className={ `de-settings__status is-${ readout.tone || 'neutral' }` }>
			<span className="de-settings__status-led" aria-hidden="true" />
			{ readout.text }
		</span>
	) )
}

export default StatusReadouts
