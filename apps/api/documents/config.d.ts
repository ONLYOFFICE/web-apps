// Types
type DocumentType =
    | "word"
    | "cell"
    | "slide"
    | "pdf"
    | "diagram"

type FileType =
    | "csv" 
    | "djvu" 
    | "doc" 
    | "docm" 
    | "docx" 
    | "dot" 
    | "dotm" 
    | "dotx" 
    | "dps" 
    | "dpt" 
    | "epub" 
    | "et" 
    | "ett" 
    | "fb2" 
    | "fodp" 
    | "fods" 
    | "fodt" 
    | "htm" 
    | "html" 
    | "hwp" 
    | "hwpx" 
    | "key" 
    | "md" 
    | "mht" 
    | "mhtml" 
    | "numbers" 
    | "odg" 
    | "odp" 
    | "ods" 
    | "odt" 
    | "otp" 
    | "ots" 
    | "ott" 
    | "oxps" 
    | "pages" 
    | "pdf" 
    | "pot" 
    | "potm" 
    | "potx" 
    | "pps" 
    | "ppsm" 
    | "ppsx" 
    | "ppt" 
    | "pptm" 
    | "pptx" 
    | "rtf" 
    | "stw" 
    | "sxc" 
    | "sxi" 
    | "sxw" 
    | "txt" 
    | "vsdm" 
    | "vsdx" 
    | "vssm" 
    | "vssx" 
    | "vstm" 
    | "vstx" 
    | "wps" 
    | "wpt" 
    | "xls" 
    | "xlsb" 
    | "xlsm" 
    | "xlsx" 
    | "xlt" 
    | "xltm" 
    | "xltx" 
    | "xml" 
    | "xps" 

type EditorTheme = 
    "theme-light" 
    | "theme-classic-light" 
    | "theme-dark" 
    | "theme-contrast-dark" 
    | "theme-white" 
    | "theme-night"


// Events props
interface DocumentStateChangeEvent {
    /**
     * `true` — the current user is editing the document.
     * `false` — the current user's changes are sent to the **document editing service.**
     */
    data: boolean;
};

interface RequestHistoryDataEvent {
    /**
     * The document version number.
     */
    data: number;
};

interface RequestRestoreEvent {
    data: {
        /**
         * The type of the document specified with the link.
         * @note
         */
        fileType: FileType;
        /**
         * The document link from the history object.
         * @note If it is called for the document changes from the history object.
         */
        url: string;
        /**
         * The document version number.
         * @note If it is called for the document version from the history.
         */
        version: number;
    };
};

interface ErrorEvent {
    data: {
        /**
         * The error code.
         * @see https://github.com/ONLYOFFICE/sdkjs/blob/master/common/errorCodes.js
         */
        errorCode: any;
        /**
         * The error description.
         */
        errorDescription: string;
    };
};

interface WarningEvent {
    data: {
        /**
         * The warning code.
         * @see https://github.com/ONLYOFFICE/sdkjs/blob/master/common/errorCodes.js
         */
        warningCode: number;
        /**
         * The warning description.
         */
        warningDescription: string;
    };
};

interface InfoEvent {
    data: {
        /**
         * The mode in which the file is opened.
         */
        mode: "view" | "edit";
    };
};

interface DownloadAsEvent {
    data: {
        /**
         * The type of the file being downloaded.
         */
        fileType: FileType;
        /**
         * The absolute URL to the document to be downloaded.
         */
        url: string;
    };
};

interface RequestSaveAsEvent {
    data: {
        /**
         * The type of the document.
         */
        fileType: FileType;
        /**
         * The title of the document.
         */
        title: string;
        /**
         * The absolute URL to the document to be downloaded.
         */
        url: string;
    };
};

interface RequestRenameEvent {
    /**
     * The new title of the document.
     */
    data: string;
};

interface MetaChangeEvent {
    data: {
        /**
         * The name/title of the document.
         */
        title: string;
        /**
         * The Favorite icon highlighting state.
         */
        favorite: boolean;
    };
};

interface RequestUsersEvent {
    /**
     * @note Starting from version 7.4, the operation type can be specified in the `data.c` parameter. It can take two values: `mention` or `protect`. Prior to version 7.4, only the `mention` operation was available.
     * @note Starting from version 8.0, the `info` operation type is added to set avatars for the users with the ids specified in the `data.id` parameter.
     */
    data: {
        /**
         * The operation type.
         */
        c: "mention" | "protect" | "info";
        /**
         * The user id's associated with the operation.
         */
        id: string[];
    };
};

interface RequestSendNotifyEvent {
    data: {
        /**
         * The comment/action link data.
         */
        actionLink: any;
        /**
         * The message of the comment.
         */
        message: string;
        /**
         * The list of user emails to be notified.
         */
        emails: string[];
    };
};

interface RequestInsertImageEvent {
    data: {
        /**
         * The type of image insertion.
         */
        c: string;
    };
};

interface RequestReferenceDataEvent {
    data: {
        /**
         * The URL of the external file.
         */
        link: string;
        /**
         * The unique file data from the source file.
         */
        referenceData: any;
        /**
         * The file path or name.
         */
        path: string;
    };
};

interface RequestOpenEvent {
    data: {
        /**
         * The file path or name of the external file.
         */
        path: string;
        /**
         * The unique file data from the source file.
         */
        referenceData: any;
        /**
         * The name of the new browser tab.
         */
        windowName: string;
    };
};

interface RequestSelectDocumentEvent {
    data: {
        /**
         * The type of document selection (e.g., "compare", "combine", "insert").
         */
        c: string;
    };
};

interface RequestSelectSpreadsheetEvent {
    data: {
        /**
         * The type of spreadsheet selection.
         */
        c: string;
    };
};

interface RequestReferenceSourceEvent {
    data: {
        /**
         * The unique file data from the source file.
         */
        referenceData: any;
        /**
         * The file path or name.
         */
        path: string;
    };
};


// Interfaces for arrays
interface SharingSetting {
    /**
     * The name of the user the document will be shared with.
     * @example "John Smith"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/info/#sharingsettingsuser
     */
    user: string;

    /**
     * The access rights for the user with the name above.
     * @example "Full Access"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/info/#sharingsettingspermissions
     */
    // TODO: In the documentation Example: “Full Access”, but in api.js '<permissions>'
    permissions: "Full Access" | "Read Only" | "Deny Access";

    /**
     * Changes the user icon to the link icon.
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/info/#sharingsettingsislink
     */
    isLink: boolean;
}

interface DocumentPermissions {
    /**
     * Defines if the document can be edited or only viewed.
     *
     * @note
     * If the editing permission is set to `false` the document will be opened in viewer and you will not be able to switch it to the editor even if the `mode` parameter is set to `edit`.
     *
     * @cases
     * - `true` → document is editable, **Edit Document** option available.
     * - `false` → document is opened in viewer only, cannot switch to `edit`.
     *
     * @default true
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/#edit
     */
    edit: boolean;

    /**
     * Defines if the document can be downloaded or only viewed or edited online.
     *
     * @cases
     * - `false` → the **Download as...** menu option will be absent from the File menu.
     *
     * @default true
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/#download
     */
    download: boolean;

    // TODO: Not in the documentation
    reader: boolean;

    /**
     * Defines if the document can be reviewed or not.
     *
     * @cases
     * - `true` → the document status bar will contain the **Review** menu option; document review is available only if the `mode` parameter is set to `edit`.
     * - If `edit` is `true` and `review` is `true` → the user can edit the document, accept/reject changes, and switch to review mode.
     * - If `edit` is `true` and `review` is `false` → the user can edit only.
     * - If `edit` is `false` and `review` is `true` → the document is available in review mode only.
     *
     * @defaultValue Coincides with the value of the `edit` parameter.
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/#review
     */
    review: boolean;

    /**
     * Defines if the document can be printed or not.
     *
     * @cases
     * - `false` → the **Print** menu option will be absent from the File menu.
     *
     * @default true
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/#print
     */
    print: boolean;

    /**
     * Defines if the document can be commented or not.
     *
     * @cases
     * - `true` → the document side bar will contain the **Comment** menu option; document commenting is available only if the `mode` parameter is set to `edit`.
     * - If `edit` is `true` and `comment` is `true` → the user will be able to edit the document and comment.
     * - If `edit` is `true` and `comment` is `false` → the user will be able to edit only, the corresponding commenting functionality will be available for viewing only, the adding and editing of comments will be unavailable.
     * - If `edit` is `false` and `comment` is `true` → the document will be available for commenting only.
     * - If `edit` is `false`, `review` is `false`, and `comment` is `true` → the `fillForms` value is not considered and filling the forms is not available.
     *
     * @defaultValue Coincides with the value of the `edit` parameter.
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/#comment
     */
    comment: boolean;

    /**
     * Defines if the filter can applied globally (`true`) affecting all the other users, or locally (`false`), i.e. for the current user only.
     * - Filter modification will only be available for the spreadsheet editor if the `mode` parameter is set to `edit`.
     * 
     * @cases
     * - If document is edited by a user with the full access rights, the filters applied by such a user will be visible to all other users despite their local settings.
     *
     * @default true
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/#modifyfilter
     */
    modifyFilter: boolean;


    /**
     * Defines if the content control settings can be changed.
     * - Content control modification will only be available for the document editor if the `mode` parameter is set to `edit`.
     *
     * @default true
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/#modifycontentcontrol
     */
    modifyContentControl: boolean;

    /**
     * Defines if the forms can be filled.
     * - Filling in forms will only be available for the document and pdf editors if the mode parameter is set to `edit`.
     * 
     * @cases
     * - If `edit` is set to "true" or `review` is set to "true", the `fillForms` value is not considered and the form filling is possible.
     * - If `edit` is set to "false" and `review` is set to "false" and `fillForms` is also set to "true", the user can only fill forms in the document.
     * - If `edit` is set to "false" and `review` is set to "false" and `fillForms` is set to "true" the `comments` value is not considered and the commenting is not available.
     * - The form filling only mode is currently available for Document Editor only.
     * 
     * @defaultValue Coincides with the value of the `edit` or the `review` parameter.
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/#fillforms
     */
    fillForms: boolean;

    /**
     * Defines if the content can be copied to the clipboard or not.
     * 
     * @cases
     * - `false` → pasting the content will be available within the current document editor only.
     * 
     * @default true
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/#copy
     */
    copy: boolean;

    /**
     * Defines if the user can edit only his/her comments.
     * @default false
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/#editcommentauthoronly
     */
    editCommentAuthorOnly: boolean;

