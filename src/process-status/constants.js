/**
 * Background Processor REST base the status widget reads from.
 *
 * @since  [NEXT_VERSION]
 * @type   {string}
 */
export const PROCESS_STATUS_REST_PATH = '/max-marine/v1/background-processor/background-processes'

/**
 * Background Processes screen, relative to `wp-admin/`.
 *
 * @since  [NEXT_VERSION]
 * @type   {string}
 */
export const BACKGROUND_PROCESSES_PAGE = 'tools.php?page=max-marine-background-processor'

/**
 * Statuses of a process that has been asked for and is waiting or working.
 *
 * @since  [NEXT_VERSION]
 * @type   {string[]}
 */
export const UNFINISHED_STATUSES = [ 'scheduled', 'pending', 'queued', 'processing' ]

/**
 * Statuses of a process that is waiting for a runner or working, but not scheduled for later.
 *
 * @since  [NEXT_VERSION]
 * @type   {string[]}
 */
export const RUNNING_STATUSES = [ 'pending', 'queued', 'processing' ]

/**
 * Statuses of a process that will not run again on its own.
 *
 * @since  [NEXT_VERSION]
 * @type   {string[]}
 */
export const FINISHED_STATUSES = [ 'complete', 'failed', 'cancelled' ]

/**
 * Poll interval while a process is pending, queued or processing.
 *
 * @since  [NEXT_VERSION]
 * @type   {number}
 */
export const POLL_RUNNING_MS = 5000

/**
 * Longest wait between polls while only scheduled processes are on record.
 *
 * @since  [NEXT_VERSION]
 * @type   {number}
 */
export const POLL_SCHEDULED_MAX_MS = 60000

/**
 * Wait before trying again after a failed request.
 *
 * @since  [NEXT_VERSION]
 * @type   {number}
 */
export const POLL_RETRY_MS = 30000
