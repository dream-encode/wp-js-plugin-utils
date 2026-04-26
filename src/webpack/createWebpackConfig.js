const webpack = require( 'webpack' )
const { resolve } = require( 'path' )
const sass = require( 'sass' )
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' )
const RtlCssPlugin = require( 'rtlcss-webpack-plugin' )
const RemoveEmptyScriptsPlugin = require( 'webpack-remove-empty-scripts' )
const TerserPlugin = require( 'terser-webpack-plugin' )

const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' )
const postcssPlugins = require( '@wordpress/postcss-plugins-preset' )

const CSSAssetPlugin = require( './CSSAssetPlugin' )

const sassImporters = typeof sass.NodePackageImporter === 'function'
	? [ new sass.NodePackageImporter() ]
	: []

const tryRequire = ( id ) => {
	try {
		return require( id )
	} catch ( e ) {
		return null
	}
}

/**
 * Create a Webpack configuration for a WordPress plugin.
 *
 * @param  {Object}  options                       Configuration options.
 * @param  {string}  options.context               Absolute path to the plugin root.
 * @param  {Object}  options.entry                 Webpack entry map.
 * @param  {string}  [options.outputPath]          Absolute path to the output directory.
 * @param  {Object}  [options.alias]               Additional resolve aliases.
 * @param  {Object}  [options.appVersion]          Plugin package.json (for APP_VERSION define).
 * @param  {Object}  [options.define]              Additional DefinePlugin values.
 * @param  {boolean} [options.sentry]              Enable Sentry webpack plugin.
 * @param  {Object}  [options.sentryOptions]       Overrides for Sentry plugin options.
 * @param  {Array}   [options.extraPlugins]        Additional webpack plugins.
 * @param  {Array}   [options.extraRules]          Additional module rules.
 * @param  {string}  [options.devtool]             Webpack devtool.
 * @param  {Function}[options.modify]              Final mutation hook receiving the config.
 * @return {Object}                                Webpack configuration array.
 */
const createWebpackConfig = ( options = {} ) => {
	const {
		context,
		entry,
		outputPath,
		alias = {},
		appVersion,
		define = {},
		sentry = false,
		sentryOptions = {},
		extraPlugins = [],
		extraRules = [],
		devtool = 'source-map',
		modify
	} = options

	if ( ! context ) {
		throw new Error( '[wp-plugin-utils] createWebpackConfig: "context" (plugin root path) is required.' )
	}

	if ( ! entry ) {
		throw new Error( '[wp-plugin-utils] createWebpackConfig: "entry" is required.' )
	}

	const isProduction = process.argv[ process.argv.indexOf( '--mode' ) + 1 ] === 'production'

	const resolvedOutputPath = outputPath || resolve( context, 'admin/assets/dist/' )

	const definePluginValues = { ...define }

	if ( appVersion && appVersion.version ) {
		definePluginValues.APP_VERSION = JSON.stringify( appVersion.version )
	}

	const plugins = [
		new webpack.DefinePlugin( definePluginValues ),
		new MiniCssExtractPlugin( {
			filename: 'css/[name].min.css',
			chunkFilename: '[id].css',
			ignoreOrder: false
		} ),
		new RtlCssPlugin( {
			filename: 'css/[name]-rtl.css'
		} ),
		new RemoveEmptyScriptsPlugin(),
		new DependencyExtractionWebpackPlugin(),
		new CSSAssetPlugin()
	]

	if ( sentry ) {
		const sentryWebpackPlugin = tryRequire( '@sentry/webpack-plugin' )

		if ( sentryWebpackPlugin && sentryWebpackPlugin.sentryWebpackPlugin ) {
			plugins.push( sentryWebpackPlugin.sentryWebpackPlugin( {
				org: process.env.SENTRY_ORG,
				project: process.env.SENTRY_PROJECT,
				authToken: process.env.SENTRY_AUTH_TOKEN,
				...sentryOptions
			} ) )
		}
	}

	plugins.push( ...extraPlugins )

	const svgrAvailable = !! tryRequire( '@svgr/webpack' )
	const urlLoaderAvailable = !! tryRequire( 'url-loader' )

	const rules = [
		{
			test: /\.jsx?$/,
			exclude: /node_modules/,
			use: { loader: 'babel-loader' }
		},
		{
			test: /\.(j|t)sx?$/,
			exclude: [ /node_modules/ ],
			use: require.resolve( 'source-map-loader' ),
			enforce: 'pre'
		},
		{
			test: /\.(css|scss)$/,
			use: [
				{ loader: MiniCssExtractPlugin.loader },
				{
					loader: require.resolve( 'css-loader' ),
					options: {
						importLoaders: 1,
						sourceMap: true,
						modules: { auto: true }
					}
				},
				{
					loader: 'sass-loader',
					options: {
						implementation: sass,
						sourceMap: true,
						api: 'modern',
						sassOptions: {
							importers: sassImporters
						}
					}
				},
				{
					loader: require.resolve( 'postcss-loader' ),
					options: {
						postcssOptions: {
							ident: 'postcss',
							sourceMap: ! isProduction,
							plugins: isProduction ? [
								...postcssPlugins,
								require( 'cssnano' )( {
									preset: [
										'default',
										{ discardComments: { removeAll: true } }
									]
								} )
							] : postcssPlugins
						}
					}
				}
			]
		}
	]

	if ( svgrAvailable ) {
		rules.push( {
			test: /\.svg$/,
			issuer: /\.(j|t)sx?$/,
			use: urlLoaderAvailable ? [ '@svgr/webpack', 'url-loader' ] : [ '@svgr/webpack' ],
			type: 'javascript/auto'
		} )
	}

	rules.push(
		{
			test: /\.svg$/,
			issuer: /\.(pc|sc|sa|c)ss$/,
			type: 'asset/inline'
		},
		{
			test: /\.(bmp|png|jpe?g|gif|webp)$/i,
			type: 'asset/resource',
			generator: { filename: 'images/[name].[hash:8][ext]' }
		},
		{
			test: /\.(woff|woff2|eot|ttf|otf)$/i,
			type: 'asset/resource',
			generator: { filename: 'fonts/[name].[hash:8][ext]' }
		}
	)

	rules.push( ...extraRules )

	const config = {
		context,
		entry,
		output: {
			filename: 'js/[name].min.js',
			path: resolvedOutputPath,
			clean: true
		},
		devtool,
		resolve: {
			extensions: [ '.jsx', '.ts', '.tsx', '.js' ],
			alias: {
				'@': resolve( context, 'admin/assets/src/js' ),
				...alias
			}
		},
		optimization: {
			concatenateModules: isProduction,
			minimizer: [
				new TerserPlugin( {
					parallel: true,
					terserOptions: {
						output: { comments: /translators:/i },
						compress: { passes: 2 },
						mangle: { reserved: [ '__', '_n', '_nx', '_x' ] },
						sourceMap: true
					},
					extractComments: false
				} )
			]
		},
		module: { rules },
		plugins
	}

	if ( typeof modify === 'function' ) {
		const modified = modify( config )

		return Array.isArray( modified ) ? modified : [ modified || config ]
	}

	return [ config ]
}

module.exports = createWebpackConfig
module.exports.createWebpackConfig = createWebpackConfig
module.exports.default = createWebpackConfig
