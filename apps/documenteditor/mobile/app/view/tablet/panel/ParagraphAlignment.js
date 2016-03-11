Ext.define('DE.view.tablet.panel.ParagraphAlignment', {
    extend: 'Common.view.PopoverPanel',
    alias: 'widget.paragraphalignmentpanel',

    initialize: function() {
        var me = this;

        me.add({
            xtype   : 'container',
            layout  : 'hbox',
            items   : [
                {
                    xtype   : 'segmentedbutton',
                    id      : 'id-toggle-paragraphalignment',
                    ui      : 'base',
                    cls     : 'divided',
                    items   : [
                        {
                            id      : 'id-btn-paragraphalignment-left',
                            ui      : 'base',
                            iconCls : 'align-left'
                        },
                        {
                            id      : 'id-btn-paragraphalignment-center',
                            ui      : 'base',
                            iconCls : 'align-center'
                        },
                        {
                            id      : 'id-btn-paragraphalignment-right',
                            ui      : 'base',
                            iconCls : 'align-right'
                        },
                        {
                            id      : 'id-btn-paragraphalignment-fill',
                            ui      : 'base',
                            iconCls : 'align-fill'
                        }
                    ]
                }
            ]
        });

        this.callParent(arguments);
    }
});