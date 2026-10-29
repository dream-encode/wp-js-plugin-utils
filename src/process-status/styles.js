/**
 * Process status widget styles.
 *
 * Shipped as a string and injected by the widget itself, so a page rendered in PHP can
 * mount the widget without loading a stylesheet, and a plugin build needs no import.
 */

const STYLE_ID = 'de-process-status-styles'

const CSS = `
.de-process-status {
	--dps-ink: #1d2327;
	--dps-muted: #646970;
	--dps-line: #dcdcde;
	--dps-line-soft: #f0f0f1;
	--dps-blue: #2271b1;
	--dps-blue-soft: #f0f6fc;
	--dps-blue-line: #c5d9ed;
	--dps-green: #00a32a;
	--dps-green-soft: #edfaef;
	--dps-green-ink: #005c12;
	--dps-amber: #dba617;
	--dps-amber-soft: #fcf9e8;
	--dps-amber-line: #ecdca1;
	--dps-amber-ink: #614200;
	--dps-red: #d63638;
	--dps-red-soft: #fcf0f1;
	--dps-red-line: #f1c4c6;
	--dps-red-ink: #8a2424;
	--dps-grey: #a7aaad;
	--dps-grey-soft: #f6f7f7;
	color: var( --dps-ink );
	font-size: 13px;
	line-height: 1.45;
}
.de-process-status--panel {
	background: #fff;
	border: 1px solid var( --dps-line );
	border-radius: 4px;
}
.de-process-status__head {
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	gap: 4px 14px;
	padding: 11px 16px;
	border-bottom: 1px solid var( --dps-line );
}
.de-process-status__head strong { font-weight: 600; }
.de-process-status__updated { color: var( --dps-muted ); font-size: 12px; font-variant-numeric: tabular-nums; }
.de-process-status__page-link { margin-left: auto; font-size: 12px; }
.de-process-status--inline .de-process-status__body { display: flex; flex-direction: column; gap: 8px; }
.de-process-status__note { margin: 0; color: var( --dps-muted ); font-style: italic; }
.de-process-status__note.is-error { color: var( --dps-red-ink ); font-style: normal; }
.de-process-status--panel .de-process-status__note { padding: 13px 16px; }
.de-process-status__subhead {
	padding: 10px 16px 0;
	border-top: 1px solid var( --dps-line-soft );
	color: var( --dps-muted );
	font-size: 11px;
	letter-spacing: 0.06em;
	text-transform: uppercase;
}
.de-process-status__item { display: flex; flex-direction: column; gap: 7px; }
.de-process-status--panel .de-process-status__body > .de-process-status__item { padding: 13px 16px; }
.de-process-status--panel .de-process-status__body > .de-process-status__item + .de-process-status__item { border-top: 1px solid var( --dps-line-soft ); }
.de-process-status--panel .de-process-status__body > .de-process-status__subhead + .de-process-status__item { padding-top: 8px; }
.de-process-status--inline .de-process-status__item:not( .de-process-status__item--child ) {
	padding: 10px 12px;
	background: var( --dps-grey-soft );
	border: 1px solid var( --dps-line );
	border-radius: 3px;
}
.de-process-status--inline .de-process-status__item.is-processing:not( .de-process-status__item--child ),
.de-process-status--inline .de-process-status__item.is-waiting:not( .de-process-status__item--child ) {
	background: var( --dps-blue-soft );
	border-color: var( --dps-blue-line );
}
.de-process-status--inline .de-process-status__item.is-warn:not( .de-process-status__item--child ) {
	background: var( --dps-amber-soft );
	border-color: var( --dps-amber-line );
}
.de-process-status--inline .de-process-status__item.is-failed:not( .de-process-status__item--child ) {
	background: var( --dps-red-soft );
	border-color: var( --dps-red-line );
}
.de-process-status__line { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; }
.de-process-status__label { font-weight: 600; }
.de-process-status__summary { font-variant-numeric: tabular-nums; }
.de-process-status__summary b { font-weight: 600; }
.de-process-status__pill {
	display: inline-block;
	padding: 1px 7px;
	border: 1px solid transparent;
	border-radius: 3px;
	font-size: 10.5px;
	font-weight: 600;
	letter-spacing: 0.04em;
	line-height: 1.5;
	text-transform: uppercase;
	white-space: nowrap;
}
.de-process-status__pill.is-processing { background: var( --dps-blue ); color: #fff; }
.de-process-status__pill.is-waiting { background: #fff; border-color: #c3c4c7; color: #50575e; }
.de-process-status__pill.is-scheduled { background: #fff; border-color: #c3c4c7; border-style: dashed; color: #50575e; }
.de-process-status__pill.is-complete { background: var( --dps-green-soft ); border-color: #68de7c; color: var( --dps-green-ink ); }
.de-process-status__pill.is-warn { background: var( --dps-amber-soft ); border-color: var( --dps-amber ); color: var( --dps-amber-ink ); }
.de-process-status__pill.is-failed { background: var( --dps-red ); color: #fff; }
.de-process-status__pill.is-cancelled { background: var( --dps-line-soft ); border-color: var( --dps-line ); color: var( --dps-muted ); }
.de-process-status__tag {
	padding: 0 6px;
	background: var( --dps-grey-soft );
	border: 1px solid var( --dps-line );
	border-radius: 3px;
	color: #50575e;
	font-size: 11px;
	line-height: 18px;
}
.de-process-status__bar { height: 6px; overflow: hidden; background: var( --dps-line ); border-radius: 3px; }
.de-process-status__bar span { display: block; height: 100%; background: var( --dps-blue ); border-radius: 3px; transition: width 0.4s ease; }
.de-process-status__bar.is-complete span { background: var( --dps-green ); }
.de-process-status__bar.is-warn span { background: var( --dps-amber ); }
.de-process-status__bar.is-failed span { background: var( --dps-red ); }
.de-process-status__bar.is-cancelled span { background: var( --dps-grey ); }
.de-process-status__meta {
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	gap: 4px 14px;
	color: var( --dps-muted );
	font-size: 12px;
	font-variant-numeric: tabular-nums;
}
.de-process-status__actions { display: inline-flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; margin-left: auto; }
.de-process-status__actions .components-button.is-link { font-size: 12px; }
.de-process-status__confirm { display: inline-flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; color: var( --dps-ink ); }
.de-process-status__error { color: var( --dps-red-ink ); font-size: 12.5px; }
.de-process-status__children { display: flex; flex-direction: column; gap: 8px; padding-top: 2px; }
.de-process-status__item--child { position: relative; padding-left: 26px; }
.de-process-status__item--child::before {
	content: "";
	position: absolute;
	left: 8px;
	top: -6px;
	width: 10px;
	height: 16px;
	border-left: 1px solid #c3c4c7;
	border-bottom: 1px solid #c3c4c7;
}
@media (prefers-reduced-motion: no-preference) {
	.de-process-status__bar.is-processing span {
		background-image: linear-gradient( 45deg, rgba( 255, 255, 255, 0.22 ) 25%, transparent 25%, transparent 50%, rgba( 255, 255, 255, 0.22 ) 50%, rgba( 255, 255, 255, 0.22 ) 75%, transparent 75% );
		background-size: 12px 12px;
		animation: de-process-status-stripes 1s linear infinite;
	}
	@keyframes de-process-status-stripes { to { background-position: 12px 0; } }
}
`

/**
 * Add the widget stylesheet to the document once.
 *
 * @since  [NEXT_VERSION]
 * @return {void}
 */
export const injectProcessStatusStyles = () => {
	if ( 'undefined' === typeof document || document.getElementById( STYLE_ID ) ) {
		return
	}

	const style = document.createElement( 'style' )

	style.id = STYLE_ID
	style.textContent = CSS

	document.head.appendChild( style )
}
