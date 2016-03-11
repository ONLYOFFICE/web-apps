Ext.define('DE.view.tablet.panel.Font', {
    extend: 'Common.view.PopoverPanel',
    alias: 'widget.fontpanel',

    requires: ([
        'Ext.NavigationView',
        'Common.component.PlanarSpinner'
    ]),

    initialize: function() {
        var me = this;

        me.add({
            xtype       : 'navigationview',
            id          : 'id-font-navigate',
            autoDestroy : false,
            cls         : 'plain',
            defaultBackButtonText: this.backText,
            navigationBar: {
                height      : 44,
                minHeight   : 44,
                hidden      : true,
                ui          : 'edit'
            },
            layout: {
                type        : 'card',
                animation   : null
            },
            items       : [
                {
                    xtype   : 'container',
                    layout  : 'hbox',
                    height  : 31,
                    id      : 'id-font-root',
                    style   : 'background: transparent;',
                    items   : [
                        {
                            xtype   : 'button',
                            id      : 'id-btn-fontname',
                            ui      : 'base',
                            style   : 'font-size: .7em;',
                            text    : this.fontNameText,
                            width   : 185
                        },
                        {
                            xtype   : 'spacer',
                            width   : 7
                        },
                        {
                            xtype       : 'planarspinnerfield',
                            width       : 135,
                            minValue    : 6,
                            maxValue    : 100,
                            stepValue   : 1,
                            cycle       : false,
                            component   : {
                                disabled : false
                            }
                        },
                        {
                            xtype   : 'spacer',
                            width   : 7
                        },
                        {
                            xtype   : 'segmentedbutton',
                            id      : 'id-toggle-baseline',
                            ui      : 'base',
                            cls     : 'divided',
                            allowDepress: true,
                            items   : [
                                {
                                    id      : 'id-btn-baseline-up',
                                    ui      : 'base',
                                    iconCls : 'superscript'
                                },
                                {
                                    id      : 'id-btn-baseline-down',
                                    ui      : 'base',
                                    iconCls : 'subscript'
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        me.add({
            xtype   : 'settingslist',
            hidden  : true,
            title   : this.fontNameText,
            id      : 'id-font-name',
            disableSelection: false,
            variableHeights: false,
            store   : Ext.create('Common.store.SettingsList', {})
        });

        this.callParent(arguments);
    },

    fontNameText: 'Font Name',
    backText    : 'Back'
});