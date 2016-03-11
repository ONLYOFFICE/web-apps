Ext.define('PE.view.tablet.Main', {
    extend: 'PE.view.Main',
    alias: 'widget.petabletmain',

    requires: ([
        'PE.view.tablet.toolbar.View'
    ]),

    config: {
        cls: 'pe-tablet-main',
        fullscreen: true,
        layout: {
            type: 'vbox',
            pack: 'center'
        }
    },

    initialize: function() {
        var me = this;

        this.add(Ext.create('PE.view.tablet.toolbar.View', {
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
                    height  : 0,
                    id      : 'id-sdkeditor'
                },
                {
                    xtype   : 'container',
                    flex    : 1,
                    id      : 'id-presentation-preview'
                },
                {
                    xtype   : 'panel',
                    cls     : 'pnl-overlay',
                    id      : 'id-preview-overlay-container',
                    style   : 'position:absolute; left:0; top:0; width:100%; height:100%; z-index:4;'
                }
            ]
        });

        this.callParent(arguments);
    }
});
