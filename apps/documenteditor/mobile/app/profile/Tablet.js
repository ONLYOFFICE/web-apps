Ext.define('DE.profile.Tablet', {
    extend: 'Ext.app.Profile',
    
    config: {
        name: 'tablet',
        namespace: 'tablet',
        controllers: [
            'Main',
            'Common.controller.PopClip',
            'DE.controller.Document',
            'DE.controller.Search',
            'DE.controller.tablet.panel.Font',
            'DE.controller.tablet.panel.FontStyle',
            'DE.controller.tablet.panel.Insert',
            'DE.controller.tablet.panel.Style',
            'DE.controller.tablet.panel.ParagraphAlignment',
            'DE.controller.tablet.panel.Spacing',
            'DE.controller.tablet.panel.TextColor',
            'DE.controller.toolbar.Edit',
            'DE.controller.toolbar.View'
        ],
        views: [
            'Main'
        ],
        models: [
            'Common.model.SettingItem'
        ],
        stores: [
            'Common.store.SettingsList'
        ]
    },
    
    isActive: function() {
        return (Ext.browser.is.WebKit && ((Ext.os.is.Tablet && (Ext.os.is.iOS || Ext.os.is.Android)) || Ext.os.is.Desktop));
    },
    
    launch: function() {
        Ext.widget('detabletmain');
    }
});