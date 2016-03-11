Ext.define('DE.view.tablet.panel.Spacing', {
    extend: 'Common.view.PopoverPanel',
    alias: 'widget.spacingpanel',

    requires: ([
        'Ext.NavigationView',
        'Common.component.SettingsList'
    ]),

    initialize: function() {
        var me = this;

        me.add({
            xtype       : 'navigationview',
            id          : 'id-spacing-navigate',
            autoDestroy : false,
            defaultBackButtonText: this.backText,
            navigationBar: {
                height      : 44,
                minHeight   : 44,
                ui          : 'edit'
            },

            items: [
                {
                    xtype   : 'settingslist',
                    title   : this.spacingText,
                    id      : 'id-spacing-root',
                    ui      : 'round',
                    scrollable: {
                        disabled: true
                    },
                    store   : Ext.create('Common.store.SettingsList', {
                        data: [
                            {
                                setting : this.lineSpacingText,
                                icon    : 'spacing',
                                group   : 'line',
                                child   : 'id-spacing-linespacing'
                            },
                            {
                                setting : this.incIndentText,
                                icon    : 'indent-inc',
                                group   : 'indent',
                                id      : 'id-linespacing-increaseindent'
                            },
                            {
                                setting : this.decIndentText,
                                icon    : 'indent-dec',
                                group   : 'indent',
                                id      : 'id-linespacing-decrementindent'
                            }
                        ]
                    })
                }
            ]
        });

        me.add({
            title           : this.spacingText,
            hidden          : true,
            id              : 'id-spacing-linespacing',
            xtype           : 'settingslist',
            disableSelection: false,
            allowDeselect   : true,
            store           : Ext.create('Common.store.SettingsList', {
                data: [
                    {setting: '1.0',    group: 'spacing'},
                    {setting: '1.15',   group: 'spacing'},
                    {setting: '1.5',    group: 'spacing'},
                    {setting: '2',      group: 'spacing'},
                    {setting: '2.5',    group: 'spacing'},
                    {setting: '3.0',    group: 'spacing'}
                ]
            })
        });

        this.callParent(arguments);
    },

    backText        : 'Back',
    spacingText     : 'Spacing',
    lineSpacingText : 'Paragraph Line Spacing',
    incIndentText   : 'Increase Indent',
    decIndentText   : 'Decrement Indent'
});