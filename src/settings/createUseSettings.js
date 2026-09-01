import { __, sprintf } from '@wordpress/i18n'

import {
	useEffect,
	useMemo,
	useRef,
	useState
} from '@wordpress/element'

import apiFetch from '@wordpress/api-fetch'

import {
	useDispatch
} from '@wordpress/data'

import {
	store as noticesStore
} from '@wordpress/notices'

/**
 * Serialize a value so two settings payloads can be compared by content.
 *
 * Object keys are sorted before serializing. The working values and the values that
 * came back from the REST endpoint routinely carry the same keys in a different
 * order - an object rebuilt through a spread is the ordinary case - and a plain
 * `JSON.stringify` comparison reports that as an edit.
 *
 * @since  [NEXT_VERSION]
 * @param  {*}  value  Value to serialize.
 * @return {string}    Stable serialization of the value.
 */
const stableStringify = ( value ) => {
	if ( null === value || undefined === value || 'object' !== typeof value ) {
		return JSON.stringify( value ?? null )
	}

	if ( Array.isArray( value ) ) {
		return `[${ value.map( ( item ) => stableStringify( item ) ).join( ',' ) }]`
	}

	const pairs = Object.keys( value )
		.sort()
		.map( ( key ) => `${ JSON.stringify( key ) }:${ stableStringify( value[ key ] ) }` )

	return `{${ pairs.join( ',' ) }}`
}

/**
 * Create a `useSettings` hook for a plugin.
 *
 * Reads/writes settings via the WordPress core REST settings endpoint
 * (`/wp/v2/settings`), keyed by `optionName`. Each entry in `fields`
 * defines a field with `key` (option key), optional `defaultValue`,
 * optional state name overrides, and an optional `section` naming the
 * settings section the field belongs to.
 *
 * The hook keeps the values it loaded, so it can report what has been edited
 * since. That is what lets a settings page enable Save only when there is
 * something to write, say how much it will write, mark the sections holding an
 * edit, and offer a Discard that actually restores something.
 *
 * @param  {Object}   config                Hook configuration.
 * @param  {string}   config.optionName     Top-level option key on the settings endpoint.
 * @param  {Array}    config.fields         Field definitions: `{ key, defaultValue, stateName, setterName, section }`.
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

	const sectionByStateName = {}

	fields.forEach( ( field ) => {
		if ( ! field.section ) {
			return
		}

		sectionByStateName[ field.stateName || toCamel( field.key ) ] = field.section
	} )

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

		const [ baseline, setBaseline ] = useState( null )

		const baselineTaken = useRef( false )

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

		useEffect( () => {
			if ( ! settingsLoaded || baselineTaken.current ) {
				return
			}

			baselineTaken.current = true

			setBaseline( values )
		}, [ settingsLoaded, values ] )

		const dirtyFields = useMemo( () => {
			if ( ! baseline ) {
				return []
			}

			return Object.keys( values ).filter( ( key ) => {
				return stableStringify( values[ key ] ) !== stableStringify( baseline[ key ] )
			} )
		}, [ values, baseline ] )

		const dirtySections = useMemo( () => {
			const sections = []

			dirtyFields.forEach( ( stateName ) => {
				const section = sectionByStateName[ stateName ]

				if ( section && ! sections.includes( section ) ) {
					sections.push( section )
				}
			} )

			return sections
		}, [ dirtyFields ] )

		const discardChanges = () => {
			if ( ! baseline ) {
				return
			}

			setValues( baseline )
		}

		const saveSettings = async () => {
			updateSettingsSaving( true )

			const written    = values
			const optionData = {}

			fields.forEach( ( field ) => {
				const stateName = field.stateName || toCamel( field.key )
				optionData[ field.key ] = values[ stateName ]
			} )

			let saveResult

			try {
				saveResult = await apiFetch( {
					path,
					method: 'POST',
					data: { [ optionName ]: optionData }
				} )
			} catch ( error ) {
				updateSettingsSaving( false )

				createErrorNotice(
					sprintf(
						/* translators: %s: Error message. */
						__( 'Error saving settings: %s.', textDomain ),
						error?.message ?? __( 'Unknown error', textDomain )
					)
				)

				return
			}

			updateSettingsSaving( false )

			if ( ! saveResult ) {
				createErrorNotice(
					sprintf(
						/* translators: %s: Error message. */
						__( 'Error saving settings: %s.', textDomain ),
						__( 'Unknown error', textDomain )
					)
				)

				return
			}

			setBaseline( written )

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
			saveSettings,
			isDirty: dirtyFields.length > 0,
			dirtyCount: dirtyFields.length,
			dirtyFields,
			dirtySections,
			discardChanges
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
