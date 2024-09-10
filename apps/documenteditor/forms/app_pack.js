require([
    'common/main/lib/view/PluginDlg',
    'common/main/lib/view/CopyWarningDialog',
    'common/main/lib/view/TextInputDialog',
    'common/main/lib/view/SelectFileDlg',
    'common/main/lib/view/SaveAsDlg',
    'common/main/lib/view/SignDialog',
    'common/main/lib/view/SignSettingsDialog',
], function () {
    Common.NotificationCenter.trigger('script:loaded');
});
