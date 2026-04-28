import { zeroPadNumber } from './strings'

/**
 * Convert seconds to a human readable format.
 * Example: "3 days, 11 hours, 2 minutes, 58 seconds".
 *
 * @param  {number}  seconds  Seconds remaining.
 * @return {string|false}
 */
export const secondsToDhms = ( seconds ) => {
	if ( seconds <= 0 ) {
		return false
	}

	seconds = Number( seconds )

	const d = Math.floor( seconds / ( 3600 * 24 ) )
	const h = Math.floor( seconds % ( 3600 * 24 ) / 3600 )
	const m = Math.floor( seconds % 3600 / 60 )
	const s = Math.floor( seconds % 60 )

	const dDisplay = d > 0 ? d + ( 1 === d ? ' day, ' : ' days, ' ) : ''
	const hDisplay = h > 0 ? h + ( 1 === h ? ' hour, ' : ' hours, ' ) : ''
	const mDisplay = m > 0 ? m + ( 1 === m ? ' minute, ' : ' minutes, ' ) : ''
	const sDisplay = s > 0 ? s + ( 1 === s ? ' second' : ' seconds' ) : ''

	return dDisplay + hDisplay + mDisplay + sDisplay
}

/**
 * Convert seconds to a human readable format, using toISOString.
 * Example: "2:58".
 *
 * @param  {number}  seconds  Seconds remaining.
 * @return {string|false}
 */
export const secondsToDhmsShortIso = ( seconds ) => {
	if ( seconds <= 0 ) {
		return false
	}

	if ( seconds < 3600 ) {
		return new Date( seconds * 1000 ).toISOString().substring( 14, 19 )
	}

	return new Date( seconds * 1000 ).toISOString().substring( 11, 16 )
}

/**
 * Convert seconds to a human readable format, but a bit shorter.
 * Example: "11:02:59".
 *
 * @param  {number}  seconds  Seconds remaining.
 * @return {string|false}
 */
export const secondsToDhmsShort = ( seconds ) => {
	if ( seconds <= 0 ) {
		return false
	}

	seconds = Number( seconds )

	const h = Math.floor( seconds % ( 3600 * 24 ) / 3600 )
	const m = Math.floor( seconds % 3600 / 60 )
	const s = Math.floor( seconds % 60 )

	const hDisplay = h > 0 ? h + ':' : ''
	const mDisplay = ( h > 0 ) ? zeroPadNumber( m, 2 ) + ':' : ( m > 0 ) ? m + ':' : zeroPadNumber( m, 1 ) + ':'
	const sDisplay = seconds > 0 ? zeroPadNumber( s, 2 ) : ''

	return hDisplay + mDisplay + sDisplay
}

/**
 * Add a number of seconds to the current time.
 *
 * @param  {number}  seconds  Seconds to add.
 * @return {number}
 */
export const addSecondsToCurrentTime = ( seconds ) => {
	let rawDate = new Date()

	rawDate = new Date( rawDate.getTime() + Number( seconds * 1000 ) )

	return rawDate.getTime() / 1000
}

/**
 * Calculate an estimated time remaining based on elapsed time and percent complete.
 *
 * @param  {number}  startTime        Unix timestamp (seconds) when the process started.
 * @param  {number}  percentComplete  Percent complete (0-100).
 * @return {number}
 */
export const calculateEstimatedTimeRemainingSimple = ( startTime, percentComplete ) => {
	if ( ! startTime || percentComplete <= 0 || percentComplete >= 100 ) {
		return 0
	}

	const secondsSinceStartTime = Date.now() / 1000 - Number( startTime )
	const decimalComplete = percentComplete / 100
	const totalSeconds = secondsSinceStartTime / decimalComplete
	const remaining = totalSeconds - secondsSinceStartTime

	return Math.max( 1, remaining )
}

/**
 * Calculate an estimated time remaining, using Simple Moving Average (SMA).
 *
 * @param  {number[]}  times   Array of previous run times (seconds).
 * @param  {number}    window  Subset of times to use.
 * @param  {number}    n       Number of loops.
 * @return {number[]}
 */