    /**
     * Defines if the user can delete only his/her comments.
     * @default false
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/#deletecommentauthoronly
     */
    deleteCommentAuthorOnly: boolean;

    /**
     * Defines the groups whose changes the user can accept/reject.
     *
     * @cases
     * - `[""]` → the user can review changes made by someone who belongs to none of these groups (for example, if the document is reviewed in third-party editors).
     * - `[]` → the user cannot review changes made by any group.
     * - `""` or not specified → the user can review changes made by any user.
     *
     * @example ["Group1", "Group2", ""]
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/#reviewgroups
     */
    reviewGroups: string[];

    /**
     * Defines the groups whose comments the user can edit, remove and/or view.
     *
     * @cases
     * - `[""]` → the user can edit/remove/view comments made by someone who belongs to none of these groups (for example, if the document is reviewed in third-party editors).
     * - `[]` → the user cannot edit/remove/view comments made by any group.
     * - If the `edit`, `remove` and `view` parameters are `""` or not specified → the user can view/edit/remove comments made by any user.
     *
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/#commentgroups
     */
    commentGroups: {
        /**
         * The user can view comments made by other users.
         * @example []
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/#commentgroupsview
         */
        view: string[];

        /**
         * The user can edit comments made by other users.
         * @example ["Group2", ""]
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/#commentgroupsedit
         */
        edit: string[];

        /**
         * The user can remove comments made by other users.
         * @example [""]
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/#commentgroupsremove
         */
        remove: string[];
    };

    /**
     * Defines the groups of users whose information is displayed in the editors.
     * - Usernames are displayed in the list of editing users in the editor header.
     * - While typing, user cursors and tooltips with their names are displayed.
     * - When locking objects in the strict co-editing mode, usernames are shown.
     *
     * @cases
     * - `["Group1", ""]` → users from **Group1** and users without any group are displayed.
     * - `[]` → no user information is displayed at all.
     * - `undefined` or `""` → information about **all users** is displayed.
     * 
     * @example ["Group1", ""]
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/#userinfogroups
     */
    userInfoGroups: string[] | undefined | "";

    /**
     * Defines if the **Protection** tab on the toolbar and the **Protect** button 
     * in the left menu are displayed **(true)** or hidden **(false)**. 
     * @default true
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/#protect
     */
    protect: boolean;

    /**
     * Defines if the chat functionality is enabled in the document or not.
     *
     * @cases
     * - `true` → the **Chat** menu button will be displayed.
     *
     * @default true
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/#chat
     */
    chat: boolean;
}

interface RecentDocument {
    /**
     * The document title that will be displayed in the **Open Recent...** menu option.
     *
     * @example "exampledocument1.docx"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#recenttitle
     */
    title: string;

    /**
     * The absolute URL to the document where it is stored.
     *
     * @example "https://example.com/exampledocument1.docx"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#recenturl
     */
    url: string;

    /**
     * The folder where the document is stored (can be empty if the document is in the root folder).
     *
     * @example "Example Files"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#recentfolder
     */
    folder: string;
}

interface DocumentTemplate {
    /**
     * The template title that will be displayed in the **Create New...** menu option.
     *
     * @example "exampletemplate1.docx"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#templatestitle
     */
    title: string;

    /**
     * The absolute URL to the image for the template.
     *
     * @example "https://example.com/exampletemplate1.png"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#templatesimage
     */
    image: string;

    /**
     * The absolute URL to the document where it will be created and available after creation.
     *
     * @example "https://example.com/url-to-create-template1"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#templatesurl
     */
    url: string;
}



interface DocumentBase {
    /**
     * Defines the desired file name for the viewed or edited document which will also be used as file name when the document is downloaded.
     * @maxLength 128
     * @example "Example Document Title.docx"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/#title
     */
    title: string;

    /**
     * Defines the absolute URL where the source viewed or edited document is stored.
     * @note Be sure to add a token when using local links. Otherwise, an error will occur.
     * @example "https://example.com/url-to-example-document.docx"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/#url
     */
    url: string;

    /**
     * Defines the type of the file for the source viewed or edited document.
     * @example "docx"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/#filetype
     */
    fileType: FileType;

    // TODO: Not in the documentation
    options: Record<string, unknown>;

    /**
     * Defines the unique document identifier used by the service to recognize the document.
     * - Every time the document is edited and saved, the key must be generated anew.
     * - In case the known key is sent, the document will be taken from the cache.
     *
     * @note The key must be unique for all independent services connected to the same document server. Otherwise, the service may open someone else's file from the editor cache. If multiple third-party integrators are connected to the same document server, they must also provide a unique key.
     * @supportedCharacters 0-9, a-z, A-Z, -._=.
     * @maxLength 128
     * @example "Khirz6zTPdfd7"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/#key
     */
    key: string;

    // TODO: Not in the documentation
    vkey: string;
}

interface DocumentNormal extends DocumentBase {
    /**
     * Defines an object that is generated by the integrator to uniquely identify a file in its system.
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/#referencedata
     */
    referenceData: {
        /**
         * The unique document identifier used by the service to get a link to the file.
         * 
         * @note It must not be changed when the document is edited and saved (i.e. it is not equal to the document.key parameter).
         * @example "BCFA2CED"
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/#referencedatafilekey
         */
        fileKey: string;

        /**
         * The unique system identifier. 
         * 
         * @note If the data was copied from a file on one system, and inserted into a file on another, then pasting by link will not be available and there will be no corresponding button in the context menu.
         * @example "https://example.com"
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/#referencedatainstanceid
         */
        instanceId: string;
    };

    /**
     * The document info section allows to change additional parameters for the document.
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/info/
     */
    info: {
        /**
         * Defines the name of the document owner/creator.
         * @example "John Smith"
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/info/#owner
         */
        owner: string;

        /**
         * Defines the folder where the document is stored (can be empty in case the document is stored in the root folder).
         * @example "Example Files"
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/info/#folder
         */

        folder: string;

        /**
         * Defines the document uploading date.
         * @example "2010-07-07 3:46 PM"
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/info/#uploaded
         */
        uploaded: string;

        /**
         * Displays the information about the settings which allow to share the document with other users.
         */
        sharingSettings: SharingSetting[];

        /**
         * Defines the highlighting state of the Favorite icon. 
         * When the user clicks the icon, the onMetaChange event is called.
         * @note If the parameter is undefined, the Favorite icon is not displayed at the editor window header.
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/info/#favorite
         */
        favorite: boolean;
    };

    /**
     * The document permission section allows to change the permission for the document to be edited and downloaded or not.
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/permissions/
     */
    permissions: DocumentPermissions;
}

interface DocumentEmbedded extends DocumentBase {
    /**
     * Defines if the PDF file is a PDF form or a standard PDF file.
     * @default true
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/#isform
     */
    isForm: boolean,
}


interface EditorConfigBase {
    // TODO: Not in the documentation
    licenseUrl: string;

    // TODO: Not in the documentation
    customerId: any;
}

interface EditorConfigNormal extends EditorConfigBase {
    /**
     * Specifies the data received from the **document editing service** using the `onMakeActionLink` event or the `onRequestSendNotify` event in `data.actionLink` parameter, which contains the information about the action in the document that will be scrolled to.
     *
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#actionlink
     */
    actionLink: {
        // TODO: Not in the documentation
        action: {
            /**
             * The type of action.
             */
            type: "bookmark" | "comment";

            /**
             * The data associated with the action.
             */
            data: string;
        }
    };
    
    /**
     * Defines the editor opening mode.
     *
     * @cases
     * - `view` → open the document for viewing.
     * - `edit` → open the document in the editing mode allowing to apply changes to the document data.
     *
     * @default "edit"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#mode
     */
    mode: "edit" | "view",

    /**
     * Defines the editor interface language.
     * 
     * @note Use two-letter language codes (e.g., `de`, `ru`, `it`).  
     * To translate the interface into Portuguese (Portugal) or Chinese (Traditional, Taiwan),
     * use four-letter codes (`pt-PT`, `zh-TW`).  
     * The code `pt` sets Portuguese (Brazil), and `zh` sets Chinese (People's Republic of China).
     * 
     * @default "en"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#lang
     */
    lang: string;

    /**
     * Defines the default measurement units.  
     * 
     * @note Use `us` or `ca` to set inches.  
     * 
     * @default ""
     * @example "us"
     * @deprecated Starting from version 8.2, use the `region` parameter instead.
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#location
     */
    location: string;

    // TODO: Not in the documentation
    canCoAuthoring: boolean,

    // TODO: Not in the documentation
    canBackToFolder:boolean,

    /**
     * Defines the absolute URL of the document where it will be created and available after creation.  
     * - If not specified, the **Create** button will not be displayed.  
     * - Instead of this parameter, you can use the `onRequestCreateNew` event.  
     *
     * @example "https://example.com/url-to-create-document/"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#createurl
     */
    createUrl: string;

    // TODO: Not in the documentation
    sharingSettingsUrl: string;

    // TODO: Not in the documentation
    fileChoiceUrl: string;

    /**
     * Specifies the absolute URL to the **document storage service**.  
     * - This service must be implemented by the software integrators who use ONLYOFFICE Docs on their own server.  
     * - Url for connection between sdk and portal.
     *
     * @example "https://example.com/url-to-callback.ashx"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#callbackurl
     */
    callbackUrl: string;

    // TODO: Not in the documentation
    mergeFolderUrl: string;

    // TODO: Not in the documentation
    saveAsUrl: string;

    
    /**
     * Defines the default display format for **currency**, **date**, and **time** (in the **Spreadsheet Editor** only).  
     * - Is set using the four letter (en-US, fr-FR, etc.) language codes.
     * 
     * @note Starting from version **8.2**, this parameter also defines the default measurement units **in all editor types**. For the `...-US` or `...-CA` regions, inches are used unless another value is specified in `editorConfig.customization.unit`.  
     *
     * @defaultValue 
     * - If not specified, the value of the `lang` parameter is used.  
     * - If no regional setting corresponds to the `lang` value, `"en-US"` is applied by default.  
     * @example "en-US"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#region
     */
    region: string;

