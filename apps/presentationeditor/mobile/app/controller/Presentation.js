Ext.define('PE.controller.Presentation', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
        },

        control: {
        }
    },

    init: function() {

    },

    launch: function() {
        Ext.getCmp('id-conteiner-document').on('resize', this.onEditorResize, this);
    },

    setApi: function(o) {
        this.api = o;
    },

    onEditorResize: function(cmp) {
        if (this.api) {
            this.api.Resize();
            this.api.zoomFitToWidth();
        }
    }
});
