Ext.define('PE.profile.Tablet', {
    extend: 'Ext.app.Profile',
    
    config: {
        name: 'tablet',
        namespace: 'tablet',
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
        return (Ext.browser.is.WebKit && ((Ext.os.is.Tablet && (Ext.os.is.iOS || Ext.os.is.Android)) || Ext.os.is.Desktop));
    },
    
    launch: function() {
        Ext.widget('petabletmain');
    }
});