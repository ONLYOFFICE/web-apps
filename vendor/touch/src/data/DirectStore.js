/**
 * Small helper class to create an {@link Ext.data.Store} configured with an {@link Ext.data.proxy.Direct}
 * and {@link Ext.data.reader.Json} to make interacting with an {@link Ext.direct.Manager} server-side
 * {@link Ext.direct.Provider Provider} easier. To create a different proxy/reader combination create a basic
 * {@link Ext.data.Store} configured as needed.
 *
 * Since configurations are deeply merged with the standard configuration, you can override certain proxy and
 * reader configurations like this:
 *
 *     Ext.create('Ext.data.DirectStore', {
 *         proxy: {
 *             paramsAsHash: true,
 *             directFn: someDirectFn,
 *             simpleSortMode: true,
 *             reader: {
 *                 rootProperty: 'results',
 *                 idProperty: '_id'
 *             }
 *         }
 *     });
 *     
 * ###Further Reading
 * [Sencha Touch Data Overview](../../../core_concepts/data/data_package_overview.html)
 * [Sencha Touch Store Guide](../../../core_concepts/data/stores.html)
 * [Sencha Touch Models Guide](../../../core_concepts/data/models.html)
 * [Sencha Touch Proxy Guide](../../../core_concepts/data/proxies.html)
 */
Ext.define('Ext.data.DirectStore', {
    extend: 'Ext.data.Store',
    alias: 'store.direct',
    requires: ['Ext.data.proxy.Direct'],

    config: {
        proxy: {
            type: 'direct',
            reader: {
                type: 'json'
            }
        }
    }
});
