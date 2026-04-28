/**
 * HTML `<progress>` bar with a status modifier class.
 *
 * @param  {Object}  props
 * @param  {number}  props.currentValue              Current value.
 * @param  {number}  [props.maxValue=100]            Maximum value.
 * @param  {string}  [props.status]                  Status modifier appended to the class name (e.g. `processing`).
 * @param  {string}  [props.id='progress-bar']       DOM id.
 * @param  {string}  [props.className='progress-bar'] Base class name.
 * @return {JSX.Element}
 */
const Progress = ( {
	currentValue,
	maxValue = 100,
	status,
	id = 'progress-bar',
	className = 'progress-bar'
} ) => {
	const classes = [ className, status ].filter( Boolean ).join( ' ' )

	return (
		<progress id={ id } className={ classes } value={ currentValue } max={ maxValue }>{ currentValue }%</progress>
	)
}

export default Progress
