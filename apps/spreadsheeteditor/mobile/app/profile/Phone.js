Ext.define('SSE.profile.Phone', {
    extend: 'Ext.app.Profile',
    
    config: {
        name: 'phone',
        namespace: 'phone',
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
        return (Ext.os.is.Phone && (Ext.os.is.iOS || Ext.os.is.Android));
    },
    
    launch: function() {
        Ext.widget('sephonemain');
    }
});