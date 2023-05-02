import {makeObservable, action, observable} from 'mobx';
import { LocalStorage } from '../../../../common/mobile/utils/LocalStorage.mjs';

export class storeAppOptions {
    constructor() {
        makeObservable(this, {
            isEdit: observable,
            canViewComments: observable,
            canReview: observable,
            setConfigOptions: action,
            setPermissionOptions: action,

            canViewReview: observable,
            setCanViewReview: action,

            lostEditingRights: observable,
            changeEditingRights: action,

            readerMode: observable,
            changeReaderMode: action,

            canBrandingExt: observable,
            canBranding: observable,

            isDocReady: observable,
            changeDocReady: action,

            isViewer: observable,
            changeViewerMode: action,

            isMobileView: observable,
            changeMobileView: action,

            isProtected: observable,
            setProtection: action,

            typeProtection: observable,
            setTypeProtection: action,

            isFileEncrypted: observable,
            setEncryptionFile: action
        });
    }

    isEdit = false;

    isFileEncrypted = false;
    setEncryptionFile(value) {
        this.isFileEncrypted = value;
    }

    isProtected = false;
    setProtection(value) {
        this.isProtected = value;
    }

    typeProtection;
    setTypeProtection(type) {
        this.typeProtection = type;
    }

    isMobileView = true;
    changeMobileView() {
        this.isMobileView = !this.isMobileView;
    }


    isViewer = true;
    changeViewerMode() {
        this.isViewer = !this.isViewer;
    }

    canViewComments = false;
    changeCanViewComments(value) {
        this.canViewComments = value;
    }

    canReview = false;
    canViewReview = false;

    lostEditingRights = false;
    changeEditingRights (value) {
        this.lostEditingRights = value;
    }

    readerMode = false;
    changeReaderMode () {
        this.readerMode = !this.readerMode;
    }

    canBrandingExt = true;
    canBranding = true;

    isDocReady = false;
    changeDocReady (value) {
        this.isDocReady = value;
    }

    config = {};
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
        this.sharingSettingsUrl = config.sharingSettingsUrl;
        this.canRequestSharingSettings = config.canRequestSharingSettings;
        this.fileChoiceUrl = config.fileChoiceUrl;
        this.mergeFolderUrl = config.mergeFolderUrl;
        this.canAnalytics = false;
        this.canRequestClose = config.canRequestClose;
        this.canBackToFolder = (config.canBackToFolder!==false) && (typeof (config.customization) == 'object') && (typeof (config.customization.goback) == 'object')
            && (!!(config.customization.goback.url) || config.customization.goback.requestClose && this.canRequestClose);
        this.canBack = this.canBackToFolder === true;
        this.canPlugins = false;
        this.canFeatureForms = !!Common.EditorApi.get().asc_isSupportFeature("forms");

