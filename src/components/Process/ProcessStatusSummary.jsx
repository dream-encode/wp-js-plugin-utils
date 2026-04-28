import { __, sprintf } from '@wordpress/i18n'

import {
	__experimentalText as Text
} from '@wordpress/components'

import {
	useEffect,
	useMemo,
	useRef,
	useState,
	Fragment
} from '@wordpress/element'

import {
	addSecondsToCurrentTime,
	calculateEstimatedTimeRemainingSimple,
	calculateEstimatedTimeRemainingUsingEMA,
	secondsToDhmsShort
} from '../../utils/time'

import { convertTimestampToFriendlyTime } from '../../utils/dates'

import useValueChangeEffect from '../../hooks/useValueChangeEffect'

/**
 * Status summary row for a long-running process.
 *
 * Renders a single horizontal row of muted text describing the current status,
 * percent complete and (when applicable) an estimated time remaining countdown.
 *
 * The consumer is responsible for computing the initial `secondsRemaining`
 * (e.g. via an EMA over previous run cycle times) and passing it in. The
 * component manages the per-second countdown internally and resets it whenever
 * the `secondsRemaining` prop changes.
 *
 * @param  {Object}    props
 * @param  {string}    props.status                            Current process status.
 * @param  {number}    props.percentComplete                   Percent complete (0-100).
 * @param  {number}    [props.secondsRemaining]                Pre-computed seconds remaining. Overrides `runs`/`startTime` when provided.
 * @param  {Object[]}  [props.runs]                            Array of process run records used to compute time remaining via EMA.
 * @param  {number}    [props.startTime]                       Unix timestamp (seconds) the process started. Used for the simple fallback.
 * @param  {number}    [props.emaWindow=2]                     Window size passed to the EMA helper.
 * @param  {boolean}   [props.emaUseCycleTime=true]            Whether the EMA helper should use full cycle time.
 * @param  {string}    [props.className='summary']             Wrapper class name.
 * @param  {boolean}   [props.animatePercent=true]             Animate the percent complete value when it changes.
 * @param  {boolean}   [props.showEstimatedCompletedTime=true] Append the local-time ETA after the time remaining.
 * @param  {JSX.Element} [props.failedAction]                  Slot rendered after the "Failed!" label (e.g. a retry button).
 * @param  {Object}    [props.messages]                        Optional per-status JSX/string overrides keyed by status name.
 * @param  {string}    [props.textDomain='default']            Translation domain for built-in strings.
 * @param  {Object}    [props.labels]                          Per-string label overrides (see `defaultLabels`).
 * @return {JSX.Element|null}
 */
