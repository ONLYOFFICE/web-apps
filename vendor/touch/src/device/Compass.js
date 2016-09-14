/**
 * Provides access to the native Compass API when running on a device. There are three implementations of this API:
 *
 * - [PhoneGap](http://docs.phonegap.com/en/2.6.0/cordova_compass_compass.md.html#Compass)
 *
 * This class will automatically select the correct implementation depending on the device your application is running on.
 *
 * ## Examples
 *
 * Getting the current location:
 *
 *     Ext.device.Compass.getCurrentHeading({
 *         success: function(heading) {
 *                      alert('Heading: ' + heading.magneticHeading);
 *          },
 *         failure: function() {
 *             console.log('something went wrong!');
 *         }
 *     });
 *
 * Watching the current compass:
 *
 *     Ext.device.Compass.watchHeading({
 *         frequency: 500, // Update every 1/2 second
 *         callback: function(heading) {
 *                      console.log('Heading: ' + heading.magneticHeading);
 *          },
 *         failure: function() {
 *             console.log('something went wrong!');
 *         }
 *     });
 *
 * For more information regarding Native APIs, please review our [Native APIs guide](../../../packaging/native_apis.html).
 * 
 * @mixins Ext.device.compass.Abstract
 */
Ext.define('Ext.device.Compass', {
    singleton: true,

    requires: [
        'Ext.device.compass.Cordova',
        'Ext.device.compass.Simulator'
    ],

    constructor: function() {
        var browserEnv = Ext.browser.is;
        if (browserEnv.WebView && browserEnv.Cordova) {
            return Ext.create('Ext.device.compass.Cordova');
        }

        return Ext.create('Ext.device.compass.Simulator');
    }
});
