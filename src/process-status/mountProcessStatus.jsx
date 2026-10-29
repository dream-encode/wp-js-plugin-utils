import { createRoot, useEffect } from '@wordpress/element'

import ProcessStatus from './ProcessStatus'
import useProcessStatus from './useProcessStatus'

const DISABLED_MARKER = 'deProcessStatusDisabled'

/**
 * The widget plus the page behaviour a PHP-rendered page asks for in its options.
 *
 * Controls matched by `disable` are disabled while a process is unfinished. Only the
 * controls this widget disabled are enabled again, so a control the page disabled for
 * its own reasons stays disabled.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object}          props
 * @param  {string}          [props.disable]    Selector for the controls to disable while a process is unfinished.
 * @param  {string|Function} [props.onComplete] `reload` to reload the page when a process finishes, or a callback.
 * @return {JSX.Element}
 */
const ProcessStatusMount = ( { disable, onComplete, ...props } ) => {
	const { isActive, isLoaded } = useProcessStatus( props )

	useEffect( () => {
		if ( ! disable || ! isLoaded ) {
			return
		}

		document.querySelectorAll( disable ).forEach( ( control ) => {
			if ( isActive && ! control.disabled ) {
				control.disabled = true
				control.dataset[ DISABLED_MARKER ] = '1'

				return
			}

			if ( ! isActive && control.dataset[ DISABLED_MARKER ] ) {
				control.disabled = false

				delete control.dataset[ DISABLED_MARKER ]
			}
		} )
	}, [ disable, isActive, isLoaded ] )

	let handleComplete = onComplete

	if ( 'reload' === onComplete ) {
		handleComplete = () => {
			window.location.reload()
		}
	}

	return (
		<ProcessStatus
			{ ...props }
			onComplete={ 'function' === typeof handleComplete ? handleComplete : undefined }
		/>
	)
}

/**
 * Render the widget into an element, for pages with no React tree of their own.
 *
 * @since  [NEXT_VERSION]
 * @param  {HTMLElement} element Mount element.
 * @param  {Object}      options `ProcessStatus` props, plus `disable` and `onComplete` as described on `ProcessStatusMount`.
 * @return {Function}            Unmounts the widget.
 */
const mountProcessStatus = ( element, options = {} ) => {
	const root = createRoot( element )

	root.render( <ProcessStatusMount { ...options } /> )

	return () => {
		root.unmount()
	}
}

export default mountProcessStatus
