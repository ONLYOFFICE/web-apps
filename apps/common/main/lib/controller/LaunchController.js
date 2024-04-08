
define([
], function () {
    const launchController = function () {
        const init = function (api) {
            this.api = api;
            Common.NotificationCenter.on('app:ready', on_app_ready.bind(this));
        }

        const on_app_ready = function (config) {
            const me = this;

            const app = window.DE || window.PE || window.SSE || window.PDFE;
            !app.postLaunchScripts && (app.postLaunchScripts = []);
            // console.log('on_app_ready', app.postLaunchScripts);

            require(app.postLaunchScripts, function () {
                Common.UI.ScreenReaderFocusManager.init(me.api);

                Common.NotificationCenter.trigger('script:loaded');
            });
        }

        return {
            init: init
        };
    }

    Common.Controllers.LaunchController = new launchController();
});