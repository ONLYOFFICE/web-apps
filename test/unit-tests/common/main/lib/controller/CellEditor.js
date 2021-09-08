!window.common && (window.common = {});
!common.controller && (common.controller = {});
Common.UI = _.extend(Common.UI || {}, {
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
        if (e.keyCode == Common.UI.Keys.RETURN){
            var name = editor.$cellname.val();
            if (name && name.length) {
                api.asc_findCell(name);
            }
            //Common.NotificationCenter.trigger('edit:complete', editor);
        }
    }
    function onKeyupCellEditor(e) {
        if(e.keyCode == Common.UI.Keys.RETURN && !e.altKey){
            api.isCEditorFocused = 'clear';
        }
    }
    function onBlurCellEditor() {
        if (api.isCEditorFocused == 'clear')
            api.isCEditorFocused = undefined;
        else if (api.isCellEdited)
            api.isCEditorFocused = true;
    }
    function expandEditorField() {
        if ( Math.floor(editor.$el.height()) > 19) {
            editor.keep_height = editor.$el.height();
            editor.$el.height(19);
            editor.$el.removeClass('expanded');
            editor.$btnexpand['removeClass']('btn-collapse');
            common.localStorage.setBool('sse-celleditor-expand', false);
        } else {
            editor.$el.height(editor.keep_height);
            editor.$el.addClass('expanded');
            editor.$btnexpand['addClass']('btn-collapse');
            common.localStorage.setBool('sse-celleditor-expand', true);
        }

        //Common.NotificationCenter.trigger('layout:changed', 'celleditor');
        //Common.NotificationCenter.trigger('edit:complete', editor, {restorefocus:true});
    }
    function events() {
           editor.$el.find('#ce-cell-name').on( 'keyup', onCellName);
           editor.$el.find('textarea#ce-cell-content').on( 'keyup', onKeyupCellEditor);
           editor.$el.find('textarea#ce-cell-content').on('blur',  onBlurCellEditor);
           //editor.$el.find('button#ce-btn-expand').on('click',  expandEditorField);/*,
            /*'click button#ce-func-label': onInsertFunction*/
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
            /*if (Math.floor(editor.$el.height()) > 19) {
                if (!editor.$btnexpand.hasClass('btn-collapse')) {
                    editor.$el.addClass('expanded');
                    editor.$btnexpand['addClass']('btn-collapse');
                }

                o && common.localStorage.setItem('sse-celleditor-height', editor.$el.height());
                o && common.localStorage.setBool('sse-celleditor-expand', true);
            } else {*/
                editor.$el.removeClass('expanded');
                editor.$btnexpand['removeClass']('btn-collapse');
                o && common.localStorage.setBool('sse-celleditor-expand', false);
            //}
        }
    }
    function  onLaunch(){
        common.view.CellEditor.create();
        editor = common.view.CellEditor;
        //me.bindViewEvents(editor, events);
        events();

        editor.$el.parent().find('.after').css({zIndex: '4'}); // for spreadsheets - bug 23127

        var val = common.localStorage.getItem('sse-celleditor-height');
        editor.keep_height = (val!==null && parseInt(val)>0) ? parseInt(val) : 74;
        if (common.localStorage.getBool('sse-celleditor-expand')) {
            editor.$el.height(editor.keep_height);
            onLayoutResize(undefined, 'cell:edit');
        }

       /* editor.btnNamedRanges.menu.on('item:click', _.bind(this.onNamedRangesMenu, this))
            .on('show:before', _.bind(this.onNameBeforeShow, this));*/
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
        editor.$btnfunc.toggleClass('disabled', state == Asc.c_oAscCellEditorState.editText);
    }
    function onLockDefNameManager(state) {
        this.namedrange_locked = (state == Asc.c_oAscDefinedNameReason.LockDefNameManager);
    }
    function onInputKeyDown(e) {
        if (Common.UI.Keys.UP === e.keyCode || Common.UI.Keys.DOWN === e.keyCode ||
            Common.UI.Keys.TAB === e.keyCode || Common.UI.Keys.RETURN === e.keyCode || Common.UI.Keys.ESC === e.keyCode ||
            Common.UI.Keys.LEFT === e.keyCode || Common.UI.Keys.RIGHT === e.keyCode) {
            var menu = $('#menu-formula-selection'); // for formula menu
            if (menu.hasClass('open'))
                menu.find('.dropdown-menu').trigger('keydown', e);
        }
    }
    function onApiDisconnect() {
        mode.isEdit = false;

        var controller = this.getApplication().getController('FormulaDialog');
        if (controller) {
            controller.hideDialog();
        }

        if (!mode.isEdit) {
            $('#ce-func-label', editor.$el).addClass('disabled');
            editor.btnNamedRanges.setVisible(false);
        }
    }
    function onCellsRange(status) {
        editor.cell.nameDisabled(status != Asc.c_oAscSelectionDialogType.None);
        editor.$btnfunc.toggleClass('disabled', status != Asc.c_oAscSelectionDialogType.None);
    }
    function setApi(apiF){
        api=apiF;

        api.isCEditorFocused = false;
        api.asc_registerCallback('asc_onSelectionNameChanged', onApiCellSelection);
        api.asc_registerCallback('asc_onEditCell', onApiEditCell);
        api.asc_registerCallback('asc_onCoAuthoringDisconnect', onApiDisconnect);
        //Common.NotificationCenter.on('api:disconnect', onApiDisconnect);
        //Common.NotificationCenter.on('cells:range', onCellsRange);
        api.asc_registerCallback('asc_onLockDefNameManager', onLockDefNameManager);
        api.asc_registerCallback('asc_onInputKeyDown', onInputKeyDown);
    }
    function onApiSelectionChanged(info) {
        if (this.viewmode) return; // signed file

        var seltype = info.asc_getSelectionType(),
            coauth_disable = (!mode.isEditMailMerge && !mode.isEditDiagram) ? (info.asc_getLocked() === true || info.asc_getLockedTable() === true || info.asc_getLockedPivotTable()===true) : false;

        var is_chart_text   = seltype == Asc.c_oAscSelectionType.RangeChartText,
            is_chart        = seltype == Asc.c_oAscSelectionType.RangeChart,
            is_shape_text   = seltype == Asc.c_oAscSelectionType.RangeShapeText,
            is_shape        = seltype == Asc.c_oAscSelectionType.RangeShape,
            is_image        = seltype == Asc.c_oAscSelectionType.RangeImage || seltype == Asc.c_oAscSelectionType.RangeSlicer,
            is_mode_2       = is_shape_text || is_shape || is_chart_text || is_chart;

        editor.$btnfunc.toggleClass('disabled', is_image || is_mode_2 || coauth_disable);
    }
    function setMode(modeF) {
        mode = modeF;

        editor.$btnfunc[mode.isEdit?'removeClass':'addClass']('disabled');
        //editor.btnNamedRanges.setVisible(mode.isEdit && !mode.isEditDiagram && !mode.isEditMailMerge);

        if ( mode.isEdit ) {
            api.asc_registerCallback('asc_onSelectionChanged', onApiSelectionChanged);
        }
    }
    function setPreviewMode(mode) {
        if (this.viewmode === mode) return;
        this.viewmode = mode;
        editor.$btnfunc[!mode && mode.isEdit?'removeClass':'addClass']('disabled');
        editor.cell.nameDisabled(mode && !(mode.isEdit && !mode.isEditDiagram && !mode.isEditMailMerge));
    }
    return {
        create: createController,
        setApi: setApi,
        setMode: setMode
    }

})();