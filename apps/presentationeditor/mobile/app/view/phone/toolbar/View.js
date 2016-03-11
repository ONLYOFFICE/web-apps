Ext.define('PE.view.phone.toolbar.View', {
    extend: 'Ext.Toolbar',
    xtype: 'viewtoolbar',

    config: {
        docked      : 'top',
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
                id      : 'id-tb-btn-prev-slide',
                ui      : 'base',
                iconCls : 'left'
            },
            {
                id      : 'id-tb-btn-play',
                ui      : 'base',
                iconCls : 'play'
            },
            {
                id      : 'id-tb-btn-next-slide',
                ui      : 'base',
                iconCls : 'right'
            },
            {
                xtype   : 'spacer'
            },
            {
                id      : 'id-tb-btn-view-share',
                ui      : 'base',
                iconCls : 'share'
            },
            {
                id      : 'id-tb-btn-fullscreen',
                ui      : 'base',
                iconCls : 'fullscreen'
            }
        ]);

        this.callParent(arguments);
    },

    doneText: 'Done'
});