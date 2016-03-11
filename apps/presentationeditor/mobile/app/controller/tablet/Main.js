Ext.define('PE.controller.tablet.Main', {
    extend: 'PE.controller.Main',

    requires: [
        'Ext.Anim'
    ],

    config: {
        refs: {
            viewToolbar     : 'viewtoolbar'
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

        var viewToolbar         = this.getViewToolbar();
        viewToolbar && viewToolbar.show();
        this.api && this.api.asc_enableKeyEvents(false);
    },

    setPresentationName: function(name){
    }
});