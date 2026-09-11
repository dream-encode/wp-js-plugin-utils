/**
 * Lightweight wrappers around the global edit product registry exposed by
 * `max-marine-edit-product-shared-state`.
 *
 * EPSS owns the registry itself - the field, action and requirement buckets, the
 * lifecycle events and the save gate. These helpers give consuming plugins a way to
 * register into it without hand-copying the namespace, in the same shape as the
 * Data Migrations wrappers alongside them.
 *
 * Unlike the Data Migrations registry, this one is created by whichever script reaches
 * it first. A consumer whose script happens to run before EPSS's still registers
 * successfully, and EPSS picks up what is already there.
 */

const NAMESPACE = 'maxMarineEditProduct'

/**
 * Get the shared registry, creating the slot if nothing has yet.
 *
 * Returns null outside a browser, and null if the slot exists but does not look like a
 * registry - which happens only if something else has claimed the global.
 *
 * @return {Object|null}
 */
export const getRegistry = () => {
	if ( 'undefined' === typeof window ) {
		return null
	}

	const registry = window[ NAMESPACE ]

	if ( ! registry || 'function' !== typeof registry.registerField ) {
		return null
	}

	return registry
}

/**
 * Register a field this plugin owns.
 *
 * @param  {Object}    field           Field definition.
 * @param  {string}    field.key       Stable key other plugins refer to this field by.
 * @param  {string}    field.label     Human label, shown to the employee.
 * @param  {string}    field.owner     Owning plugin slug.
 * @param  {string}    [field.group]   Group name used to bucket it in modals.
 * @param  {Function}  field.read      Returns the current value.
 * @param  {Function}  field.clear     Empties the field.
 * @param  {Function}  [field.isEmpty] Whether a value counts as empty.
 * @param  {Function}  [field.focus]   Moves focus to the field.
 * @param  {Function}  [field.isDisabled] Whether the field should be skipped entirely.
 * @return {boolean}
 */
export const registerField = ( field ) => {
	const registry = getRegistry()

	if ( ! registry ) {
		return false
	}

	return registry.registerField( field )
}

/**
 * Register an action bound to one or more lifecycle contexts.
 *
 * @param  {Object}           action           Action definition.
 * @param  {string}           action.id        Unique action id.
 * @param  {string|string[]}  action.on        Contexts, e.g. 'relisting' or 'duplicate'.
 * @param  {string}           [action.label]   Human label, shown to the employee.
 * @param  {string|string[]}  [action.clears]  Field keys to clear.
 * @param  {Function}         [action.run]     Extra work beyond clearing fields.
 * @return {boolean}
 */
export const registerAction = ( action ) => {
	const registry = getRegistry()

	if ( ! registry ) {
		return false
	}

	return registry.registerAction( action )
}

/**
 * Register a requirement that gates saving.
 *
 * @param  {Object}    requirement             Requirement definition.
 * @param  {string}    requirement.id          Unique requirement id.
 * @param  {string}    [requirement.field]     Field key this requirement is about.
 * @param  {*}         [requirement.when]      Context name, array, or predicate.
 * @param  {string}    [requirement.severity]  'block' or 'warn'. Default 'block'.
 * @param  {string}    [requirement.message]   Message shown to the employee.
 * @param  {Function}  [requirement.validate]  Custom check, in place of the field's own.
 * @return {boolean}
 */
export const registerRequirement = ( requirement ) => {
	const registry = getRegistry()

	if ( ! registry ) {
		return false
	}

	return registry.registerRequirement( requirement )
}

/**
 * Subscribe to a lifecycle event emitted by the kernel.
 *
 * Returns an unsubscribe function, so a caller never has to hold on to the emitter or
 * remember the matching `off()` call.
 *
 * @param  {string}    event     Event name.
 * @param  {Function}  callback  Handler.
 * @return {Function}            Call to unsubscribe.
 */
export const onEditProductEvent = ( event, callback ) => {
	const store = window?.wp?.data?.select?.( 'max-marine-edit-product-shared-state' )
	const emitter = store && 'function' === typeof store.getEventEmitter ? store.getEventEmitter() : null

	if ( ! emitter ) {
		return () => {}
	}

	emitter.on( event, callback )

	return () => {
		emitter.off( event, callback )
	}
}
