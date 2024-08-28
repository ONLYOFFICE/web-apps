+function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        const serviceWorkerName = 'document_editor_service_worker.js';
        const serviceWorkerPath = '../../../../sdkjs/common/serviceworker/' + serviceWorkerName;
        let reg;
        navigator.serviceWorker.register(serviceWorkerPath)
            .then(function (registration) {
                reg = registration;
                return navigator.serviceWorker.getRegistrations();
            })
            .then(function (registrations) {
                //delete stale service workers
                for (const registration of registrations) {
                    if (registration !== reg && registration.active && registration.active.scriptURL.endsWith(serviceWorkerName)) {
                        registration.unregister();
                    }
                }
            })
            .catch(function (err) {
                console.error('Registration failed with ' + err);
            });
    }
}();