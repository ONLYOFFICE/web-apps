/**
 * Provides an API for storing data in databases that can be queried using an SQL.
 * This API is based on Asynchronous Web SQL Database API (http://www.w3.org/TR/webdatabase/)
 *
 * ## Examples
 *
 * #### Databases
 *
 * Creating and opening a database:
 *
 *     var db = Ext.device.SQLite.openDatabase({
 *         name: 'mydb',
 *         version: '1.0', // is ignored if `creationCallback` is provided
 *         displayName: 'My Database',
 *         estimatedSize: 2 * 1024 * 1024,
 *         creationCallback: function (db) { // optional
 *             // you can set database version here by calling `db.changeVersion(...)` method (see below)
 *         }
 *     });
 *
 * Getting version of a database:
 *
 *     var db = ...;
 *     var version = db.getVersion();
 *
 * Setting version of a database:
 *
 *     var db = ...;
 *     db.changeVersion({
 *         oldVersion: '',
 *         newVersion: '1.0',
 *         callback: function(tx) { // optional
 *             // you can execute SQL statements here by calling `tx.executeSql(...)` methods (see below)
 *         },
 *         success: function() { // optional
 *             console.log('success!');
 *         },
 *         failure: function(err) { // optional
 *             console.log('failed with error: ' + err);
 *         }
 *     });
 *
 * Performing a transaction:
 *
 *     var db = ...;
 *     db.transaction({
 *         callback: function(tx) {
 *             // you can execute SQL statements here by calling `tx.executeSql(...)` methods (see below)
 *         },
 *         success: function() { // optional
 *             console.log('transaction has been successfully commited!');
 *         },
 *         failure: function(err) { // optional
 *             console.log('transaction has been rolled back with error: ' + err);
 *         }
 *     });
 *
 * #### Transactions
 *
 * Executing SQL statements:
 *
 *     function(tx) { // next methods must be called within `db.transaction(...)` or `tx.executeSql(...)` callbacks
 *         tx.executeSql({
 *             sqlStatement: 'CREATE TABLE IF NOT EXISTS foo (id INTEGER PRIMARY KEY, name TEXT, value INTEGER)',
 *             arguments: [], // optional
 *             callback: function(tx, resultSet) { // optional
 *             },
 *             failure: function(tx, err) {
 *                 return true; // return `true` or do not provide `failure` callback to stop executing next SQL statement
 *             }
 *         });
 *         tx.executeSql({
 *             sqlStatement: 'INSERT INTO foo (name, value) VALUES (?, ?)',
 *             arguments: ['xxx', 1], // arguments to bind each `?` placeholder in SQL statement
 *             callback: function(tx, resultSet) { // optional
 *                 var rowId = esultSet.getInsertId(); // throws an exception if SQL statement did not insert a row
 *                 console.log('ID of inserted record: ' + rowId);
 *             },
 *             failure: function(tx, err) {
 *                 return false; // return `false` to continue executing next SQL statement
 *             }
 *         });
 *         tx.executeSql({
 *             sqlStatement: 'SELECT * FROM foo',
 *             callback: function(tx, resultSet) {
 *                 for (var i = 0; i < resultSet.rows.getLength(); ++i) {
 *                     console.log(resultSet.rows.item(i));
 *                 }
 *             },
 *             failure: function(tx, err) { // optional
 *             }
 *         });
 *     }
 *
 * For more information regarding Native APIs, please review our [Native APIs guide](../../../packaging/native_apis.html).
 *
 * @mixins Ext.device.sqlite.Sencha
 */
Ext.define('Ext.device.SQLite', {
    singleton: true,

    requires: [
        'Ext.device.Communicator',
        'Ext.device.sqlite.Sencha'
    ],

    constructor: function() {
        var browserEnv = Ext.browser.is;
        if(browserEnv.Sencha) {
            return Ext.create('Ext.device.sqlite.Sencha');
        }

        return {};
    }
});
