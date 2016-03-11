Ext.define('DE.view.tablet.panel.Insert', {
    extend: 'Common.view.PopoverPanel',
    alias: 'widget.insertpanel',

    requires: ([
        'Ext.NavigationView',
        'Common.component.PlanarSpinner'
    ]),

    initialize: function() {
        var me = this;

        me.add({
            xtype       : 'navigationview',
            id          : 'id-insert-navigate',
            autoDestroy : false,
            defaultBackButtonText: this.backText,
            navigationBar: {
                height      : 44,
                minHeight   : 44,
                ui          : 'edit'
            },
            items       : [
                {
                    xtype   : 'settingslist',
                    title   : this.insertText,
                    id      : 'id-insert-root',
                    scrollable: {
                        disabled: true
                    },
                    store   : Ext.create('Common.store.SettingsList', {
                        data: [
                            {
                                setting : this.insertTableText,
                                icon    : 'table',
                                group   : 'table',
                                child   : 'id-insert-table-container'
                            },
                            {
                                setting : this.insertRowText,
                                icon    : 'insert-row',
                                group   : 'table',
                                id      : 'id-insert-table-row'
                            },
                            {
                                setting : this.insertColumnText,
                                icon    : 'insert-column',
                                group   : 'table',
                                id      : 'id-insert-table-column'
                            },
                            {
                                setting : this.insertPicture,
                                icon    : 'picture',
                                group   : 'image',
                                child   : 'id-insert-picture-container'
                            }
                        ]
                    })
                }
            ]
        });

        me.add({
            xtype   : 'container',
            hidden  : true,
            title   : this.tableText,
            id      : 'id-insert-table-container',
            padding : 10,
            cls     : 'round',
            items   : [
                {
                    xtype       : 'planarspinnerfield',
                    id          : 'id-spinner-table-columns',
                    margin      : '9',
                    label       : this.columnsText,
                    labelWidth  : '55%',
                    minValue    : 2,
                    maxValue    : 20,
                    stepValue   : 1,
                    cycle       : false
                },
                {
                    xtype       : 'spacer',
                    height      : 2
                },
                {
                    xtype       : 'planarspinnerfield',
                    id          : 'id-spinner-table-rows',
                    margin      : '9',
                    label       : this.rowsText,
                    labelWidth  : '55%',
                    minValue    : 2,
                    maxValue    : 20,
                    stepValue   : 1,
                    cycle       : false
                },
                {
                    xtype   : 'container',
                    padding : '5 5',
                    items   : [
                        {
                            xtype   : 'button',
                            id      : 'id-btn-insert-table',
                            ui      : 'light',
                            cls     : 'border-radius-10',
                            height  : 44,
                            text    : this.insertTableText
                        }
                    ]
                }
            ]
        });

        me.add({
            xtype   : 'settingslist',
            title   : this.pictureText,
            hidden  : true,
            id      : 'id-insert-picture-container',
            ui      : 'round',
            scrollable: {
                disabled: true
            },
            store   : Ext.create('Common.store.SettingsList', {
                data: [
                    {
                        setting : '<div class="btn-input-image" style="display: inline-block;" id="id-insert-picture-inline">' + this.pictureUploadInline + '<input style="height: 44px;" type="file" accept="image/*" capture="camera"></div>',
//                        icon    : 'spacing',
                        group   : 'wrap'
                    },
                    {
                        setting : '<div class="btn-input-image" style="display: inline-block;" id="id-insert-picture-float">' + this.pictureUploadFloat + '<input style="height: 44px;" type="file" accept="image/*" capture="camera"></div>',
//                        icon    : 'indent-inc',
                        group   : 'wrap'
                    }
                ]
            })
        });

        this.callParent(arguments);
    },

    backText            : 'Back',
    insertText          : 'Insert',
    insertTableText     : 'Insert Table',
    insertRowText       : 'Insert Row',
    insertColumnText    : 'Insert Column',
    insertPicture       : 'Insert Picture',
    tableText           : 'Table',
    columnsText         : 'Columns',
    rowsText            : 'Rows',
    pictureText         : 'Picture',
    pictureUploadInline : 'Insert Inline',
    pictureUploadFloat  : 'Insert Float'
});