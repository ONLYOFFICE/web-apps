Ext.define('SSE.controller.tablet.Main', {
    extend: 'SSE.controller.Main',

    requires: [
        'Ext.Anim'
    ],

    config: {
        refs: {
            viewToolbar         : 'viewtoolbar',
            searchToolbar       : 'searchtoolbar'
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
        this.api.asc_enableKeyEvents(true);
    },

    setDocumentName: function(name){
        var caption = this.getDocumentNameLabel();

        if (caption)
            caption.setHtml(Ext.String.htmlEncode(name));
    },

    setMode: function(mode) {
        var viewToolbar         = this.getViewToolbar(),
            searchToolbar       = this.getSearchToolbar();

        if (mode == 'edit') {
            viewToolbar         && viewToolbar.hide();
            searchToolbar       && searchToolbar.hide();
            this.api            && this.api.asc_enableKeyEvents(true);
        } else {
            viewToolbar         && viewToolbar.show();
            this.api            && this.api.asc_enableKeyEvents(false);
        }
    }
}); 