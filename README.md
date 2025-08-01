# textarea-editor

Hacky Python web editor. Developed for a WIP project. Wouldn't recommended anyone use. To develop as a standalone I'd:
- Refactor all the document.blabla => a couple of innerHTML strings
    - I could randomly generate an attribute to identify each div (I hope there's a more aesthetic approach)
- Refactor all generated css => one string
- Refactor all preferences => a json
- Remove the toggle readonly stuff (possibly throws off navreaders)
- Introduce a custom undo/redo stack for selection ranges
    - Intercept historyUndo / historyRedo event type oninput
    - I have to rely on the native stack for text content - don't ask
- Reintroduce scrollbar without breaking clampscroll
- Add wrap text, line numbers, error checking, autocomplete, other language specs, ...

At that point I'd be much happier building a native editor from scratch in C++ and Python, but hey Sublime exists already <3. It would be an interesting challenge, I guess there is a niche for a complete compact (100-300 lines) vanilla JS editor
This is enough for what I need

This was my first time doing web dev. Takeaway 1: JS is so verbose and buggy that whenever possible, I should do everything in a long string (innerHTML, style elements, JSONs). Takeaway 2: I'm never doing a JS project again.