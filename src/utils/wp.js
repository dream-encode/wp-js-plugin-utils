import { addQueryArgs } from '@wordpress/url'

/**
 * Get a URL to edit a post with a post ID.
 *
 * @param  {number}  postID    Post ID.
 * @param  {string}  adminUrl  WP admin URL (with trailing slash).
 * @return {string}
 */
export const wpEditPostLinkFromPostId = ( postID, adminUrl ) => {
	return addQueryArgs( `${ adminUrl }post.php`, { post: postID, action: 'edit' } )
}

/**
 * Build an admin page URL.
 *
 * @param  {string}  page          Admin page slug.
 * @param  {string}  [parent='admin.php']  Parent admin file.
 * @return {string}
 */
export const getAdminPageUrl = ( page, parent = 'admin.php' ) => {
	return addQueryArgs( parent, { page } )
}
