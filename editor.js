const tabSpace = 4;
const fontSize = 16;
const fontFamily = 'monospace';
const backgroundColor = 'transparent';
const caretColor = '#393939';
const selectionColor = '#0f00001a';
const lineColor = '#ff370010';
const outlineColor = '#ffe2da';
const defaultColor = '#8534a2';
const styles = [
    [String.raw`"""(.|\n)*?("""|$)|'''(.|\n)*?('''|$)`, 'color: #5a8c32'],
    [String.raw`"[^"\n]*("|\n|$)|'[^\'\n]*('|\n|$)`, 'color: #5a8c32'],
    [String.raw`#.*`, 'color: #808080; font-style: italic'],
    [String.raw`[<>+*/^\[\](){}|.\-%=!&~:;@,\\]`, 'color: #646464'],
    [String.raw`\b(and|as|assert|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b`, 'color: #c55228; font-weight: bold'],
    [String.raw`\b(\d+|True|False|None)\b`, 'color: #b5601b'] ];
const pattern = new RegExp(styles.map(p => `(${p[0].replace(/\(/g, '(?:')})`).join('|'), 'g');
const text = '';


export const createEditor = id => {
    const ki = {'editor_' : id};
    const X = key => (ki[key] = key+'-'+crypto.randomUUID());
    const $ = key => document.getElementById(ki[key]);


    let editor_ = $('editor_');
    editor_.tabIndex = -1;
    editor_.innerHTML =
        `<textarea id='${X('editor')}' tabindex=0 aria-hidden='false' spellcheck='false'` +
            `style='z-index: 1; color: transparent; caret-color: ${caretColor}'>${text}</textarea>` +
        `<pre id='${X('syntax')}' tabindex=-1 aria-hidden='true'` +
            `style='z-index: 0; overflow: hidden; color: ${defaultColor}'></pre>` +
        `<pre id='${X('cover')}' tabindex=-1 aria-hidden='true'` +
            `style='z-index: 0; overflow: hidden; color: transparent'></pre>`;
    document.head.insertAdjacentHTML('beforeend', `<style>
        #${id} { position: relative; z-index: 0; overflow: auto; background-color: ${backgroundColor}; font-size: ${fontSize}px; font-family: ${fontFamily}; user-select: none; }
        #${id} > * { all: unset; display: block; box-sizing: border-box; scrollbar-width: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; padding: 1rem; white-space: pre; scroll-padding: 1rem; }
        #${id} *::selection { background-color: ${selectionColor};
        #${ki['editor']} { caret-color: ${caretColor} } } </style>`)
    let [editor, syntax, cover] = [$('editor'), $('syntax'), $('cover')];
    let inEditor = false;


    const highlight = () => {
        syntax.innerHTML = editor.value.replace(pattern, (match, ...args) => {
            let style = styles[args.findIndex(g => g!==undefined)][1];
            return `<span style='${style}' tabindex='-1' aria-hidden='true'>${match}\u200B</span>`; }) + '\u200B'; }
    const touchup = () => {
        let [V, S, E] = [editor.value, editor.selectionStart, editor.selectionEnd];
        let [lS, lE] = [Math.min(S, V.lastIndexOf('\n', S-1)+1), (V.indexOf('\n', E)+1 || V.length+1)-1];
        let [bC, cC] = inEditor ? [lineColor, caretColor] : ['transparent', 'transparent'];
        V = V.replace('<', '\xa0').replace('>', '\xa0');
        cover.innerHTML =
            V.slice(0, lS) +
            `<span id='${X('line')}' tabindex='-1' aria-hidden='true' style='display: inline-block; min-width: 100%; background-color: ${bC}'>` +
                V.slice(lS, S) +
                `<span id='${X('caret')}' tabindex='-1' aria-hidden='true' style='caretColor: ${cC}'>` +
                    V.slice(S, E) +
                `\u200B</span>` +
                V.slice(E, lE) +
            `\u200B</span>` +
            V.slice(lE); }


    editor.onscroll = e => {
        syntax.scrollTop = cover.scrollTop = editor.scrollTop;
        syntax.scrollLeft = cover.scrollLeft = editor.scrollLeft; }
    const clampscroll = () => {
        let eB = editor.getBoundingClientRect();
        let cB = $('caret').getBoundingClientRect();
        if(cB.bottom + fontSize > eB.bottom) editor.scrollTop += cB.bottom - eB.bottom + fontSize;
        if(cB.top - 2*fontSize < eB.top) editor.scrollTop += cB.top - eB.top - 2*fontSize;
        if(cB.right > eB.right) editor.scrollLeft += cB.right - eB.right;
        syntax.scrollTop = cover.scrollTop = editor.scrollTop;
        syntax.scrollLeft = cover.scrollLeft = editor.scrollLeft; }
    
    
    const tidy = () => { highlight(); touchup(); clampscroll(); };
    editor.oninput = e => tidy();
    editor.onselectionchange = e => tidy();


    editor_.onfocus = e => {
        editor_.style.zIndex = 9999;
        editor_.style.outline = `solid 5px ${outlineColor}`; }
    editor.onfocus = e => {
        inEditor = true;
        editor_.style.outline = 'none';
        touchup(); }
    editor.onblur = e => {
        inEditor = false;
        editor_.style.zIndex = 0;
        editor_.style.outline = 'none';
        touchup(); }


    editor_.onkeydown = e => {
        switch(e.key) {
            case ' ':
            case 'Enter': e.preventDefault(); editor.focus(); } }
    editor.onkeydown = e => {
        e.stopImmediatePropagation();
        const [V, S, E, tS] = [editor.value, editor.selectionStart, editor.selectionEnd, tabSpace];
        const [lS, lE] = [V.lastIndexOf('\n', S-1)+1, (V.indexOf('\n', E)+1 || V.length+1)-1];
        const L = V.slice(lS, lE);
        const pL = L.match(/^ */)[0].length;
        const lines = L.split('\n');
        const pr = text => { e.preventDefault(); document.execCommand('insertText', false, text.length ? text : '\u200B'); }
        switch(e.key) {
            case 'Escape': editor.blur(); editor_.focus(); return;
            case 'Backspace':
                if(e.shiftKey || e.ctrlKey || S !== E) return;
                editor.selectionStart = Math.max(0, S-1-(pL && (pL>=S-lS) && (S-lS+tS-1)%tS)); return;
            case 'Enter':
                const nL = !e.shiftKey && !e.ctrlKey && (pL + (tS-pL%tS)%tS + tS*/:( )*$/.test(V.slice(lS, E)));
                pr('\n'+' '.repeat(nL)); return;
            case 'Tab':
                if(!e.shiftKey && S === E) { pr(' '.repeat(tS)); return; }
                [editor.selectionStart, editor.selectionEnd] = [lS, lE];
                pr(e.shiftKey ?
                    lines.map(line => line.slice(pL ? (pL+tS-1)%tS+1 : 0), line.length).join('\n') :
                    lines.map(line => ' '.repeat(tS-pL%tS) + line).join('\n'));
                [editor.selectionStart, editor.selectionEnd] = [S+(1-2*e.shiftKey)*tS, E+(1-2*e.shiftKey)*tS*lines.length];
                return;
            case '/':
                if(!e.ctrlKey) return;
                [editor.selectionStart, editor.selectionEnd] = [lS, lE];
                const indent = !lines.every(line => /^# /.test(line));
                pr(indent ?
                    lines.map(line => '# '+line).join('\n') :
                    lines.map(line => line.slice(2)).join('\n'));
                [editor.selectionStart, editor.selectionEnd] = [S+(2*indent-1)*2, E+(2*indent-1)*2*lines.length];
                return; } }


    editor_.getState = () => [editor.value, editor.selectionStart, editor.selectionEnd];
    editor_.setState = (text, start, end) => {
        [editor.value, editor.selectionStart, editor.selectionEnd] = [text, start, end];
        tidy(); }
    return editor_; }