    /**
     * Defines the **user** currently viewing or editing the document.  
     *
     * @note  
     * - The request to the user's avatar is sent **without authorization**, because the avatar URL is inserted into the HTML of the editor frame.  
     * - A **CORS** issue may occur. In this case, use the avatar in the **base64** format (e.g. `"data:image/png;base64,*****"`).  
     * - If you are subscribed to the `onRequestUsers` event and send an avatar via the `setUsers` method, the `user.image` field in the initialization config is not required.  
     * - It is **not recommended** to specify this parameter if the avatar is in base64 format and the initialization config is signed with JWT, since the token will become too long.  
     *
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#user
     */
    user: {
        /**
         * The identification of the user.  
         * This information is stored and used to:  
         * - distinguish co-authors,  
         * - indicate the author of the last changes when saving and highlighting history (in the list of changes),  
         * - count users with access for a license (based on the number of users).  
         *
         * @note It is recommended to use a **unique anonymized hash**. Do not use sensitive data such as real name or email.  
         *
         * @maxLength 128
         * @example "78e1e841"
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#userid
         */
        id: string;

        /**
         * The full name of the user.  
         *
         * @maxLength 128
         * @example "John Smith"
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#username
         */
        name: string;

        /**
         * The group (or several groups separated with commas) the user belongs to.
         * Can be used for `customization.reviewPermissions`, `permissions.reviewGroups`, or `permissions.commentGroups`.
         * @example "Group1,Group2"
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#usergroup
         */
        group: string;

        /**
         * The path to the user's avatar.
         *
         * @example "https://example.com/url-to-user-avatar.png"
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#userimage
         */
        image: string;

        // TODO: Not in the documentation
        /**
         * Defines the roles assigned to the user.  
         * - Used for **PDF forms**, fill form with `Role1`.
         *
         * @example ["Role1"]
         */
        roles: string[];
    };

    /**
     * Defines the presence or absence of the documents in the **Open Recent...** menu option.
     *
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#recent
     */
    recent: RecentDocument[];

    /**
     * Defines the presence or absence of the templates in the **Create New...** menu option.
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#templates
     */
    templates: DocumentTemplate[];

