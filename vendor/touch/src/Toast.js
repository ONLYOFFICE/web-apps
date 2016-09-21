/**
 * A 'Toast' is a simple modal message that is displayed on the screen and then automatically closed by a timeout or by a user tapping
 * outside of the toast itself. Think about it like a text only alert box that will self destruct. **A Toast should not be instantiated manually**
 * but creating by calling 'Ext.toast(message, timeout)'. This will create one reusable toast container and content will be swapped out as
 * toast messages are queued or displayed.
 *
 *  # Simple Toast
 *
 *      @example miniphone
 *      Ext.toast('Hello Sencha!'); // Toast will close in 1000 milliseconds (default)
 *
 *  # Toast with Timeout
 *
 *      @example miniphone
 *      Ext.toast('Hello Sencha!', 5000); // Toast will close in 5000 milliseconds
 *
 *  # Toast with config
 *
 *      @example miniphone
 *      Ext.toast({message: 'Hello Sencha!', timeout: 2000}); // Toast will close in 2000 milliseconds
 *
 * # Multiple Toasts queued
 *
 *      @example miniphone
 *      Ext.toast('Hello Sencha!');
 *      Ext.toast('Hello Sencha Again!');
 *      Ext.toast('Hello Sencha One More Time!');
 */
Ext.define('Ext.Toast', {
    extend: 'Ext.Sheet',
    requires: [
        'Ext.util.InputBlocker'
    ],

    config: {
        /**
         * @cfg
         * @inheritdoc
         */
        ui: 'dark',

        /**
         * @cfg
         * @inheritdoc
         */
        baseCls: Ext.baseCSSPrefix + 'toast',

        /**
         * @cfg
         * @inheritdoc
         */
        showAnimation: {
            type: 'popIn',
            duration: 250,
            easing: 'ease-out'
        },

        /**
         * @cfg
         * @inheritdoc
         */
        hideAnimation: {
            type: 'popOut',
            duration: 250,
            easing: 'ease-out'
        },

        /**
         * Override the default `zIndex` so it is normally always above floating components.
         */
        zIndex: 999,

        /**
         * @cfg {String} message
         * The message to be displayed in the {@link Ext.Toast}.
         * @accessor
         */
        message: null,

        /**
         * @cfg {Number} timeout
         * The amount of time in milliseconds to wait before destroying the toast automatically
         */
        timeout: 1000,

        /**
         * @cfg{Boolean/Object} animation
         * The animation that should be used between toast messages when they are queued up
         */
        messageAnimation: true,

        /**
         * @cfg
         * @inheritdoc
         */
        hideOnMaskTap: true,

        /**
         * @private
         */
        modal: true,

        /**
         * @cfg
         * @inheritdoc
         */
        layout: {
            type: 'vbox',
            pack: 'center'
        }
    },

    /**
     * @private
     */
    applyMessage: function(config) {
        config = {
            html: config,
            cls: this.getBaseCls() + '-text'
        };

        return Ext.factory(config, Ext.Component, this._message);
    },

    /**
     * @private
     */
    updateMessage: function(newMessage) {
        if (newMessage) {
            this.add(newMessage);
        }
    },

    /**
     * @private
     */
    applyTimeout: function(timeout) {
        if (this._timeoutID) {
            clearTimeout(this._timeoutID);
            if (!Ext.isEmpty(timeout)) {
                this._timeoutID = setTimeout(Ext.bind(this.onTimeout, this), timeout);
            }
        }
        return timeout;
    },

    /**
     * @internal
     */
    next: Ext.emptyFn,

    /**
     * @private
     */
    show: function(config) {
        var me = this,
            timeout = config.timeout,
            msgAnimation = me.getMessageAnimation(),
            message = me.getMessage();

        if (me.isRendered() && me.isHidden() === false) {
            config.timeout = null;
            message.onAfter({
                hiddenchange: function() {
                    me.setMessage(config.message);
                    message = me.getMessage();
                    message.onAfter({
                        hiddenchange: function() {

                            // Forces applyTimeout to create a timer
                            this._timeoutID = true;
                            me.setTimeout(timeout);
                        },
                        scope: me,
                        single: true
                    });
                    message.show(msgAnimation);
                },
                scope: me,
                single: true
            });

            message.hide(msgAnimation);
        } else {
            Ext.util.InputBlocker.blockInputs();
            me.setConfig(config);

            //if it has not been added to a container, add it to the Viewport.
            if (!me.getParent() && Ext.Viewport) {
                Ext.Viewport.add(me);
            }

            if (!Ext.isEmpty(timeout)) {
                me._timeoutID = setTimeout(Ext.bind(me.onTimeout, me), timeout);
            }

            me.callParent(arguments);
        }
    },

    /**
     * @private
     */
    hide: function(animation) {
        clearTimeout(this._timeoutID);
        if (!this.next()) {
            this.callParent(arguments);
        }
    },

    /**
     * @private
     */
    onTimeout: function() {
        this.hide();
    }
}, function(Toast) {
    var _queue = [], _isToasting = false;

    function next() {
        var config = _queue.shift();

        if (config) {
            _isToasting = true;
            this.show(config);
        } else {
            _isToasting = false;
        }

        return _isToasting;
    }

    function getInstance() {
        if (!Ext.Toast._instance) {
            Ext.Toast._instance = Ext.create('Ext.Toast');
            Ext.Toast._instance.next = next;
        }
        return Ext.Toast._instance;
    }

    Ext.toast = function(message, timeout) {
        var toast = getInstance(),
            config = message;

        if (Ext.isString(message)) {
            config = {
                message: message,
                timeout: timeout
            };
        }

        if (config.timeout === undefined) {
            config.timeout = Ext.Toast.prototype.config.timeout;
        }

        _queue.push(config);
        if (!_isToasting) {
            toast.next();
        }

        return toast;
    }
});

