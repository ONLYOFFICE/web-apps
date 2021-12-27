import {action, observable, makeObservable} from 'mobx';
import { LocalStorage } from '../../../../common/mobile/utils/LocalStorage';

export class storeAppOptions {
    constructor() {
        makeObservable(this, {
            isEdit: observable,
            canViewComments: observable,
            setConfigOptions: action,
            setPermissionOptions: action,

            lostEditingRights: observable,
            changeEditingRights: action,
            canBranding: observable,

            isDocReady: observable,
            changeDocReady: action
        });
    }

    isEdit = false;
    config = {};
    
    canViewComments = false;
    changeCanViewComments(value) {
        this.canViewComments = value;
    }

    canBranding = undefined;
    lostEditingRights = false;
    changeEditingRights (value) {
        this.lostEditingRights = value;
    }

    isDocReady = false;
    changeDocReady (value) {
        this.isDocReady = value;
    }

    setConfigOptions (config, _t) {
        this.config = config;
        this.customization = config.customization;
        this.canRenameAnonymous = !((typeof (this.customization) == 'object') && (typeof (this.customization.anonymous) == 'object') && (this.customization.anonymous.request===false));
        this.guestName = (typeof (this.customization) == 'object') && (typeof (this.customization.anonymous) == 'object') &&
        (typeof (this.customization.anonymous.label) == 'string') && this.customization.anonymous.label.trim()!=='' ?
            Common.Utils.String.htmlEncode(this.customization.anonymous.label) : _t.textGuest;

        const value = this.canRenameAnonymous ? LocalStorage.getItem("guest-username") : null;
        this.user = Common.Utils.fillUserInfo(config.user, config.lang, value ? (value + ' (' + this.guestName + ')' ) : _t.textAnonymous, LocalStorage.getItem("guest-id") || ('uid-' + Date.now()));
        this.user.anonymous && LocalStorage.setItem("guest-id", this.user.id);
        
        config.user = this.user;
        this.isDesktopApp = config.targetApp == 'desktop';
        this.canCreateNew = !!config.createUrl && !this.isDesktopApp;
        this.canOpenRecent = config.recent !== undefined && !this.isDesktopApp;
        this.templates = config.templates;
        this.recent = config.recent;
        this.createUrl = config.createUrl;
        this.lang = config.lang;
        this.location = (typeof (config.location) == 'string') ? config.location.toLowerCase() : '';
        this.region = (typeof (config.region) == 'string') ? config.region.toLowerCase() : config.region;
        this.sharingSettingsUrl = config.sharingSettingsUrl;
        this.fileChoiceUrl = config.fileChoiceUrl;
        this.isEditDiagram = config.mode == 'editdiagram';
        this.isEditMailMerge = config.mode == 'editmerge';
        this.mergeFolderUrl = config.mergeFolderUrl;
        this.canAnalytics = false;
        this.canRequestClose = config.canRequestClose;
        this.canBackToFolder = (config.canBackToFolder!==false) && (typeof (config.customization) == 'object') && (typeof (config.customization.goback) == 'object')
            && (!!(config.customization.goback.url) || config.customization.goback.requestClose && this.canRequestClose);
        this.canBack = this.canBackToFolder === true;
        this.canPlugins = false;

        AscCommon.UserInfoParser.setParser(true);
        AscCommon.UserInfoParser.setCurrentName(this.user.fullname);
    }

    setPermissionOptions (document, licType, params, permissions, isSupportEditFeature) {
        if (params.asc_getRights() !== Asc.c_oRights.Edit)
            permissions.edit = false;
        this.canBranding = params.asc_getCustomization();
        this.canBrandingExt = params.asc_getCanBranding() && (typeof this.customization == 'object');
        this.canAutosave = true;
        this.canAnalytics = params.asc_getIsAnalyticsEnable();
        this.canLicense = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
        this.isLightVersion = params.asc_getIsLight();
        this.canCoAuthoring = !this.isLightVersion;
        this.isOffline = Common.EditorApi.get().asc_isOffline();
        this.canRequestEditRights = this.config.canRequestEditRights;
        this.canEdit = permissions.edit !== false  && // can edit or review
            (this.config.canRequestEditRights || this.config.mode !== 'view') && isSupportEditFeature; // if mode=="view" -> canRequestEditRights must be defined
            // (!this.isReviewOnly || this.canLicense) && // if isReviewOnly==true -> canLicense must be true
        this.isEdit = (this.canLicense || this.isEditDiagram || this.isEditMailMerge) && permissions.edit !== false && this.config.mode !== 'view' && true;
        this.canComments = this.canLicense && (permissions.comment === undefined ? this.isEdit : permissions.comment) && (this.config.mode !== 'view');
        this.canComments = this.canComments && !((typeof (this.customization) == 'object') && this.customization.comments===false);
        this.canViewComments = this.canComments || !((typeof (this.customization) == 'object') && this.customization.comments===false);
        this.canEditComments = this.isOffline || !(typeof (this.customization) == 'object' && this.customization.commentAuthorOnly);
        this.canDeleteComments= this.isOffline || !permissions.deleteCommentAuthorOnly;
        this.canChat = this.canLicense && !this.isOffline && (permissions.chat !== false);
        this.canPrint = (permissions.print !== false);
        this.isRestrictedEdit = !this.isEdit && this.canComments;
        this.trialMode = params.asc_getLicenseMode();
        this.canDownloadOrigin = permissions.download !== false;
        this.canDownload = permissions.download !== false;
        this.canUseReviewPermissions = this.canLicense && (!!permissions.reviewGroups || this.customization 
            && this.customization.reviewPermissions && (typeof (this.customization.reviewPermissions) == 'object'));
        this.canUseCommentPermissions = this.canLicense && !!permissions.commentGroups;
        this.canUseReviewPermissions && AscCommon.UserInfoParser.setReviewPermissions(permissions.reviewGroups, this.customization.reviewPermissions);
        this.canUseCommentPermissions && AscCommon.UserInfoParser.setCommentPermissions(permissions.commentGroups);  
    }
}