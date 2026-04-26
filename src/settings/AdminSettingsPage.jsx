import { __ } from '@wordpress/i18n'

import {
	Button,
	Placeholder,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalText as Text
} from '@wordpress/components'

import {
	Fragment
} from '@wordpress/element'

import Notices from '../components/Notices'

/**
 * Generic admin settings page shell.
 *
 * Renders a header, loading placeholder, notices, body content, and a
 * standard "Save" button wired to the `useSettings`-style API.
 *
 * @param  {Object}    props
 * @param  {string}    props.title           Page title.
 * @param  {string}    [props.appVersion]    Optional app version to display in the header.
 * @param  {Object}    props.settings        Object returned from a `useSettings` hook (must expose `settingsLoaded`, `settingsSaving`, `saveSettings`).
 * @param  {Function}  [props.onSave]        Optional override for the save handler.
 * @param  {string}    [props.textDomain]    Text domain for translated UI strings.
 * @param  {Function}  props.children        Render-prop receiving `settings` to render the form body.
 * @return {JSX.Element}
 */
const AdminSettingsPage = ( {
	title,
	appVersion,
	settings,
	onSave,
	textDomain = 'default',
	children
} ) => {
	const {
		settingsLoaded,
		settingsSaving,
		saveSettings
	} = settings

	const handleSave = async ( event ) => {
		event.preventDefault()

		if ( typeof onSave === 'function' ) {
			await onSave( event )

			return
		}

		await saveSettings()
	}

	return (
		<Fragment>
			<div className="settings-header">
				<div className="settings-container">
					<div className="settings-logo">
						<h1>{ title }</h1>
						{ appVersion && (
							<Text className="version" variant="muted">(v{ appVersion })</Text>
						) }
					</div>
				</div>
			</div>

			<div className="settings-main">
				{ ! settingsLoaded ? (
					<Placeholder>
						<Spinner />
					</Placeholder>
				) : (
					<Fragment>
						<Notices />

						{ typeof children === 'function' ? children( settings ) : children }

						<HStack alignment="center">
							<Button
								variant="primary"
								isBusy={ settingsSaving }
								disabled={ ! settingsLoaded || settingsSaving }
								isLarge
								target="_blank"
								href="#"
								onClick={ handleSave }
							>
								{ settingsSaving
									? __( 'Saving...', textDomain )
									: __( 'Save', textDomain )
								}
							</Button>
						</HStack>
					</Fragment>
				) }
			</div>
		</Fragment>
	)
}

export default AdminSettingsPage
