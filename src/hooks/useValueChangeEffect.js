import {
	useEffect,
	useRef,
	useState
} from '@wordpress/element'

/**
 * Custom hook to create a fade effect when a value changes.
 *
 * @param  {*}       value  The value to watch for changes.
 * @param  {string}  speed  Animation speed: 'default', 'fast', or 'slow' (default: 'default').
 * @return {Object}         Object containing displayValue, ref to attach to the element, and isAnimating state.
 */
const useValueChangeEffect = ( value, speed = 'default' ) => {
	const stringValue = ( value === null || value === undefined ) ? '' : ( typeof value === 'object' ? JSON.stringify( value ) : String( value ) )

	const elementRef = useRef( null )

	const [ prevValue, setPrevValue ] = useState( stringValue )
	const [ displayValue, setDisplayValue ] = useState( stringValue )
	const [ isAnimating, setIsAnimating ] = useState( false )

	const getDuration = () => {
		switch ( speed ) {
			case 'fast':
				return 200
			case 'slow':
				return 600
			default:
				return 400
		}
	}

	const getClassSuffix = () => {
		switch ( speed ) {
			case 'fast':
				return '-fast'
			case 'slow':
				return '-slow'
			default:
				return ''
		}
	}

	const duration = getDuration()
	const classSuffix = getClassSuffix()

	useEffect( () => {
		const newStringValue = ( value === null || value === undefined ) ? '' : ( typeof value === 'object' ? JSON.stringify( value ) : String( value ) )

		if ( newStringValue !== prevValue && elementRef.current && ! isAnimating ) {
			setIsAnimating( true )

			elementRef.current.classList.add( `fade-out${ classSuffix }` )

			setTimeout( () => {
				setDisplayValue( newStringValue )

				if ( elementRef.current ) {
					elementRef.current.classList.remove( `fade-out${ classSuffix }` )

					void elementRef.current.offsetWidth

					elementRef.current.classList.add( `fade-in${ classSuffix }` )

					setTimeout( () => {
						if ( elementRef.current ) {
							elementRef.current.classList.remove( `fade-in${ classSuffix }` )
						}
						setIsAnimating( false )
						setPrevValue( newStringValue )
					}, duration )
				}
			}, duration )
		} else if ( newStringValue !== prevValue && ! isAnimating ) {
			setDisplayValue( newStringValue )
			setPrevValue( newStringValue )
		}
	}, [ value, prevValue, isAnimating, duration, classSuffix ] )

	return { displayValue, elementRef, isAnimating }
}

export default useValueChangeEffect
