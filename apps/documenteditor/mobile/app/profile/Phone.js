Ext.define('DE.profile.Phone', {
    extend: 'Ext.app.Profile',
    
    config: {
        name: 'phone',
        namespace: 'phone',
        controllers: [
            'Main',
            'DE.controller.Document',
            'DE.controller.Search',
            'DE.controller.toolbar.Edit',
            'DE.controller.toolbar.View'
        ],
        views: [
            'Main'
        ]
    },
    
    isActive: function() {
        return (Ext.os.is.Phone && (Ext.os.is.iOS || Ext.os.is.Android));
    },
    
    launch: function() {
        Ext.widget('dephonemain');
    }
});