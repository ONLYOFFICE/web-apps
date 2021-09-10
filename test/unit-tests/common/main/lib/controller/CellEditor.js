!window.common && (window.common = {});
!common.controller && (common.controller = {});

common.ui = _.extend(common.ui || {}, {
    Keys : {
        BACKSPACE:  8,
        TAB:        9,
        RETURN:     13,
        SHIFT:      16,
        CTRL:       17,
        ALT:        18,
        ESC:        27,
        LEFT:       37,
        UP:         38,
        RIGHT:      39,
        DOWN:       40,
        DELETE:     46,
        HOME:       36,
        END:        35,
        SPACE:      32,
        PAGEUP:     33,
        PAGEDOWN:   34,
        INSERT:     45,
        EQUALITY_FF:61,
        NUM_PLUS:   107,
        NUM_MINUS:  109,
        F1:         112,
        F2:         113,
        F3:         114,
        F4:         115,
        F5:         116,
        F6:         117,
        F7:         118,
        F8:         119,
        F9:         120,
        F10:        121,
        F11:        122,
        F12:        123,
        MINUS_FF:   173,
        EQUALITY:   187,
        MINUS:      189
    }});

common.controller.CellEditor = new(function(){
    var  me,
        api,
        editor,
        mode,
        created=false;

    function onCellName(e){
        if (e.keyCode == common.ui.Keys.RETURN){
            var name = editor.$cellname.val();
            if (name && name.length) {
                api.asc_findCell(name);
            }
        }
    }

    function onKeyupCellEditor(e) {
        if(e.keyCode == common.ui.Keys.RETURN && !e.altKey){
            api.isCEditorFocused = 'clear';
        }
    }

    function onBlurCellEditor() {
        if (api.isCEditorFocused == 'clear')
            api.isCEditorFocused = undefined;
        else if (api.isCellEdited)
            api.isCEditorFocused = true;
    }

    function events() {
           editor.$el.find('#ce-cell-name').on( 'keyup', onCellName);
           editor.$el.find('textarea#ce-cell-content').on( 'keyup', onKeyupCellEditor);
           editor.$el.find('textarea#ce-cell-content').on('blur',  onBlurCellEditor);
    }

    function createController() {
        me = this;
        if (created)
            return me;

        created = true;
        onLaunch();
        return me;
    }

    function onLayoutResize(o, r) {
        if (r == 'cell:edit') {
                o && common.localStorage.setBool('sse-celleditor-expand', false);
        }
    }

    function  onLaunch(){
        common.view.CellEditor.create();
        editor = common.view.CellEditor;
        events();

        editor.$el.parent().find('.after').css({zIndex: '4'}); // for spreadsheets - bug 23127

        var val = common.localStorage.getItem('sse-celleditor-height');
        editor.keep_height = (val!==null && parseInt(val)>0) ? parseInt(val) : 19;
        if (common.localStorage.getBool('sse-celleditor-expand')) {
            editor.$el.height(editor.keep_height);
            onLayoutResize(undefined, 'cell:edit');
        }
        this.namedrange_locked = false;
    }

    function onApiCellSelection(info){
        editor.cell.updateInfo(info);
    }

    function onApiEditCell(state) {
        if (this.viewmode) return; // signed file

        if (state == Asc.c_oAscCellEditorState.editStart){
            api.isCellEdited = true;
            editor.cell.nameDisabled(true);
        } else if (state == Asc.c_oAscCellEditorState.editInCell) {
            api.isCEditorFocused = 'clear';
        } else if (state == Asc.c_oAscCellEditorState.editEnd) {
            api.isCellEdited = false;
            api.isCEditorFocused = false;
            editor.cell.nameDisabled(false);
        }
    }

    function onLockDefNameManager(state) {
        this.namedrange_locked = (state == Asc.c_oAscDefinedNameReason.LockDefNameManager);
    }

    function onInputKeyDown(e) {
        /*if (common.ui.Keys.UP === e.keyCode || common.ui.Keys.DOWN === e.keyCode ||
            common.ui.Keys.TAB === e.keyCode || common.ui.Keys.RETURN === e.keyCode || common.ui.Keys.ESC === e.keyCode ||
            common.ui.Keys.LEFT === e.keyCode || common.ui.Keys.RIGHT === e.keyCode) {
            var menu = $('#menu-formula-selection'); // for formula menu
            if (menu.hasClass('open'))
                menu.find('.dropdown-menu').trigger('keydown', e);
        }*/
    }

    function onApiDisconnect() {
        mode.isEdit = false;
    }

    function setApi(apiF){
        api=apiF;

        api.isCEditorFocused = false;
        api.asc_registerCallback('asc_onSelectionNameChanged', onApiCellSelection);
        api.asc_registerCallback('asc_onEditCell', onApiEditCell);
        api.asc_registerCallback('asc_onCoAuthoringDisconnect', onApiDisconnect);
        api.asc_registerCallback('asc_onLockDefNameManager', onLockDefNameManager);
        api.asc_registerCallback('asc_onInputKeyDown', onInputKeyDown);
    }

    function onApiSelectionChanged(info) {
        if (this.viewmode) return; // signed file
    }

    function setMode(modeF) {
        mode = modeF;

        if ( mode.isEdit ) {
            api.asc_registerCallback('asc_onSelectionChanged', onApiSelectionChanged);
        }
    }

    function setPreviewMode(mode) {
        if (this.viewmode === mode) return;
        this.viewmode = mode;
        editor.cell.nameDisabled(mode && !(mode.isEdit && !mode.isEditDiagram && !mode.isEditMailMerge));
    }

    return {
        create: createController,
        setApi: setApi,
        setMode: setMode,
        setPreviewMode: setPreviewMode
    }

})();