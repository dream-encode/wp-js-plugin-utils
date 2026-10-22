import { useCallback, useState, useSyncExternalStore } from '@wordpress/element'

import { getDebugLogSnapshot, subscribeDebugLog } from '../log'

const LAYOUT_STORAGE_KEY = 'de-debug-overlay-layout'

const DEFAULT_LAYOUT = {
	tab: 'timeline',
	minimized: false,
	docked: false,
	right: 20,
	bottom: 76,
	kinds: {
		store: true,
		fetch: true,
		event: true,
		note: true
	},
	errorsOnly: false
}

/**
 * The current debug log snapshot, re-rendering when it changes.
 *
 * @since  [NEXT_VERSION]
 * @return {Object} `{ entries, stores, paused }`.
 */
export const useDebugSnapshot = () => {
	return useSyncExternalStore( subscribeDebugLog, getDebugLogSnapshot, getDebugLogSnapshot )
}

/**
 * Read the remembered layout. Storage can be missing or refuse access, in which case
 * the defaults are used.
 *
 * @since  [NEXT_VERSION]
 * @return {Object}
 */
const readLayout = () => {
	try {
		const stored = JSON.parse( window.localStorage.getItem( LAYOUT_STORAGE_KEY ) || '{}' )

		return {
			...DEFAULT_LAYOUT,
			...stored,
			kinds: {
				...DEFAULT_LAYOUT.kinds,
				...( stored.kinds || {} )
			}
		}
	} catch {
		return DEFAULT_LAYOUT
	}
}

/**
 * Remember the layout. A browser that refuses storage keeps it for this page only.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object} layout Layout.
 * @return {boolean} Whether it was stored.
 */
const persistLayout = ( layout ) => {
	try {
		window.localStorage.setItem( LAYOUT_STORAGE_KEY, JSON.stringify( layout ) )
	} catch {
		return false
	}

	return true
}

/**
 * Overlay layout and filters, remembered per browser.
 *
 * @since  [NEXT_VERSION]
 * @return {Array} `[ layout, updateLayout ]`. `updateLayout` merges the fields it is given.
 */
export const useOverlayLayout = () => {
	const [ layout, setLayout ] = useState( readLayout )

	const updateLayout = useCallback( ( fields ) => {
		setLayout( ( current ) => {
			const next = {
				...current,
				...fields
			}

			persistLayout( next )

			return next
		} )
	}, [] )

	return [ layout, updateLayout ]
}
