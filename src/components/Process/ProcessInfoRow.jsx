import { isValidElement } from '@wordpress/element'

import {
	__experimentalText as Text
} from '@wordpress/components'

/**
 * A single key/value row inside `ProcessInfo`.
 *
 * Either pass a primitive `value` or pass JSX as `children`. If `children` is
 * provided the value cell is rendered as a `div` (so it can host buttons,
 * spans, refs, etc.). Otherwise it is rendered as a `Text` cell.
 *
 * @param  {Object}                 props
 * @param  {string|JSX.Element}     props.label              The row label (key cell).
 * @param  {*}                      [props.value]            Primitive value to render in the value cell.
 * @param  {*}                      [props.children]         Custom value content.
 * @param  {boolean}                [props.show=true]        Render the row only when truthy.
 * @param  {string}                 [props.className='row']  Row wrapper class name.
 * @param  {string}                 [props.keyClassName='key']
 * @param  {string}                 [props.valueClassName='value']
 * @return {JSX.Element|null}
 */
const ProcessInfoRow = ( {
	label,
	value,
	children,
	show = true,
	className = 'row',
	keyClassName = 'key',
	valueClassName = 'value'
} ) => {
	if ( ! show ) {
		return null
	}

	const content = children !== undefined ? children : value
	const isComplexContent = isValidElement( content ) || Array.isArray( content )

	return (
		<div className={ className }>
			<Text className={ keyClassName }>{ label }</Text>
			{ isComplexContent ? (
				<div className={ valueClassName }>{ content }</div>
			) : (
				<Text className={ valueClassName }>{ content }</Text>
			) }
		</div>
	)
}

export default ProcessInfoRow
