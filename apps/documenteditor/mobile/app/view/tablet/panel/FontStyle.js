Ext.define('DE.view.tablet.panel.FontStyle', {
    extend: 'Common.view.PopoverPanel',
    alias: 'widget.fontstylepanel',

    requires: ([
        'Ext.SegmentedButton'
    ]),

    initialize: function() {
        var me = this;

        me.add({
            xtype   : 'container',
            layout  : 'hbox',
            items   : [
                {
                    xtype   : 'segmentedbutton',
                    id      : 'id-toggle-fontstyles',
                    ui      : 'base',
                    cls     : 'divided',
                    allowMultiple: true,
                    items   : [
                        {
                            id      : 'id-btn-fontstyle-bold',
                            ui      : 'base',
                            iconCls : 'bold'
                        },
                        {
                            id      : 'id-btn-fontstyle-italic',
                            ui      : 'base',
                            iconCls : 'italic'
                        },
                        {
                            id      : 'id-btn-fontstyle-underline',
                            ui      : 'base',
                            iconCls : 'underline'
                        }
                    ]
                }
            ]
        });

        this.callParent(arguments);
    }
});