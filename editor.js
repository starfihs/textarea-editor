const tabSpace              = 4;
const fontSize              = 16;
const fontFamily            = 'monospace';
const backgroundColor       = 'transparent';
const caretColor            = '#393939';
const selectionColor        = '#0f00001a';
const lineColor             = '#ff370010';
const outlineColor          = '#ffe2da';
const defaultColor          = '#8534a2';
const r                     = String.raw;
const ops                   = r`<>+*/^\[\](){}|.\-%=!&~:;@,\\`;
const kws                   = r`and|as|assert|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield`;
const styles                = [ [r`"""(.|\n)*?("""|$)|'''(.|\n)*?('''|$)`,     'color: #5a8c32'],
                                [r`"[^"\n]*("|\n|$)|'[^\'\n]*('|\n|$)`,        'color: #5a8c32'],
                                [r`#.*`,                                       'color: #808080; font-style: italic'],
                                [r`[${ops}]`,                                  'color: #646464'],
                                [r`\b(${kws})\b`,                              'color: #c55228; font-weight: bold'],
                                [r`\b(\d+|True|False|None)\b`,                 'color: #b5601b'] ];
const pattern               = new RegExp(styles.map(p => `(${p[0].replace(/\(/g, '(?:')})`).join('|'), 'g');


