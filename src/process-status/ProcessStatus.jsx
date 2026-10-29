import { Fragment, useEffect, useState } from '@wordpress/element'
import { __, sprintf } from '@wordpress/i18n'

import { BACKGROUND_PROCESSES_PAGE } from './constants'
import { formatElapsed } from './format'
import ProcessStatusItem from './ProcessStatusItem'
import { injectProcessStatusStyles } from './styles'
import useProcessStatus from './useProcessStatus'

/**
 * Current time in milliseconds, updated on an interval.
 *
 * @since  [NEXT_VERSION]
 * @param  {number} interval Update interval in milliseconds.
 * @return {number}
 */
const useClock = ( interval ) => {
	const [ now, setNow ] = useState( () => Date.now() )

	useEffect( () => {
		const timer = setInterval( () => {
			setNow( Date.now() )
		}, interval )

		return () => {
			clearInterval( timer )
		}
	}, [ interval ] )

	return now
}

/**
 * Status of the background processes a page starts, shown on that page.
 *
 * The panel lists every unfinished process with the most recent finished ones under
 * it. The inline size shows the unfinished processes, or the most recent finished one,
 * and suits a spot directly under the button that starts the process.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object}           props
 * @param  {string[]}         [props.processors]       Processor keys.
 * @param  {string}           [props.group]            Processor group.
 * @param  {number}           [props.history=1]        Finished processes to keep for each processor.
 * @param  {string}           [props.variant='panel']  `panel` or `inline`.
 * @param  {string}           [props.title]            Panel heading.
 * @param  {string|Function}  [props.unit]             What one row is, such as `listings`, or a function of the process.
 * @param  {Function}         [props.getLabel]         Returns a label for a process, or nothing to keep the processor label.
 * @param  {Function}         [props.getTags]          Returns short strings shown as tags beside the status.
 * @param  {string}           [props.emptyText]        Shown when no process is on record.
 * @param  {boolean}          [props.showActions=true] Whether to offer Cancel, Retry and Details.
 * @param  {boolean}          [props.showFinished=true] Whether to show finished processes.
 * @param  {Function}         [props.onComplete]       Called with a process when it finishes while the page is open.
 * @param  {string}           [props.className]        Extra class name.
 * @param  {string}           [props.textDomain]       Text domain for translated UI strings.
 * @return {JSX.Element}
 */
const ProcessStatus = ( {
	processors = [],
	group = '',
	history = 1,
	variant = 'panel',
	title,
	unit,
	getLabel,
	getTags,
	emptyText,
	showActions = true,
	showFinished = true,
	onComplete,
	className = '',
	textDomain = 'default'
} ) => {
	useEffect( () => {
		injectProcessStatusStyles()
	}, [] )

	const {
		activeProcesses,
		finishedProcesses,
		isLoaded,
		error,
		updatedAt,
		serverOffset,
		cancel,
		retry
	} = useProcessStatus( { processors, group, history, onComplete } )

	const now       = useClock( activeProcesses.length > 0 ? 1000 : 15000 )
	const serverNow = Math.floor( now / 1000 ) + serverOffset
	const isPanel   = 'panel' === variant

	const finishedToShow = showFinished ? finishedProcesses : []
	const inlineFinished = activeProcesses.length ? [] : finishedToShow.slice( 0, 1 )

	const rootClassName = [
		'de-process-status',
		`de-process-status--${ isPanel ? 'panel' : 'inline' }`,
		className
	].filter( Boolean ).join( ' ' )

	/**
	 * Render one process.
	 *
	 * @since  [NEXT_VERSION]
	 * @param  {Object} process Process.
	 * @return {JSX.Element}
	 */
	const renderItem = ( process ) => {
		return (
			<ProcessStatusItem
				key={ process.id }
				process={ process }
				unit={ unit }
				getLabel={ getLabel }
				getTags={ getTags }
				showLabel={ isPanel }
				showActions={ showActions }
				serverNow={ serverNow }
				onCancel={ cancel }
				onRetry={ retry }
				textDomain={ textDomain }
			/>
		)
	}

	/**
	 * Render the body: a loading line, an error, the empty text, or the processes.
	 *
	 * @since  [NEXT_VERSION]
	 * @return {JSX.Element}
	 */
	const renderBody = () => {
		if ( ! isLoaded ) {
			return (
				<p className="de-process-status__note">{ __( 'Loading process status…', textDomain ) }</p>
			)
		}

		const shown = isPanel ? [ ...activeProcesses, ...finishedToShow ] : [ ...activeProcesses, ...inlineFinished ]

		if ( error && ! shown.length ) {
			return (
				<p className="de-process-status__note is-error">
					{ sprintf(
						/* translators: %s: error message. */
						__( 'Process status unavailable: %s', textDomain ),
						error
					) }
				</p>
			)
		}

		if ( ! shown.length ) {
			return (
				<p className="de-process-status__note">{ emptyText || __( 'No process on record.', textDomain ) }</p>
			)
		}

		if ( ! isPanel ) {
			return shown.map( renderItem )
		}

		return (
			<Fragment>
				{ activeProcesses.map( renderItem ) }
				{ finishedToShow.length > 0 && (
					<Fragment>
						<div className="de-process-status__subhead">
							{ __( 'Last finished', textDomain ) }
						</div>
						{ finishedToShow.map( renderItem ) }
					</Fragment>
				) }
			</Fragment>
		)
	}

	return (
		<div className={ rootClassName }>
			{ isPanel && (
				<div className="de-process-status__head">
					<strong>{ title || __( 'Background processes', textDomain ) }</strong>
					{ updatedAt > 0 && (
						<span className="de-process-status__updated">
							{ sprintf(
								/* translators: %s: time since the last update, such as 4s. */
								__( 'Updated %s ago', textDomain ),
								formatElapsed( ( now - updatedAt ) / 1000 )
							) }
						</span>
					) }
					<a
						className="de-process-status__page-link"
						href={ BACKGROUND_PROCESSES_PAGE }
						target="_blank"
						rel="noreferrer"
					>
						{ __( 'Background Processes', textDomain ) }
					</a>
				</div>
			) }
			<div className="de-process-status__body">
				{ renderBody() }
			</div>
		</div>
	)
}

export default ProcessStatus
