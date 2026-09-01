import { Button, Spinner } from '@wordpress/components'
import { Fragment, useEffect } from '@wordpress/element'
import { __, _n, sprintf } from '@wordpress/i18n'

import Notices from '../components/Notices'

import SettingsRail from './SettingsRail'
import useActiveSection from './useActiveSection'

/**
 * Settings page shell built around a vertical section rail.
 *
 * Sections are declared rather than nested, so the rail, the open pane, the unsaved
 * markers and the deep link all read from one list. Each entry accepts:
 *
 *     key          Unique section key, and the URL hash that opens it.
 *     title        Rail label and pane heading.
 *     group        Optional rail group heading. Consecutive sections sharing a group
 *                  sit under one heading.
 *     description  Optional sentence under the pane heading.
 *     badge        Optional count shown against the rail item.
 *     type         'actions' for a section whose controls run immediately.
 *     render       Called with the settings object, returns the pane content.
 *
 * A page declaring a single section renders without the rail, since a rail holding
 * one item is chrome rather than navigation. Its status readout moves to the header.
 *
 * A section is marked as edited by matching the `section` declared on each field in
 * `createUseSettings` against the section key, so a field does not have to be listed
 * twice.
 *
 * Everything the page writes goes through the single Save in the header, which names
 * how many fields it will write. A section of type 'actions' hides Save entirely,
 * because nothing on such a section is written by it - a button there has already
 * done its work by the time it returns. Unsaved edits made elsewhere are still
 * reachable from an actions section through the count, which opens the first section
 * holding one.
 *
 * @since  0.6.0
 * @param  {Object}    props
 * @param  {string}    props.title         Page title.
 * @param  {string}    [props.appVersion]  Optional version shown beside the title.
 * @param  {Object}    props.settings      Object returned from a `useSettings` hook.
 * @param  {Array}     props.sections      Section definitions.
 * @param  {Object}    [props.status]      Optional readout for the rail foot, as `{ tone, text }`.
 * @param  {Function}  [props.onSave]      Optional override for the save handler.
 * @param  {string}    [props.textDomain]  Text domain for translated UI strings.
 * @return {JSX.Element}
 */
const RailSettingsPage = ( {
	title,
	appVersion,
	settings,
	sections = [],
	status,
	onSave,
	textDomain = 'default'
} ) => {
	const {
		settingsLoaded,
		settingsSaving,
		saveSettings,
		isDirty = false,
		dirtyCount = 0,
		dirtySections = [],
		discardChanges
	} = settings

	const [ activeKey, selectSection ] = useActiveSection( sections )

	const activeSection = sections.find( ( section ) => section.key === activeKey ) || sections[ 0 ]

	const isActionsSection = 'actions' === activeSection?.type

	const showRail = sections.length > 1

	useEffect( () => {
		if ( ! isDirty ) {
			return undefined
		}

		const handleBeforeUnload = ( event ) => {
			event.preventDefault()

			event.returnValue = ''
		}

		window.addEventListener( 'beforeunload', handleBeforeUnload )

		return () => {
			window.removeEventListener( 'beforeunload', handleBeforeUnload )
		}
	}, [ isDirty ] )

	const handleSave = async ( event ) => {
		event.preventDefault()

		if ( 'function' === typeof onSave ) {
			await onSave( event )

			return
		}

		await saveSettings()
	}

	const unsavedLabel = sprintf(
		/* translators: %d: number of settings fields holding an unsaved edit. */
		_n( '%d unsaved change', '%d unsaved changes', dirtyCount, textDomain ),
		dirtyCount
	)

	const saveLabel = () => {
		if ( settingsSaving ) {
			return __( 'Saving…', textDomain )
		}

		if ( ! isDirty ) {
			return __( 'Saved', textDomain )
		}

		return __( 'Save', textDomain )
	}

	if ( ! activeSection ) {
		return null
	}

	return (
		<div className="de-settings">
			<div className="de-settings__header">
				<div className="de-settings__identity">
					<h1 className="de-settings__title">{ title }</h1>
					{ !! appVersion && (
						<span className="de-settings__version">v{ appVersion }</span>
					) }
				</div>

				{ ! showRail && !! status?.text && (
					<span className={ `de-settings__status is-${ status.tone || 'neutral' }` }>
						<span className="de-settings__status-led" aria-hidden="true" />
						{ status.text }
					</span>
				) }

				<div className="de-settings__header-actions">
					{ isActionsSection ? (
						<Fragment>
							<span className="de-settings__note">
								{ __( 'Actions here run immediately.', textDomain ) }
							</span>
							{ isDirty && dirtySections.length > 0 && (
								<Button
									variant="tertiary"
									onClick={ () => selectSection( dirtySections[ 0 ] ) }
								>
									{ unsavedLabel }
								</Button>
							) }
						</Fragment>
					) : (
						<Fragment>
							{ isDirty && (
								<Fragment>
									<span className="de-settings__unsaved">{ unsavedLabel }</span>
									<Button
										variant="tertiary"
										onClick={ discardChanges }
										disabled={ settingsSaving }
									>
										{ __( 'Discard', textDomain ) }
									</Button>
								</Fragment>
							) }
							<Button
								variant="primary"
								isBusy={ settingsSaving }
								disabled={ ! settingsLoaded || settingsSaving || ! isDirty }
								onClick={ handleSave }
							>
								{ saveLabel() }
							</Button>
						</Fragment>
					) }
				</div>
			</div>

			<div className={ showRail ? 'de-settings__body' : 'de-settings__body is-solo' }>
				{ showRail && (
					<SettingsRail
						sections={ sections }
						activeKey={ activeSection.key }
						onSelect={ selectSection }
						dirtySections={ dirtySections }
						status={ status }
						textDomain={ textDomain }
					/>
				) }

				<div
					className="de-settings__pane"
					id={ `de-settings-pane-${ activeSection.key }` }
					role="tabpanel"
					aria-labelledby={ `de-settings-tab-${ activeSection.key }` }
					tabIndex={ 0 }
				>
					{ ! settingsLoaded ? (
						<div className="de-settings__loading">
							<Spinner />
							<p>{ __( 'Loading settings…', textDomain ) }</p>
						</div>
					) : (
						<Fragment>
							<Notices />

							<div className="de-settings__pane-head">
								<h2>{ activeSection.title }</h2>
								{ !! activeSection.description && (
									<p>{ activeSection.description }</p>
								) }
							</div>

							{ activeSection.render( settings ) }
						</Fragment>
					) }
				</div>
			</div>
		</div>
	)
}

export default RailSettingsPage
