/**
 * Generates `.asset.php` files for CSS-only webpack entry points.
 *
 * `@wordpress/dependency-extraction-webpack-plugin` only emits asset
 * manifests for JS entry points. Plugins that ship style-only entries
 * (e.g. an admin stylesheet not paired with a script) need a sibling
 * `.asset.php` file so PHP `wp_enqueue_style()` calls can pull the
 * version hash and cache-bust correctly.
 *
 * For each entry point that does not produce a JS chunk, this plugin
 * emits `js/<entry>.min.asset.php` with an empty dependencies array
 * and the current compilation hash as the version.
 */
class CSSAssetPlugin {
	apply( compiler ) {
		compiler.hooks.compilation.tap( 'CSSAssetPlugin', ( compilation ) => {
			compilation.hooks.processAssets.tap(
				{
					name: 'CSSAssetPlugin',
					stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
				},
				() => {
					compilation.entrypoints.forEach( ( entrypoint, entryName ) => {
						const hasJS = entrypoint.chunks.some( ( chunk ) =>
							chunk.files.has( `js/${ entryName }.min.js` )
						)

						if ( hasJS ) {
							return
						}

						const version = compilation.hash.substring( 0, 16 )
						const assetContent = `<?php return array('dependencies' => array(), 'version' => '${ version }');`
						const assetFilename = `js/${ entryName }.min.asset.php`

						compilation.emitAsset( assetFilename, {
							source: () => assetContent,
							size: () => assetContent.length
						} )
					} )
				}
			)
		} )
	}
}

module.exports = CSSAssetPlugin