export const calculateEstimatedTimeRemainingUsingSMA = ( times, window = 2, n = Infinity ) => {
	if ( ! times || times.length < window ) {
		return []
	}

	let index = window - 1

	const length = times.length + 1

	const simpleMovingAverages = []

	let numberOfSMAsCalculated = 0

	while ( ++index < length && numberOfSMAsCalculated++ < n ) {
		const windowSlice = times.slice( index - window, index )
		const sum = windowSlice.reduce( ( prev, curr ) => prev + curr, 0 )

		simpleMovingAverages.push( sum / window )
	}

	return simpleMovingAverages
}

/**
 * Calculate an estimated time remaining, using Exponential Moving Average (EMA).
 *
 * Each run object should expose at least `start_time`. Optional fields
 * `completed_time`, `last_attempt_time` and `total_time` are used when present.
 *
 * @param  {Object[]}  runs           Array of process run records.
 * @param  {number}    window         Subset of times to use.
 * @param  {boolean}   useCycleTime   Whether to use full cycle time instead of pure processing time.
 * @return {{emaValues: number[], avgTime: number}}
 */
export const calculateEstimatedTimeRemainingUsingEMA = ( runs, window = 2, useCycleTime = true ) => {
	if ( ! runs || runs.length < window + 1 ) {
		return {
			emaValues: [],
			avgTime: 0
		}
	}

	const sortedRuns = [ ...runs ].sort( ( a, b ) =>
		Number( a.start_time ) - Number( b.start_time )
	)

	let timesToUse = []

	if ( useCycleTime ) {
		const runsWithCycleTimes = []

		for ( let i = 1; i < sortedRuns.length; i++ ) {
			const previousRun = sortedRuns[ i - 1 ]
			const currentRun = sortedRuns[ i ]

			const processingTime = ( currentRun.completed_time )
				? Number( currentRun.completed_time ) - Number( currentRun.start_time )
				: ( ( currentRun.last_attempt_time ) ? Number( currentRun.last_attempt_time ) - Number( currentRun.start_time ) : 0 )

			const previousEndTime = ( previousRun.completed_time )
				? Number( previousRun.completed_time )
				: ( ( previousRun.last_attempt_time ) ? Number( previousRun.last_attempt_time ) : Number( previousRun.start_time ) )

			const currentEndTime = ( currentRun.completed_time )
				? Number( currentRun.completed_time )
				: ( ( currentRun.last_attempt_time ) ? Number( currentRun.last_attempt_time ) : Number( currentRun.start_time ) )

			const cycleTime = currentEndTime - previousEndTime

			if ( cycleTime > 0 && processingTime > 0 ) {
				runsWithCycleTimes.push( {
					...currentRun,
					total_time: processingTime,
					cycle_time: cycleTime
				} )
			}
		}

		if ( runsWithCycleTimes.length < window ) {
			return {
				emaValues: [],
				avgTime: 0
			}
		}

		timesToUse = runsWithCycleTimes.map( ( run ) => run.cycle_time )
	} else {
		timesToUse = sortedRuns.map( ( run ) => {
			if ( typeof run.total_time === 'number' && run.total_time > 0 ) {
				return run.total_time
			}

			const startTime = ( run.start_time ) ? Number( run.start_time ) : null
			const endTime = ( run.completed_time )
				? Number( run.completed_time )
				: ( ( run.last_attempt_time ) ? Number( run.last_attempt_time ) : null )

			return ( startTime && endTime ) ? endTime - startTime : 0
		} ).filter( ( time ) => time > 0 )

		if ( timesToUse.length < window ) {
			return {
				emaValues: [],
				avgTime: 0
			}
		}
	}

	let index = window - 1
	let previousEmaIndex = 0

	const length = timesToUse.length
	const smoothingFactor = 2 / ( window + 1 )
	const exponentialMovingAverages = []

	const smaValues = calculateEstimatedTimeRemainingUsingSMA( timesToUse, window, 1 )
	const sma = ( smaValues.length > 0 ) ? smaValues[ 0 ] : 0

	if ( sma <= 0 ) {
		return {
			emaValues: [],
			avgTime: 0
		}
	}

	exponentialMovingAverages.push( sma )

	while ( ++index < length ) {
		const value = timesToUse[ index ]
		const previousEma = exponentialMovingAverages[ previousEmaIndex++ ]
		const currentEma = ( value - previousEma ) * smoothingFactor + previousEma

		exponentialMovingAverages.push( currentEma )
	}

	return {
		emaValues: exponentialMovingAverages,
		avgTime: ( exponentialMovingAverages.length > 0 ) ? exponentialMovingAverages[ exponentialMovingAverages.length - 1 ] : 0
	}
}
