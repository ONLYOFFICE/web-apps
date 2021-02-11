import {action, observable} from 'mobx';

export class storeAppOptions {
    config = {};
    @action setConfigOptions (config) {
        this.config = config;
        this.user = Common.Utils.fillUserInfo(config.user, config.lang, "Local.User"/*me.textAnonymous*/);
        this.isDesktopApp = config.targetApp == 'desktop';
        this.canCreateNew = !!config.createUrl && !this.isDesktopApp;
        this.canOpenRecent = config.recent !== undefined && !this.isDesktopApp;
        this.templates = config.templates;
        this.recent = config.recent;
        this.createUrl = config.createUrl;
        this.lang = config.lang;
        this.location = (typeof (config.location) == 'string') ? config.location.toLowerCase() : '';
        this.sharingSettingsUrl = config.sharingSettingsUrl;
        this.fileChoiceUrl = config.fileChoiceUrl;
        this.mergeFolderUrl = config.mergeFolderUrl;
        this.canAnalytics = false;
        this.canRequestClose = config.canRequestClose;
        this.customization = config.customization;
        this.canBackToFolder = (config.canBackToFolder!==false) && (typeof (config.customization) == 'object') && (typeof (config.customization.goback) == 'object')
            && (!!(config.customization.goback.url) || config.customization.goback.requestClose && this.canRequestClose);
        this.canBack = this.canBackToFolder === true;
        this.canPlugins = false;
    }
    @action setPermissionOptions (document, licType, params, permissions) {
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
            true/*isSupportEditFeature*/;
        this.isEdit = this.canLicense && this.canEdit && this.config.mode !== 'view';
        this.canReview = this.canLicense && this.isEdit && (permissions.review===true);
        this.canUseHistory = this.canLicense && !this.isLightVersion && this.config.canUseHistory && this.canCoAuthoring && !this.isDesktopApp;
        this.canHistoryClose = this.config.canHistoryClose;
        this.canUseMailMerge = this.canLicense && this.canEdit && !this.isDesktopApp;
        this.canSendEmailAddresses = this.canLicense && this.config.canSendEmailAddresses && this.canEdit && this.canCoAuthoring;
        this.canComments = this.canLicense && (permissions.comment === undefined ? this.isEdit : permissions.comment) && (this.config.mode !== 'view');
        this.canComments = this.canComments && !((typeof (this.customization) == 'object') && this.customization.comments===false);
        this.canViewComments = this.canComments || !((typeof (this.customization) == 'object') && this.customization.comments===false);
        this.canEditComments = this.isOffline || !(typeof (this.customization) == 'object' && this.customization.commentAuthorOnly);
        this.canChat = this.canLicense && !this.isOffline && !((typeof (this.customization) == 'object') && this.customization.chat === false);
        this.canEditStyles = this.canLicense && this.canEdit;
        this.canPrint = (permissions.print !== false);
        this.fileKey = document.key;
        this.canFillForms = this.canLicense && ((permissions.fillForms===undefined) ? this.isEdit : permissions.fillForms) && (this.config.mode !== 'view');
        this.isRestrictedEdit = !this.isEdit && (this.canComments || this.canFillForms);
        if (this.isRestrictedEdit && this.canComments && this.canFillForms) // must be one restricted mode, priority for filling forms
            this.canComments = false;
        this.trialMode = params.asc_getLicenseMode();

        const type = /^(?:(pdf|djvu|xps))$/.exec(document.fileType);
        this.canDownloadOrigin = permissions.download !== false && (type && typeof type[1] === 'string');
        this.canDownload = permissions.download !== false && (!type || typeof type[1] !== 'string');
        this.canReader = (!type || typeof type[1] !== 'string');

        this.canBranding = params.asc_getCustomization();
        this.canBrandingExt = params.asc_getCanBranding() && (typeof this.customization == 'object');

        if ( this.isLightVersion ) {
            this.canUseHistory = this.canReview = this.isReviewOnly = false;
        }

        this.canUseReviewPermissions = this.canLicense && this.customization && this.customization.reviewPermissions && (typeof (this.customization.reviewPermissions) == 'object');
    }
    @action setCanViewReview (value) {
        this.canViewReview = value;
    }
}