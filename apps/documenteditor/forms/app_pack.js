require([
    'common/main/lib/view/PluginDlg',
    'common/main/lib/view/CopyWarningDialog',
    'common/main/lib/view/TextInputDialog',
    'common/main/lib/view/SelectFileDlg',
    'common/main/lib/view/SaveAsDlg',
], function () {
    Common.NotificationCenter.trigger('script:loaded');
});
