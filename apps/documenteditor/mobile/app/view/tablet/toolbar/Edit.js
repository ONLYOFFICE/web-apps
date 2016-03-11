Ext.define('DE.view.tablet.toolbar.Edit', {
    extend: 'Ext.Toolbar',
    xtype: 'edittoolbar',

    requires: ([
        'Common.component.RepeatableButton'
    ]),

    config: {
        docked      : 'top',
        zIndex      : 5,
        minHeight   : 44,
        ui          : 'edit'
    },

    initialize: function() {
        var me = this;

        this.add([
            {
                xtype   : 'toolbar',
                minHeight: 40,
                flex    : 1,
                style   : 'margin: 0; padding: 0;',
                items   : [
                    {
                        id      : 'id-tb-btn-done',
                        ui      : 'base-blue',
                        cls     : 'text-offset-12',
                        text    : this.doneText
                    },
                    {
                        id      : 'id-tb-btn-save',
                        ui      : 'base',
                        iconCls : 'save'
                    }
                ]
            },
            {
                xtype   : 'repeatablebutton',
                id      : 'id-tb-btn-undo',
                disabled: true,
                ui      : 'base',
                iconCls : 'undo'
            },
            {
                xtype   : 'spacer',
                width   : 30
            },
            {
                id      : 'id-tb-btn-font',
                ui      : 'base',
                cls     : 'text-offset-30',
                text    : this.fontText
            },
            {
                id      : 'id-tb-btn-style',
                ui      : 'base',
                iconCls : 'font-style'
            },
            {
                id      : 'id-tb-btn-color',
                ui      : 'base',
                iconCls : 'font-color'
            },
            {
                xtype   : 'spacer',
                width   : 30
            },
            {
                id      : 'id-tb-btn-align',
                ui      : 'base',
                iconCls : 'align-left'
            },
            {
                id      : 'id-tb-btn-liststyle',
                ui      : 'base',
                iconCls : 'bullets'
            },
            {
                id      : 'id-tb-btn-paragraph',
                ui      : 'base',
                iconCls : 'spacing'
            },
            {
                xtype   : 'spacer',
                width   : 30
            },
            {
                id      : 'id-tb-btn-table',
                ui      : 'base',
                iconCls : 'insert'
            },
            {
                xtype   : 'toolbar',
                minHeight: 40,
                flex    : 1,
                style   : 'margin: 0; padding: 0;',
                layout  : {
                    type    : 'hbox',
                    pack    : 'end'
                },
                items   : [
                    {
                        id      : 'id-tb-btn-share',
                        ui      : 'base',
                        iconCls : 'share'
                    }
                ]
            }
        ]);

        this.add({
            xtype   : 'fontpanel',
            layout  : 'fit',
            ui      : 'settings',
            width   : 440,
            height  : 46,
            id      : 'id-panel-font',
            top     : 0,
            left    : 0,
            hidden  : true,
            hideOnMaskTap: true
        });

        this.add({
            xtype   : 'fontstylepanel',
            layout  : 'fit',
            ui      : 'settings',
            width   : 154,
            height  : 45,
            id      : 'id-panel-font-style',
            top     : 0,
            left    : 0,
            hidden  : true,
            hideOnMaskTap: true
        });

        this.add({
            xtype   : 'textcolorsettingspanel',
            layout  : 'fit',
            ui      : 'settings',
            width   : 350,
            height  : 172,
            id      : 'id-panel-text-color',
            top     : 0,
            left    : 0,
            hidden  : true,
            hideOnMaskTap: true
        });

        this.add({
            xtype   : 'paragraphalignmentpanel',
            layout  : 'fit',
            ui      : 'settings',
            width   : 205,
            height  : 45,
            id      : 'id-panel-paragraph-alignment',
            top     : 0,
            left    : 0,
            hidden  : true,
            hideOnMaskTap: true
        });

        this.add({
            xtype   : 'liststylepanel',
            layout  : 'fit',
            ui      : 'settings',
            width   : 337,
            height  : 328,
            id      : 'id-panel-liststyle',
            top     : 0,
            left    : 0,
            hidden  : true,
            hideOnMaskTap: true
        });

        this.add({
            xtype   : 'spacingpanel',
            layout  : 'fit',
            ui      : 'settings',
            width   : 350,
            height  : 235,
            id      : 'id-panel-spacing',
            top     : 0,
            left    : 0,
            hidden  : true,
            hideOnMaskTap: true
        });

        this.add({
            xtype   : 'insertpanel',
            layout  : 'fit',
            ui      : 'settings',
            width   : 350,
            height  : 283,
            id      : 'id-panel-insert',
            top     : 0,
            left    : 0,
            hidden  : true,
            hideOnMaskTap: true
        });

        this.callParent(arguments);
    },

    doneText: 'Done',
    fontText: 'Font'
});