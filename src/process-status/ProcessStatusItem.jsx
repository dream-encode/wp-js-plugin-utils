import { Button } from '@wordpress/components'
import { createInterpolateElement, Fragment, useState } from '@wordpress/element'
import { __, _n, sprintf } from '@wordpress/i18n'

import { BACKGROUND_PROCESSES_PAGE, UNFINISHED_STATUSES } from './constants'
import { formatCount, formatElapsed, formatPercent, formatWhen } from './format'

/**
 * Visual tone of a process, which sets the colour of its pill, bar and box.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object} process Process.
 * @return {string}         `scheduled`, `waiting`, `processing`, `complete`, `warn`, `failed` or `cancelled`.
 */
export const getProcessTone = ( process ) => {
	switch ( process.status ) {
		case 'scheduled':
			return 'scheduled'

		case 'pending':
		case 'queued':
			return 'waiting'

		case 'processing':
			return 'processing'

		case 'complete':
			return process.total_rows_failed > 0 ? 'warn' : 'complete'

		case 'failed':
			return 'failed'

		default:
			return 'cancelled'
	}
}

/**
 * One process in the status widget, with its prerequisite processes nested under it.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object}           props
 * @param  {Object}           props.process        Process from the status route.
 * @param  {string|Function}  [props.unit]         What one row is, or a function of the process returning it.
 * @param  {Function}         [props.getLabel]     Returns a label for a process, or nothing to keep the processor label.
 * @param  {Function}         [props.getTags]      Returns short strings shown as tags beside the status.
 * @param  {boolean}          [props.showLabel]    Whether to show the label.
 * @param  {boolean}          [props.showActions]  Whether to offer Cancel, Retry and Details.
 * @param  {boolean}          [props.isChild]      Whether this is a prerequisite process under another.
 * @param  {number}           props.serverNow      Current server time in seconds.
 * @param  {Function}         [props.onCancel]     Cancels a process by ID.
 * @param  {Function}         [props.onRetry]      Retries a process by ID.
 * @param  {string}           [props.textDomain]   Text domain for translated UI strings.
 * @return {JSX.Element}
 */
