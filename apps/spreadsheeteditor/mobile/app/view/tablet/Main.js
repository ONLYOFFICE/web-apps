Ext.define('SSE.view.tablet.Main', {
    extend: 'SSE.view.Main',
    alias: 'widget.setabletmain',

    requires: ([
        'SSE.view.tablet.toolbar.Search',
        'SSE.view.tablet.toolbar.View',
        'SSE.view.WorksheetList'
    ]),

    config: {
        fullscreen: true,
        layout: {
            type: 'vbox',
            pack: 'center'
        }
    },

    initialize: function() {
        this.add(Ext.create('SSE.view.tablet.toolbar.View', {
            hidden      : true
        }));

        this.add(Ext.create('SSE.view.tablet.toolbar.Search', {
            hidden      : true
        }));

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
