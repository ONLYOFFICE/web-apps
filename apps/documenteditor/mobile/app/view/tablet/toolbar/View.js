Ext.define('DE.view.tablet.toolbar.View', {
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
                xtype   : 'toolbar',
                minHeight: 40,
                flex    : 1,
                style   : 'margin: 0; padding: 0;',
                items   : [
                    {
                        id      : 'id-tb-btn-view-done',
                        ui      : 'base-blue',
                        cls     : 'text-offset-12',
                        hidden  : true,
                        text    : this.doneText
                    },
                    {
                        id      : 'id-tb-btn-editmode',
                        ui      : 'base',
                        cls     : 'text-offset-12',
                        text    : this.editText
                    },
                    {
                        id      : 'id-tb-btn-readable',
                        ui      : 'base',
                        cls     : 'text-offset-12',
                        text    : this.readerText
                    }
                ]
            },
            {
                id      : 'id-tb-btn-search',
                ui      : 'base',
                iconCls : 'search'
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
                id      : 'id-tb-btn-fullscreen',
                ui      : 'base',
                iconCls : 'fullscreen'
            },
            {
                xtype   : 'toolbar',
                minHeight: 40,
                style   : 'margin: 0; padding: 0;',
                layout  : {
                    type    : 'hbox',
                    pack    : 'end'
                },
                flex    : 1,
                items   : [
                    {
                        id      : 'id-tb-btn-view-share',
                        ui      : 'base',
                        iconCls : 'share'
                    }
                ]
            }
        ]);

        this.callParent(arguments);
    },

    doneText    : 'Done',
    editText    : 'Edit',
    readerText  : 'Reader'
});