require([
    'common/main/lib/component/ComboBoxFonts',
    'common/main/lib/component/ColorButton',
    'common/main/lib/component/TextareaField',
    'common/main/lib/view/PluginDlg',
    'common/main/lib/view/CopyWarningDialog',
    'common/main/lib/view/TextInputDialog',
    'common/main/lib/view/SelectFileDlg',
    'common/main/lib/view/SaveAsDlg',
    'common/main/lib/view/SignDialog',
    'common/main/lib/view/SignSettingsDialog',
    'common/main/lib/view/PdfSignDialog'
], function () {
    Common.NotificationCenter.trigger('app-pack:loaded');
});
