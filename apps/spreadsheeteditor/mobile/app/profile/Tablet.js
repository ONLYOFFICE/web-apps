Ext.define('SSE.profile.Tablet', {
    extend: 'Ext.app.Profile',
    
    config: {
        name: 'tablet',
        namespace: 'tablet',
        controllers: [
            'Main',
            'SSE.controller.Document',
            'SSE.controller.Search',
            'SSE.controller.WorksheetList',
            'SSE.controller.toolbar.View'
        ],
        views: [
            'Main'
        ],
        models: [
            'SSE.model.Worksheet'
        ],
        stores: [
            'SSE.store.Worksheets'
        ]
    },
    
    isActive: function() {
        return (Ext.browser.is.WebKit && ((Ext.os.is.Tablet && (Ext.os.is.iOS || Ext.os.is.Android)) || Ext.os.is.Desktop));
    },
    
    launch: function() {
        Ext.widget('setabletmain');
    }
});