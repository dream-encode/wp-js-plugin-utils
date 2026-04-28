/**
 * Wrapper for a process info key/value table.
 *
 * @param  {Object}    props
 * @param  {string}    [props.className]  Wrapper class name. Defaults to `'process-info'`.
 * @param  {*}         props.children     `ProcessInfoRow` children (or any nodes).
 * @return {JSX.Element|null}
 */
const ProcessInfo = ( { className = 'process-info', children } ) => {
	if ( ! children ) {
		return null
	}

	return (
		<div className={ className }>
			{ children }
		</div>
	)
}

export default ProcessInfo
