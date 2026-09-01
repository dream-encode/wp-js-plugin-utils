import { Fragment, useRef } from '@wordpress/element'
import { __ } from '@wordpress/i18n'

/**
 * Vertical section navigation for the settings shell.
 *
 * Implements the tab pattern: one item is tabbable at a time and the arrow keys move
 * between them, so the rail costs a single tab stop no matter how many sections a
 * plugin registers.
 *
 * @since  [NEXT_VERSION]
 * @param  {Object}    props
 * @param  {Array}     props.sections       Section definitions.
 * @param  {string}    props.activeKey      Key of the open section.
 * @param  {Function}  props.onSelect       Called with a section key when one is chosen.
 * @param  {Array}     [props.dirtySections] Keys of sections holding an unsaved edit.
 * @param  {Object}    [props.status]       Optional readout for the rail foot, as `{ tone, text }`.
 * @param  {string}    [props.textDomain]   Text domain for translated UI strings.
 * @return {JSX.Element}
 */
const SettingsRail = ( {
	sections,
	activeKey,
	onSelect,
	dirtySections = [],
	status,
	textDomain = 'default'
} ) => {
	const itemRefs = useRef( {} )

	const moveFocus = ( fromIndex, step ) => {
		const nextIndex = ( fromIndex + step + sections.length ) % sections.length
		const nextKey   = sections[ nextIndex ].key

		onSelect( nextKey )

		itemRefs.current[ nextKey ]?.focus()
	}

	const handleKeyDown = ( event, index ) => {
		if ( 'ArrowDown' === event.key || 'ArrowRight' === event.key ) {
			event.preventDefault()

			moveFocus( index, 1 )

			return
		}

		if ( 'ArrowUp' === event.key || 'ArrowLeft' === event.key ) {
			event.preventDefault()

			moveFocus( index, -1 )

			return
		}

		if ( 'Home' === event.key ) {
			event.preventDefault()

			moveFocus( -1, 1 )

			return
		}

		if ( 'End' === event.key ) {
			event.preventDefault()

			moveFocus( 0, -1 )
		}
	}

	return (
		<div className="de-settings__rail">
			<div className="de-settings__rail-inner">
				<div
					className="de-settings__rail-list"
					role="tablist"
					aria-orientation="vertical"
					aria-label={ __( 'Settings sections', textDomain ) }
				>
					{ sections.map( ( section, index ) => {
						const previousGroup = index > 0 ? sections[ index - 1 ].group : null
						const isActive      = section.key === activeKey
						const isDirty       = dirtySections.includes( section.key )

						return (
							<Fragment key={ section.key }>
								{ !! section.group && section.group !== previousGroup && (
									<div className="de-settings__rail-group" role="presentation">
										{ section.group }
									</div>
								) }
								<button
									type="button"
									role="tab"
									id={ `de-settings-tab-${ section.key }` }
									className="de-settings__rail-item"
									aria-selected={ isActive }
									aria-controls={ isActive ? `de-settings-pane-${ section.key }` : undefined }
									tabIndex={ isActive ? 0 : -1 }
									ref={ ( element ) => {
										itemRefs.current[ section.key ] = element
									} }
									onClick={ () => onSelect( section.key ) }
									onKeyDown={ ( event ) => handleKeyDown( event, index ) }
								>
									<span className="de-settings__rail-title">
										{ section.title }
									</span>
									{ undefined !== section.badge && null !== section.badge && (
										<span className="de-settings__rail-badge">
											{ section.badge }
										</span>
									) }
									{ isDirty && (
										<span
											className="de-settings__rail-dirty"
											role="img"
											aria-label={ __( 'Unsaved changes', textDomain ) }
										/>
									) }
								</button>
							</Fragment>
						)
					} ) }
				</div>

				{ !! status?.text && (
					<div className="de-settings__rail-foot">
						<span className={ `de-settings__status is-${ status.tone || 'neutral' }` }>
							<span className="de-settings__status-led" aria-hidden="true" />
							{ status.text }
						</span>
					</div>
				) }
			</div>
		</div>
	)
}

export default SettingsRail
