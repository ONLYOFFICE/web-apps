!window.common && (window.common = {});
!common.controller && (common.controller = {});
if (SSE === undefined) {
    var SSE = {};
}
SSE.Keys={RETURN:   13};

SSE.CellEditorController = new(function(){
    var  me,
        api,
        editor,
        created=false;

    function onCellName(e){
        if (e.keyCode == SSE.Keys.RETURN){
            var name = editor.$cellname.val();
            if (name && name.length) {
                api.asc_findCell(name);
            }
        }
    }

    function onKeyupCellEditor(e) {
        if(e.keyCode == SSE.Keys.RETURN && !e.altKey){
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

    function  onLaunch(){
        SSE.CellEditorView.create();
        editor = SSE.CellEditorView;
        events();

        editor.$el.parent().find('.after').css({zIndex: '4'}); // for spreadsheets - bug 23127

        var val = common.localStorage.getItem('sse-celleditor-height');
        editor.keep_height = 19;//(val!==null && parseInt(val)>0) ? parseInt(val) : 19;
        if (common.localStorage.getBool('sse-celleditor-expand')) {
            editor.$el.height(editor.keep_height);
        }
        this.namedrange_locked = false;
    }

    function createController() {
        me = this;
        if (created) return me;

        created = true;
        onLaunch();
        return me;
    }

    function onApiCellSelection(info){
        editor.cell.updateInfo(info);
    }

    function onApiEditCell(state) {
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

    function setApi(apiF){
        api=apiF;

        api.isCEditorFocused = false;
        api.asc_registerCallback('asc_onSelectionNameChanged', onApiCellSelection);
        api.asc_registerCallback('asc_onEditCell', onApiEditCell);
    }



    return {
        create: createController,
        setApi: setApi
    }

})();