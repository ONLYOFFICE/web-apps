Ext.define('DE.controller.tablet.Main', {
    extend: 'DE.controller.Main',

    requires: [
        'Ext.Anim'
    ],

    config: {
        refs: {
            editToolbar     : 'edittoolbar',
            viewToolbar     : 'viewtoolbar',
            searchToolbar   : 'searchtoolbar',
            readableBtn     : '#id-tb-btn-readable'
        },

        control: {
        }
    },

    launch: function() {
        this.callParent(arguments);
    },
    
    initControl: function() {
        this.callParent(arguments);
    },
    
    initApi: function() {
        this.callParent(arguments);
    },

    setApi: function(o){
        this.api = o;
    },

    setMode: function(mode){
        var editToolbar         = this.getEditToolbar(),
            viewToolbar         = this.getViewToolbar(),
            searchToolbar       = this.getSearchToolbar(),
            popClipController   = this.getApplication().getController('Common.controller.PopClip');

        if (mode == 'edit') {
            viewToolbar         && viewToolbar.hide();
            searchToolbar       && searchToolbar.hide();
            editToolbar         && editToolbar.show();
            this.api            && this.api.asc_enableKeyEvents(true);
            this.api            && this.api.asc_setViewMode(false);
        } else {
            editToolbar         && editToolbar.hide();
            viewToolbar         && viewToolbar.show();
            this.api            && this.api.asc_enableKeyEvents(false);
            this.api            && this.api.asc_setViewMode(true);
        }

        if (popClipController) {
            popClipController.setMode(mode);
        }
    },

    setReadableMode: function(readable) {
        var readableBtn = this.getReadableBtn();

        if (readableBtn)
            readable ? readableBtn.show() : readableBtn.hide();
    }

}); 