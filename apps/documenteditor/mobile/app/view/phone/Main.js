Ext.define('DE.view.phone.Main', {
    extend: 'DE.view.Main',
    alias: 'widget.dephonemain',

    requires: ([
        'DE.view.phone.toolbar.Search',
        'DE.view.phone.toolbar.View'
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

        this.add(Ext.create('DE.view.phone.toolbar.View', {
            hidden      : true
        }));

        this.add(Ext.create('DE.view.phone.toolbar.Search', {
            hidden      : true
        }));

        this.add({
            xtype   : 'container',
            layout  : 'vbox',
            id      : 'id-conteiner-document',
            flex    : 1,
            items   : [
                {
                    xtype   : 'container',
                    flex    : 1,
                    id      : 'id-sdkeditor',
                    style   : 'z-index: 1'
                }
            ]
        });

        this.callParent(arguments);
    }
});