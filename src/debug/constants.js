/**
 * Global the shared debug log lives on.
 *
 * @since  0.9.0
 * @type {string}
 */
export const DEBUG_NAMESPACE = 'dreamEncodeDebug'

/**
 * Shape version of the shared log. A log of another version is left alone.
 *
 * @since  0.9.0
 * @type {number}
 */
export const DEBUG_LOG_VERSION = 1

/**
 * Query parameter that turns debug output on.
 *
 * @since  0.9.0
 * @type {string}
 */
export const DEBUG_QUERY_PARAM = 'debug'

/**
 * Most entries kept. Older entries are dropped first.
 *
 * @since  0.9.0
 * @type {number}
 */
export const DEBUG_MAX_ENTRIES = 1000

/**
 * Entry kinds the overlay knows how to show. Any other kind is shown as a note.
 *
 * @since  0.9.0
 * @type {string}
 */
export const DEBUG_KIND_STORE = 'store'
export const DEBUG_KIND_FETCH = 'fetch'
export const DEBUG_KIND_EVENT = 'event'
export const DEBUG_KIND_NOTE = 'note'
