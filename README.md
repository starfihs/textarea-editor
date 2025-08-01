# textarea-editor

Hacky Python web editor. Developed for a WIP project. Wouldn't recommended anyone use. To develop as a standalone I'd:
- Refactor all the document.blabla => a couple of innerHTML strings
    - I could randomly generate an attribute to identify each div (I hope there's a more aesthetic approach)
- Refactor all generated css => one string
- Refactor all preferences => a json
- Remove the toggle readonly stuff (possibly throws off navreaders)
- Introduce a custom undo/redo stack for selection ranges
    - Intercept historyUndo / historyRedo event type oninput
    - I have to rely on the native stack for text content
- Reintroduce scrollbar without breaking clampscroll
- Add wrap text, line numbers, error checking, autocomplete, other language specs, ...

At that point I'd be much happier building a native editor from scratch in C++ and Python, but hey Sublime exists already <3. It would be an interesting challenge though, I guess there is a niche for a complete compact (100-300 lines) vanilla JS editor. This is enough for what I need.

This was my first time doing web dev. Takeaway 1: JS is so verbose and buggy that whenever possible, I should do everything in a long string (innerHTML, style elements, JSONs). Takeaway 2: I'm never doing a JS project again.

Annoyance with undo/redo stack:
- I rely on the deprecated document.execCommand(). As far as I know it's the only way to edit text and preserve the native undo/redo stack. There's no interface to the native stack
- You CAN intercept 'historyUndo/historyRedo' events in oninput. When I realized this I implemented my own undo/redo logic. However, the browser still maintains the native stack behind the scenes and it prevents oninput being called at all when it thinks there's nothing to undo/redo. That means to avoid execCommand you have to intercept every possible undo/redo trigger (in addition to Ctrl+yz keybinds, you need at least a custom context menu).
- document.execCommand('insertText', false, '...') works like a charm on all major browsers, for now. Unfortunately, there is no way to specify selection after insert (messing up selection in undo/redo buffer). I could have reintroduced my custom buffer, just for selection, but it would add a bunch of code and only really impact indentation/comment keybinds, so I decided against it. Sad because my undo/redo code was very clean