    customization: {
        /**
         * Changes the image file at the top left corner of the editor header.  
         * The recommended image height is **20 pixels**.  
         *
         * @note  
         * - This parameter is available for editing only for **ONLYOFFICE Docs Developer**.  
         * - This parameter is also available for the **mobile editors**.  
         *
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#logo
         */
        logo: {
            /**
             * Path to the image file used to show in the common work mode (view and edit modes for all editors) or in the embedded mode.  
             * The image must have the following size: **172x40**.  
             *
             * @example "https://example.com/logo.png"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#logoimage
             */
            image: string;

            /**
             * Path to the image file used for the dark header (for example, in a dark theme or in a theme with a colored header).
             * The image must have the following size: **172x40**.  
             *
             * @example "https://example.com/dark-logo.png"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#logoimagedark
             */
            imageDark: string;

            /**
             * Path to the image file used for the **light header** (for example, in the Gray theme).  
             * The image must have the following size: **172x40**.  
             *
             * @example "https://example.com/light-logo.png"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#logoimagelight
             */
            imageLight: string;

            /**
             * Path to the image file used to show in the **embedded mode**.  
             * The image must have the following size: **248x40**.  
             *
             * @deprecated Starting from version 7.0, use the `logo.image` field instead.
             * @example "https://example.com/logo_em.png"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#logoimageembedded
             */
            imageEmbedded: string;

            /**
             * The absolute URL which will be used when someone clicks the logo image.  
             * Can be used to go to your website, etc.  
             * Leave as an empty string or `null` to make the logo not clickable.  
             *
             * @example "https://example.com"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#logourl
             */
            url: string;

            /**
             * Shows or hides the logo.
             *
             * @default true
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#logovisible
             */
            visible: boolean;
        };

        /**
         * Contains the information which will be displayed in the editor **About** section and is visible to all editor users.
         *
         * @note This parameter is available for editing only for **ONLYOFFICE Docs Developer**.
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#customer
         */
        customer: {
            /**
             * The name of the company or person who gives access to the editors or the editor authors.
             *
             * @example "John Smith and Co."
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#customername
             */
            name: string;

            /**
             * Postal address of the company or person who gives access to the editors or the editor authors.
             *
             * @example "My City, 123a-45"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#customeraddress
             */
            address: string;

            /**
             * Email address of the company or person who gives access to the editors or the editor authors.
             *
             * @example "john@example.com"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#customermail
             */
            mail: string;

            /**
             * Home website address of the above company or person.
             *
             * @example "example.com"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#customerwww
             */
            www: string;

            /**
             * The phone of the company or person who gives access to the editors or the editor authors.
             *
             * @example "123456789"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#customerphone
             */
            phone: string;

            /**
             * Some additional information about the company or person you want the others to know.
             *
             * @example "Some additional information"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#customerinfo
             */
            info: string;

            /**
             * The path to the image logo.  
             * - No special recommendations for this file, but it is recommended to use **.png** format with a transparent background.  
             * - The image must have the following size: **432x70**.  
             *
             * @example "https://example.com/logo-big.png"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#customerlogo
             */
            logo: string;

            /**
             * The path to the image logo for the **dark theme**.  
             * - No special recommendations for this file, but it is recommended to use **.png** format with a transparent background.  
             * - The image must have the following size: **432x70**.  
             *
             * @example "https://example.com/dark-logo-big.png"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#customerlogodark
             */
            logoDark: string;
        };

        /**
         * Defines if the **About** menu button is displayed or hidden.
         *
         * @default true
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#about
         */
        about: boolean;

        /**
         * Defines settings for the **Feedback & Support** menu button.  
         * - Can be either **boolean** (simply displays or hides the button) or **object** (to configure settings).  
         *
         * @note This parameter is also available for the **mobile editors**.
         * @default false
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#feedback
         */
        feedback: {
            /**
             * Shows or hides the **Feedback & Support** menu button.
             *
             * @default false
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#feedbackvisible
             */
            visible: boolean;

            /**
             * The absolute URL to the website which will be opened when clicking the **Feedback & Support** menu button.
             *
             * @example "https://example.com"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#feedbackurl
             */
            url: string;
        } | boolean;

        /**
         * Defines settings for the **Open file location** menu button and the upper right corner button.
         *
         * @note This parameter is also available for the **mobile editors**.
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#goback
         */
        goback: {
            /**
             * Opens the website in a new browser tab/window (if `true`) or the current tab (if `false`) when the **Open file location** button is clicked.
             *
             * @default true
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#gobackblank
             */
            blank: boolean;

            /**
             * Defines that if the **Open file location** button is clicked, the `events.onRequestClose` event is called instead of opening a browser tab or window.
             *
             * @deprecated Starting from version 8.1, use the `close` parameter instead.
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#gobackrequestclose
             */
            requestClose: boolean;

            /**
             * The text which will be displayed for the **Open file location** menu button and upper right corner button (i.e. instead of Go to Documents).
             *
             * @example "Open file location"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#gobacktext
             */
            text: string;

            /**
             * The absolute URL to the website which will be opened when clicking the **Open file location** menu button.
             *
             * @example "https://example.com"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#gobackurl
             */
            url: string;
        };

        /**
         * Defines settings for the **cross button** to close the editor.
         *
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#close
         */
        close: {
            /**
             * Defines if the cross button to close the editor is displayed or hidden.
             *
             * @default true
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#closevisible
             */
            visible: boolean;

            /**
             * Defines the tooltip text for the cross button in the editor header or the menu item text in the mobile editors and in the **File** menu of the web editors.
             *
             * @note
             * - It will only be available if the `onRequestClose` event is set.  
             * - If the event is not declared and the `close` parameter is not specified, the cross button will not be displayed.  
             * - This parameter is also available for the mobile editors.
             *
             * @example "Close file"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#closetext
             */
            text: string;
        };

        // TODO: Not in the documentation
        reviewPermissions:objectж

        /**
         * Adds a request for the anonymous name.
         *
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#anonymous
         */
        anonymous: {
            /**
             * Defines if the request is sent or not.
             *
             * @default true
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#anonymousrequest
             */
            request: boolean;

            /**
             * A postfix added to the user name.
             *
             * @default "Guest"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#anonymouslabel
             */
            label: string;
        };

        /**
         * Contains the information about the **review mode**.
         *
         * @note
         * - In case this setting is changed in the editor interface, it will be stored in the browser local storage and will overwrite any values sent as the `editorConfig.customization.review.hoverMode` and the `editorConfig.customization.review.reviewDisplay` parameters.
         * - The `showReviewChanges`, `reviewDisplay`, and `trackChanges` parameters are deprecated **since version 7.0**. Please use the `review` parameter instead.
         *
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#review
         */
        review: {
            /**
             * Defines if the **Display mode** button is displayed or hidden on the **Collaboration** tab.
             *
             * @default false
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#reviewhidereviewdisplay
             */
            hideReviewDisplay: boolean;

            /**
             * Defines the review display mode: show reviews in tooltips by hovering the changes (`true`) or in balloons by clicking the changes (`false`).
             *
             * @default false
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#reviewhovermode
             */
            hoverMode: boolean;

            /**
             * Defines the review editing mode which will be used when the document is opened for viewing.
             * It will only be available for the document editor if mode is set to **view**. Can take the following values:
             *
             * @cases
             * - `markup` → the document is displayed with proposed changes highlighted.
             * - `simple` → the document is displayed with proposed changes highlighted, but the balloons are turned off.
             * - `final` → the document is displayed with all the proposed changes applied.
             * - `original` → the original document is displayed without the proposed changes.
             *
             * @default "original"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#reviewreviewdisplay
             */
            reviewDisplay: "markup" | "simple" | "final" | "original";

            /**
             * Defines if the review changes panel is automatically displayed or hidden when the editor is loaded. 
             *
             * @default false
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#reviewshowreviewchanges
             */
            showReviewChanges: boolean;

            /**
             * Defines if the document is opened in the review editing mode (`true`) or not (`false`) regardless of the `document.permissions.review` parameter.  
             * If `undefined`, the `document.permissions.review` value is used for all document users.
             *
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#reviewtrackchanges
             */
            trackChanges: boolean;
        };

        /**
         * Defines the parameters that the user can use to hide the interface elements but not to disable features completely (for example, if this functionality is available from other elements such as context menu, or via hotkeys).
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layout
         */
        layout: {
            /**
             * Defines the **toolbar** settings. 
             * If this parameter is a **boolean** value, then it specifies whether the **toolbar** will be displayed or hidden.
             *
             * @default true
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layouttoolbar
             */
            toolbar: {
                /**
                 * Defines the **File** tab settings. 
                 * If this parameter is a **boolean** value, then it specifies whether the **File** tab will be displayed or hidden.
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layouttoolbarfile
                 */
                file: {
                    /**
                     * Defines if the **Close** menu option is displayed or hidden.
                     *
                     * @default true
                     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layouttoolbarfileclose
                     */
                    close: boolean;

                    /**
                     * Defines if the **Advanced settings** option is displayed or hidden.
                     *
                     * @default true
                     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layouttoolbarfilesettings
                     */
                    settings: boolean;

                    /**
                     * Defines if the **Document info** option is displayed or hidden.
                     *
                     * @default true
                     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layouttoolbarfileinfo
                     */
                    info: boolean;

                    /**
                     * Defines if the **Save** option is displayed or hidden.
                     *
                     * @default true
                     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layouttoolbarfilesave
                     */
                    save: boolean;
                } | boolean;

                /**
                 * Defines the Home tab settings. This tab cannot be hidden.
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layouttoolbarhome
                 */
                home: {
                    /**
                     * Defines if the button for choosing the mail merge base is displayed or hidden. 
                     * 
                     * @deprecated Please use the `toolbar.collaboration.mailmerge` parameter instead.
                     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layouttoolbarhomemailmerge
                     */
                    mailmerge: boolean;
                };

                // TODO: Not in the documentation
                /**
                 * Defines the **Insert** tab settings.  
                 * If this parameter is a **boolean** value, then it specifies whether the **Insert** tab will be displayed or hidden.
                 */
                insert: {
                    /**
                     * Text from file button in **Document Editor**.
                     */
                    file: boolean;

                    /**
                     * Field button in **Document Editor**.
                     */
                    field: boolean;
                } | boolean;

                /**
                 * Defines if the **Layout** tab is displayed or hidden. 
                 * This parameter will only be available for the **Document Editor** and the **Spreadsheet Editor**. 
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layouttoolbarlayout
                 */
                layout: {
                    // TODO: Not in the documentation
                    /**
                     *Page color button.
                        */
                    pagecolor: boolean
                } | boolean;

                /**
                 * Defines if the **References** tab is displayed or hidden. 
                 * This parameter will only be available for the **Document Editor**. 
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layouttoolbarreferences
                 */
                references: boolean;

                /**
                 * Defines the **Collaboration** tab settings. 
                 * If this parameter is a **boolean** value, then it specifies whether the **Collaboration** tab will be displayed or hidden. 
                 *
                 * @default true
                 * @seehttps://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layouttoolbarcollaboration
                 */
                collaboration: {
                    /**
                     * Defines if the button for choosing the **mail merge** base is displayed or hidden.
                     *
                     * @default true
                     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layouttoolbarcollaborationmailmerge
                     */
                    mailmerge: boolean;
                } | boolean;

                /**
                 * Defines if the **Draw** tab is displayed or hidden.
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layouttoolbardraw
                 */
                draw: boolean;

                /**
                 * Defines if the **Protection** tab is displayed or hidden.
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layouttoolbarprotect
                 */
                protect: boolean;

                /**
                 * Defines if the **Plugins** tab is displayed or hidden.
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layouttoolbarplugins
                 */
                plugins: boolean;

                /**
                 * Defines the **View** tab settings. 
                 * If this parameter is a **boolean** value, then it specifies whether the **View** tab will be displayed or hidden. 
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layouttoolbarview
                 */
                view: {
                    /**
                     * Defines if the **Navigation** button is displayed or hidden. 
                     * The default value is `true`. This parameter will only be available for the **Document Editor**.
                     *
                     * @default true
                     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layouttoolbarviewnavigation
                     */
                    navigation: boolean;
                } | boolean;

                /**
                 * Defines if the **Save** button on the toolbar is displayed or hidden. 
                 * @note Please note that this setting is used when the `compactHeader` parameter is set to `true`.
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layouttoolbarsave
                 */
                save: boolean;
            } | boolean;

            /**
             * Defines the editor **header** settings.
             *
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layoutheader
             */
            header: {
                /**
                 * Defines if a button for switching editor modes will be displayed in the header or not.
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layoutheadereditmode
                 */
                editMode: boolean;

                /**
                 * Defines if the **Save** button in the editor header is displayed or hidden. 
                 * @note Please note that this setting is used when the `compactHeader` parameter is set to `false`.
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layoutheadersave
                 */
                save: boolean;

                /**
                 * Defines if the icon with the user's avatar/initials in the editor header is displayed or hidden. 
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layoutheaderuser
                 */
                user: boolean;

                /**
                 * Defines if the button with the editing users is displayed or hidden.
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layoutheaderusers
                 */
                users: boolean;
            };

            /**
             * Defines the **left menu** settings. 
             * If this parameter is a **boolean** value, then it specifies whether the **left menu** will be displayed or hidden. 
             *
             * @default true
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layoutleftmenu
             */
            leftMenu: {
                /**
                 * Defines the initial value of the left panel visibility - displayed or hidden. 
                 * It is used for the **Left panel** menu option on the **View** tab. 
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layoutleftmenumode
                 */
                mode: boolean;

                /**
                 * Defines if the **Navigation** button is displayed or hidden. 
                 * This parameter will only be available for the **Document Editor**.
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layoutleftmenunavigation
                 */
                navigation: boolean;

                /**
                 * Defines if the **Spellcheck** button is displayed or hidden. 
                 * This parameter will only be available for the **Spreadsheet Editor**.
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layoutleftmenuspellcheck
                 */
                spellcheck: boolean;
            } | boolean;

            /**
             * Defines the **right menu** settings. 
             * If this parameter is a **boolean** value, then it specifies whether the **right menu** will be displayed or hidden. 
             *
             * @default true
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layoutrightmenu
             */
            rightMenu: {
                /**
                 * Defines the initial value of the right panel visibility - displayed or hidden. 
                 * It is used for the **Right panel** menu option on the **View** tab. 
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layoutrightmenumode
                 */
                mode: boolean;
            } | boolean;

            /**
             * Defines the **status bar** settings. 
             * If this parameter is a **boolean** value, then it specifies whether the status bar will be displayed or hidden. 
             *
             * @default true
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layoutstatusbar
             */
            statusBar: {
                /**
                 * Defines if an **action status** is displayed or hidden. 
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layoutstatusbaractionstatus
                 */
                actionStatus: boolean;

                /**
                 * Defines if a button for choosing the **document language** is displayed or hidden. 
                 * This parameter will only be available for the **Document Editor** and the **Presentation Editor**.
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layoutstatusbardoclang
                 */
                docLang: boolean;

                /**
                 * Defines if a button for choosing the **text language** is displayed or hidden. 
                 * This parameter will only be available for the **Document Editor** and the **Presentation Editor**.
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#layoutstatusbartextlang
                 */
                textLang: boolean;
            } | boolean
        }

        /**
         * Defines the parameters that the user can disable or customize if possible.
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#features
         */
        features: {
            /**
             * Defines if the **spell checker** is automatically switched on or off when the editor is loaded.
             * If this parameter is a **boolean** value, then it is set as the initial spell checker value and the spell checker setting will not be hidden.
             * @default true
             */
            spellcheck: {
                /**
                 * Defines if the spell checker is automatically switched on or off when the editor is loaded.
                 * This parameter will only be available for the **Document Editor** and the **Presentation Editor**.
                 *
                 * @note In case spellcheck setting is changed in the editor interface, it will be stored in the **browser local storage**
                 * and will overwrite any values sent as the `editorConfig.customization.features.spellcheck` parameter.
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#featuresspellcheckmode
                 */
                mode: boolean;

                // TODO: Not in the documentation
                /**
                 * Hide or show feature in **Document Editor**, **Presentation Editor**, **Spreadsheet Editor**
                 */
                change: boolean
            } | boolean;

            /**
             * Defines if the **role settings** will be disabled in the **PDF forms** or not.  
             * If the parameter is equal to `false`, then the **role manager** is hidden and viewing the form on behalf of a specific role is disabled.  
             * In this case, the **Manage Roles** and **View Form** buttons on the **Forms** tab and a drop-down list for setting the field role in the right panel will not be displayed.  
             *
             * @note This parameter is available for editing **only** for `ONLYOFFICE Docs Developer`.
             *
             * @default true
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#featuresroles
             */
            roles: boolean;

            /**
             * Defines the style of the **top toolbar tabs**.  
             * If this parameter is a string value (`fill` or `line`), then it is set as the **initial tab style value**  
             * and the tab style setting will not be hidden.  
             *
             * @default "fill"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#featurestabstyle
             */
            tabStyle: {
                /**
                 * Defines if the top toolbar tabs are distinctly displayed (`fill`) or  
                 * only highlighted to see which one is selected (`line`).  
                 * The default value is `"fill"`.  
                 * This value is used when the editor is first opened.
                 *
                 * @default "fill"
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#featurestabstylemode
                 */
                mode: "file" | "line";

                /**
                 * Defines if the **tab style setting** will be displayed in  
                 * the `File -> Advanced settings` or not.  
                 * This setting is available in **all editor types**.
                 *
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#featurestabstylechange
                 */
                change: boolean;
            } | "file" | "line";        
            
            /**
             * Defines the **background of the top toolbar tabs**.  
             * If this parameter is a string value (`header` or `toolbar`), then it is set as the  
             * **initial tab background value** and the tab background setting will not be hidden.  
             *
             * @default "header"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#featurestabbackground
             */
            tabBackground: {
                /**
                 * Defines if the background of the top toolbar tabs matches the **header background** (`header`)  
                 * or the **toolbar background** (`toolbar`).  
                 * This value is used when the editor is first opened.
                 *
                 * @default "header"
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#featurestabbackgroundmode
                 */
                mode: string;

                /**
                 * Defines if the **tab background setting** will be displayed in  
                 * the `File -> Advanced settings` or not.  
                 * This setting is available in **all editor types**.
                 *
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#featurestabbackgroundchange
                 */
                change: boolean;
            } | "header" | "toolbar";   
            
            /**
             * Defines if the tooltips about new editor features will be displayed or hidden on first loading.
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#featuresfeaturestips
             * @default true
             */
            featuresTips: boolean
        }

        /**
         * Defines the font for the interface elements (buttons, tabs, etc.).
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#font
         */
        font: {
            /**
             * The font name.
             * @example "Arial"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#fontname
             */
            name: string;

            /** The font size.
             * @example "11px"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#fontsize
             */
            size: string;
        }

        /**
         * Defines if the **Chat menu button** is displayed or hidden.  
         * @note Please note that in case you hide the **Chat** button, the corresponding chat functionality will also be disabled
         *
         * @deprecated Starting from version 7.1, please use the `document.permissions.chat` parameter instead.
         *
         * @default true
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#chat
         */
        chat: boolean;

        /**
         * Defines if the **Comments menu button** is displayed or hidden.  
         * @note Please note that in case you hide the **Comments** button, the corresponding commenting functionality will be available for viewing only, adding and editing comments will be unavailable.
         *
         * @default true
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#comments
         */
        comments: boolean;

        /**
         * Defines the **document display zoom value** measured in percent.  
         * Can take values larger than `0`. 
         * For text documents and presentations it is possible to set this parameter to `-1` (fitting the document to page option) or to `-2` (fitting the document page width to the editor page).
         *
         * @note In case this setting is changed in the editor interface, it will be stored in the browser local storage and will overwrite any values sent as the `editorConfig.customization.zoom` parameter.
         *
         * @default 100
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#zoom
         */
        zoom: number;

        /**
         * Defines if the **top toolbar type** displayed is full (`false`) or compact (`true`).  
         * Starting from version 8.3, this setting is also available for the viewer. The default value for the view mode is `true`.
         *
         * @note In case this setting is changed in the editor interface, it will be stored in the browser local storage and will overwrite any values sent as the `editorConfig.customization.compactToolbar` parameter.
         *
         * @defaultValue Normal mode — false. View mode — true.
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#compacttoolbar
         */
        compactToolbar: boolean;

        /**
         * Defines if the **left menu panel** is displayed or hidden.  
         *
         * @deprecated Starting from version 7.1, please use the `layout.leftMenu` parameter instead.
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#leftmenu
         */
        leftMenu: boolean;

        /**
         * Defines if the **right menu panel** is displayed or hidden.  
         *
         * @deprecated Starting from version 7.1, please use the `layout.rightMenu` parameter instead.
         *
         * @default true
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#rightmenu
         */
        rightMenu: boolean;

        /**
         * Defines if the **right menu** is displayed or hidden on first loading.  
         *
         * @note In case this setting is changed in the editor interface, it will be stored in the browser local storage and will overwrite any values sent as the `editorConfig.customization.hideRightMenu` parameter.
         *
         * @default true
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#hiderightmenu
         */
        hideRightMenu: boolean;

        /**
         * Defines if the **top toolbar** is displayed or hidden.  
         *
         * @deprecated Starting from version 7.1, please use the `layout.toolbar` parameter instead.
         *
         * @default true
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-white-label/#toolbar
         */
        toolbar: boolean;

        /**
         * Defines if the **status bar** is displayed or hidden.  
         *
         * @deprecated Starting from version 7.1, please use the `layout.statusBar` parameter instead.
         *
         * @default true
         */
        statusBar: boolean;

        /**
         * Defines if the **Autosave menu option** is enabled or disabled.  
         * If set to `false`, only **Strict** co-editing mode can be selected, as **Fast** does not work without autosave.  
         * @note In case this setting is changed in the editor interface, it will be stored in the browser local storage and will overwrite any values sent as the `editorConfig.customization.autosave` parameter.
         *
         * @default true
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#autosave
         */
        autosave: boolean;

        /**
         * Adds the request for the **file force saving** to the callback handler when saving the document within the **document editing service** (e.g., clicking the **Save** button, etc.).  
         * @note In case this setting is changed in the editor interface, it will be stored in the browser local storage and will overwrite any values sent as the `editorConfig.customization.forcesave` parameter.
         *
         * @default false
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#forcesave
         */
        forcesave: boolean;

        /**
         * Defines if the user can **edit and delete only his comments**.  
         *
         * @deprecated Starting from version 6.3, please use the `document.permissions.editCommentAuthorOnly` and `document.permissions.deleteCommentAuthorOnly` fields instead.
         *
         * @default false
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#commentauthoronly
         */
        commentAuthorOnly: boolean;

        /**
         * Defines if the **review changes panel** is automatically displayed or hidden when the editor is loaded.  
         *
         * @deprecated Starting from version 7.0, please use the `review.showReviewChanges` parameter instead.
         *
         * @default false
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#showreviewchanges
         */
        showReviewChanges: boolean;

        /**
         * Defines if the **Help menu button** is displayed or hidden.  
         *
         * @note This parameter is also available for the mobile editors.
         *
         * @default true
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#help
         */
        help: boolean;

        /**
         * Defines if the additional action buttons are displayed in the upper part of the editor window header next to the logo (`false`) or in the toolbar (`true`) making the header more compact.
         *
         * @default false
         *
         * @example false
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#compactheader
         */
        compactHeader: boolean;

        /**
         * Defines if the top toolbar tabs are distinctly displayed (`false`) or only highlighted to see which one is selected (`true`).
         *
         * @deprecated Starting from version 8.2, please use the `editorConfig.customization.features.tabStyle` parameter which is set to `line` and the `editorConfig.customization.features.tabBackground` parameter which is equal to `toolbar`.
         *
         * @default false
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#toolbarnotabs
         */
        toolbarNoTabs: boolean;

        /**
         * Defines if the document title is visible on the top toolbar (`false`) or hidden (`true`).  
         * @note This setting is used when the `compactHeader` parameter is set to `true`.  
         * @note Starting from version 9.0.3, this parameter is also available for the mobile editors.
         *
         * @default false
         */
        toolbarHideFileName: boolean;

        /**
         * Defines the review editing mode in the document editor.  
         * 
         * @note In case this setting is changed in the editor interface, it will be stored in the browser local storage and will overwrite any values sent as the `editorConfig.customization.reviewDisplay` parameter.
         * @deprecated Starting from version 7.0, please use the `review.reviewDisplay` parameter instead.
         *
         * @defaultValue `original` for viewer and `markup` for editor
         * @example "markup"
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#reviewdisplay
         */
        reviewDisplay: "markup" | "simple" | "final" | "original";

        /**
         * Defines if the **spell checker** is automatically switched on or off when the editor is loaded.  
         * Spell checker will only be available for the **document editor** and the **presentation editor**.
         * 
         * @note In case this setting is changed in the editor interface, it will be stored in the browser local storage and will overwrite any values sent as the `editorConfig.customization.spellcheck` parameter.
         * @deprecated Starting from version 7.1, please use the `features.spellcheck` parameter instead.
         *
         * @default true
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#spellcheck
         */
        spellcheck: boolean;

        /**
         * Defines the use of functionality only compatible with the **OOXML format**.  
         * For example, do not use comments on the entire document.
         *
         * @default false
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#compatiblefeatures
         */
        compatibleFeatures: boolean;

        /**
         * Defines the **measurement units** used on the ruler and in dialog boxes.  
         * Can take the following values:
         * - `cm` - centimeters;
         * - `pt` - points;
         * - `inch` - inches.
         *
         * @note In case this setting is changed in the editor interface, it will be stored in the browser local storage and will overwrite any values sent as the `editorConfig.customization.unit` parameter.
         *
         * @default "cm"
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#unit
         */
        unit: "cm" | "pt" | "inch";

        /**
         * Defines the **hint** that describes the event after mentions in a comment.  
         * - If `true`, a hint indicates that the user will receive a notification and access to the document.  
         * - If `false`, a hint indicates that the user will receive only a notification of the mention.
         *
         * @note It will only be available for the comments if the `onRequestSendNotify` event is set.
        *
            * @default true
            * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#mentionshare
            */
        mentionShare: boolean;

        /**
         * Defines if **document macros** will be automatically run when the editor opens.  
         *
         * @note
         * - Before version 9.0.3: the `false` value disables the automatic startup of macros and hides the macros settings from the user.  
         * - Since version 9.0.3: the `false` value completely disables macros — they cannot be run, added, or edited. The Macros button is also hidden from the View tab.
         *
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#macros
         */
        macros: boolean;

        /**
         * Defines if **plugins** will be launched and available.
         *
         * @default true
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#plugins
         */
        plugins: boolean;

        /**
         * Defines the **macros run mode** when autostart is enabled.  
         * Can take the following values:  
         * - `disable` - don't run macros at all;  
         * - `warn` - warn about macros and ask permission to run them;  
         * - `enable` - run all macros automatically.
         *
         * @note In case this setting is changed in the editor interface, it will be stored in the browser local storage and will overwrite any values sent as the `editorConfig.customization.macrosMode` parameter.  
         * This parameter is also available for the mobile editors.
         *
         * @default "warn"
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#macrosmode
         */
        macrosMode: "disable" | "warn" | "enable";

        /**
         * Defines if the document is opened in the **review editing mode** (`true`) or not (`false`)  
         * regardless of the `document.permissions.review` parameter (the review mode is changed only for the current user).  
         * If the parameter is `undefined`, the `document.permissions.review` value is used (for all the document users).
         *
         * @deprecated Starting from version 7.0, please use the `review.trackChanges` parameter instead.
         *
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#trackchanges
         */
        trackChanges: boolean;

        /**
         * Defines if the **editor rulers** are displayed or hidden.  
         * This parameter is available for the **Document Editor** and **Presentation Editor**.
         *
         * @defaultValue `false` for the document editor, `true` for presentations.
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#hiderulers
         */
        hideRulers: boolean;

        /**
         * Defines if the **note panel** is displayed or hidden on first loading.  
         * This parameter is available for the **Presentation Editor only**.
         *
         * @note In case this setting is changed in the editor interface, it will be stored in the browser local storage and will overwrite any values sent as the `editorConfig.customization.hideNotes` parameter.
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#hidenotes
         */
        hideNotes: boolean;

        /**
         * Defines the **editor theme settings**. It can be set in two ways:
         * - **theme id** - the user sets the theme parameter by its id (`theme-light`, `theme-classic-light`, `theme-dark`, `theme-contrast-dark`, `theme-white`, `theme-night`);
         * - **default theme** - the default dark or light theme value will be set (`default-dark`, `default-light`).  
         *   The default light theme is `theme-classic-light`. The first option has higher priority.
         *
         * @note Apart from the available editor themes, the user can also customize their own color themes for the application interface.  
         * @note In case this setting is changed in the editor interface, it will be stored in the browser local storage and will overwrite any values sent as the `editorConfig.customization.uiTheme` parameter.
         *
         * @example "theme-dark"
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#uitheme
         */
        uiTheme: EditorTheme | "default-dark" | "default-light";

        /**
         * Defines the **mode of embedding editors into the web page**.  
         * - The `embed` value disables scrolling to the editor frame when it is loaded, as the focus is not captured.
         *
         * @example "embed"
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#integrationmode
         */
        integrationMode: string;

        /**
         * Defines the **pointer mode** (`select` or `hand`) when the presentation editor is loaded in the viewer.
         *
         * @default "select"
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#pointermode
         */
        pointerMode: "select" | "hand";

        /**
         * Defines the **mobile document editor settings**.
         *
         * @note This parameter is also available for the mobile editors.
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#mobile
         */
        mobile: {
            /**
             * Defines whether the **view mode** is enabled on launch in the mobile document editor.
             *
             * @default true
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#mobileforceview
             */
            forceView: boolean;

            /**
             * Defines whether the **Document Info** button is displayed or hidden in the mobile document editor.
             *
             * @default false
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#mobileinfo
             */
            info: boolean;

            /**
             * Defines whether the editor will be opened in **Standard view** instead of **Mobile view**.
             *
             * @default false
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#mobilestandardview
             */
            standardView: boolean;

            //TODO: Not in the documentation
            /**
             * Hide or show UI option to switch editor in **Desktop** type.
             * @default false
             */
            disableForceDesktop: boolean;

            /**
             * Defines the **Complete & Submit** button settings.  
             * Starting from version 8.3. 
             * If this parameter is a boolean value, then it specifies whether the **Complete & Submit** button will be displayed or hidden on the top toolbar.  
             * Button will only be available for the **PDF** format.
             *
             * @default true
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#submitform
             */
            submitForm: {
                /**
                 * Defines whether the **Complete & Submit** button will be displayed or hidden on the top toolbar.  
                 * Button will only be available for the **PDF** format.
                 *
                 * @default true
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#submitformvisible
                 */
                visible: boolean;

                /**
                 * Defines a message displayed after forms are submitted.  
                 * The following values are available:
                 * - `""` - the message will not be displayed;
                 * - `null` / `undefined` - the default message will be displayed;
                 * - `"text"` - any text that the user specifies will be displayed.
                 *
                 * @example "text"
                 * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#submitformresultmessage
                 */
                resultMessage: "text" | "" | null | undefined;
            } | boolean;

            /**
             * Defines if the **Western** (`true`) or **Chinese** (`false`) font size is used in the Chinese (Simplified) UI.
             *
             * @default false
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#forcewesternfontsize
             */
            forceWesternFontSize: boolean;

            /**
             * Defines the background color for the slide show in the **Presentation Editor**.  
             * Can be represented in the HEX, RGB, or RGBA formats. For example, `#ff0000`, `rgb(255, 0, 0)`, `rgba(255, 0, 0, 0.5)`.
             * Starting from version 8.3,
             *
             * @default "#000000"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#slideplayerbackground
             */
            slidePlayerBackground: string;

            /**
             * Defines the HEX color for the default heading styles in the document editor.
             * Starting from version 8.3
             *
             * @default "#00ff00"
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#wordheadingscolor
             */
            wordHeadingsColor: string;

            /**
             * Defines if the **vertical scroll** is automatically displayed or hidden when the **Spreadsheet Editor** is loaded.
             * Starting from version 8.3
             *
             * @default true
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#showverticalscroll
             */
            showVerticalScroll: boolean;

            /**
             * Defines if the **horizontal scroll** is automatically displayed or hidden when the **Spreadsheet Editor** is loaded.
             * Starting from version 8.3
             *
             * @default true
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#showhorizontalscroll
             */
            showHorizontalScroll: boolean;

            // TODO: Not in the documentation
            startFillingForm: {
                /**
                 * Caption of the start filling button, used for **PDF Forms**
                 * @default "Share & collect"
                 */
                text: string;
            }

            /**
             * Defines whether the **Suggest a Feature** menu button will be displayed or hidden.
             *
             * @default true
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/customization/customization-standard-branding/#suggestfeature
             */
            suggestFeature: boolean;
        };
    };

