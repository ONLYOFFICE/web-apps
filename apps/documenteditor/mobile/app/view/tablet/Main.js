Ext.define('DE.view.tablet.Main', {
    extend: 'DE.view.Main',
    alias: 'widget.detabletmain',

    requires: ([
        'Common.view.PopClip',
        'DE.view.tablet.panel.FontStyle',
        'DE.view.tablet.panel.Insert',
        'DE.view.tablet.panel.ListStyle',
        'DE.view.tablet.panel.ParagraphAlignment',
        'DE.view.tablet.panel.Spacing',
        'DE.view.tablet.panel.TextColor',
        'DE.view.tablet.toolbar.Edit',
        'DE.view.tablet.toolbar.Search',
        'DE.view.tablet.toolbar.View'
    ]),

    config: {
        cls: 'de-tablet-main',
        fullscreen: true,
        layout: {
            type: 'vbox',
            pack: 'center'
        }
    },

    initialize: function() {
        var me = this;

        this.add(Ext.create('DE.view.tablet.toolbar.Edit', {
            hidden      : true
        }));

        this.add(Ext.create('DE.view.tablet.toolbar.View', {
            hidden      : true
        }));

        this.add(Ext.create('DE.view.tablet.toolbar.Search', {
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
                    id      : 'id-sdkeditor'
                }
            ]
        });

        this.add({
            xtype   : 'popclip',
            hidden  : true
        });

        this.callParent(arguments);
    }
});
