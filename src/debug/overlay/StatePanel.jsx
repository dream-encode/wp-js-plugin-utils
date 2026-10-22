import { useState } from '@wordpress/element'

import { formatPreview } from '../format'

/**
 * Latest state of each store wrapped with `withDebugLog`.
 *
 * A store appears once it has handled an action since debug output was switched on.
 *
 * @since  0.9.0
 * @param  {Object} props        Props.
 * @param  {Object} props.stores Store states keyed by store name.
 * @return {JSX.Element}
 */
const StatePanel = ( { stores } ) => {
	const names = Object.keys( stores ).sort()

	const [ picked, setPicked ] = useState( null )

	const current = names.includes( picked ) ? picked : names[ 0 ]

	if ( ! names.length ) {
		return (
			<div className="de-debug-body">
				<div className="de-debug-empty">No store has handled an action yet.</div>
			</div>
		)
	}

	return (
		<>
			<div className="de-debug-pick">
				{ names.map( ( name ) => (
					<button
						key={ name }
						type="button"
						className="de-debug-chip"
						aria-pressed={ name === current ? 'true' : 'false' }
						onClick={ () => setPicked( name ) }
					>
						{ name }
					</button>
				) ) }
			</div>
			<div className="de-debug-body">
				<pre className="de-debug-state">{ formatPreview( stores[ current ], { maxDepth: 6, maxItems: 40, maxString: 300 } ) }</pre>
			</div>
		</>
	)
}

export default StatePanel
