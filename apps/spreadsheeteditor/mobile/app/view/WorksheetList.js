Ext.define('SSE.view.WorksheetList', {
    extend: 'Ext.Container',
    requires: ([
        'Ext.dataview.List',
        'Ext.XTemplate'
    ]),
    alias: ['widget.seworksheetlist'],

    config: {
        layout: {
            type: 'fit'
        }
    },

    initialize: function() {
        var worksheetItemTpl = Ext.create('Ext.XTemplate',
            '<tpl for=".">' +
                '<div class="worksheet-item">{text:htmlEncode}</div>' +
            '</tpl>'
        );

        this.add({
            xtype       : 'list',
            store       : 'Worksheets',
            itemTpl     : worksheetItemTpl,
            singleSelect: true,
            itemSelector: 'div.worksheet-item',
            emptyText   : '',
            cls         : 'x-worksheet-item x-select-overlay'
        });

        this.callParent(arguments);
    }
});
