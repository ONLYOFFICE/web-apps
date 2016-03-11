Ext.application({
    name: 'DE',

    icon: 'resources/img/icon.png',
    tabletStartupScreen: 'resources/img/tablet_startup.png',
    phoneStartupScreen: 'resources/img/phone_startup.png',

    viewport: {
        autoMaximize: false // TODO: set as TRUE if standalone version
    },

    profiles: [
        'Tablet', 
        'Phone'
    ]
});