    /**
     * Defines the **co-editing mode** (Fast or Strict) and the possibility to change it.  
     * This parameter is used to apply the co-editing and viewing modes.
     *
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#coediting
     */
    coEditing: {
        /**
         * The co-editing mode.
         * If `fast` and `customization.autosave` = false → set `customization.autosave` = true.  
         * @note In case **mode** setting is changed in the editor interface, it will be stored in the browser local storage and will overwrite any values sent as the `editorConfig.coEditing.mode` parameter.
         *
         * @default 'fast'
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#coeditingmode
         */
        mode: 'fast' | 'strict';

        /**
         * Defines if the co-editing mode can be changed in the editor interface or not.
         *
         * @defaultValue `true` - for editor, `false` - for viewer
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/#coeditingchange
         */
        change: boolean;
    };

    /**
     * The **plugins** section allows to connect the special add-ons to your ONLYOFFICE Docs installation
     * which will help you add additional features to document editors.
     */
    plugins: {
        /**
         * Defines the array of the identifiers (as entered in `config.json`) for the plugins,  
         * which will automatically start when the editor opens, and the order the plugins will run one-by-one.
         *
         * @example ["asc.{7327FC95-16DA-41D9-9AF2-0E7F449F6800}"]
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/plugins/#autostart
         */
        autostart: string[];

        /**
         * Defines an object which allows configuring plugins from an external source.  
         * The settings can be set for all plugins or for a specific plugin.  
         * For example, this object can be used to pass an authorization token to the plugin.  
         * You can also use the `SetPluginsOptions` method of the Automation API to pass the options object to the plugin.
         *
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/plugins/#options
         */
        options: {
            /**
             * Defines the parameters which will be set for all plugins.
             *
             * @example { "keyAll": "valueAll" }
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/plugins/#options
             */
            all: object;

            /**
             * Defines the parameters which will be set for a specific plugin.  
             * The plugin must be specified with the plugin GUID of the `asc.{UUID}` type.
             *
             * @example { "asc.{38E022EA-AD92-45FC-B22B-49DF39746DB4}": { "keyYoutube": "valueYoutube" } }
             * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/plugins/#optionspluginguid
             */
            pluginGuid: object;
        };

        /**
         * Defines the array of absolute URLs to the plugin configuration files (`config.json`).
         *
         * @example ["helloworld/config.json", "chess/config.json"]
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/plugins/#pluginsdata
         */
        pluginsData: string[];

        /**
         * Defines the absolute URL to the directory where the plugins are stored.  
         *
         * @deprecated Since version 4.3. Please use the absolute URLs in `pluginsData` field instead.
         * @example "https://example.com/plugins/"
         * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/plugins/#url
         */
        url: string;
    };

