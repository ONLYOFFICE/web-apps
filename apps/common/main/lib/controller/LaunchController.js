
define([
], function () {
    const launchController = function () {
        const init = function (api) {
            this.api = api;
            Common.NotificationCenter.on('app:ready', on_app_ready.bind(this));
            Common.NotificationCenter.on('app:face', on_hide_loader.bind(this));
        }

        const load_scripts = function () {
            const me = this;

            const app = window.DE || window.PE || window.SSE || window.PDFE;
            !app.postLaunchScripts && (app.postLaunchScripts = []);
            // console.log('on_app_ready', app.postLaunchScripts);

            require(app.postLaunchScripts, function () {
                Common.UI.ScreenReaderFocusManager.init(me.api);

                Common.NotificationCenter.trigger('script:loaded');
            });
        }

        const on_app_ready = function (config) {
            load_scripts.call(this);
        }

        const on_hide_loader = function (config) {}

        return {
            init: init
        };
    }

    Common.Controllers.LaunchController = new launchController();
});