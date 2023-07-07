/**
 * Copyright (c) Ascensio System SIA 2013. All rights reserved
 *
 * http://www.onlyoffice.com
 */

;(function(DocsAPI, window, document, undefined) {

    /*

        # Full #

        config = {
            type: 'desktop or mobile or embedded',
            width: '100% by default',
            height: '100% by default',
            documentType: 'word' | 'cell' | 'slide',// deprecate 'text' | 'spreadsheet' | 'presentation',
            token: <string> encrypted signature
            document: {
                title: 'document title',
                url: 'document url'
                fileType: 'document file type',
                options: <advanced options>,
                key: 'key',
                vkey: 'vkey',
                referenceData: 'data for external paste',
                info: {
                    owner: 'owner name',
                    folder: 'path to document',
                    uploaded: '<uploaded date>',
                    sharingSettings: [
                        {
                            user: 'user name',
                            permissions: '<permissions>',
                            isLink: false
                        },
                        ...
                    ],
                    favorite: '<file is favorite>' // true/false/undefined (undefined - don't show fav. button)
                },
                permissions: {
                    edit: <can edit>, // default = true
                    download: <can download>, // default = true
                    reader: <can view in readable mode>,
                    review: <can review>, // default = edit
                    print: <can print>, // default = true
                    comment: <can comment in view mode> // default = edit,
                    modifyFilter: <can add, remove and save filter in the spreadsheet> // default = true
                    modifyContentControl: <can modify content controls in documenteditor> // default = true
                    fillForms:  <can edit forms in view mode> // default = edit || review,
                    copy: <can copy data> // default = true,
                    editCommentAuthorOnly: <can edit your own comments only> // default = false
                    deleteCommentAuthorOnly: <can delete your own comments only> // default = false,
                    reviewGroups: ["Group1", ""] // current user can accept/reject review changes made by users from Group1 and users without a group. [] - use groups, but can't change any group's changes
                    commentGroups: { // {} - use groups, but can't view/edit/delete any group's comments
                         view: ["Group1", ""] // current user can view comments made by users from Group1 and users without a group.
                         edit: ["Group1", ""] // current user can edit comments made by users from Group1 and users without a group.
                         remove: ["Group1", ""] // current user can remove comments made by users from Group1 and users without a group.
                    },
                    userInfoGroups: ["Group1", ""], // show tooltips/cursors/info in header only for users in userInfoGroups groups. [""] - means users without group, [] - don't show any users, null/undefined/"" - show all users
                    protect: <can protect document> // default = true. show/hide protect tab or protect buttons
                }
            },
            editorConfig: {
                actionLink: { // open file and scroll to data, used with onMakeActionLink or the onRequestSendNotify event
                    action: {
                        type: "bookmark", // or type="comment"
                        data: <bookmark name> // or comment id
                    }
                },
                mode: 'view or edit',
                lang: <language code>,
                location: <location>,
                canCoAuthoring: <can coauthoring documents>,
                canBackToFolder: <can return to folder> - deprecated. use "customization.goback" parameter,
                createUrl: 'create document url', 
                sharingSettingsUrl: 'document sharing settings url',
                fileChoiceUrl: 'source url', // for mail merge or image from storage
                callbackUrl: <url for connection between sdk and portal>,
                mergeFolderUrl: 'folder for saving merged file', // must be deprecated, use saveAsUrl instead
                saveAsUrl: 'folder for saving files'
                licenseUrl: <url for license>,
                customerId: <customer id>,
                region: <regional settings> // can be 'en-us' or lang code

                user: {
                    id: 'user id',
                    name: 'user name',
                    group: 'group name' // for customization.reviewPermissions or permissions.reviewGroups or permissions.commentGroups. Can be multiple groups separated by commas (,) : 'Group1' or 'Group1,Group2'
                },
                recent: [
                    {
                        title: 'document title',
                        url: 'document url',
                        folder: 'path to document',
                    },
                    ...
                ],
                templates: [
                    {
                        title: 'template name', // name - is deprecated
                        image: 'template icon url',
                        url: 'http://...'
                    },
                    ...
                ],
                customization: {
                    logo: {
                        image: url,
                        imageDark: url, // logo for dark theme
                        imageEmbedded: url, // deprecated, use image instead
                        url: http://...
                    },
                    customer: {
                        name: 'SuperPuper',
                        address: 'New-York, 125f-25',
                        mail: 'support@gmail.com',
                        www: 'www.superpuper.com',
                        phone: '1234567890',
                        info: 'Some info',
                        logo: '',
                        logoDark: '', // logo for dark theme
                    },
                    about: true,
                    feedback: {
                        visible: false,
                        url: http://...
                    },
                    goback: {
                        url: 'http://...',
                        text: 'Go to London',
                        blank: true,
                        requestClose: false // if true - goback send onRequestClose event instead opening url
                    },
                    reviewPermissions: {
                        "Group1": ["Group2"], // users from Group1 can accept/reject review changes made by users from Group2
                        "Group2": ["Group1", "Group2"] // users from Group2 can accept/reject review changes made by users from Group1 and Group2
                        "Group3": [""] // users from Group3 can accept/reject review changes made by users without a group
                    },
                    anonymous: { // set name for anonymous user
                        request: bool (default: true), // enable set name
                        label: string (default: "Guest") // postfix for user name
                    },
                    review: {
                        hideReviewDisplay: false, // hide button Review mode
                        hoverMode: false, // true - show review balloons on mouse move, not on click on text
                        showReviewChanges: false,
                        reviewDisplay: 'original', // original for viewer, markup for editor
                        trackChanges: undefined // true/false - open editor with track changes mode on/off,
                    },
                    layout: { // hide elements, but don't disable feature
                        toolbar: {
                            file: { // menu file
                                close: false / true, // close menu button
                                settings: false / true, // advanced settings
                                info: false / true // document info
                                save: false/true // save button
                            } / false / true,
                            home:  {
                                mailmerge: false/true // mail merge button
                            },
                            layout:  false / true, // layout tab
                            references:  false / true, // de references tab
                            collaboration:  false / true // collaboration tab
                            draw:  false / true // draw tab
                            protect:  false / true, // protect tab
                            plugins:  false / true // plugins tab
                            view: {
                                navigation: false/true // navigation button in de
                            } / false / true, // view tab
                            save: false/true // save button on toolbar in 
                        } / false / true, // use instead of customization.toolbar,
                        header: {
                            users: false/true // users list button
                            save: false/true // save button
                        },
                        leftMenu: {
                            navigation: false/true,
                            spellcheck: false/true // spellcheck button in sse,
                            mode: false/true // init value for left panel, true - is visible, false - is hidden, used for option "Left panel" on the View Tab
                        } / false / true, // use instead of customization.leftMenu
                        rightMenu: {
                            mode: false/true // init value for right panel, true - is visible, false - is hidden, used for option "Right panel" on the View Tab
                        } / false/true, // use instead of customization.rightMenu
                        statusBar: {
                            textLang: false/true // text language button in de/pe
                            docLang: false/true // document language button in de/pe
                            actionStatus: false/true // status of operation
                        } / false / true, // use instead of customization.statusBar
                    },
                    features: { // disable feature
                        spellcheck: {
                            mode: false/true // init value in de/pe
                            change: false/true // hide/show feature in de/pe/sse
                        } / false / true // if false/true - use as init value in de/pe. use instead of customization.spellcheck parameter
                    },
                    font: {
                        name: "Arial",
                        size: "11px";
                    },
                    chat: true,
                    comments: true,
                    zoom: 100,
                    compactToolbar: false,
                    leftMenu: true, // must be deprecated. use layout.leftMenu instead
                    rightMenu: true, // must be deprecated. use layout.rightMenu instead
                    hideRightMenu: false, // hide or show right panel on first loading
                    toolbar: true, // must be deprecated. use layout.toolbar instead
                    statusBar: true, // must be deprecated. use layout.statusBar instead
                    autosave: true,
                    forcesave: false,
                    commentAuthorOnly: false, // must be deprecated. use permissions.editCommentAuthorOnly and permissions.deleteCommentAuthorOnly instead
                    showReviewChanges: false, // must be deprecated. use customization.review.showReviewChanges instead
                    help: true,
                    compactHeader: false,
                    toolbarNoTabs: false,
                    toolbarHideFileName: false,
                    reviewDisplay: 'original', // must be deprecated. use customization.review.reviewDisplay instead
                    spellcheck: true, // must be deprecated. use customization.features.spellcheck instead
                    compatibleFeatures: false,
                    unit: 'cm' // cm, pt, inch,
                    mentionShare : true // customize tooltip for mention,
                    macros: true // can run macros in document
                    plugins: true // can run plugins in document
                    macrosMode: 'warn' // warn about automatic macros, 'enable', 'disable', 'warn',
                    trackChanges: undefined // true/false - open editor with track changes mode on/off,  // must be deprecated. use customization.review.trackChanges instead
                    hideRulers: false // hide or show rulers on first loading (presentation or document editor)
                    hideNotes: false // hide or show notes panel on first loading (presentation editor)
                    uiTheme: 'theme-dark' // set interface theme: id or default-dark/default-light
                    integrationMode: "embed" // turn off scroll to frame
                },
                 coEditing: {
                     mode: 'fast', // <coauthoring mode>, 'fast' or 'strict'. if 'fast' and 'customization.autosave'=false -> set 'customization.autosave'=true. 'fast' - default for editor
                     // for viewer: 'strict' is default, offline viewer; 'fast' - live viewer, show changes from other users
                     change: true, // can change co-authoring mode. true - default for editor, false - default for viewer
                 },
                plugins: {
                    autostart: ['asc.{FFE1F462-1EA2-4391-990D-4CC84940B754}'],
                    pluginsData: [
                        "helloworld/config.json",
                        "chess/config.json",
                        "speech/config.json",
                        "clipart/config.json",
                    ]
                },
                wopi: { // only for wopi
                    FileNameMaxLength: 250 // max filename length for rename, 250 by default
                }
            },
            events: {
                'onAppReady': <application ready callback>,
                'onDocumentStateChange': <document state changed callback>
                'onDocumentReady': <document ready callback>
                'onRequestEditRights': <request rights for switching from view to edit>,
                'onRequestHistory': <request version history>,// must call refreshHistory method
                'onRequestHistoryData': <request version data>,// must call setHistoryData method
                'onRequestRestore': <try to restore selected version>,
                'onRequestHistoryClose': <request closing history>,
                'onError': <error callback>,
                'onWarning': <warning callback>,
                'onInfo': <document open callback>,// send view or edit mode
                'onOutdatedVersion': <outdated version callback>,// send when  previous version is opened
                'onDownloadAs': <download as callback>,// send url of downloaded file as a response for downloadAs method
                'onRequestSaveAs': <try to save copy of the document>,
                'onCollaborativeChanges': <co-editing changes callback>,// send when other user co-edit document
                'onRequestRename': <try to rename document>,
                'onMetaChange': // send when meta information changed
                'onRequestClose': <request close editor>,
                'onMakeActionLink': <request link to document with bookmark, comment...>,// must call setActionLink method
                'onRequestUsers': <request users list for mentions>,// must call setUsers method
                'onRequestSendNotify': //send when user is mentioned in a comment,
                'onRequestInsertImage': <try to insert image>,// must call insertImage method
                'onRequestCompareFile': <request file to compare>,// must call setRevisedFile method. must be deprecated
                'onRequestSharingSettings': <request sharing settings>,// must call setSharingSettings method
                'onRequestCreateNew': <try to create document>,
                'onRequestReferenceData': <try to refresh external data>,
                'onRequestOpen': <try to open external link>,
                'onRequestSelectDocument': <try to open document>, // used for compare and combine documents. must call setRequestedDocument method. use instead of onRequestCompareFile/setRevisedFile
                'onRequestSelectSpreadsheet': <try to open spreadsheet>, // used for mailmerge id de and external links in sse. must call setRequestedSpreadsheet method. use instead of onRequestMailMergeRecipients/setMailMergeRecipients
                'onRequestReferenceSource': <try to change source for external link>, // used for external links in sse. must call setReferenceSource method
            }
        }

        # Embedded #

        config = {
            type: 'embedded',
            width: '100% by default',
            height: '100% by default',
            documentType: 'word' | 'cell' | 'slide',// deprecate 'text' | 'spreadsheet' | 'presentation',
            document: {
                title: 'document title',
                url: 'document url',
                fileType: 'document file type',
                key: 'key',
                vkey: 'vkey'
            },
            editorConfig: {
                licenseUrl: <url for license>,
                customerId: <customer id>,
                autostart: 'document',    // action for app's autostart. for presentations default value is 'player'
                embedded: {
                     embedUrl: 'url',
                     fullscreenUrl: 'url',
                     saveUrl: 'url',
                     shareUrl: 'url',
                     toolbarDocked: 'top or bottom'
                }
            },
            events: {
                'onAppReady': <application ready callback>,
                'onBack': <back to folder callback>,
                'onError': <error callback>,
                'onDocumentReady': <document ready callback>,
                'onWarning': <warning callback>
            }
        }
    */

    // TODO: allow several instances on one page simultaneously

    DocsAPI.DocEditor = function(placeholderId, config) {
        var _self = this,
            _config = config || {};

        extend(_config, DocsAPI.DocEditor.defaultConfig);
        _config.editorConfig.canUseHistory = _config.events && !!_config.events.onRequestHistory;
        _config.editorConfig.canHistoryClose = _config.events && !!_config.events.onRequestHistoryClose;
        _config.editorConfig.canHistoryRestore = _config.events && !!_config.events.onRequestRestore;
        _config.editorConfig.canSendEmailAddresses = _config.events && !!_config.events.onRequestEmailAddresses;
        _config.editorConfig.canRequestEditRights = _config.events && !!_config.events.onRequestEditRights;
        _config.editorConfig.canRequestClose = _config.events && !!_config.events.onRequestClose;
        _config.editorConfig.canRename = _config.events && !!_config.events.onRequestRename;
        _config.editorConfig.canMakeActionLink = _config.events && !!_config.events.onMakeActionLink;
        _config.editorConfig.canRequestUsers = _config.events && !!_config.events.onRequestUsers;
        _config.editorConfig.canRequestSendNotify = _config.events && !!_config.events.onRequestSendNotify;
        _config.editorConfig.mergeFolderUrl = _config.editorConfig.mergeFolderUrl || _config.editorConfig.saveAsUrl;
        _config.editorConfig.canRequestSaveAs = _config.events && !!_config.events.onRequestSaveAs;
        _config.editorConfig.canRequestInsertImage = _config.events && !!_config.events.onRequestInsertImage;
        _config.editorConfig.canRequestMailMergeRecipients = _config.events && !!_config.events.onRequestMailMergeRecipients;
        _config.editorConfig.canRequestCompareFile = _config.events && !!_config.events.onRequestCompareFile;
        _config.editorConfig.canRequestSharingSettings = _config.events && !!_config.events.onRequestSharingSettings;
        _config.editorConfig.canRequestCreateNew = _config.events && !!_config.events.onRequestCreateNew;
        _config.editorConfig.canRequestReferenceData = _config.events && !!_config.events.onRequestReferenceData;
        _config.editorConfig.canRequestOpen = _config.events && !!_config.events.onRequestOpen;
        _config.editorConfig.canRequestSelectDocument = _config.events && !!_config.events.onRequestSelectDocument;
        _config.editorConfig.canRequestSelectSpreadsheet = _config.events && !!_config.events.onRequestSelectSpreadsheet;
        _config.editorConfig.canRequestReferenceSource = _config.events && !!_config.events.onRequestReferenceSource;
        _config.frameEditorId = placeholderId;
        _config.parentOrigin = window.location.origin;

        var onMouseUp = function (evt) {
            _processMouse(evt);
        };

        var _attachMouseEvents = function() {
            if (window.addEventListener) {
                window.addEventListener("mouseup", onMouseUp, false)
            } else if (window.attachEvent) {
                window.attachEvent("onmouseup", onMouseUp);
            }
        };

        var _detachMouseEvents = function() {
            if (window.removeEventListener) {
                window.removeEventListener("mouseup", onMouseUp, false)
            } else if (window.detachEvent) {
                window.detachEvent("onmouseup", onMouseUp);
            }
        };

        var _onAppReady = function() {
            if (_config.type === 'mobile') {
                document.body.onfocus = function(e) {
                    setTimeout(function(){
                        iframe.contentWindow.focus();

                        _sendCommand({
                            command: 'resetFocus',
                            data: {}
                        })
                    }, 10);
                };
            }

            _attachMouseEvents();

            if (_config.editorConfig) {
                _init(_config.editorConfig);
            }

            if (_config.document) {
                _openDocument(_config.document);
            }
        };

        var _onMessage = function(msg) {
            if ( msg ) {
                if ( msg.type === "onExternalPluginMessage" ) {
                    _sendCommand(msg);
                } else if ((window.parent !== window) && msg.type === "onExternalPluginMessageCallback") {
                    postMessage(window.parent, msg);
                } else
                if ( msg.frameEditorId == placeholderId ) {
                    var events = _config.events || {},
                        handler = events[msg.event],
                        res;

                    if (msg.event === 'onRequestEditRights' && !handler) {
                        _applyEditRights(false, 'handler isn\'t defined');
                    } else {
                        if (msg.event === 'onAppReady') {
                            _onAppReady();
                        }

                        if (handler && typeof handler == "function") {
                            res = handler.call(_self, {target: _self, data: msg.data});
                        }
                    }
                }
            }
        };

        var _checkConfigParams = function() {
            if (_config.document) {
                if (!_config.document.url || ((typeof _config.document.fileType !== 'string' || _config.document.fileType=='') &&
                                              (typeof _config.documentType !== 'string' || _config.documentType==''))) {
                    window.alert("One or more required parameter for the config object is not set");
                    return false;
                }

                var appMap = {
                        'text': 'docx',
                        'text-pdf': 'pdf',
                        'spreadsheet': 'xlsx',
                        'presentation': 'pptx',
                        'word': 'docx',
                        'cell': 'xlsx',
                        'slide': 'pptx'
                    }, app;

                if (_config.documentType=='text' || _config.documentType=='spreadsheet' ||_config.documentType=='presentation')
                    console.warn("The \"documentType\" parameter for the config object must take one of the values word/cell/slide.");

                if (typeof _config.documentType === 'string' && _config.documentType != '') {
                    app = appMap[_config.documentType.toLowerCase()];
                    if (!app) {
                        window.alert("The \"documentType\" parameter for the config object is invalid. Please correct it.");
                        return false;
                    } else if (typeof _config.document.fileType !== 'string' || _config.document.fileType == '') {
                        _config.document.fileType = app;
                    }
                }

                if (typeof _config.document.fileType === 'string' && _config.document.fileType != '') {
                    _config.document.fileType = _config.document.fileType.toLowerCase();
                    var type = /^(?:(xls|xlsx|ods|csv|gsheet|xlsm|xlt|xltm|xltx|fods|ots|xlsb|sxc|et|ett)|(pps|ppsx|ppt|pptx|odp|gslides|pot|potm|potx|ppsm|pptm|fodp|otp|sxi|dps|dpt)|(doc|docx|odt|gdoc|txt|rtf|pdf|mht|htm|html|mhtml|epub|djvu|xps|oxps|docm|dot|dotm|dotx|fodt|ott|fb2|xml|oform|docxf|sxw|stw|wps|wpt))$/
                                    .exec(_config.document.fileType);
                    if (!type) {
                        window.alert("The \"document.fileType\" parameter for the config object is invalid. Please correct it.");
                        return false;
                    } else if (typeof _config.documentType !== 'string' || _config.documentType == ''){
                        if (typeof type[1] === 'string') _config.documentType = 'cell'; else
                        if (typeof type[2] === 'string') _config.documentType = 'slide'; else
                        if (typeof type[3] === 'string') _config.documentType = 'word';
                    }
                }

                var type = /^(?:(pdf|djvu|xps|oxps))$/.exec(_config.document.fileType);
                if (type && typeof type[1] === 'string') {
                    _config.editorConfig.canUseHistory = false;
                }

                if (!_config.document.title || _config.document.title=='')
                    _config.document.title = 'Unnamed.' + _config.document.fileType;

                if (!_config.document.key) {
                    _config.document.key = 'xxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, function (c) {var r = Math.random() * 16 | 0; return r.toString(16);});
                } else if (typeof _config.document.key !== 'string') {
                    window.alert("The \"document.key\" parameter for the config object must be string. Please correct it.");
                    return false;
                }

                if (_config.editorConfig.user && _config.editorConfig.user.id && (typeof _config.editorConfig.user.id == 'number')) {
                    _config.editorConfig.user.id = _config.editorConfig.user.id.toString();
                    console.warn("The \"id\" parameter for the editorConfig.user object must be a string.");
                }

                _config.document.token = _config.token;
            }
            
            return true;
        };

        (function() {
            var result = /[\?\&]placement=(\w+)&?/.exec(window.location.search);
            if (!!result && result.length) {
                if (result[1] == 'desktop') {
                    _config.editorConfig.targetApp = result[1];
                    // _config.editorConfig.canBackToFolder = false;
                    if (!_config.editorConfig.customization) _config.editorConfig.customization = {};
                    _config.editorConfig.customization.about = false;
                    _config.editorConfig.customization.compactHeader = false;
                }
            }
        })();

        var target = document.getElementById(placeholderId),
            iframe;

        if (target && _checkConfigParams()) {
            var openEditorFrame = function (target, type) {
                if ( type !== undefined )
                    _config.documentType = type;

                iframe = createIframe(_config);
                if (_config.editorConfig.customization && _config.editorConfig.customization.integrationMode==='embed')
                    window.AscEmbed && window.AscEmbed.initWorker(iframe);

                if (iframe.src) {
                    var pathArray = iframe.src.split('/');
                    this.frameOrigin = pathArray[0] + '//' + pathArray[2];
                }
                target.parentNode && target.parentNode.replaceChild(iframe, target);
                var _msgDispatcher = new MessageDispatcher(_onMessage, this);
            }

            if ( _config.document.fileType == 'xml' ) {
                boxChooseEditor(target, openEditorFrame);
            } else {
                openEditorFrame(target)
            }
        }

        /*
         cmd = {
         command: 'commandName',
         data: <command specific data>
         }
         */

        var _destroyEditor = function(cmd) {
            var target = document.createElement("div");
            target.setAttribute('id', placeholderId);

            if (iframe) {
                _msgDispatcher && _msgDispatcher.unbindEvents();
                _detachMouseEvents();
                iframe.parentNode && iframe.parentNode.replaceChild(target, iframe);
            }
        };

        var _sendCommand = function(cmd) {
            if (iframe && iframe.contentWindow)
                postMessage(iframe.contentWindow, cmd);
        };

        var _init = function(editorConfig) {
            _sendCommand({
                command: 'init',
                data: {
                    config: editorConfig
                }
            });
        };

        var _openDocument = function(doc) {
            _sendCommand({
                command: 'openDocument',
                data: {
                    doc: doc
                }
            });
        };

        var _showMessage = function(title, msg) {
            msg = msg || title;
            _sendCommand({
                command: 'showMessage',
                data: {
                    msg: msg
                }
            });
        };

        var _applyEditRights = function(allowed, message) {
            _sendCommand({
                command: 'applyEditRights',
                data: {
                    allowed: allowed,
                    message: message
                }
            });
        };

        var _processSaveResult = function(result, message) {
            _sendCommand({
                command: 'processSaveResult',
                data: {
                    result: result,
                    message: message
                }
            });
        };

        // TODO: remove processRightsChange, use denyEditingRights
        var _processRightsChange = function(enabled, message) {
            _sendCommand({
                command: 'processRightsChange',
                data: {
                    enabled: enabled,
                    message: message
                }
            });
        };

        var _denyEditingRights = function(message) {
            _sendCommand({
                command: 'processRightsChange',
                data: {
                    enabled: false,
                    message: message
                }
            });
        };

        var _refreshHistory = function(data, message) {
            _sendCommand({
                command: 'refreshHistory',
                data: {
                    data: data,
                    message: message
                }
            });
        };

        var _setHistoryData = function(data, message) {
            _sendCommand({
                command: 'setHistoryData',
                data: {
                    data: data,
                    message: message
                }
            });
        };

        var _setEmailAddresses = function(data) {
            _sendCommand({
                command: 'setEmailAddresses',
                data: {
                    data: data
                }
            });
        };

        var _setActionLink = function (data) {
            _sendCommand({
                command: 'setActionLink',
                data: {
                    url: data
                }
            });
        };

        var _processMailMerge = function(enabled, message) {
            _sendCommand({
                command: 'processMailMerge',
                data: {
                    enabled: enabled,
                    message: message
                }
            });
        };

        var _downloadAs = function(data) {
            _sendCommand({
                command: 'downloadAs',
                data: data
            });
        };

        var _setUsers = function(data) {
            _sendCommand({
                command: 'setUsers',
                data: data
            });
        };

        var _showSharingSettings = function(data) {
            _sendCommand({
                command: 'showSharingSettings',
                data: data
            });
        };

        var _setSharingSettings = function(data) {
            _sendCommand({
                command: 'setSharingSettings',
                data: data
            });
        };

        var _insertImage = function(data) {
            _sendCommand({
                command: 'insertImage',
                data: data
            });
        };

        var _setMailMergeRecipients = function(data) {
            _sendCommand({
                command: 'setMailMergeRecipients',
                data: data
            });
        };

        var _setRevisedFile = function(data) {
            _sendCommand({
                command: 'setRevisedFile',
                data: data
            });
        };

        var _setRequestedDocument = function(data) {
            _sendCommand({
                command: 'setRequestedDocument',
                data: data
            });
        };

        var _setRequestedSpreadsheet = function(data) {
            _sendCommand({
                command: 'setRequestedSpreadsheet',
                data: data
            });
        };

        var _setReferenceSource = function(data) {
            _sendCommand({
                command: 'setReferenceSource',
                data: data
            });
        };

        var _setFavorite = function(data) {
            _sendCommand({
                command: 'setFavorite',
                data: data
            });
        };

        var _requestClose = function(data) {
            _sendCommand({
                command: 'requestClose',
                data: data
            });
        };

        var _processMouse = function(evt) {
            var r = iframe.getBoundingClientRect();
            var data = {
                type: evt.type,
                x: evt.x - r.left,
                y: evt.y - r.top,
                event: evt
            };

            _sendCommand({
                command: 'processMouse',
                data: data
            });
        };

        var _grabFocus = function(data) {
            setTimeout(function(){
                _sendCommand({
                    command: 'grabFocus',
                    data: data
                });
            }, 10);
        };

        var _blurFocus = function(data) {
            _sendCommand({
                command: 'blurFocus',
                data: data
            });
        };

        var _setReferenceData = function(data) {
            _sendCommand({
                command: 'setReferenceData',
                data: data
            });
        };

        var _serviceCommand = function(command, data) {
            _sendCommand({
                command: 'internalCommand',
                data: {
                    command: command,
                    data: data
                }
            });
        };

        return {
            showMessage         : _showMessage,
            processSaveResult   : _processSaveResult,
            processRightsChange : _processRightsChange,
            denyEditingRights   : _denyEditingRights,
            refreshHistory      : _refreshHistory,
            setHistoryData      : _setHistoryData,
            setEmailAddresses   : _setEmailAddresses,
            setActionLink       : _setActionLink,
            processMailMerge    : _processMailMerge,
            downloadAs          : _downloadAs,
            serviceCommand      : _serviceCommand,
            attachMouseEvents   : _attachMouseEvents,
            detachMouseEvents   : _detachMouseEvents,
            destroyEditor       : _destroyEditor,
            setUsers            : _setUsers,
            showSharingSettings : _showSharingSettings,
            setSharingSettings  : _setSharingSettings,
            insertImage         : _insertImage,
            setMailMergeRecipients: _setMailMergeRecipients,
            setRevisedFile      : _setRevisedFile,
            setFavorite         : _setFavorite,
            requestClose        : _requestClose,
            grabFocus           : _grabFocus,
            blurFocus           : _blurFocus,
            setReferenceData    : _setReferenceData,
            setRequestedDocument: _setRequestedDocument,
            setRequestedSpreadsheet: _setRequestedSpreadsheet,
            setReferenceSource: _setReferenceSource
        }
    };


    DocsAPI.DocEditor.defaultConfig = {
        type: 'desktop',
        width: '100%',
        height: '100%',
        editorConfig: {
            lang: 'en',
            canCoAuthoring: true,
            customization: {
                about: true,
                feedback: false
            }
        }
    };

    DocsAPI.DocEditor.version = function() {
        return '{{PRODUCT_VERSION}}';
    };

    MessageDispatcher = function(fn, scope) {
        var _fn     = fn,
            _scope  = scope || window,
            eventFn = function(msg) {
                _onMessage(msg);
            };

        var _bindEvents = function() {
            if (window.addEventListener) {
                window.addEventListener("message", eventFn, false)
            }
            else if (window.attachEvent) {
                window.attachEvent("onmessage", eventFn);
            }
        };

        var _unbindEvents = function() {
            if (window.removeEventListener) {
                window.removeEventListener("message", eventFn, false)
            }
            else if (window.detachEvent) {
                window.detachEvent("onmessage", eventFn);
            }
        };

        var _onMessage = function(msg) {
            // TODO: check message origin
            if (msg && window.JSON && _scope.frameOrigin==msg.origin ) {

                try {
                    var msg = window.JSON.parse(msg.data);
                    if (_fn) {
                        _fn.call(_scope, msg);
                    }
                } catch(e) {}
            }
        };

        _bindEvents.call(this);

        return {
            unbindEvents: _unbindEvents
        }
    };

    function getBasePath() {
        var scripts = document.getElementsByTagName('script'),
            match;

        for (var i = scripts.length - 1; i >= 0; i--) {
            match = scripts[i].src.match(/(.*)api\/documents\/api.js/i);
            if (match) {
                return match[1];
            }
        }

        return "";
    }

    function getExtensionPath() {
        if ("undefined" == typeof(extensionParams) || null == extensionParams["url"])
            return null;
        return extensionParams["url"] + "apps/";
    }


    function getTestPath() {
        var scripts = document.getElementsByTagName('script'),
            match;

        for (var i = scripts.length - 1; i >= 0; i--) {
            match = scripts[i].src.match(/(.*)apps\/api\/documents\/api.js/i);
            if (match) {
                return match[1] + "test/";
            }
        }

        return "";
    }

    function getAppPath(config) {
        var extensionPath = getExtensionPath(),
            path = extensionPath ? extensionPath : (config.type=="test" ? getTestPath() : getBasePath()),
            appMap = {
                'text': 'documenteditor',
                'text-pdf': 'documenteditor',
                'spreadsheet': 'spreadsheeteditor',
                'presentation': 'presentationeditor',
                'word': 'documenteditor',
                'cell': 'spreadsheeteditor',
                'slide': 'presentationeditor'
            },
            app = appMap['word'];

        if (typeof config.documentType === 'string') {
            app = appMap[config.documentType.toLowerCase()];
        } else
        if (!!config.document && typeof config.document.fileType === 'string') {
            var type = /^(?:(xls|xlsx|ods|csv|xlst|xlsy|gsheet|xlsm|xlt|xltm|xltx|fods|ots|xlsb)|(pps|ppsx|ppt|pptx|odp|pptt|ppty|gslides|pot|potm|potx|ppsm|pptm|fodp|otp))$/
                            .exec(config.document.fileType);
            if (type) {
                if (typeof type[1] === 'string') app = appMap['cell']; else
                if (typeof type[2] === 'string') app = appMap['slide'];
            }
        }

        path += app + "/";
        const path_type = config.type === "mobile"
                    ? "mobile" : (config.type === "embedded")
                    ? "embed" : (config.document && typeof config.document.fileType === 'string' && config.document.fileType.toLowerCase() === 'oform')
                    ? "forms" : "main";

        path += path_type;
        var index = "/index.html";
        if (config.editorConfig && path_type!=="forms") {
            var customization = config.editorConfig.customization;
            if ( typeof(customization) == 'object' && ( customization.toolbarNoTabs ||
                                                        (config.editorConfig.targetApp!=='desktop') && (customization.loaderName || customization.loaderLogo))) {
                index = "/index_loader.html";
            } else if (config.editorConfig.mode === 'editdiagram' || config.editorConfig.mode === 'editmerge' || config.editorConfig.mode === 'editole')
                index = "/index_internal.html";

        }
        path += index;
        return path;
    }

    function getAppParameters(config) {
        var params = "?_dc=0";

        if (config.editorConfig && config.editorConfig.lang)
            params += "&lang=" + config.editorConfig.lang;

        if (config.editorConfig && config.editorConfig.targetApp!=='desktop') {
            if ( (typeof(config.editorConfig.customization) == 'object') && config.editorConfig.customization.loaderName) {
                if (config.editorConfig.customization.loaderName !== 'none') params += "&customer=" + encodeURIComponent(config.editorConfig.customization.loaderName);
            } else
                params += "&customer={{APP_CUSTOMER_NAME}}";
            if (typeof(config.editorConfig.customization) == 'object') {
                if ( config.editorConfig.customization.loaderLogo && config.editorConfig.customization.loaderLogo !== '') {
                    params += "&logo=" + encodeURIComponent(config.editorConfig.customization.loaderLogo);
                }
                if ( config.editorConfig.customization.logo ) {
                    if (config.type=='embedded' && (config.editorConfig.customization.logo.image || config.editorConfig.customization.logo.imageEmbedded))
                        params += "&headerlogo=" + encodeURIComponent(config.editorConfig.customization.logo.image || config.editorConfig.customization.logo.imageEmbedded);
                    else if (config.type!='embedded' && (config.editorConfig.customization.logo.image || config.editorConfig.customization.logo.imageDark)) {
                        config.editorConfig.customization.logo.image && (params += "&headerlogo=" + encodeURIComponent(config.editorConfig.customization.logo.image));
                        config.editorConfig.customization.logo.imageDark && (params += "&headerlogodark=" + encodeURIComponent(config.editorConfig.customization.logo.imageDark));
                    }
                }
            }
        }

        if (config.editorConfig && (config.editorConfig.mode == 'editdiagram' || config.editorConfig.mode == 'editmerge' || config.editorConfig.mode == 'editole'))
            params += "&internal=true";

        if (config.frameEditorId)
            params += "&frameEditorId=" + config.frameEditorId;

        if (config.editorConfig && config.editorConfig.mode == 'view' ||
            config.document && config.document.permissions && (config.document.permissions.edit === false && !config.document.permissions.review ))
            params += "&mode=view";

        if (config.editorConfig && config.editorConfig.customization && !!config.editorConfig.customization.compactHeader)
            params += "&compact=true";

        if (config.editorConfig && config.editorConfig.customization && (config.editorConfig.customization.toolbar===false))
            params += "&toolbar=false";

        if (config.parentOrigin)
            params += "&parentOrigin=" + config.parentOrigin;

        if (config.editorConfig && config.editorConfig.customization && config.editorConfig.customization.uiTheme )
            params += "&uitheme=" + config.editorConfig.customization.uiTheme;

        return params;
    }

    function createIframe(config) {
        var iframe = document.createElement("iframe");

        iframe.src = getAppPath(config) + getAppParameters(config);
        iframe.width = config.width;
        iframe.height = config.height;
        iframe.align = "top";
        iframe.frameBorder = 0;
        iframe.name = "frameEditor";
        config.title && (typeof config.title === 'string') && (iframe.title = config.title);
        iframe.allowFullscreen = true;
        iframe.setAttribute("allowfullscreen",""); // for IE11
        iframe.setAttribute("onmousewheel",""); // for Safari on Mac
        iframe.setAttribute("allow", "autoplay; camera; microphone; display-capture; clipboard-write;");

		if (config.type == "mobile")
		{
			iframe.style.position = "fixed";
            iframe.style.overflow = "hidden";
            document.body.style.overscrollBehaviorY = "contain";
		}
        return iframe;
    }

    function postMessage(wnd, msg) {
        if (wnd && wnd.postMessage && window.JSON) {
            // TODO: specify explicit origin
            wnd.postMessage(window.JSON.stringify(msg), "*");
        }

    }

    function extend(dest, src) {
        for (var prop in src) {
            if (src.hasOwnProperty(prop)) {
                if (typeof dest[prop] === 'undefined') {
                    dest[prop] = src[prop];
                } else
                if (typeof dest[prop] === 'object' &&
                        typeof src[prop] === 'object') {
                    extend(dest[prop], src[prop])
                }
            }
        }
        return dest;
    }

    function boxChooseEditor(target, callback) {
        const _svg_icon_word = `<svg width="80" height="100" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g><path d="M75 19V92.6667C75 93.2855 74.7542 93.879 74.3166 94.3166C73.879 94.7542 73.2855 95 72.6667 95H7.33333C6.71449 95 6.121 94.7542 5.68342 94.3166C5.24583 93.879 5 93.2855 5 92.6667V7.33333C5 6.71449 5.24583 6.121 5.68342 5.68342C6.121 5.24583 6.71449 5 7.33333 5H61L75 19Z" fill="#214479"/>
            <path opacity="0.2" d="M75 19H63.3333C62.7145 19 62.121 18.7542 61.6834 18.3166C61.2458 17.879 61 17.2855 61 16.6667V5L75 19Z" fill="black"/>
            <path d="M31.1406 82.6348C31.1406 83.5996 30.9551 84.4062 30.584 85.0547C30.2168 85.6992 29.6836 86.1855 28.9844 86.5137C28.2852 86.8379 27.4434 87 26.459 87H24.0332V78.4336H26.7227C27.6211 78.4336 28.4004 78.5938 29.0605 78.9141C29.7207 79.2305 30.2324 79.7012 30.5957 80.3262C30.959 80.9473 31.1406 81.7168 31.1406 82.6348ZM29.2539 82.6816C29.2539 82.0488 29.1602 81.5293 28.9727 81.123C28.7891 80.7129 28.5156 80.4102 28.1523 80.2148C27.793 80.0195 27.3477 79.9219 26.8164 79.9219H25.8496V85.5H26.6289C27.5156 85.5 28.1738 85.2637 28.6035 84.791C29.0371 84.3184 29.2539 83.6152 29.2539 82.6816ZM40.6914 82.7051C40.6914 83.3652 40.6094 83.9668 40.4453 84.5098C40.2812 85.0488 40.0312 85.5137 39.6953 85.9043C39.3633 86.2949 38.9414 86.5957 38.4297 86.8066C37.918 87.0137 37.3125 87.1172 36.6133 87.1172C35.9141 87.1172 35.3086 87.0137 34.7969 86.8066C34.2852 86.5957 33.8613 86.2949 33.5254 85.9043C33.1934 85.5137 32.9453 85.0469 32.7812 84.5039C32.6172 83.9609 32.5352 83.3574 32.5352 82.6934C32.5352 81.8066 32.6797 81.0352 32.9688 80.3789C33.2617 79.7188 33.7109 79.207 34.3164 78.8438C34.9219 78.4805 35.6914 78.2988 36.625 78.2988C37.5547 78.2988 38.3184 78.4805 38.916 78.8438C39.5176 79.207 39.9629 79.7188 40.252 80.3789C40.5449 81.0391 40.6914 81.8145 40.6914 82.7051ZM34.4395 82.7051C34.4395 83.3027 34.5137 83.8184 34.6621 84.252C34.8145 84.6816 35.0508 85.0137 35.3711 85.248C35.6914 85.4785 36.1055 85.5938 36.6133 85.5938C37.1289 85.5938 37.5469 85.4785 37.8672 85.248C38.1875 85.0137 38.4199 84.6816 38.5645 84.252C38.7129 83.8184 38.7871 83.3027 38.7871 82.7051C38.7871 81.8066 38.6191 81.0996 38.2832 80.584C37.9473 80.0684 37.3945 79.8105 36.625 79.8105C36.1133 79.8105 35.6953 79.9277 35.3711 80.1621C35.0508 80.3926 34.8145 80.7246 34.6621 81.1582C34.5137 81.5879 34.4395 82.1035 34.4395 82.7051ZM46.1055 79.8223C45.7578 79.8223 45.4492 79.8906 45.1797 80.0273C44.9141 80.1602 44.6895 80.3535 44.5059 80.6074C44.3262 80.8613 44.1895 81.168 44.0957 81.5273C44.002 81.8867 43.9551 82.291 43.9551 82.7402C43.9551 83.3457 44.0293 83.8633 44.1777 84.293C44.3301 84.7188 44.5645 85.0449 44.8809 85.2715C45.1973 85.4941 45.6055 85.6055 46.1055 85.6055C46.4531 85.6055 46.8008 85.5664 47.1484 85.4883C47.5 85.4102 47.8809 85.2988 48.291 85.1543V86.6777C47.9121 86.834 47.5391 86.9453 47.1719 87.0117C46.8047 87.082 46.3926 87.1172 45.9355 87.1172C45.0527 87.1172 44.3262 86.9355 43.7559 86.5723C43.1895 86.2051 42.7695 85.6934 42.4961 85.0371C42.2227 84.377 42.0859 83.6074 42.0859 82.7285C42.0859 82.0801 42.1738 81.4863 42.3496 80.9473C42.5254 80.4082 42.7832 79.9414 43.123 79.5469C43.4629 79.1523 43.8828 78.8477 44.3828 78.6328C44.8828 78.418 45.457 78.3105 46.1055 78.3105C46.5312 78.3105 46.957 78.3652 47.3828 78.4746C47.8125 78.5801 48.2227 78.7266 48.6133 78.9141L48.0273 80.3906C47.707 80.2383 47.3848 80.1055 47.0605 79.9922C46.7363 79.8789 46.418 79.8223 46.1055 79.8223ZM57.0449 87H54.9707L52.9785 83.7598L50.9863 87H49.041L51.8828 82.582L49.2227 78.4336H51.2266L53.0723 81.5156L54.8828 78.4336H56.8398L54.1504 82.6816L57.0449 87Z" fill="white"/>
            <path d="M51.8009 36L47.2398 56.6471L42.1719 36H40H37.8281L32.7602 56.6471L28.1991 36H24L30.1538 62H34.7873L40 40.6647L45.2127 62H49.8462L56 36H51.8009Z" fill="white"/></g></svg>`;

        const _svg_icon_cell = `<svg width="80" height="100" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g><path d="M75 19V92.6667C75 93.2855 74.7542 93.879 74.3166 94.3166C73.879 94.7542 73.2855 95 72.6667 95H7.33333C6.71449 95 6.121 94.7542 5.68342 94.3166C5.24583 93.879 5 93.2855 5 92.6667V7.33333C5 6.71449 5.24583 6.121 5.68342 5.68342C6.121 5.24583 6.71449 5 7.33333 5H61L75 19Z" fill="#1F7244"/>
            <path opacity="0.2" d="M75 19H63.3333C62.7145 19 62.121 18.7542 61.6834 18.3166C61.2458 17.879 61 17.2855 61 16.6667V5L75 19Z" fill="black"/>
            <path d="M33.3027 87H31.2285L29.2363 83.7598L27.2441 87H25.2988L28.1406 82.582L25.4805 78.4336H27.4844L29.3301 81.5156L31.1406 78.4336H33.0977L30.4082 82.6816L33.3027 87ZM34.3809 87V78.4336H36.1973V85.5H39.6719V87H34.3809ZM46.2227 84.6211C46.2227 85.1289 46.0996 85.5703 45.8535 85.9453C45.6074 86.3203 45.248 86.6094 44.7754 86.8125C44.3066 87.0156 43.7363 87.1172 43.0645 87.1172C42.7676 87.1172 42.4766 87.0977 42.1914 87.0586C41.9102 87.0195 41.6387 86.9629 41.377 86.8887C41.1191 86.8105 40.873 86.7148 40.6387 86.6016V84.9141C41.0449 85.0938 41.4668 85.2559 41.9043 85.4004C42.3418 85.5449 42.7754 85.6172 43.2051 85.6172C43.502 85.6172 43.7402 85.5781 43.9199 85.5C44.1035 85.4219 44.2363 85.3145 44.3184 85.1777C44.4004 85.041 44.4414 84.8848 44.4414 84.709C44.4414 84.4941 44.3691 84.3105 44.2246 84.1582C44.0801 84.0059 43.8809 83.8633 43.627 83.7305C43.377 83.5977 43.0938 83.4551 42.7773 83.3027C42.5781 83.209 42.3613 83.0957 42.127 82.9629C41.8926 82.8262 41.6699 82.6602 41.459 82.4648C41.248 82.2695 41.0742 82.0332 40.9375 81.7559C40.8047 81.4746 40.7383 81.1387 40.7383 80.748C40.7383 80.2363 40.8555 79.7988 41.0898 79.4355C41.3242 79.0723 41.6582 78.7949 42.0918 78.6035C42.5293 78.4082 43.0449 78.3105 43.6387 78.3105C44.084 78.3105 44.5078 78.3633 44.9102 78.4688C45.3164 78.5703 45.7402 78.7188 46.1816 78.9141L45.5957 80.3262C45.2012 80.166 44.8477 80.043 44.5352 79.957C44.2227 79.8672 43.9043 79.8223 43.5801 79.8223C43.3535 79.8223 43.1602 79.8594 43 79.9336C42.8398 80.0039 42.7188 80.1055 42.6367 80.2383C42.5547 80.3672 42.5137 80.5176 42.5137 80.6895C42.5137 80.8926 42.5723 81.0645 42.6895 81.2051C42.8105 81.3418 42.9902 81.4746 43.2285 81.6035C43.4707 81.7324 43.7715 81.8828 44.1309 82.0547C44.5684 82.2617 44.9414 82.4785 45.25 82.7051C45.5625 82.9277 45.8027 83.1914 45.9707 83.4961C46.1387 83.7969 46.2227 84.1719 46.2227 84.6211ZM54.7012 87H52.627L50.6348 83.7598L48.6426 87H46.6973L49.5391 82.582L46.8789 78.4336H48.8828L50.7285 81.5156L52.5391 78.4336H54.4961L51.8066 82.6816L54.7012 87Z" fill="white"/>
            <path d="M41.4914 48.7171L49.6379 36H45.6552L39.5 45.6047L33.3448 36H29.3621L37.5086 48.7171L29 62H32.9828L39.5 51.8294L46.0172 62H50L41.4914 48.7171Z" fill="white"/></g></svg>`;

        const _svg_icon_slide = `<svg width="80" height="100" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g><path d="M75 19V92.6667C75 93.2855 74.7542 93.879 74.3166 94.3166C73.879 94.7542 73.2855 95 72.6667 95H7.33333C6.71449 95 6.121 94.7542 5.68342 94.3166C5.24583 93.879 5 93.2855 5 92.6667V7.33333C5 6.71449 5.24583 6.121 5.68342 5.68342C6.121 5.24583 6.71449 5 7.33333 5H61L75 19Z" fill="#DD682B"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M41 46V34C44.1826 34 47.2348 35.2643 49.4853 37.5147C51.7357 39.7652 53 42.8174 53 46H41ZM47.4853 56.4853C45.2348 58.7357 42.1826 60 39 60C35.8174 60 32.7652 58.7357 30.5147 56.4853C28.2643 54.2348 27 51.1826 27 48C27 44.8174 28.2643 41.7652 30.5147 39.5147C32.7652 37.2643 35.8174 36 39 36V48H51C51 51.1826 49.7357 54.2348 47.4853 56.4853Z" fill="white"/>
            <path opacity="0.2" d="M75 19H63.3333C62.7145 19 62.121 18.7542 61.6834 18.3166C61.2458 17.879 61 17.2855 61 16.6667V5L75 19Z" fill="black"/>
            <path d="M28.8027 78.4336C29.9082 78.4336 30.7148 78.6719 31.2227 79.1484C31.7305 79.6211 31.9844 80.2734 31.9844 81.1055C31.9844 81.4805 31.9277 81.8398 31.8145 82.1836C31.7012 82.5234 31.5156 82.8262 31.2578 83.0918C31.0039 83.3574 30.6641 83.5684 30.2383 83.7246C29.8125 83.877 29.2871 83.9531 28.6621 83.9531H27.8828V87H26.0664V78.4336H28.8027ZM28.709 79.9219H27.8828V82.4648H28.4805C28.8203 82.4648 29.1152 82.4199 29.3652 82.3301C29.6152 82.2402 29.8086 82.0996 29.9453 81.9082C30.082 81.7168 30.1504 81.4707 30.1504 81.1699C30.1504 80.748 30.0332 80.4355 29.7988 80.2324C29.5645 80.0254 29.2012 79.9219 28.709 79.9219ZM36.3379 78.4336C37.4434 78.4336 38.25 78.6719 38.7578 79.1484C39.2656 79.6211 39.5195 80.2734 39.5195 81.1055C39.5195 81.4805 39.4629 81.8398 39.3496 82.1836C39.2363 82.5234 39.0508 82.8262 38.793 83.0918C38.5391 83.3574 38.1992 83.5684 37.7734 83.7246C37.3477 83.877 36.8223 83.9531 36.1973 83.9531H35.418V87H33.6016V78.4336H36.3379ZM36.2441 79.9219H35.418V82.4648H36.0156C36.3555 82.4648 36.6504 82.4199 36.9004 82.3301C37.1504 82.2402 37.3438 82.0996 37.4805 81.9082C37.6172 81.7168 37.6855 81.4707 37.6855 81.1699C37.6855 80.748 37.5684 80.4355 37.334 80.2324C37.0996 80.0254 36.7363 79.9219 36.2441 79.9219ZM44.4414 87H42.625V79.9453H40.2988V78.4336H46.7676V79.9453H44.4414V87ZM55.0117 87H52.9375L50.9453 83.7598L48.9531 87H47.0078L49.8496 82.582L47.1895 78.4336H49.1934L51.0391 81.5156L52.8496 78.4336H54.8066L52.1172 82.6816L55.0117 87Z" fill="white"/></g></svg>`;

        const _css = `#idx-box-types{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center}
                        #idx-box-types a{cursor:pointer}`;
        const style = document.createElement('style');
        style.textContent = _css;
        // if (style.styleSheet) style.styleSheet.cssText = rule; // Support for IE
        document.head.append(style);

        const html = `<section>
                        <h2>The type of file is ambiguous</h2>
                        <h2>What the editor do we need to open?</h2>
                    </section>
                    <section>
                        <a id="idx-btn-word">${_svg_icon_word}</a>
                        <a id="idx-btn-cell">${_svg_icon_cell}</a>
                        <a id="idx-btn-slide">${_svg_icon_slide}</a>
                    </section>`;
        const div = document.createElement('div');
        div.id = 'idx-box-types';
        div.innerHTML = html.trim();

        target.parentNode.replaceChild(div, target);

        ['word', 'slide', 'cell'].forEach(function(i) {
            document.getElementById('idx-btn-' + i).
            addEventListener("click", function () {
                console.log('open word editor');
                callback(div, i);
            });
        })
    }

})(window.DocsAPI = window.DocsAPI || {}, window, document);