    // TODO: Not in the documentation
    /**
     * The **wopi** section is used only for WOPI.
     */
    wopi?: {
        /**
         * Defines the maximum filename length for the rename.  
         *
         * @default 250
         */
        FileNameMaxLength: number;
    };
}

interface EditorConfigEmbedded extends EditorConfigBase {
    // TODO: Not in the documentation
    /**
     * Defines the action for application autostart.
     * - For documents: `"document"`.
     * - For presentations: default is `"player"`.
     */
    autostart: "document" | "player";

    /**
     * Settings for embedding the editor.
     */
    embedded: {
        // TODO: Not in the documentation
        embedUrl: string;
        fullscreenUrl: string;
        saveUrl: string;
        shareUrl: string;
        toolbarDocked: "top" | "bottom";
    };
}


interface EventsBase {
    /**
     * The function called when the application is fully loaded into the browser.
     *
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onappready
     */
    onAppReady: () => void;

    /**
     * The function called when the document is loaded into the document editor.
     * 
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#ondocumentready
     */
    onDocumentReady: () => void;

    /**
     * The function called when an **error** or some other specific event occurs.
     *
     * @param event
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onerror
     */
    onError: (event: ErrorEvent) => void;

    /**
     * The function called when a **warning** occurs.
     *
     * @param event
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onwarning
     */
    onWarning: (event: WarningEvent) => void;
}

interface EventsNormal extends EventsBase {
    /**
     * The function called when the document is modified.
     * 
     * @param event
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#ondocumentstatechange
     */
    onDocumentStateChange: (event: DocumentStateChangeEvent) => void;

    /**
     * The function called when the user is trying to switch the document from the viewing into the editing mode by clicking the **Edit current file** button.
     * This event also fires when the user clicks the **Edit PDF** button in forms that are open in the view or **fillForms** mode.
     * If the method is not declared, the **Edit current file** and **Edit PDF** buttons will not be displayed.
     *
     * @note When the function is called, the editor must be initialized again, in editing mode. 
     * @note This parameter is obligatory when the `editorConfig.mode` parameter is set to `view` and the permission to edit the document (`document.permissions`) is `true`.
     * 
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequesteditrights
     */
    onRequestEditRights: () => void;

    /**
     * The function called when the user is trying to show the document **version history** by clicking the **Version History** button.
     *
     * @note To show the document version history you must call the `refreshHistory` method.  
     * @note If this method and the `onRequestHistoryData` method are not declared, the **Version History** button will not be displayed.
     * 
     * @example
     * ```
     * function onRequestHistory() {
     *   docEditor.refreshHistory({
     *     currentVersion: 2,
     *     history: [
     *       {
     *         created: "2010-07-06 10:13 AM",
     *         key: "af86C7e71Ca8",
     *         user: {
     *           id: "F89d8069ba2b",
     *           name: "Kate Cage",
     *         },
     *         version: 1,
     *       },
     *       {
     *         changes,
     *         created: "2010-07-07 3:46 PM",
     *         key: "Khirz6zTPdfd7",
     *         serverVersion,
     *         user: {
     *           id: "78e1e841",
     *           name: "John Smith",
     *         },
     *         version: 2,
     *       },
     *     ],
     *   })
     * }
     * ```
     * 
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequesthistory
     */
    onRequestHistory: () => void;


