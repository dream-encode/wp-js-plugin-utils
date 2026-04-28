import {
	useEffect,
	useRef,
	useState
} from '@wordpress/element'

import NotificationsList from './NotificationsList'

const DEFAULT_AUTO_HIDE_DELAY = 2000

/**
 * Floating notifications drawer with a count badge and hover/click expansion.
 *
 * The consumer owns the notifications state. Pass it in via `notifications`
 * and provide async `onDismiss(id)` and `onDismissAll()` handlers that update
 * that state on success.
 *
 * @param  {Object}   props
 * @param  {Array}    props.notifications                Array of `{ id, type, message }` objects.
 * @param  {Function} props.onDismiss                    Async per-item dismiss handler. Returns truthy on success.
 * @param  {Function} props.onDismissAll                 Async dismiss-all handler. Returns truthy on success.
 * @param  {string}   [props.textDomain]                 Translation domain for built-in strings.
 * @param  {string}   [props.id]                         DOM id for the drawer container.
 * @param  {string}   [props.className]                  Additional class name for the drawer container.
 * @param  {string}   [props.itemClassName]              Class name applied to each notification's underlying `Notice`.
 * @param  {string}   [props.iconName]                   Dashicon name used for the drawer trigger icon.
 * @param  {boolean}  [props.allowHtml]                  Render notification messages via `dangerouslySetInnerHTML`.
 * @param  {Function} [props.renderMessage]              Custom message renderer. Receives `notification`.
 * @param  {Function} [props.onMessageMount]             Called with `(element, notification)` after each message DOM node mounts.
 * @param  {boolean}  [props.expandOnHover]              Expand the drawer on mouse enter (default true).
 * @param  {boolean}  [props.expandOnClick]              Toggle the drawer on icon click (default true).
 * @param  {number}   [props.autoHideDelay]              Delay (ms) before auto-collapsing after mouse leave.
 * @param  {boolean}  [props.animateOnNew]               Briefly add a `new-message` class to the icon when the count increases (default true).
 * @param  {number}   [props.dismissAnimationDuration]   Forwarded to each notification item.
 * @param  {number}   [props.dismissAllStartDelay]       Forwarded to the dismiss-all button.
 * @param  {number}   [props.dismissAllResetDelay]       Forwarded to the dismiss-all button.
 * @return {JSX.Element|null}
 */
const NotificationsDrawer = ( {
	notifications,
	onDismiss,
	onDismissAll,
	textDomain = 'default',
	id,
	className = '',
	itemClassName = '',
	iconName = 'email',
	allowHtml = false,
	renderMessage,
	onMessageMount,
	expandOnHover = true,
	expandOnClick = true,
	autoHideDelay = DEFAULT_AUTO_HIDE_DELAY,
	animateOnNew = true,
	dismissAnimationDuration = 500,
	dismissAllStartDelay = 300,
	dismissAllResetDelay = 800
} ) => {
	const count = notifications?.length || 0

	const [ isExpanded, setIsExpanded ] = useState( false )
	const [ animate, setAnimate ] = useState( false )

	const prevCountRef = useRef( 0 )
	const containerRef = useRef( null )
	const iconRef = useRef( null )
	const autoHideTimerRef = useRef( null )

	useEffect( () => {
		if ( animateOnNew && count > prevCountRef.current && prevCountRef.current > 0 ) {
			setAnimate( true )

			const timerId = setTimeout( () => setAnimate( false ), 1000 )

			prevCountRef.current = count

			return () => clearTimeout( timerId )
		}

		prevCountRef.current = count
	}, [ count, animateOnNew ] )

	useEffect( () => {
		if ( ! expandOnHover ) {
			return undefined
		}

		const clearAutoHide = () => {
			if ( autoHideTimerRef.current ) {
				clearTimeout( autoHideTimerRef.current )
				autoHideTimerRef.current = null
			}
		}

		const startAutoHide = () => {
			clearAutoHide()

			autoHideTimerRef.current = setTimeout( () => {
				setIsExpanded( false )
			}, autoHideDelay )
		}

		const handleMouseEnter = () => {
			if ( count === 0 ) {
				return
			}

			setIsExpanded( true )
			clearAutoHide()
		}

		const handleMouseLeave = () => {
			startAutoHide()
		}

		const container = containerRef.current
		const icon = iconRef.current

		if ( container ) {
			container.addEventListener( 'mouseenter', handleMouseEnter )
			container.addEventListener( 'mouseleave', handleMouseLeave )
		}

		if ( icon ) {
			icon.addEventListener( 'mouseenter', handleMouseEnter )
			icon.addEventListener( 'mouseleave', handleMouseLeave )
		}

		return () => {
			if ( container ) {
				container.removeEventListener( 'mouseenter', handleMouseEnter )
				container.removeEventListener( 'mouseleave', handleMouseLeave )
			}

			if ( icon ) {
				icon.removeEventListener( 'mouseenter', handleMouseEnter )
				icon.removeEventListener( 'mouseleave', handleMouseLeave )
			}

			clearAutoHide()
		}
	}, [ expandOnHover, autoHideDelay, count ] )

	const handleIconClick = () => {
		if ( ! expandOnClick || count === 0 ) {
			return
		}

		setIsExpanded( ( prev ) => ! prev )
	}

	const containerClassName = `${ className } ${ isExpanded ? 'expanded' : '' }`.trim()

	return (
		<div
			id={ id }
			ref={ containerRef }
			className={ containerClassName }
		>
			<div
				ref={ iconRef }
				className={ `messages-icon ${ animate ? 'new-message' : '' }`.trim() }
				onClick={ handleIconClick }
			>
				<span className={ `dashicons dashicons-${ iconName }` }></span>
				{ count > 0 && (
					<span className="messages-count">{ count }</span>
				) }
			</div>

			{ count > 0 && (
				<NotificationsList
					notifications={ notifications }
					onDismiss={ onDismiss }
					onDismissAll={ onDismissAll }
					textDomain={ textDomain }
					allowHtml={ allowHtml }
					renderMessage={ renderMessage }
					onMessageMount={ onMessageMount }
					itemClassName={ itemClassName }
					dismissAnimationDuration={ dismissAnimationDuration }
					dismissAllStartDelay={ dismissAllStartDelay }
					dismissAllResetDelay={ dismissAllResetDelay }
				/>
			) }
		</div>
	)
}

export default NotificationsDrawer
