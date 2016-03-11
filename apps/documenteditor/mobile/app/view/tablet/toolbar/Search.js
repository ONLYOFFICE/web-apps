Ext.define('DE.view.tablet.toolbar.Search', {
    extend: 'Ext.Toolbar',
    xtype: 'searchtoolbar',

    requires: ([
        'Ext.Label',
        'Ext.field.Search'
    ]),

    config: {
        docked      : 'top',
        zIndex      : 10,
        minHeight   : 52,
        ui          : 'search'
    },

    initialize: function() {
        this.add([
            {
                xtype       : 'searchfield',
                id          : 'id-field-search',
                placeHolder : this.searchText,
                flex        : 1
            },
            {
                xtype       : 'segmentedbutton',
                allowToggle : false,
                ui          : 'base',
                items       : [
                    {
                        id      : 'id-btn-search-up',
                        ui      : 'base',
                        iconCls : 'spinner-prev',
                        disabled: true
                    },
                    {
                        id      : 'id-btn-search-down',
                        ui      : 'base',
                        iconCls : 'spinner-next',
                        disabled: true
                    }
                ]
            }
        ]);

        this.callParent(arguments);
    },

    searchText: 'Search'
});
