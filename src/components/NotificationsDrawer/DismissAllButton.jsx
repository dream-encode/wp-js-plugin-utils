import { __ } from '@wordpress/i18n'

import {
	Button
} from '@wordpress/components'

import {
	useState
} from '@wordpress/element'

/**
 * "Dismiss All" button used inside the notifications drawer.
 *
 * @param  {Object}   props
 * @param  {Function} props.onDismissAll          Async dismiss-all handler. Returns truthy on success.
 * @param  {Function} [props.onDismissingChange]  Optional callback invoked with `true` when dismiss-all begins and `false` once the animation completes (or the request fails).
 * @param  {string}   [props.textDomain]          Translation domain for the button label.
 * @param  {number}   [props.startDelay]          Delay (ms) before the API call fires after dismiss-all begins, to allow the start animation to play.
 * @param  {number}   [props.resetDelay]          Delay (ms) after a successful dismiss-all before resetting the busy state.
 * @return {JSX.Element}
 */
const DismissAllButton = ( {
	onDismissAll,
	onDismissingChange,
	textDomain = 'default',
	startDelay = 300,
	resetDelay = 800
} ) => {
	const [ dismissing, setDismissing ] = useState( false )

	const dismissAll = async () => {
		if ( dismissing ) {
			return
		}

		setDismissing( true )

		if ( typeof onDismissingChange === 'function' ) {
			onDismissingChange( true )
		}

		setTimeout( async () => {
			const result = await onDismissAll()

			if ( ! result ) {
				setDismissing( false )

				if ( typeof onDismissingChange === 'function' ) {
					onDismissingChange( false )
				}

				return
			}

			setTimeout( () => {
				setDismissing( false )

				if ( typeof onDismissingChange === 'function' ) {
					onDismissingChange( false )
				}
			}, resetDelay )
		}, startDelay )
	}

	return (
		<div className="dismiss-all">
			<Button
				className="dismiss-all-button"
				variant="secondary"
				size="default"
				isBusy={ dismissing }
				disabled={ dismissing }
				onClick={ dismissAll }
			>
				{ dismissing
					? __( 'Dismissing...', textDomain )
					: __( 'Dismiss All', textDomain )
				}
			</Button>
		</div>
	)
}

export default DismissAllButton
