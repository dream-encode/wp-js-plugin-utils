import { useCallback, useEffect, useMemo, useState } from '@wordpress/element'

/**
 * Read the section key carried in the URL hash.
 *
 * @since  0.6.0
 * @param  {Array}  keys  Known section keys.
 * @return {string|null}  Matching section key, or null when the hash names nothing known.
 */
const readSectionFromHash = ( keys ) => {
	const hash = window.location.hash.replace( /^#/, '' )

	return keys.includes( hash ) ? hash : null
}

/**
 * Keep the open settings section in the URL.
 *
 * A settings section is worth linking to - in a ticket, in a message, in
 * documentation - and a page that only ever opens on its first section cannot be
 * linked to at all. The hash is written with `replaceState` rather than pushed, so
 * the browser Back button still leaves the settings page instead of walking back
 * through the sections that were opened.
 *
 * @since  0.6.0
 * @param  {Array}  sections  Section definitions.
 * @return {Array}            The active section key and a setter for it.
 */
const useActiveSection = ( sections ) => {
	const keySignature = sections.map( ( section ) => section.key ).join( '|' )

	const keys = useMemo( () => {
		return keySignature.split( '|' ).filter( Boolean )
	}, [ keySignature ] )

	const [ activeKey, setActiveKey ] = useState( () => {
		return readSectionFromHash( keys ) || keys[ 0 ] || ''
	} )

	useEffect( () => {
		const handleHashChange = () => {
			const nextKey = readSectionFromHash( keys )

			if ( nextKey ) {
				setActiveKey( nextKey )
			}
		}

		window.addEventListener( 'hashchange', handleHashChange )

		return () => {
			window.removeEventListener( 'hashchange', handleHashChange )
		}
	}, [ keys ] )

	useEffect( () => {
		if ( keys.length && ! keys.includes( activeKey ) ) {
			setActiveKey( keys[ 0 ] )
		}
	}, [ keys, activeKey ] )

	const selectSection = useCallback( ( key ) => {
		setActiveKey( key )

		window.history.replaceState( null, '', `#${ key }` )
	}, [] )

	return [ activeKey, selectSection ]
}

export default useActiveSection