    /**
     * The function called when the user is trying to click a specific document version in the **document version history**.
     * 
     * @param event
     * @note To show the changes corresponding to the specific document version, you must call the `setHistoryData` method. When calling this method, the `token` must be added to validate the parameters. If this method and the `onRequestHistory` method are not declared, the **Version History** button will not be displayed.
     *
     * @example
     * ```
     * function onRequestHistoryData(event) {
     *   const version = event.data
     *   docEditor.setHistoryData({
     *     changesUrl: "https://example.com/url-to-changes.zip",
     *     fileType: "docx",
     *     key: "Khirz6zTPdfd7",
     *     previous: {
     *       fileType: "docx",
     *       key: "af86C7e71Ca8",
     *       url: "https://example.com/url-to-the-previous-version-of-the-document.docx",
     *     },
     *     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaGFuZ2VzVXJsIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS91cmwtdG8tY2hhbmdlcy56aXAiLCJmaWxlVHlwZSI6ImRvY3giLCJrZXkiOiJLaGlyejZ6VFBkZmQ3IiwicHJldmlvdXMiOnsiZmlsZVR5cGUiOiJkb2N4Iiwia2V5IjoiYWY4NkM3ZTcxQ2E4IiwidXJsIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS91cmwtdG8tdGhlLXByZXZpb3VzLXZlcnNpb24tb2YtdGhlLWRvY3VtZW50LmRvY3gifSwidXJsIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS91cmwtdG8tZXhhbXBsZS1kb2N1bWVudC5kb2N4In0.pfPJs9XvCmAnPiUnZYRm0rZGPYHzqfEP7AFRjKg1af4",
     *     url: "https://example.com/url-to-example-document.docx",
     *     version,
     *   })
     * }
     * ```
     * 
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequesthistorydata
     */
    onRequestHistoryData: (event: RequestHistoryDataEvent) => void;


    /**
     * The function called when the user is trying to **restore the file version** by clicking the Restore button in the version history.
     *
     * @param event
     * 
     * @note When the function is called, you must call the `refreshHistory` method to initialize version history again.  
     * If this method is not declared, the **Restore** button will not be displayed.
     *
     * @note The Restore button is displayed for the previous document versions only and hidden for the current one.  
     * Until version 5.5, the Restore button is only available if the `document.permissions.changeHistory` is set to true.
     *
     * @example
     * ```
     * function onRequestRestore(event) {
     *   const fileType = event.data.fileType
     *   const url = event.data.url
     *   const version = event.data.version
     *
     *   docEditor.refreshHistory({
     *     currentVersion: 2,
     *     history: [
     *       {
     *         created: "2010-07-06 10:13 AM",
     *         key: "af86C7e71Ca8",
     *         user: {
     *           id: "F89d8069ba2b",
     *           name: "Kate Cage",
     *         },
     *         version: 1,
     *       },
     *       {
     *         changes,
     *         created: "2010-07-07 3:46 PM",
     *         key: "Khirz6zTPdfd7",
     *         serverVersion,
     *         user: {
     *           id: "78e1e841",
     *           name: "John Smith",
     *         },
     *         version: 2,
     *       },
     *     ],
     *   })
     * }
     * ```
     * 
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequestrestore
     */
    onRequestRestore: (event: RequestRestoreEvent) => void;

    /**
     * The function called when the user is trying to go back to the document from viewing the **document version history** by clicking the Close History button.
     *
     * @note When the function is called, the editor must be initialized again, in editing mode.  
     * If this method is not declared, the **Close History** button will not be displayed.
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequesthistoryclose
     */
    onRequestHistoryClose: () => void;

    /**
     * The function called when the application **opened the file**.
     *
     * @param event
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#oninfo
     */
    onInfo: (event: InfoEvent) => void;

    /**
     * The function called after the error is shown, when the document is opened for editing with the **old document.key value**.  
     * This key was used to edit the previous document version and was successfully saved.  
     * When this event is called, the editor must be reinitialized with a new `document.key`.
     *
     * @deprecated Starting from version 8.3, please use `onRequestRefreshFile` instead.
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onoutdatedversion
     */
    onOutdatedVersion: () => void;

    /**
     * The function called with the **absolute URL** to the edited file when the `downloadAs` method is being called.  
     * 
     * @param event
     * @example
     * ```
     * function onDownloadAs(event) {
     *   const fileType = event.data.fileType
     *   const url = event.data.url
     *   console.log(`ONLYOFFICE Document Editor create file: ${url}`)
     * }
     * ```
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#ondownloadas
     */
    onDownloadAs: (event: DownloadAsEvent) => void;

    /**
     * The function called when the user is trying to **save file** by clicking **Save Copy as...** button.  
     * 
     * @param event
     * @note If the method is not declared, the **Save Copy as...** button will not be displayed.
     *
     * @example
     * ```
     * function onRequestSaveAs(event) {
     *   const fileType = event.data.fileType
     *   const title = event.data.title
     *   const url = event.data.url
     * }
     * ```
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequestsaveas
     */
    onRequestSaveAs: (event: RequestSaveAsEvent) => void;

    /**
     * The function called when the document is co-edited by the other user in the strict co-editing mode.
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#oncollaborativechanges
     */
    onCollaborativeChanges: () => void;        

    /**
     * The function called when the user is trying to rename the file by clicking the **Rename... button**.
     *
     * @param event
     * @note Until version 6.0, the **Rename... button** is only available if the `document.permissions.rename` is set to `true`.
     *
     * @example
     * ```
     * function onRequestRename(event) {
     *   const title = event.data
     * }
     * ```
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequestrename
     */
    onRequestRename: (event: RequestRenameEvent) => void;

    /**
     * The function called when the **meta information of the document** is changed via the `meta` command.
     *
     * @param event
     * @note When the user clicks the Favorite icon, the `setFavorite` method is called to update the information about the Favorite icon highlighting state.  
     * If the method is not declared, the Favorite icon will not be changed.
     *
     * @example
     * ```
     * function onMetaChange(event) {
     *   const title = event.data.title
     *   const favorite = event.data.favorite
     * }
     * ```
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onmetachange
     */
    onMetaChange: (event: MetaChangeEvent) => void;

    /**
     * The function called when the user is trying to **end the work with the editor and close it** by clicking the cross button.
     *
     * @note If the method is not declared, the `editorConfig.customization.close` parameter will not be available, and the cross button will not be displayed.
     *
     * @example
     * ```
     * function onRequestClose() {
     *   if (window.opener) {
     *     window.close()
     *     return
     *   }
     *   docEditor.destroyEditor()
     * }
     * ```
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequestclose
     */
    onRequestClose: () => void;

    /**
     * The function called when the user is trying to **get a link for opening the document** which contains a bookmark, scrolling to the bookmark position.
     *
     * @param event
     * @note To set the bookmark link, you must call the `setActionLink` method. The bookmark data is received in the `data` parameter and must be then used in the configuration as the value for the `editorConfig.actionLink` parameter. 
     * @note If the method is not declared, the **Get Link** button will not be displayed.
     *
     * @example
     * ```
     * function onMakeActionLink(event) {
     *   const ACTION_DATA = event.data
     *   const link = GENERATE_LINK(ACTION_DATA)
     *   docEditor.setActionLink(link)
     * }
     * ```
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onmakeactionlink
     */
    onMakeActionLink: (event: { data: any }) => void;

    /**
     * The function called when the user can **select other users to mention in comments**, grant access rights to edit specific sheet ranges, or set the user avatars.
     *
     * @param event
     * @note To set a list of users, you must call the `setUsers` method which can take different lists of users depending on the specified operation type. The `onRequestUsers` event is called once for each `c` type when the corresponding operation is performed. If `setUsers` is called with an empty list, then the `onRequestUsers` event will fire again.
     *
     * @example
     * ```
     * function onRequestUsers(event) {
     *   const c = event.data.c
     *   const id = event.data.id
     *
     *   docEditor.setUsers({
     *     c: event.data.c,
     *     users: [
     *       {
     *         email: "john@example.com",
     *         id: "78e1e841",
     *         image: "https://example.com/url-to-user-avatar1.png",
     *         name: "John Smith",
     *       },
     *       {
     *         email: "kate@example.com",
     *         id: "F89d8069ba2b",
     *         image: "https://example.com/url-to-user-avatar2.png",
     *         name: "Kate Cage",
     *       },
     *     ],
     *   })
     * }
     * ```
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequestusers
     */
    onRequestUsers: (event: RequestUsersEvent) => void;

    /**
     * The function called when the user is **mentioned in a comment**.
     *
     * @param event
     * @note The list of users to be mentioned should be completed by the `setUsers` method.
     * @note In version 5.4, `onRequestSendNotify` event can only be used if `onRequestUsers` event is set. Starting from version 5.5, there is no such dependency between `onRequestSendNotify` and `onRequestUsers` - both can be set independently.
     * @example
     * ```
     * function onRequestSendNotify(event) {
     *   const ACTION_DATA = event.data.actionLink
     *   const comment = event.data.message
     *   const emails = event.data.emails
     * }
     * ```
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequestsendnotify
     */
    onRequestSendNotify: (event: RequestSendNotifyEvent) => void;


    /**
     * The function called when the user is trying to insert an image by clicking the **Image from Storage** button.
     *
     * @param event
     * @note To insert an image into the file, you must call the `insertImage` method with the specified command. When calling this method, the `token` must be added to validate the parameters. If the method is not declared, the Image from Storage button will not be displayed.
     * @example
     * ```
     * function onRequestInsertImage(event) {
     *   docEditor.insertImage({
     *     c: event.data.c,
     *     images: [
     *       {
     *         fileType: "png",
     *         url: "https://example.com/url-to-example-image1.png",
     *       },
     *       {
     *         fileType: "png",
     *         url: "https://example.com/url-to-example-image2.png",
     *       },
     *     ],
     *     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbWFnZXMiOlt7ImZpbGVUeXBlIjoicG5nIiwidXJsIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS91cmwtdG8tZXhhbXBsZS1pbWFnZTEucG5nIn0seyJmaWxlVHlwZSI6InBuZyIsInVybCI6Imh0dHBzOi8vZXhhbXBsZS5jb20vdXJsLXRvLWV4YW1wbGUtaW1hZ2UyLnBuZyJ9XX0.ly1O8-6u4Y7WJlgp9O-bJMeffHe0GtaXzyvY2UUFJTg",
     *   })
     * }
     * ```
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequestinsertimage
     */
    onRequestInsertImage: (event: RequestInsertImageEvent) => void;

    /**
     * The function called when the user is trying to **select a document for comparing** by clicking the Document from Storage button.
     *
     * @note This event is available only for **ONLYOFFICE Docs Enterprise** and **ONLYOFFICE Docs Developer**.
     * @deprecated Starting from version 7.5, please use `onRequestSelectDocument` instead.
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequestcomparefile
     */
    onRequestCompareFile: () => void;

