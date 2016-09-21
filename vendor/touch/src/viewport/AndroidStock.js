/**
 * @private
 * Android version of viewport.
 */
Ext.define('Ext.viewport.AndroidStock', {
    extend: 'Ext.viewport.Default',
    alternateClassName: ['Ext.viewport.Android'],

    config: {
        translatable: {
            translationMethod: 'csstransform'
        }
    },

    constructor: function() {
        this.on('orientationchange', 'hideKeyboardIfNeeded', this, { prepend: true });

        this.callSuper(arguments);
    },

    getWindowWidth: function () {
        return this.element.getWidth();

    },

    getWindowHeight: function () {
        return this.element.getHeight();
    },

    getDummyInput: function() {
        var input = this.dummyInput,
            focusedElement = this.focusedElement,
            box = Ext.fly(focusedElement).getPageBox();

        if (!input) {
            this.dummyInput = input = document.createElement('input');
            input.style.position = 'absolute';
            input.style.opacity = '0';
            input.style.pointerEvents = 'none';
            document.body.appendChild(input);
        }

        input.style.left = box.left + 'px';
        input.style.top = box.top + 'px';
        input.style.display = '';

        return input;
    },

    doBlurInput: function(e) {
        var target = e.target,
            focusedElement = this.focusedElement,
            dummy;

        if (focusedElement && !this.isInputRegex.test(target.tagName)) {
            dummy = this.getDummyInput();
            delete this.focusedElement;
            dummy.focus();

            setTimeout(function() {
                dummy.style.display = 'none';
            }, 100);
        }
    },

    hideKeyboardIfNeeded: function() {
        var eventController = arguments[arguments.length - 1],
            focusedElement = this.focusedElement;

        if (focusedElement) {
            delete this.focusedElement;
            eventController.pause();

            if (Ext.os.version.lt('4')) {
                focusedElement.style.display = 'none';
            }
            else {
                focusedElement.blur();
            }

            setTimeout(function() {
                focusedElement.style.display = '';
                eventController.resume();
            }, 1000);
        }
    },

    getActualWindowOuterHeight: function() {
        return Math.round(this.getWindowOuterHeight() / window.devicePixelRatio);
    },

    maximize: function() {
        var stretchHeights = this.stretchHeights,
            orientation = this.getOrientation(),
            height;

        height = stretchHeights[orientation];

        if (!height) {
            stretchHeights[orientation] = height = this.getActualWindowOuterHeight();
        }

        if (!this.addressBarHeight) {
            this.addressBarHeight = height - this.getWindowHeight();
        }

        this.setHeight(height);

        var isHeightMaximized = Ext.Function.bind(this.isHeightMaximized, this, [height]);

        this.scrollToTop();
        this.waitUntil(isHeightMaximized, this.fireMaximizeEvent, this.fireMaximizeEvent);
    },

    isHeightMaximized: function(height) {
        this.scrollToTop();
        return this.getWindowHeight() === height;
    },

    doPreventZooming: function (e) {
        // Don't prevent right mouse event
        if ('button' in e && e.button !== 0) {
            return;
        }

        var target = e.target;

        if (target && target.nodeType === 1 && !this.isInputRegex.test(target.tagName) && !this.focusedElement) {
            e.preventDefault();
        }
    }

}, function() {
    if (!Ext.os.is.Android) {
        return;
    }

    var version = Ext.os.version,
        userAgent = Ext.browser.userAgent,
        // These Android devices have a nasty bug which causes JavaScript timers to be completely frozen
        // when the browser's viewport is being panned.
        isBuggy = /(htc|desire|incredible|ADR6300)/i.test(userAgent) && version.lt('2.3');

    if (isBuggy) {
        this.override({
            constructor: function(config) {
                if (!config) {
                    config = {};
                }

                config.autoMaximize = false;

                this.watchDogTick = Ext.Function.bind(this.watchDogTick, this);

                setInterval(this.watchDogTick, 1000);

                return this.callParent([config]);
            },

            watchDogTick: function() {
                this.watchDogLastTick = Ext.Date.now();
            },

            doPreventPanning: function() {
                var now = Ext.Date.now(),
                    lastTick = this.watchDogLastTick,
                    deltaTime = now - lastTick;

                // Timers are frozen
                if (deltaTime >= 2000) {
                    return;
                }

                return this.callParent(arguments);
            },

            doPreventZooming: function() {
                var now = Ext.Date.now(),
                    lastTick = this.watchDogLastTick,
                    deltaTime = now - lastTick;

                // Timers are frozen
                if (deltaTime >= 2000) {
                    return;
                }

                return this.callParent(arguments);
            }
        });
    }

    if (version.match('2')) {
        this.override({
            onReady: function() {
                this.addWindowListener('resize', Ext.Function.bind(this.onWindowResize, this));

                this.callParent(arguments);
            },

            scrollToTop: function() {
                document.body.scrollTop = 100;
            },

            onWindowResize: function() {
                var oldWidth = this.windowWidth,
                    oldHeight = this.windowHeight,
                    width = this.getWindowWidth(),
                    height = this.getWindowHeight();

                if (this.getAutoMaximize() && !this.isMaximizing && !this.orientationChanging
                    && window.scrollY === 0
                    && oldWidth === width
                    && height < oldHeight
                    && ((height >= oldHeight - this.addressBarHeight) || !this.focusedElement)) {
                        this.scrollToTop();
                }
            }
        });
    }
    else if (version.gtEq('3.1')) {
        this.override({
            isHeightMaximized: function(height) {
                this.scrollToTop();
                return this.getWindowHeight() === height - 1;
            }
        });
    }
    else if (version.match('3')) {
        this.override({
            isHeightMaximized: function() {
                this.scrollToTop();
                return true;
            }
        })
    }

    if (version.gtEq('4')) {
        this.override({
            doBlurInput: Ext.emptyFn
        });
    }
});
