/**
 * Provides access to the audio and video capture capabilities of the device.
 *
 * For more information regarding Native APIs, please review our [Native APIs guide](../../../packaging/native_apis.html).
 * 
 * @mixins Ext.device.capture.Abstract
 */
Ext.define('Ext.device.Capture', {
    singleton: true,

    requires: [
        'Ext.device.Communicator',
        'Ext.device.capture.Cordova',
        'Ext.device.capture.Simulator'
    ],

    constructor: function() {
        var browserEnv = Ext.browser.is;

        if (browserEnv.WebView && browserEnv.Cordova) {
            return Ext.create('Ext.device.capture.Cordova');
        }

        return Ext.create('Ext.device.capture.Simulator');
    }
});
