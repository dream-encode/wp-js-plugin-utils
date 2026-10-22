import { useEffect, useMemo, useRef, useState } from '@wordpress/element'

import { DEBUG_KIND_FETCH, DEBUG_MAX_ENTRIES } from '../constants'
import { serializeDebugEntries } from '../format'
import { clearDebugLog, getDebugLog, isDebugActive, setDebugPaused } from '../log'
import { isFailureEntry } from './entries'
import { useDebugSnapshot, useOverlayLayout } from './hooks'
import RequestsPanel from './RequestsPanel'
import StatePanel from './StatePanel'
import { injectOverlayStyles } from './styles'
import TimelinePanel from './TimelinePanel'

const NO_ALIASES = {}

const NO_PANELS = []

const EDGE_GAP = 8

const PANEL_WIDTH = 460

const PANEL_HEIGHT = 580

const MIN_VISIBLE = 160

/**
 * Take the page's one overlay slot, if it is free.
 *
 * Two plugins on the same page may both render the overlay. The log is shared, so the
 * first one to mount shows everything and the second renders nothing.
 *
 * @since  [NEXT_VERSION]
 * @param  {symbol} owner Token for this overlay.
 * @return {boolean} Whether this overlay holds the slot.
 */
const claimOverlay = ( owner ) => {
	const log = getDebugLog()

	if ( ! log ) {
		return false
	}

	if ( ! log.overlayOwner ) {
		log.overlayOwner = owner
	}

	return log.overlayOwner === owner
}

/**
 * Icon used by the title bar buttons.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object} props      Props.
 * @param  {string} props.name Icon name.
 * @return {JSX.Element}
 */
const Icon = ( { name } ) => {
	const shapes = {
		pause: <><line x1="9" y1="5" x2="9" y2="19" /><line x1="15" y1="5" x2="15" y2="19" /></>,
		play: <polygon points="7,5 19,12 7,19" />,
		clear: <><circle cx="12" cy="12" r="8" /><line x1="6.5" y1="17.5" x2="17.5" y2="6.5" /></>,
		copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></>,
		dock: <><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="3" y1="14" x2="21" y2="14" /></>,
		float: <><rect x="3" y="4" width="18" height="16" rx="2" /><rect x="11" y="11" width="7" height="6" rx="1" /></>,
		minimize: <line x1="5" y1="12" x2="19" y2="12" />
	}

	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			{ shapes[ name ] }
		</svg>
	)
}

/**
 * Floating debug panel showing the shared log.
 *
 * Renders nothing unless `activateDebug()` switched the log on. Built-in tabs are
 * Timeline, Requests and State; `panels` adds plugin-specific tabs after them.
 *
 * Render it inside a modal when the page has one. `@wordpress/components` Modal keeps
 * focus inside itself and closes on Escape, so an overlay outside it cannot be reached
 * from the keyboard. Escape pressed inside the overlay is stopped here so it never
 * closes the modal.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object}   props                Props.
 * @param  {string}   [props.title]        Title bar text. Default `Debug`.
 * @param  {Object[]} [props.panels]       Extra tabs: `{ key, title, render }`. `render`
 *                                         receives `{ snapshot }`.
 * @param  {Object}   [props.pathAliases]  Map of REST namespace to a short label, e.g.
 *                                         `{ 'my-plugin/v1': 'mp/v1' }`.
 * @param  {Function} [props.footerItems]  Receives the snapshot and returns extra
 *                                         strings for the footer.
 * @return {JSX.Element|null}
 */
