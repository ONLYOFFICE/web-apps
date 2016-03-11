Ext.define('SSE.view.phone.toolbar.Search', {
    extend: 'Ext.Toolbar',
    xtype: 'searchtoolbar',

    requires: ([
        'Ext.Label',
        'Ext.field.Search'
    ]),

    config: {
        docked      : 'top',
        minHeight   : 52,
        ui          : 'search'
    },

    initialize: function() {
        this.add([
            {
                xtype       : 'searchfield',
                id          : 'id-field-search',
                placeHolder : this.searchText,
                flex: 1
            },
            {
                xtype       : 'segmentedbutton',
                allowToggle : false,
                ui          : 'base',
                items       : [
                    {
                        id      : 'id-btn-search-prev',
                        ui      : 'base',
                        iconCls : 'search-prev',
                        disabled: true
                    },
                    {
                        id      : 'id-btn-search-next',
                        ui      : 'base',
                        iconCls : 'search-next',
                        disabled: true
                    }
                ]
            }
        ]);

        this.callParent(arguments);
    },

    searchText: 'Search'
});
