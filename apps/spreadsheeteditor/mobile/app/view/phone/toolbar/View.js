Ext.define('SSE.view.phone.toolbar.View', {
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
//            {
//                id      : 'id-tb-btn-editmode',
//                ui      : 'base',
//                cls     : 'text-offset-12',
//                text    : this.editText
//            },
            {
                xtype   : 'spacer'
            },
            {
                id      : 'id-tb-btn-search',
                ui      : 'base',
                iconCls : 'search'
            },
            {
                id      : 'id-tb-btn-pages',
                ui      : 'base',
                iconCls : 'pages'
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

    doneText: 'Done',
    editText: 'Edit'
});