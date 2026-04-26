import {
	useEffect,
	useRef,
	useState
} from '@wordpress/element'

/**
 * Debounce a rapidly-changing value.
 *
 * @param  {*}       value     The value to debounce.
 * @param  {number}  [delay]   Debounce delay in milliseconds.
 * @return {*}
 */
const useDebouncedValue = ( value, delay = 300 ) => {
	const [ debounced, setDebounced ] = useState( value )

	const timeoutRef = useRef( null )

	useEffect( () => {
		if ( timeoutRef.current ) {
			clearTimeout( timeoutRef.current )
		}

		timeoutRef.current = setTimeout( () => {
			setDebounced( value )
		}, delay )

		return () => {
			if ( timeoutRef.current ) {
				clearTimeout( timeoutRef.current )
			}
		}
	}, [ value, delay ] )

	return debounced
}

export default useDebouncedValue
