Ext.define('DE.view.phone.toolbar.View', {
    extend: 'Ext.Toolbar',
    xtype: 'viewtoolbar',

    config: {
        docked      : 'top',
        zIndex      : 10,
        minHeight   : 44,
        ui          : 'edit'
    },

    initialize: function() {
        this.add([
            {
                id      : 'id-tb-btn-view-done',
                ui      : 'base-blue',
                cls     : 'text-offset-12',
                hidden  : true,
                text    : this.doneText
            },
            {
                xtype   : 'spacer'
            },
            {
                id      : 'id-tb-btn-incfontsize',
                ui      : 'base',
                iconCls : 'textbigger',
                hidden  : true
            },
            {
                id      : 'id-tb-btn-decfontsize',
                ui      : 'base',
                iconCls : 'textless',
                hidden  : true
            },
            {
                id      : 'id-tb-btn-search',
                ui      : 'base',
                iconCls : 'search'
            },
            {
                id      : 'id-tb-btn-fullscreen',
                ui      : 'base',
                iconCls : 'fullscreen'
            },
            {
                xtype   : 'spacer'
            },
            {
                id      : 'id-tb-btn-view-share',
                ui      : 'base',
                iconCls : 'share'
            }
        ]);

        this.callParent(arguments);
    },

    doneText    : 'Done',
    readerText  : 'Reader'
});