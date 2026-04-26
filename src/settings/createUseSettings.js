import { __, sprintf } from '@wordpress/i18n'

import {
	useState,
	useEffect
} from '@wordpress/element'

import apiFetch from '@wordpress/api-fetch'

import {
	useDispatch
} from '@wordpress/data'

import {
	store as noticesStore
} from '@wordpress/notices'

/**
 * Create a `useSettings` hook for a plugin.
 *
 * Reads/writes settings via the WordPress core REST settings endpoint
 * (`/wp/v2/settings`), keyed by `optionName`. Each entry in `fields`
 * defines a field with `key` (option key), optional `defaultValue`, and
 * optional state name overrides.
 *
 * @param  {Object}   config                Hook configuration.
 * @param  {string}   config.optionName     Top-level option key on the settings endpoint.
 * @param  {Array}    config.fields         Field definitions: `{ key, defaultValue, stateName, setterName }`.
 * @param  {string}   [config.textDomain]   Text domain for translated notice strings.
 * @param  {string}   [config.path]         REST path (default: '/wp/v2/settings').
 * @return {Function}                       A `useSettings` React hook.
 */
const createUseSettings = ( config ) => {
	const {
		optionName,
		fields = [],
		textDomain = 'default',
		path = '/wp/v2/settings'
	} = config

	if ( ! optionName ) {
		throw new Error( '[wp-plugin-utils] createUseSettings: "optionName" is required.' )
	}

	const toCamel = ( key ) => key.replace( /[_-](.)/g, ( _m, c ) => c.toUpperCase() )

	const ucFirst = ( s ) => s.charAt( 0 ).toUpperCase() + s.slice( 1 )

	return function useSettings() {
		const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore )

		const [ settingsLoaded, updateSettingsLoaded ] = useState( false )
		const [ settingsSaving, updateSettingsSaving ] = useState( false )

		const initialState = {}

		fields.forEach( ( field ) => {
			const stateName = field.stateName || toCamel( field.key )
			initialState[ stateName ] = field.defaultValue !== undefined ? field.defaultValue : ''
		} )

		const [ values, setValues ] = useState( initialState )

		const setField = ( stateName ) => ( value ) => {
			setValues( ( prev ) => ( { ...prev, [ stateName ]: value } ) )
		}

		useEffect( () => {
			apiFetch( { path } ).then( ( settings ) => {
				const optionData = settings[ optionName ] || {}

				const next = { ...initialState }

				fields.forEach( ( field ) => {
					const stateName = field.stateName || toCamel( field.key )

					if ( optionData[ field.key ] !== undefined ) {
						next[ stateName ] = optionData[ field.key ]
					}
				} )

				setValues( next )
				updateSettingsLoaded( true )
			} )
		}, [] )

		const saveSettings = async () => {
			updateSettingsSaving( true )

			const optionData = {}

			fields.forEach( ( field ) => {
				const stateName = field.stateName || toCamel( field.key )
				optionData[ field.key ] = values[ stateName ]
			} )

			const saveResult = await apiFetch( {
				path,
				method: 'POST',
				data: { [ optionName ]: optionData }
			} )

			if ( ! saveResult ) {
				updateSettingsSaving( false )

				createErrorNotice(
					sprintf(
						/* translators: %s: Error message. */
						__( 'Error saving settings: %s.', textDomain ),
						saveResult?.message ?? __( 'Unknown error', textDomain )
					)
				)

				return
			}

			updateSettingsSaving( false )

			createSuccessNotice(
				__( 'Settings saved.', textDomain )
			)
		}

		const exposed = {
			settingsLoaded,
			updateSettingsLoaded,
			settingsSaving,
			updateSettingsSaving,
			values,
			setValues,
			saveSettings
		}

		fields.forEach( ( field ) => {
			const stateName = field.stateName || toCamel( field.key )
			const setterName = field.setterName || `update${ ucFirst( stateName ) }`

			exposed[ stateName ] = values[ stateName ]
			exposed[ setterName ] = setField( stateName )
		} )

		return exposed
	}
}

export default createUseSettings
