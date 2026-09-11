/**
 * Lifecycle event names and context values emitted by the edit product kernel.
 *
 * These mirror the constants in `max-marine-edit-product-shared-state`. Consumers import
 * them from here so no plugin hand-copies an event string - which is exactly how
 * `MMEPSSStockQuantityChanged` ended up declared by hand in two plugins at once.
 */

export const EDIT_PRODUCT_STORE_NAME = 'max-marine-edit-product-shared-state'

export const EVENT_PRODUCT_READY = 'max-marine/edit-product/product:ready'

export const EVENT_STOCK_CHANGED = 'max-marine/edit-product/stock:changed'

export const EVENT_RELISTING_DETECTED = 'max-marine/edit-product/relisting:detected'

export const EVENT_RELISTING_CONFIRMED = 'max-marine/edit-product/relisting:confirmed'

export const EVENT_RELISTING_CANCELLED = 'max-marine/edit-product/relisting:cancelled'

export const EVENT_DUPLICATE_AWAITING_FIRST_SAVE = 'max-marine/edit-product/duplicate:awaiting-first-save'

export const EVENT_SAVE_REQUESTED = 'max-marine/edit-product/save:requested'

export const EVENT_SAVE_BLOCKED = 'max-marine/edit-product/save:blocked'

export const EVENT_SAVE_COMMITTED = 'max-marine/edit-product/save:committed'

export const CONTEXT_ALWAYS = 'always'

export const CONTEXT_DUPLICATE = 'duplicate'

export const CONTEXT_RELISTING = 'relisting'

export const SEVERITY_BLOCK = 'block'

export const SEVERITY_WARN = 'warn'
