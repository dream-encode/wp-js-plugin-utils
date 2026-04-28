import {
	Notice,
	Flex,
	FlexItem,
	FlexBlock,
	Dashicon
} from '@wordpress/components'

import {
	useState,
	useEffect,
	useRef
} from '@wordpress/element'

const iconType = ( type ) => {
	switch ( type ) {
		case 'error':
		case 'warning':
			return 'warning'
		case 'success':
			return 'yes'
		case 'info':
		default:
			return 'info-outline'
	}
}

const NotificationIcon = ( { type } ) => <Dashicon icon={ iconType( type ) } />

/**
 * Single notification rendered inside the drawer.
 *
 * @param  {Object}   props
 * @param  {Object}   props.notification          Notification object: `{ id, type, message }`.
 * @param  {Function} props.onDismiss             Async dismiss handler. Receives the notification id, returns a truthy value on success.
 * @param  {string}   [props.className]           Additional class name applied to the underlying `Notice`.
 * @param  {boolean}  [props.allowHtml]           Render `notification.message` via `dangerouslySetInnerHTML`.
 * @param  {Function} [props.renderMessage]       Custom message renderer. Receives `notification`, returns a node.
 * @param  {Function} [props.onMessageMount]      Called with `(element, notification)` after the message DOM node mounts. Useful for post-render DOM transforms.
 * @param  {number}   [props.dismissAnimationDuration]  Delay (ms) between successful dismiss and the parent removing the item.
 * @return {JSX.Element}
 */
const NotificationItem = ( {
	notification,
	onDismiss,
	className = '',
	allowHtml = false,
	renderMessage,
	onMessageMount,
	dismissAnimationDuration = 500
} ) => {
	const [ dismissing, setDismissing ] = useState( false )
	const messageRef = useRef( null )

	useEffect( () => {
		if ( typeof onMessageMount === 'function' && messageRef.current ) {
			onMessageMount( messageRef.current, notification )
		}
	}, [ notification, onMessageMount ] )

	const dismissNotice = async () => {
		if ( dismissing ) {
			return
		}

		setDismissing( true )

		setTimeout( async () => {
			const result = await onDismiss( notification.id )

			if ( ! result ) {
				setDismissing( false )

				return
			}

			setTimeout( () => {
				setDismissing( false )
			}, dismissAnimationDuration )
		}, 50 )
	}

	const noticeClassName = `${ className } ${ dismissing ? 'dismissing' : '' }`.trim()

	let messageContent

	if ( typeof renderMessage === 'function' ) {
		messageContent = <div ref={ messageRef }>{ renderMessage( notification ) }</div>
	} else if ( allowHtml ) {
		messageContent = <p ref={ messageRef } dangerouslySetInnerHTML={ { __html: notification.message } } />
	} else {
		messageContent = <p ref={ messageRef }>{ notification.message }</p>
	}

	return (
		<Notice
			className={ noticeClassName }
			status={ notification.type }
			isDismissible={ true }
			onRemove={ dismissNotice }
		>
			<Flex>
				<FlexItem>
					<NotificationIcon type={ notification.type } />
				</FlexItem>
				<FlexBlock>
					{ messageContent }
				</FlexBlock>
			</Flex>
		</Notice>
	)
}

export default NotificationItem