export const createEditor = (id, text='') => {
    const editor_           = Object.assign(document.getElementById(id), { tabIndex: -1 });
    const editor            = Object.assign(editor_.appendChild(document.createElement('textarea')), { tabIndex: 0, readOnly: true, spellcheck: false, name: 'editor', value: text });
    const syntax            = Object.assign(editor_.appendChild(document.createElement('pre')), { tabIndex: -1, ariaHidden: true });
    const cover             = Object.assign(editor_.appendChild(document.createElement('pre')), { tabIndex: -1, ariaHidden: true });
    document.head.append(Object.assign(document.createElement('style'), { textContent: `#${id}              { position: relative; z-index: 0; overflow: auto; background-color: ${backgroundColor}; font-size: ${fontSize}px; font-family: ${fontFamily}; user-select: none; }`}));
    document.head.append(Object.assign(document.createElement('style'), { textContent: `#${id} > *          { all: unset; display: block; box-sizing: border-box; scrollbar-width: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; padding: 1rem; white-space: pre; scroll-padding: 1rem; }`}));
    document.head.append(Object.assign(document.createElement('style'), { textContent: `#${id} *::selection { background-color: ${selectionColor}; }`}));
    editor.style.cssText    = `z-index: 1; color: transparent; caret-color: ${caretColor};`
    syntax.style.cssText    = `z-index: 0; overflow: hidden; color: ${defaultColor};`
    cover.style.cssText     = `z-index: 0; overflow: hidden; color: transparent`;
    let inEditor            = false;
    let clickCnt            = 0;
    let [line, caret]       = [null, null];
    let [S, E]              = [0, 0];


    const highlight = () => {
        syntax.innerHTML = editor.value.replace(pattern, (match, ...args) => {
            let style = styles[args.findIndex(g => g!==undefined)][1];
            return `<span style='${style}' tabindex='-1' aria-hidden='true'>${match}\u200B</span>`; }) + '\u200B'; }
    const touchup = () => {
        let [V, S, E]       = [editor.value, editor.selectionStart, editor.selectionEnd];
        let [lS, lE]        = [Math.min(S, V.lastIndexOf('\n', S-1)+1), (V.indexOf('\n', E)+1 || V.length+1)-1];
        let bC              = inEditor ? lineColor : 'transparent';
        V                   = V.replace('<', '\xa0').replace('>', '\xa0');
        cover.textContent   = '';
        line                = Object.assign(document.createElement('span'), {tabIndex: -1, ariaHidden: true});
        caret               = Object.assign(document.createElement('span'), {tabIndex: -1, ariaHidden: true});
        cover.appendChild(document.createTextNode(V.slice(0, lS)));
        cover.appendChild(line);
        line .appendChild(document.createTextNode(V.slice(lS, S)));
        line .appendChild(caret);
        caret.appendChild(document.createTextNode(V.slice(S, E) + '\u200B'));
        line .appendChild(document.createTextNode(V.slice(E, lE) + '\u200B'));
        cover.appendChild(document.createTextNode(V.slice(lE) + '\u200B'));
        line.style.cssText  = `display: inline-block; min-width: 100%; background-color: ${bC}`;
        editor.style.caretColor = inEditor ? caretColor : 'transparent'; }
    editor.onscroll = e => {
        syntax.scrollTop  = cover.scrollTop  = editor.scrollTop;
        syntax.scrollLeft = cover.scrollLeft = editor.scrollLeft; }
    const clampscroll = () => {
        if(!caret) return;
        let eB = editor.getBoundingClientRect();
        let cB = caret.getBoundingClientRect();
        if(cB.bottom + fontSize > eB.bottom)    editor.scrollTop  += cB.bottom - eB.bottom + fontSize;
        if(cB.top - 2*fontSize < eB.top)        editor.scrollTop  += cB.top - eB.top - 2*fontSize;
        if(cB.right > eB.right)                 editor.scrollLeft += cB.right - eB.right;
        syntax.scrollTop  = cover.scrollTop   = editor.scrollTop;
        syntax.scrollLeft = cover.scrollLeft  = editor.scrollLeft; }
    const tidy                  = () => { highlight(); touchup(); clampscroll(); };
    editor.oninput              = e => tidy();
    editor.onselectionchange    = e => tidy();


    editor.onfocus = e => {
        e.stopPropagation(); e.preventDefault();
        clickCnt = 1;
        editor_.style.zIndex = 9999;
        editor_.style.outline = `solid 5px ${outlineColor}`; }
    const enter = (resetSelect = false) => {
        if(!editor.value.length || (resetSelect && editor.selectionStart === editor.selectionEnd))
            [editor.selectionStart, editor.selectionEnd] = [S, E];
        editor_.style.outline = 'none';
        editor.readOnly = !(inEditor = true);
        touchup(); }
    editor.onblur = e => {
        e.stopPropagation(); e.preventDefault();
        clickCnt = 0;
        [S, E] = [editor.selectionStart, editor.selectionEnd];
        editor_.style.zIndex = 0;
        editor_.style.outline = 'none';
        editor.readOnly = !(inEditor = false);
        touchup(); }


    editor.onmousedown  = e => {
        if(!inEditor && ++clickCnt === 2) {
            if(e.detail === 2) { e.stopPropagation(); e.preventDefault(); }
            enter(); } }
    editor.onkeydown = e => {
        // console.log(e.key);
        e.stopPropagation();
        const [V, S, E, tS] = [editor.value, editor.selectionStart, editor.selectionEnd, tabSpace];
        const [lS, lE]      = [V.lastIndexOf('\n', S-1)+1, (V.indexOf('\n', E)+1 || V.length+1)-1];
        const L             = V.slice(lS, lE);
        const pL            = L.match(/^ */)[0].length;
        const lines         = L.split('\n');
        const pr            = text => { e.preventDefault(); document.execCommand('insertText', false, text.length ? text : '\u200B'); }
        if(!inEditor)
            switch(e.key) {
                case ' ':
                case 'Enter':   e.preventDefault(); enter(true); }
        else
            switch(e.key) {
                case 'Escape':  editor.blur(); editor.focus(); return;
                case 'Backspace':
                                if(e.shiftKey || e.ctrlKey || S !== E) return;
                                editor.selectionStart = Math.max(0, S-1-(pL && (pL>=S-lS) && (S-lS+tS-1)%tS)); return;
                case 'Enter':   const nL = !e.shiftKey && !e.ctrlKey && (pL + (tS-pL%tS)%tS + tS*/:( )*$/.test(V.slice(lS, E)));
                                pr('\n'+' '.repeat(nL)); return;
                case 'Tab':     if(!e.shiftKey && S === E) { pr(' '.repeat(tS)); return; }
                                [editor.selectionStart, editor.selectionEnd] = [lS, lE];
                                pr(e.shiftKey ?
                                    lines.map(line => line.slice(pL ? (pL+tS-1)%tS+1 : 0), line.length).join('\n') :
                                    lines.map(line => ' '.repeat(tS-pL%tS) + line).join('\n'));
                                [editor.selectionStart, editor.selectionEnd] = [S+(1-2*e.shiftKey)*tS, E+(1-2*e.shiftKey)*tS*lines.length];
                                return;
                case '/':       if(!e.ctrlKey) return;
                                [editor.selectionStart, editor.selectionEnd] = [lS, lE];
                                const indent = !lines.every(line => /^# /.test(line));
                                pr(indent ?
                                    lines.map(line => '# '+line).join('\n') :
                                    lines.map(line => line.slice(2)).join('\n'));
                                [editor.selectionStart, editor.selectionEnd] = [S+(2*indent-1)*2, E+(2*indent-1)*2*lines.length];
                                return; } }


    editor_.getText = () => editor.value;
    editor_.setText = text => {
        let [pActiveEl, pInEditor, pSelection, pRanges] = [document.activeElement, inEditor, getSelection(), []];
        for(let i = 0; i < pSelection.rangeCount; i++) pRanges.push(pSelection.getRangeAt(i).cloneRange());
        editor.focus(); enter(); editor.select();
        document.execCommand('insertText', false, text);
        editor.blur(); if(pActiveEl) pActiveEl.focus(); if(pInEditor) enter();
        let selection = getSelection();
        selection.removeAllRanges();
        for(const range of pRanges) if(document.contains(range.startContainer) && document.contains(range.endContainer)) selection.addRange(range);
        tidy(); }


    return editor_; }
