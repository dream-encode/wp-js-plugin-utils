import { createRoot } from '@wordpress/element'

import { isDebugActive } from '../log'
import DebugOverlay from './DebugOverlay'

/**
 * Render the overlay into its own root at the end of `<body>`.
 *
 * For pages with no React tree of their own, or none that stays mounted. A page whose
 * UI is inside a `@wordpress/components` Modal should render `<DebugOverlay />` inside
 * the modal instead, or the overlay cannot take keyboard focus.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object} [props] Props passed to `DebugOverlay`.
 * @return {Function|null} Unmounts the overlay, or null when debug is off.
 */
const mountDebugOverlay = ( props = {} ) => {
	if ( ! isDebugActive() || 'undefined' === typeof document ) {
		return null
	}

	const container = document.createElement( 'div' )

	container.className = 'de-debug-root'

	document.body.appendChild( container )

	const root = createRoot( container )

	root.render( <DebugOverlay { ...props } /> )

	return () => {
		root.unmount()
		container.remove()
	}
}

export default mountDebugOverlay
