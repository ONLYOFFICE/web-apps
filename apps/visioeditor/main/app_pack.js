require([
    'common/main/lib/controller/ScreenReaderFocus',
    'common/main/lib/view/AdvancedSettingsWindow',
    'common/main/lib/view/DocumentAccessDialog',
    'common/main/lib/view/SaveAsDlg',
    'common/main/lib/view/CopyWarningDialog',
    'common/main/lib/view/SelectFileDlg',
    // 'common/main/lib/view/SearchDialog',
    'common/main/lib/view/RenameDialog',
    'common/main/lib/view/PluginDlg',
    'common/main/lib/view/PluginPanel',
    'common/main/lib/view/TextInputDialog',
    'common/main/lib/view/DocumentHolderExt',
    'common/main/lib/view/CustomizeQuickAccessDialog',
    // 'common/main/lib/view/ShortcutsDialog',
    // 'common/main/lib/view/ShortcutsEditDialog',

    'visioeditor/main/app/view/FileMenuPanels',
    'visioeditor/main/app/view/DocumentHolderExt'
], function () {
    Common.NotificationCenter.trigger('app-pack:loaded');
});