        AscCommon.UserInfoParser.setParser(true);
        AscCommon.UserInfoParser.setCurrentName(this.user.fullname);
    }
    setPermissionOptions (document, licType, params, permissions, isSupportEditFeature) {
        if (params.asc_getRights() !== Asc.c_oRights.Edit)
            permissions.edit = permissions.review = false;
        this.review = (permissions.review === undefined) ? (permissions.edit !== false) : permissions.review;
        this.canAnalytics = params.asc_getIsAnalyticsEnable();
        this.canLicense = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
        this.isLightVersion = params.asc_getIsLight();
        this.canCoAuthoring = !this.isLightVersion;
        this.isOffline = Common.EditorApi.get().asc_isOffline();
        this.isReviewOnly = (permissions.review === true) && (permissions.edit === false);
        this.canRequestEditRights = this.config.canRequestEditRights;
        this.canEdit = (permissions.edit !== false || permissions.review === true) && // can edit or review
            (this.config.canRequestEditRights || this.config.mode !== 'view') && // if mode=="view" -> canRequestEditRights must be defined
            (!this.isReviewOnly || this.canLicense) && // if isReviewOnly==true -> canLicense must be true
            isSupportEditFeature;
        this.isEdit = this.canLicense && this.canEdit && this.config.mode !== 'view';
        this.canReview = this.canLicense && this.isEdit && (permissions.review===true);
        this.canUseHistory = this.canLicense && !this.isLightVersion && this.config.canUseHistory && this.canCoAuthoring && !this.isDesktopApp;
        this.canHistoryClose = this.config.canHistoryClose;
        this.canUseMailMerge = this.canLicense && this.canEdit && !this.isDesktopApp;
        this.canSendEmailAddresses = this.canLicense && this.config.canSendEmailAddresses && this.canEdit && this.canCoAuthoring;
        this.canComments = this.canLicense && (permissions.comment === undefined ? this.isEdit : permissions.comment) && (this.config.mode !== 'view');
        this.canComments = this.canComments && !((typeof (this.customization) == 'object') && this.customization.comments===false);
        this.canViewComments = this.canComments || !((typeof (this.customization) == 'object') && this.customization.comments===false);
        this.canEditComments = this.isOffline || !permissions.editCommentAuthorOnly;
        this.canDeleteComments= this.isOffline || !permissions.deleteCommentAuthorOnly;
        if ((typeof (this.customization) == 'object') && this.customization.commentAuthorOnly===true) {
            console.log("Obsolete: The 'commentAuthorOnly' parameter of the 'customization' section is deprecated. Please use 'editCommentAuthorOnly' and 'deleteCommentAuthorOnly' parameters in the permissions instead.");
            if (permissions.editCommentAuthorOnly===undefined && permissions.deleteCommentAuthorOnly===undefined)
                this.canEditComments = this.canDeleteComments = this.isOffline;
        }
        this.canChat = this.canLicense && !this.isOffline && (permissions.chat !== false);
        this.canEditStyles = this.canLicense && this.canEdit;
        this.canPrint = (permissions.print !== false);
        this.fileKey = document.key;
        const typeForm = /^(?:(oform))$/.exec(document.fileType); // can fill forms only in oform format
        this.canFillForms = this.canLicense && !!(typeForm && typeof typeForm[1] === 'string') && ((permissions.fillForms===undefined) ? this.isEdit : permissions.fillForms) && (this.config.mode !== 'view');
        this.canProtect = permissions.protect !== false;
        this.isRestrictedEdit = !this.isEdit && (this.canComments || this.canFillForms) && isSupportEditFeature;
        if (this.isRestrictedEdit && this.canComments && this.canFillForms) // must be one restricted mode, priority for filling forms
            this.canComments = false;
        this.trialMode = params.asc_getLicenseMode();

        const type = /^(?:(pdf|djvu|xps|oxps))$/.exec(document.fileType);
        
        this.canDownloadOrigin = false;
        this.canDownload = permissions.download !== false;
        this.canReader = (!type || typeof type[1] !== 'string');

        this.canBranding = params.asc_getCustomization();
        this.canBrandingExt = params.asc_getCanBranding() && (typeof this.customization == 'object');

        if ( this.isLightVersion ) {
            this.canUseHistory = this.canReview = this.isReviewOnly = false;
        }
        this.canUseReviewPermissions = this.canLicense && (!!permissions.reviewGroups || this.customization 
            && this.customization.reviewPermissions && (typeof (this.customization.reviewPermissions) == 'object'));
        this.canUseCommentPermissions = this.canLicense && !!permissions.commentGroups;
        this.canUseUserInfoPermissions = this.canLicense && !!permissions.userInfoGroups;
        this.canUseReviewPermissions && AscCommon.UserInfoParser.setReviewPermissions(permissions.reviewGroups, this.customization.reviewPermissions);
        this.canUseCommentPermissions && AscCommon.UserInfoParser.setCommentPermissions(permissions.commentGroups);    
        this.canUseUserInfoPermissions && AscCommon.UserInfoParser.setUserInfoPermissions(permissions.userInfoGroups);

        this.canLiveView = !!params.asc_getLiveViewerSupport() && (this.config.mode === 'view') && !(type && typeof type[1] === 'string') && isSupportEditFeature;
    }
    setCanViewReview (value) {
        this.canViewReview = value;
    }
}