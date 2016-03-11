if (Common === undefined) {
    var Common = {};
}

Common.Gateway = new(function() {
    var me = this,
        $me = $(me);

    var commandMap = {
        'init': function(data) {
            $me.trigger('init', data);
        },

        'openDocument': function(data) {
            $me.trigger('opendocument', data);
        },

        'showMessage': function(data) {
            $me.trigger('showmessage', data);
        },

        'applyEditRights': function(data) {
            $me.trigger('applyeditrights', data);
        },

        'processSaveResult': function(data) {
            $me.trigger('processsaveresult', data);
        },

        'processRightsChange': function(data) {
            $me.trigger('processrightschange', data);
        },

        'refreshHistory': function(data) {
            $me.trigger('refreshhistory', data);
        },

        'setHistoryData': function(data) {
            $me.trigger('sethistorydata', data);
        },

        'setEmailAddresses': function(data) {
            $me.trigger('setemailaddresses', data);
        },

        'processMailMerge': function(data) {
            $me.trigger('processmailmerge', data);
        },

        'downloadAs': function() {
            $me.trigger('downloadas');
        },

        'processMouse': function(data) {
            $me.trigger('processmouse', data);
        },

        'internalCommand': function(data) {
            $me.trigger('internalcommand', data);
        },

        'resetFocus': function(data) {
            $me.trigger('resetfocus', data);
        }
    };

    var _postMessage = function(msg) {
        // TODO: specify explicit origin
        if (window.parent && window.JSON) {
            window.parent.postMessage(window.JSON.stringify(msg), "*");
        }
    };

    var _onMessage = function(msg) {
        // TODO: check message origin
        var data = msg.data;
        if (Object.prototype.toString.apply(data) !== '[object String]' || !window.JSON) {
            return;
        }

        var cmd, handler;

        try {
            cmd = window.JSON.parse(data)
        } catch(e) {
            cmd = '';
        }

        if (cmd) {
            handler = commandMap[cmd.command];
            if (handler) {
                handler.call(this, cmd.data);
            }
        }
    };

    var fn = function(e) { _onMessage(e); };

    if (window.attachEvent) {
        window.attachEvent('onmessage', fn);
    } else {
        window.addEventListener('message', fn, false);
    }

    return {

        ready: function() {
            _postMessage({ event: 'onReady' });
        },

        save: function(url) {
            _postMessage({
                event: 'onSave',
                data: url
            });
        },

        requestEditRights: function() {
            _postMessage({ event: 'onRequestEditRights' });
        },

        requestHistory: function() {
            _postMessage({ event: 'onRequestHistory' });
        },

        requestHistoryData: function(revision) {
            _postMessage({
                event: 'onRequestHistoryData',
                data: revision
            });
        },

        requestEmailAddresses: function() {
            _postMessage({ event: 'onRequestEmailAddresses' });
        },

        requestStartMailMerge: function() {
            _postMessage({event: 'onRequestStartMailMerge'});
        },

        requestHistoryClose: function(revision) {
            _postMessage({event: 'onRequestHistoryClose'});
        },

        reportError: function(code, description) {
            _postMessage({
                event: 'onError',
                data: {
                    errorCode: code,
                    errorDescription: description
                }
            });
        },

        sendInfo: function(info) {
            _postMessage({
                event: 'onInfo',
                data: info
            });
        },

        setDocumentModified: function(modified) {
            _postMessage({
                event: 'onDocumentStateChange',
                data: modified
            });
        },

        internalMessage: function(type, data) {
            _postMessage({
                event: 'onInternalMessage',
                data: {
                    type: type,
                    data: data
                }
            });
        },

        updateVersion: function() {
            _postMessage({ event: 'onOutdatedVersion' });
        },

        downloadAs: function(url) {
            _postMessage({
                event: 'onDownloadAs',
                data: url
            });
        },
        
        collaborativeChanges: function() {
            _postMessage({event: 'onCollaborativeChanges'});
        },

        on: function(event, handler){
            var localHandler = function(event, data){
                handler.call(me, data)
            };

            $me.on(event, localHandler);
        }
    }

})();