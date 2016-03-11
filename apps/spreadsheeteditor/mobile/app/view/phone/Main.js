Ext.define('SSE.view.phone.Main', {
    extend: 'SSE.view.Main',
    alias: 'widget.sephonemain',

    requires: ([
//        'Ext.Label',
        'Ext.field.Search'
    ]),

    config: {
        cls: 'de-phone-main',
        fullscreen: true,
        layout: {
            type: 'vbox',
            pack: 'center'
        }
    },

    initialize: function() {
        var me = this;

        this.add(Ext.create('SSE.view.phone.toolbar.View', {
            hidden      : true
        }));

        this.add(Ext.create('SSE.view.phone.toolbar.Search', {
            hidden      : true
        }));

        this.add({
            xtype   : 'container',
            id      : 'id-pnl-top-fixed',
            docked  : 'top',
            style   : 'opacity: 0;'
        });

        this.add({
            xtype   : 'container',
            layout  : 'vbox',
            id      : 'id-container-document',
            flex    : 1,
            items   : [
                {
                    xtype   : 'container',
                    flex    : 1,
                    id      : 'id-sdkeditor'
                }
            ]
        });

        this.add({
            xtype   : 'panel',
            layout  : 'fit',
            width   : 200,
            height  : 200,
            id      : 'id-worksheets-panel',
            top     : 0,
            left    : 0,
            modal   : true,
            hidden  : true,
            hideOnMaskTap: true,
            items: [{
                xtype: 'seworksheetlist'
            }]
        });

        this.callParent(arguments);
    }
});