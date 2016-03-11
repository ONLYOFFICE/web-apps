/**
 * User: Julia.Radzhabova
 * Date: 15.04.15
 * Time: 13:56
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/LoadMask'
], function () { 'use strict';

    DE.Views.MailMergeSaveDlg = Common.UI.Window.extend(_.extend({
        initialize : function(options) {
            var _options = {};
            _.extend(_options,  {
                title: this.textTitle,
                width: 420,
                height: 681,
                header: true
            }, options);

            this.template = [
                '<div id="id-mail-merge-folder-placeholder"></div>'
            ].join('');

            _options.tpl = _.template(this.template, _options);

            this.mergeFolderUrl = options.mergeFolderUrl || '';
            this.mergedFileUrl = options.mergedFileUrl || '';
            this.defFileName = options.defFileName || '';
            this.mergeFolderUrl = this.mergeFolderUrl.replace("{title}", encodeURIComponent(this.defFileName)).replace("{fileuri}", encodeURIComponent(this.mergedFileUrl));
            Common.UI.Window.prototype.initialize.call(this, _options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);
            this.$window.find('> .body').css({height: 'auto', overflow: 'hidden'});

            var iframe = document.createElement("iframe");
            iframe.width        = '100%';
            iframe.height       = 645;
            iframe.align        = "top";
            iframe.frameBorder  = 0;
            iframe.scrolling    = "no";
            iframe.onload       = _.bind(this._onLoad,this);
            $('#id-mail-merge-folder-placeholder').append(iframe);

            this.loadMask = new Common.UI.LoadMask({owner: $('#id-mail-merge-folder-placeholder')});
            this.loadMask.setTitle(this.textLoading);
            this.loadMask.show();

            iframe.src = this.mergeFolderUrl;

            var me = this;
            this._eventfunc = function(msg) {
                me._onWindowMessage(msg);
            };
            this._bindWindowEvents.call(this);

             this.on('close', function(obj){
                me._unbindWindowEvents();
            });
        },

        _bindWindowEvents: function() {
            if (window.addEventListener) {
                window.addEventListener("message", this._eventfunc, false)
            } else if (window.attachEvent) {
                window.attachEvent("onmessage", this._eventfunc);
            }
        },

        _unbindWindowEvents: function() {
            if (window.removeEventListener) {
                window.removeEventListener("message", this._eventfunc)
            } else if (window.detachEvent) {
                window.detachEvent("onmessage", this._eventfunc);
            }
        },

        _onWindowMessage: function(msg) {
            // TODO: check message origin
            if (msg && window.JSON) {
                try {
                    this._onMessage.call(this, window.JSON.parse(msg.data));
                } catch(e) {}
            }
        },

        _onMessage: function(msg) {
            if (msg) {
                if ( !_.isEmpty(msg.error) ) {
                    this.trigger('mailmergeerror', this, msg.error);
                }
//                if ( !_.isEmpty(msg.folder) ) {
//                    this.trigger('mailmergefolder', this, msg.folder); // save last folder url
//                }
                Common.NotificationCenter.trigger('window:close', this);
            }
        },

        _onLoad: function() {
            if (this.loadMask)
                this.loadMask.hide();
        },

        textTitle   : 'Folder for save',
        textLoading : 'Loading'
    }, DE.Views.MailMergeSaveDlg || {}));
});

