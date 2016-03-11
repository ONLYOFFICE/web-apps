Ext.define('PE.profile.Phone', {
    extend: 'Ext.app.Profile',
    
    config: {
        name: 'phone',
        namespace: 'phone',
        controllers: [
            'Main',
            'PE.controller.Presentation',
            'PE.controller.toolbar.View'
        ],
        views: [
            'Main'
        ]
    },
    
    isActive: function() {
        return (Ext.os.is.Phone && (Ext.os.is.iOS || Ext.os.is.Android));
    },
    
    launch: function() {
        Ext.widget('pephonemain');
    }
});