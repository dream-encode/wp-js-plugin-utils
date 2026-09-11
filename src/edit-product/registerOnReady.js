import domReady from '@wordpress/dom-ready'

import {
	registerAction,
	registerField,
	registerRequirement
} from './registry'

/**
 * Register a batch of edit product extensions on `domReady`.
 *
 * Fields are registered before actions and requirements, because both refer to fields by
 * key and the registry checks that the key resolves.
 *
 * @param  {Object}    registrations               Registration map.
 * @param  {Object[]}  [registrations.fields]       Field definitions.
 * @param  {Object[]}  [registrations.actions]      Action definitions.
 * @param  {Object[]}  [registrations.requirements] Requirement definitions.
 * @return {void}
 */
const registerOnReady = ( registrations = {} ) => {
	const {
		fields = [],
		actions = [],
		requirements = []
	} = registrations

	domReady( () => {
		fields.forEach( ( field ) => {
			registerField( field )
		} )

		actions.forEach( ( action ) => {
			registerAction( action )
		} )

		requirements.forEach( ( requirement ) => {
			registerRequirement( requirement )
		} )
	} )
}

export default registerOnReady
