/**
 * Custom hook for managing blurable content.
 *
 * @param  {boolean}  isBlurred  Whether the content should be blurred.
 * @return {Object}              Object containing the blur class and state.
 */
const useBlurableContent = ( isBlurred ) => {
	return {
		blurClass: isBlurred ? 'blurred' : '',
		isBlurred
	}
}

export default useBlurableContent
