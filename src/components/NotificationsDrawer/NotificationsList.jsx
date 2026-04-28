import {
	useState
} from '@wordpress/element'

import NotificationItem from './NotificationItem'
import DismissAllButton from './DismissAllButton'

/**
 * List of notifications with a "Dismiss All" control.
 *
 * Stateless with respect to the notifications array — the consumer owns the
 * source-of-truth and is expected to update it from within `onDismiss`/`onDismissAll`.
 *
 * @param  {Object}   props
 * @param  {Array}    props.notifications                Array of `{ id, type, message }` objects.
 * @param  {Function} props.onDismiss                    Async per-item dismiss handler. Receives the notification id, returns truthy on success.
 * @param  {Function} props.onDismissAll                 Async dismiss-all handler. Returns truthy on success.
 * @param  {string}   [props.textDomain]                 Translation domain for built-in strings.
 * @param  {boolean}  [props.allowHtml]                  Render notification messages via `dangerouslySetInnerHTML`.
 * @param  {Function} [props.renderMessage]              Custom message renderer. Receives `notification`.
 * @param  {Function} [props.onMessageMount]             Called with `(element, notification)` after each message DOM node mounts.
 * @param  {string}   [props.containerClassName]         Additional class names for the list container.
 * @param  {string}   [props.itemClassName]              Class name applied to each `NotificationItem`'s underlying `Notice`.
 * @param  {boolean}  [props.showDismissAll]             Toggle visibility of the "Dismiss All" button.
 * @param  {boolean}  [props.alwaysRender]               When true, the list container is rendered even when empty (useful while a dismiss-all animation is running).
 * @param  {number}   [props.dismissAnimationDuration]   Forwarded to each `NotificationItem`.
 * @param  {number}   [props.dismissAllStartDelay]       Forwarded to `DismissAllButton`.
 * @param  {number}   [props.dismissAllResetDelay]       Forwarded to `DismissAllButton`.
 * @return {JSX.Element|null}
 */
const NotificationsList = ( {
	notifications,
	onDismiss,
	onDismissAll,
	textDomain = 'default',
	allowHtml = false,
	renderMessage,
	onMessageMount,
	containerClassName = '',
	itemClassName = '',
	showDismissAll = true,
	alwaysRender = false,
	dismissAnimationDuration = 500,
	dismissAllStartDelay = 300,
	dismissAllResetDelay = 800
} ) => {
	const [ isDismissingAll, setIsDismissingAll ] = useState( false )

	const count = notifications?.length || 0

	if ( ! alwaysRender && count === 0 && ! isDismissingAll ) {
		return null
	}

	const className = `messages-container ${ containerClassName } ${ isDismissingAll ? 'dismissing-all' : '' }`.trim()

	return (
		<div className={ className }>
			{ showDismissAll && count > 0 && (
				<DismissAllButton
					onDismissAll={ onDismissAll }
					onDismissingChange={ setIsDismissingAll }
					textDomain={ textDomain }
					startDelay={ dismissAllStartDelay }
					resetDelay={ dismissAllResetDelay }
				/>
			) }
			{ notifications?.map( ( notification ) => (
				<NotificationItem
					key={ notification.id }
					notification={ notification }
					onDismiss={ onDismiss }
					className={ itemClassName }
					allowHtml={ allowHtml }
					renderMessage={ renderMessage }
					onMessageMount={ onMessageMount }
					dismissAnimationDuration={ dismissAnimationDuration }
				/>
			) ) }
		</div>
	)
}

export default NotificationsList
