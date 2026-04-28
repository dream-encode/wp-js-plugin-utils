import {
	Icon,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text
} from '@wordpress/components'

import { useState } from '@wordpress/element'

import Progress from '../Progress/Progress'
import ProcessStatusSummary from './ProcessStatusSummary'

const PENDING_STATUSES = [ 'pending', 'queued' ]

/**
 * Card-level wrapper for a single running process.
 *
 * Renders the process name, optional id and badges, a progress bar, a status
 * summary row, an action button slot and an expandable details section.
 *
 * @param  {Object}        props
 * @param  {string|JSX.Element} props.name                    Display name shown at the top.
 * @param  {string|number} [props.processId]                  Optional id rendered as `#{id}` next to the name.
 * @param  {string}        props.status                       Current process status.
 * @param  {number}        props.percentComplete              Percent complete (0-100).
 * @param  {string}        [props.progressStatus]             Optional override for the Progress bar status modifier.
 * @param  {Object[]}      [props.runs]                       Forwarded to `ProcessStatusSummary`.
 * @param  {number}        [props.startTime]                  Forwarded to `ProcessStatusSummary`.
 * @param  {number}        [props.secondsRemaining]           Forwarded to `ProcessStatusSummary`.
 * @param  {Object}        [props.summaryProps]               Additional props passed to `ProcessStatusSummary`.
 * @param  {JSX.Element}   [props.badges]                     Badges/pill labels rendered after the name (e.g. "DRY RUN").
 * @param  {JSX.Element}   [props.actions]                    Action buttons rendered on the right side.
 * @param  {*}             [props.children]                   Content for the expandable details section (e.g. `<ProcessInfo>`).
 * @param  {boolean}       [props.expandable=true]            Whether the details toggle is rendered.
 * @param  {boolean}       [props.defaultExpanded=false]      Initial expanded state.
 * @param  {string}        [props.className='process']        Wrapper class name.
 * @param  {string[]}      [props.modifierClassNames]         Additional class names appended to the wrapper.
 * @param  {string}        [props.detailsToggleIcon='menu']   Dashicon name for the details toggle.
 * @param  {string}        [props.idClassName='process-id']   Class for the id label.
 * @param  {string}        [props.nameClassName='process-name'] Class for the name label.
 * @param  {string}        [props.actionsClassName='process-buttons'] Class for the actions container.
 * @param  {string}        [props.detailsClassName='details'] Class for the expandable details container.
 * @return {JSX.Element|null}
 */
const ProcessStatusInfo = ( {
	name,
	processId,
	status,
	percentComplete,
	progressStatus,
	runs,
	startTime,
	secondsRemaining,
	summaryProps = {},
	badges,
	actions,
	children,
	expandable = true,
	defaultExpanded = false,
	className = 'process',
	modifierClassNames = [],
	detailsToggleIcon = 'menu',
	idClassName = 'process-id',
	nameClassName = 'process-name',
	actionsClassName = 'process-buttons',
	detailsClassName = 'details'
} ) => {
	const [ showDetails, setShowDetails ] = useState( defaultExpanded )

	const wrapperClassName = [ className, ...modifierClassNames ].filter( Boolean ).join( ' ' )
	const isPending = PENDING_STATUSES.includes( status )
	const showDetailsToggle = expandable && !! children && ! isPending

	const toggleShowDetails = () => {
		setShowDetails( ( current ) => ! current )
	}

	return (
		<div className={ wrapperClassName }>
			<HStack alignment="top">
				<VStack>
					<HStack alignment="left">
						<Text className={ nameClassName }>{ name }</Text>
						{ ( processId || processId === 0 ) && (
							<Text className={ idClassName } variant="muted">
								{ `#${ processId }` }
							</Text>
						) }
						{ badges }
					</HStack>
					<Progress
						currentValue={ percentComplete ?? 0 }
						maxValue={ 100 }
						status={ progressStatus || status }
					/>
					<ProcessStatusSummary
						status={ status }
						percentComplete={ percentComplete }
						runs={ runs }
						startTime={ startTime }
						secondsRemaining={ secondsRemaining }
						{ ...summaryProps }
					/>
				</VStack>
				{ ( showDetailsToggle || actions ) && (
					<div className={ actionsClassName }>
						{ showDetailsToggle && (
							<Icon
								className="process-details-icon"
								icon={ detailsToggleIcon }
								size={ 30 }
								onClick={ toggleShowDetails }
							/>
						) }
						{ actions }
					</div>
				) }
			</HStack>
			{ !! children && (
				<div className={ `${ detailsClassName } ${ showDetails ? 'open' : 'closed' }` }>
					{ children }
				</div>
			) }
		</div>
	)
}

export default ProcessStatusInfo
