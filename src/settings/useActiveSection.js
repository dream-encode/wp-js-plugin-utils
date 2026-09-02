import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element'

/**
 * Read the raw section key carried in the URL hash.
 *
 * @since  0.6.3
 * @return {string}  Hash without its leading `#`, or an empty string.
 */
const readHash = () => {
	return window.location.hash.replace( /^#/, '' )
}

/**
 * Read the section key carried in the URL hash.
 *
 * @since  0.6.0
 * @param  {Array}  keys  Known section keys.
 * @return {string|null}  Matching section key, or null when the hash names nothing known.
 */
const readSectionFromHash = ( keys ) => {
	const hash = readHash()

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
 * A page whose sections depend on a setting registers them in two passes: the first
 * render happens before `/wp/v2/settings` answers, so any section gated behind a
 * value is missing from `sections` at that point. A hash naming one of those is
 * therefore unknown when the page mounts. Rather than discard it and fall back to
 * the first section, the requested key is parked and adopted as soon as it appears,
 * which is what makes a link to a gated section work. The parked key is dropped the
 * moment the reader chooses a section themselves, so a late arriving section can
 * never pull them away from what they are looking at.
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

	const requestedSection = useRef( null )

	const [ activeKey, setActiveKey ] = useState( () => {
		const hash = readHash()

		if ( hash && ! keys.includes( hash ) ) {
			requestedSection.current = hash
		}

		return readSectionFromHash( keys ) || keys[ 0 ] || ''
	} )

	useEffect( () => {
		const handleHashChange = () => {
			const hash = readHash()

			if ( ! hash ) {
				return
			}

			if ( keys.includes( hash ) ) {
				requestedSection.current = null

				setActiveKey( hash )

				return
			}

			requestedSection.current = hash
		}

		window.addEventListener( 'hashchange', handleHashChange )

		return () => {
			window.removeEventListener( 'hashchange', handleHashChange )
		}
	}, [ keys ] )

	useEffect( () => {
		if ( ! requestedSection.current ) {
			return
		}

		if ( ! keys.includes( requestedSection.current ) ) {
			return
		}

		setActiveKey( requestedSection.current )

		requestedSection.current = null
	}, [ keys ] )

	useEffect( () => {
		if ( requestedSection.current ) {
			return
		}

		if ( keys.length && ! keys.includes( activeKey ) ) {
			setActiveKey( keys[ 0 ] )
		}
	}, [ keys, activeKey ] )

	const selectSection = useCallback( ( key ) => {
		requestedSection.current = null

		setActiveKey( key )

		window.history.replaceState( null, '', `#${ key }` )
	}, [] )

	return [ activeKey, selectSection ]
}

export default useActiveSection