const DebugOverlay = ( { title = 'Debug', panels = NO_PANELS, pathAliases = NO_ALIASES, footerItems = null } ) => {
	const ownerRef = useRef( Symbol( 'de-debug-overlay' ) )

	const [ owned ] = useState( () => isDebugActive() && claimOverlay( ownerRef.current ) )
	const [ layout, updateLayout ] = useOverlayLayout()
	const [ query, setQuery ] = useState( '' )
	const [ openId, setOpenId ] = useState( null )
	const [ notice, setNotice ] = useState( '' )
	const [ dragPosition, setDragPosition ] = useState( null )

	const dragRef = useRef( null )
	const rootRef = useRef( null )

	const snapshot = useDebugSnapshot()

	useEffect( () => {
		if ( owned ) {
			injectOverlayStyles()
		}

		return () => {
			const log = getDebugLog()

			if ( log && log.overlayOwner === ownerRef.current ) {
				log.overlayOwner = null
			}
		}
	}, [ owned ] )

	useEffect( () => {
		if ( ! notice ) {
			return undefined
		}

		const timer = setTimeout( () => setNotice( '' ), 2500 )

		return () => clearTimeout( timer )
	}, [ notice ] )

	const { entries, stores, paused } = snapshot

	const counts = useMemo( () => {
		const requests = entries.filter( ( entry ) => DEBUG_KIND_FETCH === entry.kind )

		return {
			requests: requests.length,
			inFlight: requests.filter( ( entry ) => entry.pending ).length,
			failedRequests: requests.filter( ( entry ) => ! entry.pending && false === entry.ok ).length,
			failures: entries.filter( isFailureEntry ).length
		}
	}, [ entries ] )

	if ( ! owned ) {
		return null
	}

	const tabs = [
		{ key: 'timeline', title: 'Timeline', count: entries.length },
		{ key: 'requests', title: 'Requests', count: counts.requests },
		{ key: 'state', title: 'State' },
		...panels.map( ( panel ) => ( { key: panel.key, title: panel.title } ) )
	]

	const activeTab = tabs.some( ( tab ) => tab.key === layout.tab ) ? layout.tab : 'timeline'
	const stored = dragPosition || { right: layout.right, bottom: layout.bottom }
	const position = {
		right: Math.min( stored.right, Math.max( EDGE_GAP, window.innerWidth - MIN_VISIBLE ) ),
		bottom: Math.min( stored.bottom, Math.max( EDGE_GAP, window.innerHeight - MIN_VISIBLE ) )
	}
	const pillStyle = { right: `${ position.right }px`, bottom: `${ position.bottom }px` }
	const rootStyle = layout.docked ? undefined : {
		...pillStyle,
		width: `min(${ PANEL_WIDTH }px, calc(100% - ${ position.right + EDGE_GAP }px))`,
		height: `min(${ PANEL_HEIGHT }px, calc(100% - ${ position.bottom + EDGE_GAP }px))`
	}

	const toggleOpen = ( id ) => {
		setOpenId( openId === id ? null : id )
	}

	const copyLog = () => {
		const text = serializeDebugEntries( entries )

		const fallback = () => {
			window.console.log( text )

			setNotice( 'Copy refused. Log written to the console.' )
		}

		try {
			window.navigator.clipboard.writeText( text ).then(
				() => setNotice( `Copied ${ entries.length } entries` ),
				fallback
			)
		} catch {
			fallback()
		}
	}

	const onKeyDown = ( event ) => {
		if ( 'Escape' !== event.key ) {
			return
		}

		event.stopPropagation()

		if ( openId !== null ) {
			setOpenId( null )
		}
	}

	const onPointerDown = ( event ) => {
		if ( layout.docked || 0 !== event.button || event.target.closest( 'button' ) ) {
			return
		}

		dragRef.current = {
			x: event.clientX,
			y: event.clientY,
			right: position.right,
			bottom: position.bottom,
			rect: rootRef.current.getBoundingClientRect()
		}

		event.currentTarget.setPointerCapture( event.pointerId )
	}

	const onPointerMove = ( event ) => {
		const drag = dragRef.current

		if ( ! drag ) {
			return
		}

		const { rect } = drag
		const dx = Math.min( Math.max( event.clientX - drag.x, EDGE_GAP - rect.left ), window.innerWidth - EDGE_GAP - rect.right )
		const dy = Math.min( Math.max( event.clientY - drag.y, EDGE_GAP - rect.top ), window.innerHeight - EDGE_GAP - rect.bottom )

		setDragPosition( {
			right: Math.max( EDGE_GAP, drag.right - dx ),
			bottom: Math.max( EDGE_GAP, drag.bottom - dy )
		} )
	}

	const onPointerUp = () => {
		if ( ! dragRef.current ) {
			return
		}

		dragRef.current = null

		if ( dragPosition ) {
			updateLayout( dragPosition )
			setDragPosition( null )
		}
	}

	if ( layout.minimized ) {
		return (
			<div className="de-debug" style={ pillStyle } onKeyDown={ onKeyDown }>
				<button
					type="button"
					className="de-debug-pill"
					aria-label={ `Open ${ title } panel` }
					onClick={ () => updateLayout( { minimized: false } ) }
				>
					<span className={ `de-debug-rec${ paused ? ' is-paused' : '' }` } aria-hidden="true" />
					{ title }
					<span className="de-debug-pill-n">{ entries.length }</span>
					{ counts.inFlight > 0 && <span className="de-debug-pill-fly">{ `${ counts.inFlight } in flight` }</span> }
					{ counts.failures > 0 && <span className="de-debug-pill-err">{ `${ counts.failures } failed` }</span> }
				</button>
			</div>
		)
	}

	let body = null

	if ( 'timeline' === activeTab ) {
		body = (
			<TimelinePanel
				entries={ entries }
				layout={ layout }
				updateLayout={ updateLayout }
				query={ query }
				setQuery={ setQuery }
				openId={ openId }
				toggleOpen={ toggleOpen }
				aliases={ pathAliases }
			/>
		)
	} else if ( 'requests' === activeTab ) {
		body = <RequestsPanel entries={ entries } openId={ openId } toggleOpen={ toggleOpen } aliases={ pathAliases } />
	} else if ( 'state' === activeTab ) {
		body = <StatePanel stores={ stores } />
	} else {
		const panel = panels.find( ( item ) => item.key === activeTab )

		body = <div className="de-debug-body">{ panel.render( { snapshot } ) }</div>
	}

	const extraFooter = footerItems ? footerItems( snapshot ) : []

	return (
		<div
			ref={ rootRef }
			className={ `de-debug${ layout.docked ? ' is-docked' : '' }` }
			style={ rootStyle }
			role="region"
			aria-label={ `${ title } log` }
			onKeyDown={ onKeyDown }
		>
			<div className="de-debug-panel">
				<div
					className="de-debug-bar"
					onPointerDown={ onPointerDown }
					onPointerMove={ onPointerMove }
					onPointerUp={ onPointerUp }
					onPointerCancel={ onPointerUp }
				>
					<span className={ `de-debug-rec${ paused ? ' is-paused' : '' }` } aria-hidden="true" />
					<span className="de-debug-name">{ title }</span>
					<span className="de-debug-status" role="status">{ notice || ( paused ? 'Paused' : 'Recording' ) }</span>
					<span className="de-debug-grow" />
					<button type="button" className="de-debug-ib" aria-label={ paused ? 'Resume recording' : 'Pause recording' } title={ paused ? 'Resume recording' : 'Pause recording' } onClick={ () => setDebugPaused( ! paused ) }>
						<Icon name={ paused ? 'play' : 'pause' } />
					</button>
					<button type="button" className="de-debug-ib" aria-label="Clear log" title="Clear log" onClick={ () => {
						setOpenId( null )
						clearDebugLog()
					} }>
						<Icon name="clear" />
					</button>
					<button type="button" className="de-debug-ib" aria-label="Copy log as JSON" title="Copy log as JSON" onClick={ copyLog }>
						<Icon name="copy" />
					</button>
					<button type="button" className="de-debug-ib" aria-label={ layout.docked ? 'Float panel' : 'Dock to bottom' } title={ layout.docked ? 'Float panel' : 'Dock to bottom' } onClick={ () => updateLayout( { docked: ! layout.docked } ) }>
						<Icon name={ layout.docked ? 'float' : 'dock' } />
					</button>
					<button type="button" className="de-debug-ib" aria-label="Minimize" title="Minimize" onClick={ () => updateLayout( { minimized: true } ) }>
						<Icon name="minimize" />
					</button>
				</div>
				<div className="de-debug-tabs" role="tablist" aria-label={ `${ title } views` }>
					{ tabs.map( ( tab ) => (
						<button
							key={ tab.key }
							type="button"
							role="tab"
							className="de-debug-tab"
							aria-selected={ tab.key === activeTab ? 'true' : 'false' }
							onClick={ () => {
								setOpenId( null )
								updateLayout( { tab: tab.key } )
							} }
						>
							{ tab.title }
							{ 'number' === typeof tab.count && <span className="de-debug-n">{ tab.count }</span> }
							{ 'requests' === tab.key && counts.failedRequests > 0 && <span className="de-debug-n is-err">{ `${ counts.failedRequests } failed` }</span> }
						</button>
					) ) }
				</div>
				{ body }
				<div className="de-debug-foot">
					<span>{ `${ entries.length } / ${ DEBUG_MAX_ENTRIES } entries` }</span>
					<span>{ `${ counts.inFlight } in flight` }</span>
					{ extraFooter.map( ( item ) => <span key={ item }>{ item }</span> ) }
				</div>
			</div>
		</div>
	)
}

export default DebugOverlay