    /**
     * The function called when the user is trying to manage document access rights by clicking the **Change access rights** button.
     *
     * @note When the access rights are changed, you must call the `setSharingSettings` method to update the settings.  
     * If this method is not declared, the Change access rights button will not be displayed.
     *
     * @example
     * ```
     * function onRequestSharingSettings() {
     *   docEditor.setSharingSettings({
     *     sharingSettings: [
     *       {
     *         permissions: "Full Access",
     *         user: "John Smith",
     *       },
     *       {
     *         isLink: true,
     *         permissions: "Read Only",
     *         user: "External link",
     *       },
     *     ],
     *   })
     * }
     * ```
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequestsharingsettings
     */
    onRequestSharingSettings: () => void;

    /**
     * The function called when the user is trying to create a new document by clicking the **Create New** button.
     *
     * @note This method is used instead of the `createUrl` field.  
     * If this method is not declared and `createUrl` is not specified, the Create New button will not be displayed.
     *
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequestcreatenew
     */
    onRequestCreateNew: () => void;

    /**
     * The function called when the user is trying to refresh data inserted from an external file by clicking the **Update values** button in the **External links** dialog box of the **Data** tab.
     *
     * @param event
     * @note To refresh data, you must call the `setReferenceData` method. The token must be added to validate the parameters.  
     * If this event is not declared, the **Paste link** and **Update values** buttons will not be displayed.  
     * This event also fires when the user runs the `IMPORTRANGE` function.
     * @note To send the data to the `setReferenceData` method, it is recommended to search for the file by the `referenceData` parameter first. 
     * If there is no such a field or a file cannot be found, then the `path` or `link` parameters are used.
     *
     * @example
     * ```
     * function onRequestReferenceData(event) {
     *   const link = event.data.link
     *   const referenceData = event.data.referenceData
     *   const path = event.data.path
     *
     *   docEditor.setReferenceData({
     *     fileType: "xlsx",
     *     key: "Khirz6zTPdfd7",
     *     path: "sample.xlsx",
     *     referenceData: {
     *       fileKey: "BCFA2CED",
     *       instanceId: "https://example.com",
     *     },
     *     token: "TOKEN_HERE",
     *     url: "https://example.com/url-to-example-document.xlsx",
     *   })
     * }
     * ```
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequestreferencedata
     */
    onRequestReferenceData: (event: RequestReferenceDataEvent) => void;

    /**
     * The function called when the user is trying to open an external link by clicking the **Open source** button.
     *
     * @param event
     *
     * @note If the method is not declared, the Open source button will not be displayed.
     * @note To open the editor with the external file referenced by the `path` or `referenceData` parameters in a new tab, you must pass a link to this tab by calling the `window.open` method with the `path` and `windowName` parameters.
     *
     * @example
     * ```
     * function onRequestOpen(event) {
     *   const path = event.data.path
     *   const referenceData = event.data.referenceData
     *   const windowName = event.data.windowName
     *   window.open({
     *     path: "https://example.com/external-url.docx",
     *     windowName: event.data.windowName,
     *   })
     * }
     * ```
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequestopen
     */
    onRequestOpen: (event: RequestOpenEvent) => void;


    /**
     * The function called when the user is trying to select a document for comparing, combining, or inserting text.
     *
     * @param event
     * @note To select a document for comparing, combining, or inserting text, you must call the `setRequestedDocument` method.
     *
     * @example
     * ```
     * function onRequestSelectDocument(event) {
     *   docEditor.setRequestedDocument({
     *     c: event.data.c,
     *     fileType: "docx",
     *     url: "https://example.com/url-to-example-document.docx",
     *     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *   })
     * }
     * ```
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequestselectdocument
     */
    onRequestSelectDocument: (event: RequestSelectDocumentEvent) => void;

    /**
     * The function called when the user is trying to select recipients data by clicking the `Mail merge` button.
     *
     * @param event
     * @note To select recipient data, you must call the `setRequestedSpreadsheet` method. When calling this method, the token must be added to validate the parameters. 
     * @note If the method is not declared, the `Mail merge` button will become faded and unclickable.
     *
     * @example
     * ```
     * function onRequestSelectSpreadsheet(event) {
     *   docEditor.setRequestedSpreadsheet({
     *     c: event.data.c,
     *     fileType: "xlsx",
     *     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *     url: "https://example.com/url-to-example-recipients.xlsx",
     *   })
     * }
     * ```
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequestselectspreadsheet
     */
    onRequestSelectSpreadsheet: (event: RequestSelectSpreadsheetEvent) => void;

    /**
     * The function called when the user is trying to change a source of the external data by clicking the **Change source** button.
     *
     * @param event
     *
     * @note When the button is clicked, you must call the `setReferenceSource` method to change a source of the external data. When calling this method, the token must be added to validate the parameters. 
     * @note To send the data to the `setReferenceSource` method, it is recommended to search for the file by the referenceData parameter first. If there is no such a field or a file cannot be found, then the path parameter is used.
     * @note If the event is not declared, the Change source button will not be displayed.
     *
     * @example
     * ```
     * function onRequestReferenceSource(event) {
     *   const referenceData = event.data.referenceData
     *   const path = event.data.path
     *
     *   docEditor.setReferenceSource({
     *     fileType: "xlsx",
     *     key: "Khirz6zTPdfd7",
     *     path: "sample.xlsx",
     *     referenceData: {
     *       fileKey: "BCFA2CED",
     *       instanceId: "https://example.com",
     *     },
     *     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *     url: "https://example.com/url-to-example-document.xlsx",
     *   })
     * }
     * ```
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequestreferencesource
     */
    onRequestReferenceSource: (event: RequestReferenceSourceEvent) => void;

    // TODO: Not in the documentation
    /**
     * The function called when save document from binary.
     */
    onSaveDocument: () => void;

    /**
     * The function called when the user is trying to start filling out ready forms by clicking the **Start filling** button in PDF editing mode.
     *
     * @note If the event is not declared, the **Start filling** button will not be displayed.
     * @note When the user clicks the **Start filling** button, the `startFilling` method is called to lock PDF editing (only PDF viewing becomes available).
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequeststartfilling
     */
    onRequestStartFilling: () => void;

    /**
     * The function called when the force saving request of the 3 `forcesavetype` is successfully performed, i.e., when the **Complete & Submit** button is clicked and the form is submitted.
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onsubmit
     */
    onSubmit: () => void;

    /**
     * The function called instead of the `onOutdatedVersion` event in the following cases:
     * - When the editor is opened with a key that was already used to successfully save a file.
     * - When the editor reconnects to the server after losing the connection and interrupting the editing session.
     *
     * @note In these cases, the `refreshFile` method is called and the file version is updated without reloading the editor.
     *
     * @example
     * ```
     * function onRequestRefreshFile() {
     *   refreshFile({
     *     document: {
     *       fileType: "docx",
     *       key: "Khirz6zTPdfd7",
     *       title: "Example Document Title.docx",
     *       url: "https://example.com/url-to-example-document.docx",
     *     },
     *     documentType: "word",
     *     editorConfig: {
     *       callbackUrl: "https://example.com/url-to-callback.ashx",
     *     },
     *     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *   })
     * }
     * ```
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onrequestrefreshfile
     */
    onRequestRefreshFile: () => void;

    /**
     * The function called when a user action is required to open a document in the following cases:
     * - When the user needs to enter a password to open a protected document.
     * - When the user needs to select an encoding for a TXT file.
     * - When the user needs to select an encoding and a delimiter for a CSV file.
     *
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/#onuseractionrequired
     */
    onUserActionRequired: () => void;

    // TODO: Not in the documentation
    /**
     * The function called to request the filling status for the current role in PDF form filling mode.
     */
    onRequestFillingStatus: () => void;

    // TODO: Not in the documentation
    /**
     * The function called when the user can start filling the PDF form.
     */
    onStartFilling: () => void;
}

interface EventsEmbedded extends EventsBase {
    // TODO: Not in the documentation
    /**
     * The function called when the user navigates back to the folder.
     */
    onBack: () => void;
}


interface BaseConfig {
    /**
     * Defines the platform type used to access the document.
     * @default "desktop"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/#type
     */
    type: "desktop" | "mobile" | "embedded";

    /**
     * Defines the document width in the browser window.
     * @default "100%"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/#width
     */
    width: string;

    /**
     * Defines the document height in the browser window.
     * @default "100%"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/#height
     */
    height: string;

    /** 
     * Defines the document type to be opened.
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/#documenttype
     */
    documentType: DocumentType;
}

export interface ConfigNormal extends BaseConfig {
    /**
     * Defines the encrypted signature added to the ONLYOFFICE Docs config in the form of a token.
     * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.LwimMJA3puF3ioGeS-tfczR3370GXBZMIL-bdpu4hOU"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/#token
     */
    token: string;

    /**
     * The document section allows to change all the parameters pertaining to the document (title, url, file type, etc.).
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/
     */
    document: DocumentNormal;

    /**
     * The editorConfig section allows to change the parameters pertaining to the editor interface: opening mode (viewer or editor), interface language, additional buttons, etc.
     */
    editorConfig: EditorConfigNormal;
    
    /**
     * The events section allows to change all the functions pertaining to the events.
     * 
     * @example
     * ```ts
     * function onAppReady() {
     *   console.log("ONLYOFFICE Document Editor is ready");
     * }
     *
     * const config = {
     *   events: {
     *     onAppReady,
     *   },
     * };
     *
     * const docEditor = new DocsAPI.DocEditor("placeholder", config);
     * ```
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/
     */
    events: EventsNormal;
}

export interface ConfigEmbedded extends BaseConfig {
    /**
     * Defines the platform type used to access the document.
     * @default "embedded"
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/#type
     */
    type: 'embedded';

    /**
     * The document section allows to change all the parameters pertaining to the document (title, url, file type, etc.).
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/document/
     */
    document: DocumentEmbedded;

    /**
     * The editorConfig section allows to change the parameters pertaining to the editor interface: opening mode (viewer or editor), interface language, additional buttons, etc.
     */
    editorConfig: EditorConfigEmbedded;
    
    /**
     * The events section allows to change all the functions pertaining to the events.
     * 
     * @example
     * ```ts
     * function onAppReady() {
     *   console.log("ONLYOFFICE Document Editor is ready");
     * }
     *
     * const config = {
     *   events: {
     *     onAppReady,
     *   },
     * };
     *
     * const docEditor = new DocsAPI.DocEditor("placeholder", config);
     * ```
     * @see https://api.onlyoffice.com/docs/docs-api/usage-api/config/events/
     */
    events: EventsEmbedded;
}