const ProcessStatusItem = ( {
	process,
	unit,
	getLabel,
	getTags,
	showLabel = true,
	showActions = true,
	isChild = false,
	serverNow,
	onCancel,
	onRetry,
	textDomain = 'default'
} ) => {
	const [ confirmingCancel, setConfirmingCancel ] = useState( false )
	const [ busyAction, setBusyAction ]             = useState( '' )
	const [ actionError, setActionError ]           = useState( '' )

	const tone         = getProcessTone( process )
	const isUnfinished = UNFINISHED_STATUSES.includes( process.status )
	const label        = ( 'function' === typeof getLabel && getLabel( process ) ) || process.label
	const tags         = 'function' === typeof getTags ? ( getTags( process ) || [] ).filter( Boolean ) : []
	const children     = Array.isArray( process.children ) ? process.children : []

	const unitText = ( 'function' === typeof unit ? unit( process ) : unit ) || __( 'rows', textDomain )

	const totalRows = Number( process.total_rows ) || 0
	const position  = Number( process.current_position ) || 0
	const skipped   = Number( process.total_rows_skipped ) || 0
	const failed    = Number( process.total_rows_failed ) || 0

	const pillText = {
		scheduled: __( 'Scheduled', textDomain ),
		pending: __( 'Pending', textDomain ),
		queued: __( 'Queued', textDomain ),
		processing: __( 'Processing', textDomain ),
		complete: failed > 0
			? sprintf(
				/* translators: %s: number of rows that failed. */
				__( 'Complete · %s failed', textDomain ),
				formatCount( failed )
			)
			: __( 'Complete', textDomain ),
		failed: __( 'Failed', textDomain ),
		cancelled: __( 'Cancelled', textDomain )
	}[ process.status ] || process.status

	/**
	 * Text saying how far the process got, or what it is waiting for.
	 *
	 * @since  [NEXT_VERSION]
	 * @return {string|JSX.Element}
	 */
	const getSummary = () => {
		switch ( process.status ) {
			case 'scheduled': {
				const secondsUntil = ( Number( process.scheduled_time ) || 0 ) - serverNow

				if ( secondsUntil <= 0 ) {
					return __( 'Starting', textDomain )
				}

				if ( secondsUntil < 3600 ) {
					return sprintf(
						/* translators: %s: time until the process starts, such as 12s. */
						__( 'Starts in %s', textDomain ),
						formatElapsed( secondsUntil )
					)
				}

				return sprintf(
					/* translators: %s: date and time the process starts. */
					__( 'Starts %s', textDomain ),
					formatWhen( process.scheduled_time, serverNow, textDomain )
				)
			}

			case 'pending': {
				const waitingOn = children.filter( ( child ) => UNFINISHED_STATUSES.includes( child.status ) ).length

				if ( waitingOn > 0 ) {
					return sprintf(
						/* translators: %d: number of prerequisite processes still running. */
						_n( 'Waiting on %d prerequisite process', 'Waiting on %d prerequisite processes', waitingOn, textDomain ),
						waitingOn
					)
				}

				return __( 'Waiting to start', textDomain )
			}

			case 'queued':
				return __( 'Waiting to start', textDomain )

			case 'processing':
				if ( ! totalRows ) {
					return __( 'Starting', textDomain )
				}

				return createInterpolateElement(
					sprintf(
						/* translators: 1: rows done, 2: total rows, 3: what a row is, such as listings, 4: percent complete. */
						__( '<b>%1$s</b> of %2$s %3$s · %4$s', textDomain ),
						formatCount( position ),
						formatCount( totalRows ),
						unitText,
						formatPercent( process.percent_complete )
					),
					{ b: <b /> }
				)

			case 'complete': {
				const elapsed = process.completed_time && process.start_time
					? Number( process.completed_time ) - Number( process.start_time )
					: 0

				if ( failed > 0 ) {
					return sprintf(
						/* translators: 1: rows done, 2: total rows, 3: what a row is, such as listings. */
						__( '%1$s of %2$s %3$s', textDomain ),
						formatCount( position - failed ),
						formatCount( totalRows ),
						unitText
					)
				}

				if ( elapsed > 0 ) {
					return sprintf(
						/* translators: 1: total rows, 2: what a row is, such as listings, 3: how long it took. */
						__( '%1$s %2$s in %3$s', textDomain ),
						formatCount( totalRows || position ),
						unitText,
						formatElapsed( elapsed )
					)
				}

				return sprintf(
					/* translators: 1: total rows, 2: what a row is, such as listings. */
					__( '%1$s %2$s', textDomain ),
					formatCount( totalRows || position ),
					unitText
				)
			}

			default:
				if ( ! totalRows ) {
					return ''
				}

				return sprintf(
					/* translators: 1: rows done, 2: total rows, 3: what a row is, such as listings. */
					__( 'Stopped at %1$s of %2$s %3$s', textDomain ),
					formatCount( position ),
					formatCount( totalRows ),
					unitText
				)
		}
	}

	/**
	 * When the process ran and who asked for it.
	 *
	 * @since  [NEXT_VERSION]
	 * @return {string[]}
	 */
	const getMeta = () => {
		const meta = []

		if ( 'processing' === process.status && process.start_time ) {
			meta.push(
				sprintf(
					/* translators: 1: date and time started, 2: time running, such as 3m 12s. */
					__( 'Started %1$s · %2$s', textDomain ),
					formatWhen( process.start_time, serverNow, textDomain ),
					formatElapsed( serverNow - Number( process.start_time ) )
				)
			)
		} else if ( isUnfinished && process.user_name ) {
			meta.push(
				sprintf(
					/* translators: %s: name of the user who started the process. */
					__( 'Requested by %s', textDomain ),
					process.user_name
				)
			)
		} else if ( 'complete' === process.status && process.completed_time ) {
			meta.push(
				sprintf(
					/* translators: %s: date and time finished. */
					__( 'Finished %s', textDomain ),
					formatWhen( process.completed_time, serverNow, textDomain )
				)
			)
		} else if ( 'cancelled' === process.status && process.cancelled_time ) {
			meta.push(
				sprintf(
					/* translators: %s: date and time cancelled. */
					__( 'Cancelled %s', textDomain ),
					formatWhen( process.cancelled_time, serverNow, textDomain )
				)
			)
		} else if ( 'failed' === process.status && process.start_time ) {
			meta.push(
				sprintf(
					/* translators: %s: date and time started. */
					__( 'Started %s', textDomain ),
					formatWhen( process.start_time, serverNow, textDomain )
				)
			)
		}

		if ( skipped > 0 ) {
			meta.push(
				sprintf(
					/* translators: %s: number of rows skipped. */
					__( '%s skipped', textDomain ),
					formatCount( skipped )
				)
			)
		}

		if ( failed > 0 && 'complete' !== process.status ) {
			meta.push(
				sprintf(
					/* translators: %s: number of rows that failed. */
					__( '%s failed', textDomain ),
					formatCount( failed )
				)
			)
		}

		return meta
	}

	/**
	 * Run a Cancel or Retry and report a refusal next to the button.
	 *
	 * @since  [NEXT_VERSION]
	 * @param  {string}   action  `cancel` or `retry`.
	 * @param  {Function} handler Called with the process ID.
	 * @return {Promise<void>}
	 */
	const runAction = async ( action, handler ) => {
		setBusyAction( action )
		setActionError( '' )

		try {
			await handler( process.id )

			setConfirmingCancel( false )
		} catch ( error ) {
			setActionError( error?.message || __( 'The request failed.', textDomain ) )
		} finally {
			setBusyAction( '' )
		}
	}

	const showBar  = totalRows > 0 && [ 'processing', 'complete', 'failed', 'cancelled' ].includes( process.status )
	const barWidth = 'complete' === process.status ? 100 : Math.min( 100, Number( process.percent_complete ) || 0 )
	const summary  = getSummary()
	const meta     = getMeta()

	const detailsUrl = `${ BACKGROUND_PROCESSES_PAGE }&backgroundProcessID=${ process.id }`

	const itemClassName = [
		'de-process-status__item',
		`is-${ tone }`,
		isChild ? 'de-process-status__item--child' : ''
	].filter( Boolean ).join( ' ' )

	return (
		<div className={ itemClassName }>
			<div className="de-process-status__line">
				{ showLabel && (
					<span className="de-process-status__label">{ label }</span>
				) }
				<span className={ `de-process-status__pill is-${ tone }` }>{ pillText }</span>
				{ !! summary && (
					<span className="de-process-status__summary">{ summary }</span>
				) }
				{ process.is_dry_run && (
					<span className="de-process-status__tag">{ __( 'Dry run', textDomain ) }</span>
				) }
				{ tags.map( ( tag ) => (
					<span key={ tag } className="de-process-status__tag">{ tag }</span>
				) ) }
			</div>

			{ showBar && (
				<div
					className={ `de-process-status__bar is-${ tone }` }
					role="progressbar"
					aria-valuemin={ 0 }
					aria-valuemax={ 100 }
					aria-valuenow={ Math.floor( barWidth ) }
					aria-label={ label }
				>
					<span style={ { width: `${ barWidth }%` } } />
				</div>
			) }

			{ 'failed' === process.status && !! process.latest_error && (
				<div className="de-process-status__error">{ process.latest_error }</div>
			) }

			{ ( meta.length > 0 || ( showActions && ! isChild ) ) && (
				<div className="de-process-status__meta">
					{ meta.map( ( item ) => (
						<span key={ item }>{ item }</span>
					) ) }

					{ showActions && ! isChild && (
						<span className="de-process-status__actions">
							{ confirmingCancel ? (
								<span className="de-process-status__confirm">
									<span>{ __( 'Cancel this process?', textDomain ) }</span>
									<Button
										variant="link"
										isDestructive
										isBusy={ 'cancel' === busyAction }
										disabled={ !! busyAction }
										onClick={ () => runAction( 'cancel', onCancel ) }
									>
										{ __( 'Cancel process', textDomain ) }
									</Button>
									<Button
										variant="link"
										disabled={ !! busyAction }
										onClick={ () => setConfirmingCancel( false ) }
									>
										{ __( 'Keep running', textDomain ) }
									</Button>
								</span>
							) : (
								<Fragment>
									<a href={ detailsUrl } target="_blank" rel="noreferrer">
										{ __( 'Details', textDomain ) }
									</a>
									{ isUnfinished && 'function' === typeof onCancel && (
										<Button
											variant="link"
											isDestructive
											onClick={ () => setConfirmingCancel( true ) }
										>
											{ __( 'Cancel', textDomain ) }
										</Button>
									) }
									{ 'failed' === process.status && 'function' === typeof onRetry && (
										<Button
											variant="link"
											isBusy={ 'retry' === busyAction }
											disabled={ !! busyAction }
											onClick={ () => runAction( 'retry', onRetry ) }
										>
											{ __( 'Retry', textDomain ) }
										</Button>
									) }
								</Fragment>
							) }
						</span>
					) }
				</div>
			) }

			{ !! actionError && (
				<div className="de-process-status__error">{ actionError }</div>
			) }

			{ children.length > 0 && (
				<div className="de-process-status__children">
					{ children.map( ( child ) => (
						<ProcessStatusItem
							key={ child.id }
							process={ child }
							unit={ unit }
							getLabel={ getLabel }
							getTags={ getTags }
							showLabel
							showActions={ false }
							isChild
							serverNow={ serverNow }
							textDomain={ textDomain }
						/>
					) ) }
				</div>
			) }
		</div>
	)
}

export default ProcessStatusItem
