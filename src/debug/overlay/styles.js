/**
 * Overlay styles.
 *
 * Shipped as a string and injected by the overlay itself, so a consuming plugin needs no
 * stylesheet import and pages loaded without the debug flag never download any of it.
 */

const STYLE_ID = 'de-debug-overlay-styles'

const CSS = `
.de-debug {
	--dd-bg: #14161a;
	--dd-raise: #1a1d22;
	--dd-sunk: #0f1114;
	--dd-line: #2c3038;
	--dd-row: #1f2228;
	--dd-fg: #e7e9ec;
	--dd-muted: #a3aab5;
	--dd-dim: #8b929d;
	--dd-store: #7cb2ff;
	--dd-fetch: #f2a65a;
	--dd-event: #c3a6ff;
	--dd-note: #9fd8d0;
	--dd-err: #ff8f87;
	--dd-ok: #6fd08c;
	--dd-err-bg: #2a1717;
	--dd-sel-bg: #1d2633;
	--dd-ui: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
	--dd-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
	position: fixed;
	z-index: 1000010;
	box-sizing: border-box;
	color: var(--dd-fg);
	font-family: var(--dd-ui);
	font-size: 13px;
	line-height: 1.4;
	text-align: left;
}
.de-debug *, .de-debug *::before, .de-debug *::after { box-sizing: border-box; }
.de-debug button { font-family: var(--dd-ui); cursor: pointer; margin: 0; }
.de-debug button:focus-visible, .de-debug input:focus-visible { outline: 2px solid var(--dd-store); outline-offset: 1px; }
.de-debug-panel { width: 100%; height: 100%; background: var(--dd-bg); border: 1px solid var(--dd-line); border-radius: 10px; box-shadow: 0 14px 44px rgba(0, 0, 0, 0.32); display: flex; flex-direction: column; overflow: hidden; }
.de-debug.is-docked { left: 0; right: 0; bottom: 0; height: min(280px, 60%); }
.de-debug.is-docked .de-debug-panel { border-radius: 0; border-width: 1px 0 0; }
.de-debug-bar { height: 40px; flex: none; display: flex; align-items: center; gap: 8px; padding: 0 6px 0 12px; background: var(--dd-raise); border-bottom: 1px solid var(--dd-line); cursor: move; user-select: none; touch-action: none; }
.de-debug.is-docked .de-debug-bar { cursor: default; }
.de-debug-rec { width: 8px; height: 8px; flex: none; border-radius: 4px; background: var(--dd-ok); }
.de-debug-rec.is-paused { background: var(--dd-dim); }
.de-debug-name { font-weight: 600; white-space: nowrap; }
.de-debug-status { color: var(--dd-muted); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.de-debug-grow { flex: 1; }
.de-debug-ib { width: 30px; height: 30px; flex: none; padding: 0; border: 0; border-radius: 5px; background: transparent; color: var(--dd-muted); display: inline-flex; align-items: center; justify-content: center; }
.de-debug-ib:hover { background: var(--dd-row); color: var(--dd-fg); }
.de-debug-ib svg { width: 16px; height: 16px; }
.de-debug-tabs { height: 38px; flex: none; display: flex; gap: 2px; padding: 0 6px; border-bottom: 1px solid var(--dd-line); overflow-x: auto; }
.de-debug-tab { border: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--dd-muted); font-size: 13px; padding: 0 10px; white-space: nowrap; }
.de-debug-tab[aria-selected="true"] { color: var(--dd-fg); font-weight: 500; border-bottom-color: var(--dd-store); }
.de-debug-n { margin-left: 4px; color: var(--dd-dim); font-weight: 400; font-family: var(--dd-mono); font-size: 11px; }
.de-debug-n.is-err { color: var(--dd-err); }
.de-debug-filters { flex: none; display: flex; gap: 6px; padding: 8px 10px; border-bottom: 1px solid var(--dd-line); align-items: center; flex-wrap: wrap; }
.de-debug-chip { height: 26px; padding: 0 10px; border-radius: 13px; border: 1px solid var(--dd-line); background: transparent; color: var(--dd-dim); font-size: 12px; }
.de-debug-chip[aria-pressed="true"] { border-color: #3a4a63; background: #1d2a3d; color: #a9cbff; }
.de-debug-chip.is-fetch[aria-pressed="true"] { border-color: #5a4630; background: #33281c; color: #f7c28b; }
.de-debug-chip.is-event[aria-pressed="true"] { border-color: #4a3f66; background: #2a2440; color: #d4c1ff; }
.de-debug-chip.is-err[aria-pressed="true"] { border-color: #6a3434; background: #3a1d1d; color: #ffb0aa; }
.de-debug-search { flex: 1; min-width: 110px; height: 26px; margin: 0; background: var(--dd-sunk); border: 1px solid var(--dd-line); border-radius: 5px; color: var(--dd-fg); padding: 0 8px; font-family: var(--dd-ui); font-size: 12px; box-shadow: none; }
.de-debug-search::placeholder { color: var(--dd-dim); }
.de-debug-body { flex: 1; min-height: 0; overflow-y: auto; }
.de-debug-foot { height: 28px; flex: none; display: flex; align-items: center; gap: 14px; padding: 0 12px; border-top: 1px solid var(--dd-line); background: var(--dd-raise); font-family: var(--dd-mono); font-size: 11px; color: var(--dd-muted); white-space: nowrap; overflow: hidden; }
.de-debug-row { width: 100%; text-align: left; display: grid; grid-template-columns: 84px 46px minmax(0, 1fr) auto; column-gap: 8px; align-items: start; padding: 7px 10px; border: 0; border-bottom: 1px solid var(--dd-row); border-radius: 0; background: transparent; color: var(--dd-fg); }
.de-debug-row:hover { background: var(--dd-raise); }
.de-debug-row.is-err { background: var(--dd-err-bg); }
.de-debug-row[aria-expanded="true"] { background: var(--dd-sel-bg); }
.de-debug-t { font-family: var(--dd-mono); font-size: 11px; color: var(--dd-dim); padding-top: 2px; font-variant-numeric: tabular-nums; }
.de-debug-k { font-family: var(--dd-mono); font-size: 10px; font-weight: 500; letter-spacing: 0.05em; padding-top: 3px; text-transform: uppercase; }
.de-debug-k.is-store { color: var(--dd-store); }
.de-debug-k.is-fetch { color: var(--dd-fetch); }
.de-debug-k.is-event { color: var(--dd-event); }
.de-debug-k.is-note { color: var(--dd-note); }
.de-debug-k.is-err { color: var(--dd-err); }
.de-debug-main { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.de-debug-ti { font-family: var(--dd-mono); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.de-debug-su { font-family: var(--dd-mono); font-size: 11px; color: var(--dd-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.de-debug-r { font-family: var(--dd-mono); font-size: 11px; color: var(--dd-muted); padding-top: 2px; text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
.de-debug-r.is-ok { color: var(--dd-ok); }
.de-debug-r.is-err { color: var(--dd-err); }
.de-debug-r.is-pending { color: var(--dd-fetch); }
.de-debug-detail { padding: 10px 12px 12px 148px; background: var(--dd-sel-bg); border-bottom: 1px solid var(--dd-line); display: flex; flex-direction: column; gap: 8px; }
.de-debug-detail.is-request { padding-left: 58px; }
.de-debug-h { margin: 0; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dd-dim); font-weight: 500; }
.de-debug-pre { margin: 0; padding: 0; background: transparent; border: 0; font-family: var(--dd-mono); font-size: 11px; line-height: 1.5; color: var(--dd-fg); white-space: pre-wrap; word-break: break-word; max-height: 260px; overflow-y: auto; }
.de-debug-diff { display: grid; grid-template-columns: auto minmax(0, 1fr); column-gap: 10px; row-gap: 2px; font-family: var(--dd-mono); font-size: 11px; }
.de-debug-diff-key { color: var(--dd-muted); }
.de-debug-from { color: var(--dd-err); text-decoration: line-through; text-decoration-color: rgba(255, 143, 135, 0.5); word-break: break-word; }
.de-debug-to { color: var(--dd-ok); word-break: break-word; }
.de-debug-empty { padding: 28px 16px; color: var(--dd-muted); }
.de-debug-more { padding: 10px; color: var(--dd-dim); font-size: 12px; }
.de-debug-req-head, .de-debug-req { display: grid; grid-template-columns: 44px minmax(0, 1fr) 54px 110px; column-gap: 8px; align-items: center; }
.de-debug-req-head { position: sticky; top: 0; padding: 6px 10px; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dd-dim); border-bottom: 1px solid var(--dd-line); background: var(--dd-bg); }
.de-debug-req { width: 100%; text-align: left; padding: 7px 10px; border: 0; border-bottom: 1px solid var(--dd-row); border-radius: 0; background: transparent; color: var(--dd-fg); font-family: var(--dd-mono); font-size: 11px; }
.de-debug-req:hover { background: var(--dd-raise); }
.de-debug-req.is-err { background: var(--dd-err-bg); }
.de-debug-req[aria-expanded="true"] { background: var(--dd-sel-bg); }
.de-debug-m { color: var(--dd-fetch); font-weight: 500; }
.de-debug-p { min-width: 0; display: flex; flex-direction: column; }
.de-debug-p span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.de-debug-p span:first-child { font-size: 12px; }
.de-debug-p span:last-child { color: var(--dd-dim); }
.de-debug-s { text-align: right; font-variant-numeric: tabular-nums; }
.de-debug-wf { position: relative; height: 8px; background: var(--dd-sunk); border-radius: 2px; }
.de-debug-wf i { position: absolute; top: 0; bottom: 0; min-width: 2px; border-radius: 2px; background: var(--dd-fetch); }
.de-debug-wf i.is-err { background: var(--dd-err); }
.de-debug-wf i.is-pending { background: repeating-linear-gradient(90deg, var(--dd-fetch) 0 4px, transparent 4px 7px); }
.de-debug-pick { display: flex; gap: 6px; flex-wrap: wrap; padding: 8px 10px; border-bottom: 1px solid var(--dd-line); }
.de-debug-state { margin: 0; padding: 10px 12px; font-family: var(--dd-mono); font-size: 11px; line-height: 1.55; color: var(--dd-fg); white-space: pre; background: transparent; border: 0; }
.de-debug-sec { padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; border-bottom: 1px solid var(--dd-line); }
.de-debug-kv { display: grid; grid-template-columns: minmax(110px, auto) minmax(0, 1fr); row-gap: 3px; column-gap: 12px; font-family: var(--dd-mono); font-size: 11px; }
.de-debug-kv > span:nth-child(odd) { color: var(--dd-muted); }
.de-debug-list { display: grid; grid-template-columns: auto minmax(0, 1fr); column-gap: 10px; row-gap: 8px; align-items: start; }
.de-debug-list > .de-debug-badge { justify-self: start; margin-top: 1px; }
.de-debug-badge { display: inline-block; font-family: var(--dd-mono); font-size: 10px; letter-spacing: 0.04em; border: 1px solid var(--dd-line); border-radius: 3px; padding: 0 6px; color: var(--dd-muted); text-transform: uppercase; }
.de-debug-badge.is-ok { color: var(--dd-ok); border-color: #2f5a3c; }
.de-debug-badge.is-pending { color: var(--dd-fetch); border-color: #5a4630; }
.de-debug-badge.is-err { color: var(--dd-err); border-color: #6a3434; }
.de-debug-mini { height: 24px; padding: 0 8px; border: 1px solid var(--dd-line); border-radius: 4px; background: transparent; color: var(--dd-fg); font-size: 11px; }
.de-debug-pill { display: inline-flex; align-items: center; gap: 8px; height: 34px; padding: 0 14px 0 12px; background: var(--dd-bg); color: var(--dd-fg); border: 1px solid var(--dd-line); border-radius: 17px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28); font-size: 13px; }
.de-debug-pill-n { font-family: var(--dd-mono); font-size: 11px; color: var(--dd-muted); }
.de-debug-pill-fly { font-family: var(--dd-mono); font-size: 11px; color: var(--dd-fetch); }
.de-debug-pill-err { font-family: var(--dd-mono); font-size: 11px; color: var(--dd-err); }
@media (prefers-reduced-motion: no-preference) {
	.de-debug-rec:not(.is-paused) { animation: de-debug-pulse 1.8s ease-in-out infinite; }
	@keyframes de-debug-pulse { 50% { opacity: 0.35; } }
}
`

/**
 * Add the overlay stylesheet to the document once.
 *
 * @since  [NEXT_VERSION]
 * @return {void}
 */
export const injectOverlayStyles = () => {
	if ( 'undefined' === typeof document || document.getElementById( STYLE_ID ) ) {
		return
	}

	const style = document.createElement( 'style' )

	style.id = STYLE_ID
	style.textContent = CSS

	document.head.appendChild( style )
}