const ProcessStatusSummary = ( {
	status,
	percentComplete,
	secondsRemaining,
	runs,
	startTime,
	emaWindow = 2,
	emaUseCycleTime = true,
	className = 'summary',
	animatePercent = true,
	showEstimatedCompletedTime = true,
	failedAction,
	messages = {},
	textDomain = 'default',
	labels = {}
} ) => {
	const mergedLabels = useMemo( () => ( {
		waiting: __( 'Waiting', textDomain ),
		inProgress: __( 'In-progress', textDomain ),
		complete: __( 'Complete', textDomain ),
		completing: __( 'Completing process', textDomain ),
		failed: __( 'Failed!', textDomain ),
		percentSuffix: __( 'complete', textDomain ),
		calculating: __( 'Calculating time remaining...', textDomain ),
		fewSeconds: __( 'A few seconds remaining', textDomain ),
		/* translators: %s: Time remaining. */
		approxRemaining: __( 'Approx. %s remaining', textDomain ),
		...labels
	} ), [ textDomain, labels ] )

	const percentValue = String( parseFloat( percentComplete ?? 0 ).toFixed( 1 ) )
	const { displayValue: displayPercent, elementRef: percentRef } = useValueChangeEffect(
		percentValue,
		animatePercent ? 'fast' : 'default'
	)

	const [ intervalSecondsRemaining, setIntervalSecondsRemaining ] = useState( false )
	const [ estimatedCompletedTime, setEstimatedCompletedTime ] = useState( false )
	const intervalRef = useRef( null )

	const computedSecondsRemaining = useMemo( () => {
		if ( secondsRemaining !== undefined && secondsRemaining !== null ) {
			return Number( secondsRemaining )
		}

		if ( ! percentComplete || percentComplete >= 100 ) {
			return 0
		}

		if ( Array.isArray( runs ) && runs.length >= 3 ) {
			const { avgTime } = calculateEstimatedTimeRemainingUsingEMA( runs, emaWindow, emaUseCycleTime )

			if ( avgTime > 0 ) {
				const remainingPercentage    = 100 - percentComplete
				const estimatedRemainingRuns = remainingPercentage / ( percentComplete / runs.length )

				return Math.max( 1, avgTime * estimatedRemainingRuns )
			}
		}

		if ( startTime ) {
			return calculateEstimatedTimeRemainingSimple( startTime, percentComplete )
		}

		return 0
	}, [ secondsRemaining, runs, startTime, percentComplete, emaWindow, emaUseCycleTime ] )

	useEffect( () => {
		if ( computedSecondsRemaining && Number( computedSecondsRemaining ) > 0 ) {
			setIntervalSecondsRemaining( Number( computedSecondsRemaining ) )
			setEstimatedCompletedTime( addSecondsToCurrentTime( Number( computedSecondsRemaining ) ) )
		}
	}, [ computedSecondsRemaining ] )

	useEffect( () => {
		if ( intervalRef.current ) {
			clearInterval( intervalRef.current )
			intervalRef.current = null
		}

		if ( intervalSecondsRemaining > 0 && percentComplete < 100 ) {
			intervalRef.current = setInterval( () => {
				setIntervalSecondsRemaining( ( old ) => Math.max( 0, old - 1 ) )
			}, 1000 )
		}

		return () => {
			if ( intervalRef.current ) {
				clearInterval( intervalRef.current )
				intervalRef.current = null
			}
		}
	}, [ intervalSecondsRemaining > 0, percentComplete ] )

	const formattedTimeRemaining = useMemo( () => {
		if ( percentComplete >= 100 || ( intervalSecondsRemaining !== false && intervalSecondsRemaining <= 0 ) ) {
			return mergedLabels.fewSeconds
		}

		if ( ! intervalSecondsRemaining ) {
			return mergedLabels.calculating
		}

		return sprintf( mergedLabels.approxRemaining, secondsToDhmsShort( intervalSecondsRemaining ) || '0:01' )
	}, [ intervalSecondsRemaining, percentComplete, mergedLabels ] )

	const formattedEstimatedCompletedTime = useMemo( () => {
		if ( ! estimatedCompletedTime ) {
			return false
		}

		return ` (${ convertTimestampToFriendlyTime( estimatedCompletedTime, textDomain ) })`
	}, [ estimatedCompletedTime, textDomain ] )

	if ( messages[ status ] !== undefined && messages[ status ] !== null ) {
		return (
			<div className={ className }>
				<Text variant="muted">{ messages[ status ] }</Text>
			</div>
		)
	}

	switch ( status ) {
		case 'pending':
		case 'queued':
			return (
				<div className={ className }>
					<Text variant="muted" className="status">{ mergedLabels.waiting }</Text>
				</div>
			)

		case 'processing':
			if ( percentComplete >= 100 ) {
				return (
					<div className={ className }>
						<Text variant="muted" className="status">{ mergedLabels.completing }</Text>
					</div>
				)
			}

			return (
				<div className={ className }>
					<Text variant="muted" className="status">{ mergedLabels.inProgress }</Text>
					<Text variant="muted" className="divider">|</Text>
					<Text variant="muted" className="percent-complete">
						<span ref={ percentRef }>{ displayPercent }</span>% { mergedLabels.percentSuffix }
					</Text>
					<Text variant="muted" className="divider">|</Text>
					<Text variant="muted" className="time-remaining">
						{ formattedTimeRemaining }{ showEstimatedCompletedTime && formattedEstimatedCompletedTime }
					</Text>
				</div>
			)

		case 'complete':
			return (
				<div className={ className }>
					<Text variant="muted" className="status">{ mergedLabels.complete }</Text>
				</div>
			)

		case 'failed':
			return (
				<div className={ className }>
					<Text variant="muted" isDestructive="true" className="status">{ mergedLabels.failed }</Text>
					{ failedAction && (
						<Fragment>
							<Text variant="muted" className="divider">|</Text>
							{ failedAction }
						</Fragment>
					) }
				</div>
			)

		default:
			return null
	}
}

export default ProcessStatusSummary
