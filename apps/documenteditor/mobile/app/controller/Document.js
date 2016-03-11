Ext.define('DE.controller.Document', {
    extend: 'Ext.app.Controller',

    init: function() {
    },

    launch: function() {
        Ext.getCmp('id-conteiner-document').on('resize', this.onEditorResize, this);
    },

    setApi: function(o) {
        this.api = o;

        if (this.api) {
            this.api.asc_registerCallback('asc_onShowPopMenu', Ext.bind(this.onApiShowPopMenu, this));
            this.api.asc_registerCallback('asc_onHidePopMenu', Ext.bind(this.onApiHidePopMenu, this));
        }
    },

    onEditorResize: function(cmp) {
        if (this.api) {
            this.api.Resize();
            this.onApiHidePopMenu();
        }
    },

    onApiShowPopMenu: function(posX, posY) {
        var popClipCmp = Ext.ComponentQuery.query('popclip');

        if (popClipCmp.length > 0) {
            popClipCmp[0].setLeft(posX);
            popClipCmp[0].setTop(posY);
            popClipCmp[0].show();
        }
    },

    onApiHidePopMenu: function() {
        var popClipCmp = Ext.ComponentQuery.query('popclip');

        if (popClipCmp.length > 0) {
            popClipCmp[0].hide();
        }
    }
});
