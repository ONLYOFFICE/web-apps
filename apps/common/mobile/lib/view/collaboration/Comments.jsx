import React, {useState, useEffect, Fragment, useRef} from 'react';
import {observer, inject} from "mobx-react";
import { f7, Popup, Sheet, Popover, Page, Toolbar, Navbar, NavLeft, NavRight, NavTitle, Link, Input, Icon, List, ListItem, Actions, ActionsGroup, ActionsButton } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../utils/device';

// Utils
const sliceQuote = (text) => {
    if (text) {
        let sliced = text.slice(0, 100);
        if (sliced.length < text.length) {
            sliced += '...';
            return sliced;
        }
        return text;
    }
};

// Add comment

const AddCommentPopup = inject("storeComments")(observer(props => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const userInfo = props.userInfo;
    const [stateText, setText] = useState('');
    let refInputComment = useRef(null);

    useEffect(() => {
        f7.popup.open('.add-comment-popup', false);

        if(refInputComment) {
            refInputComment.focus();
        }
    }, []);

    return (
        <Popup className="add-comment-popup">
            <Navbar>
                <NavLeft>
                    <Link onClick={() => {
                        f7.popup.close('.add-comment-popup');
                        setTimeout(() => {
                            props.closeAddComment();
                        }, 500)
                    }}>{_t.textCancel}</Link>
                </NavLeft>
                <NavTitle>{_t.textAddComment}</NavTitle>
                <NavRight>
                    <Link className={stateText.length === 0 && 'disabled'}
                          onClick={() => {
                              f7.popup.close('.add-comment-popup');
                              setTimeout(() => {
                                  props.closeAddComment();
                                  props.onAddNewComment(stateText, false)
                              }, 500);
                    }}>
                        {Device.android ? <Icon icon='icon-done-comment-white'/> : _t.textDone}
                    </Link>
                </NavRight>
            </Navbar>
            <div className='wrap-comment'>
                <div className="comment-header">
                    {Device.android &&
                    <div className='initials' style={{backgroundColor: `${userInfo.color}`}}>{userInfo.initials}</div>
                    }
                    <div className='name'>{userInfo.name}</div>
                </div>
                <div className='wrap-textarea'>
                    <textarea autoFocus placeholder={_t.textAddComment} value={stateText} onChange={(event) => {setText(event.target.value);}} ref={el => refInputComment = el}></textarea>
                </div>
            </div>
        </Popup>
    )
}));

const AddCommentDialog = inject("storeComments")(observer(props => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const userInfo = props.userInfo;
    const templateInitials = `<div class="initials" style="background-color: ${userInfo.color};">${userInfo.initials}</div>`;
    let refContainerDialog = useRef(null);

    useEffect(() => {
        f7.dialog.create({
            destroyOnClose: true,
            containerEl: document.getElementById('add-comment-dialog'),
            content:
                `<div class="navbar">
                    <div class="navbar-bg"></div>
                    <div class="navbar-inner sliding">
                        <div class="left">
                            <a href="#" id="comment-cancel">${_t.textCancel}</a>
                        </div>
                        <div class="title">${_t.textAddComment}</div>
                        <div class="right">
                            <a href="#" class="done" id="comment-done">${ Device.android ? '<i class="icon icon-done-comment-white"></i>' : _t.textDone}</a>
                        </div>
                    </div>
                </div>
                <div class='wrap-comment'>
                    <div class="comment-header">
                        ${Device.android ? templateInitials : ''}
                        <div class='name'>${userInfo.name}</div>
                    </div>
                    <div class='wrap-textarea'>
                        <textarea id='comment-text' placeholder='${_t.textAddComment}'></textarea>
                    </div>
                </div>`,
            on: {
                opened: () => {
                    const cancel = document.getElementById('comment-cancel');
                    if(!Device.android) $$('#comment-text').focus();
                    cancel.addEventListener('click', () => {
                        f7.dialog.close();
                        props.closeAddComment();
                    });
                    const done = document.getElementById('comment-done');
                    done.addEventListener('click', () => {
                        const value = document.getElementById('comment-text').value;
                        if (value.length > 0) {
                            f7.dialog.close();
                            props.closeAddComment();
                            props.onAddNewComment(value, false);
                        }
                    });
                    const area = document.getElementById('comment-text');
                    area.addEventListener('input', (event) => {
                        if (event.target.value.length === 0 && !done.classList.contains('disabled')) {
                            done.classList.add('disabled');
                        } else if (event.target.value.length > 0 && done.classList.contains('disabled')) {
                            done.classList.remove('disabled');
                        }
                    });
                    done.classList.add('disabled');
                }
            }
        }).open();

        if(refContainerDialog) {
            const inputComment = refContainerDialog.querySelector('#comment-text');
            inputComment.focus();
        }
    }, []);

    return (
        <div id='add-comment-dialog' ref={el => refContainerDialog = el} className="add-comment-dialog"></div>
    );
}));

const AddComment = props => {
    return (
        Device.phone ?
            <AddCommentPopup {...props} /> :
            <AddCommentDialog {...props} />
    )
};

// Actions
const CommentActions = ({comment, onCommentMenuClick, opened, openActionComment}) => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    return (
        <Actions id='comment-menu' opened={opened} onActionsClosed={() => openActionComment(false)}>
            <ActionsGroup>
                {comment && <Fragment>
                    {comment.editable && <ActionsButton onClick={() => {onCommentMenuClick('editComment', comment);}}>{_t.textEdit}</ActionsButton>}
                    {!comment.resolved && comment.editable ?
                        <ActionsButton onClick={() => {onCommentMenuClick('resolve', comment);}}>{_t.textResolve}</ActionsButton> :
                       comment.editable && <ActionsButton onClick={() => {onCommentMenuClick('resolve', comment);}}>{_t.textReopen}</ActionsButton>
                    }
                    <ActionsButton onClick={() => {onCommentMenuClick('addReply', comment);}}>{_t.textAddReply}</ActionsButton>
                    {comment.removable && <ActionsButton color='red' onClick={() => {onCommentMenuClick('deleteComment', comment);}}>{_t.textDeleteComment}</ActionsButton>}
                </Fragment>
                }
            </ActionsGroup>
            <ActionsGroup>
                <ActionsButton>{_t.textCancel}</ActionsButton>
            </ActionsGroup>
        </Actions>
    )
};

const ReplyActions = ({comment, reply, onCommentMenuClick, opened, openActionReply}) => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    return (
        <Actions id='reply-menu' opened={opened} onActionsClosed={() => openActionReply(false)}>
            <ActionsGroup>
                {reply && <Fragment>
                    {reply.editable && <ActionsButton onClick={() => {onCommentMenuClick('editReply', comment, reply);}}>{_t.textEdit}</ActionsButton>}
                    {reply.removable && <ActionsButton color='red' onClick={() => {onCommentMenuClick('deleteReply', comment, reply);}}>{_t.textDeleteReply}</ActionsButton>}
                </Fragment>
                }
            </ActionsGroup>
            <ActionsGroup>
                <ActionsButton>{_t.textCancel}</ActionsButton>
            </ActionsGroup>
        </Actions>
    )
};

// Edit comment
const EditCommentPopup = inject("storeComments")(observer(({storeComments, comment, onEditComment}) => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const [stateText, setText] = useState(comment.comment);
    let refInputEditComment = useRef(null);

    useEffect(() => {
        f7.popup.open('.edit-comment-popup', false);

        if(refInputEditComment) {
            refInputEditComment.focus();
        }
    }, []);
   
    return (
        <Popup className="edit-comment-popup">
            <Navbar>
                <NavLeft>
                    <Link onClick={() => {
                        f7.popup.close('.edit-comment-popup');
                        setTimeout(() => {
                            storeComments.openEditComment(false);
                        }, 500);
                    }}>{_t.textCancel}</Link>
                </NavLeft>
                <NavTitle>{_t.textEditComment}</NavTitle>
                <NavRight>
                    <Link className={stateText.length === 0 && 'disabled'}
                          onClick={() => {
                              f7.popup.close('.edit-comment-popup');
                              setTimeout(() => {
                                  storeComments.openEditComment(false);
                                  onEditComment(comment, stateText);
                              }, 500);
                          }}
                    >
                        {Device.android ? <Icon icon='icon-done-comment-white'/> : _t.textDone}
                    </Link>
                </NavRight>
            </Navbar>
            <div className='wrap-comment'>
                <div className="comment-header">
                    {Device.android &&
                    <div className='initials' style={{backgroundColor: `${comment.userColor}`}}>{comment.userInitials}</div>
                    }
                    <div>
                        <div className='name'>{comment.parsedName}</div>
                        <div className='comment-date'>{comment.date}</div>
                    </div>
                </div>
                <div className='wrap-textarea'>
                    <textarea placeholder={_t.textEditComment} autoFocus value={stateText} onChange={(event) => {setText(event.target.value);}} ref={el => refInputEditComment = el}></textarea>
                </div>
            </div>
        </Popup>
    )
}));

const EditCommentDialog = inject("storeComments")(observer(({storeComments, comment, onEditComment}) => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const templateInitials = `<div class="initials" style="background-color: ${comment.userColor};">${comment.userInitials}</div>`;
    let refContainerDialog = useRef(null);

    useEffect(() => {
        f7.dialog.create({
            destroyOnClose: true,
            containerEl: document.getElementById('edit-comment-dialog'),
            content:
                `<div class="navbar">
                    <div class="navbar-bg"></div>
                    <div class="navbar-inner sliding">
                        <div class="left">
                            <a href="#" id="comment-cancel">${_t.textCancel}</a>
                        </div>
                        <div class="title">${_t.textEditComment}</div>
                        <div class="right">
                            <a href="#" class="done" id="comment-done">${ Device.android ? '<i class="icon icon-done-comment-white"></i>' : _t.textDone}</a>
                        </div>
                    </div>
                </div>
                <div class='wrap-comment'>
                    <div class="comment-header">
                        ${Device.android ? templateInitials : ''}
                        <div>
                            <div class='name'>${comment.parsedName}</div>
                            <div class='comment-date'>${comment.date}</div>
                        </div>
                    </div>
                    <div class='wrap-textarea'>
                        <textarea id='comment-text' placeholder='${_t.textEditComment}' autofocus>${comment.comment}</textarea>
                    </div>
                </div>`,
            on: {
                opened: () => {
                    const cancel = document.getElementById('comment-cancel');
                    cancel.addEventListener('click', () => {
                        f7.dialog.close();
                        storeComments.openEditComment(false);
                    });
                    const done = document.getElementById('comment-done');
                    done.addEventListener('click', () => {
                        const value = document.getElementById('comment-text').value;
                        if (value.length > 0) {
                            onEditComment(comment, value);
                            f7.dialog.close();
                            storeComments.openEditComment(false);
                        }
                    });
                    const area = document.getElementById('comment-text');
                    area.addEventListener('input', (event) => {
                        if (event.target.value.length === 0 && !done.classList.contains('disabled')) {
                            done.classList.add('disabled');
                        } else if (event.target.value.length > 0 && done.classList.contains('disabled')) {
                            done.classList.remove('disabled');
                        }
                    });
                },
                open: () => {
                    $$('.dialog-backdrop.backdrop-in')[0].classList.add('over-popover');
                },
                closed: () => {
                    $$('.dialog-backdrop.backdrop-in')[0].classList.remove('over-popover');
                }
            }
        }).open();

        if(refContainerDialog) {
            const inputComment = refContainerDialog.querySelector('#comment-text');
            inputComment.focus();
        }
    }, []);

    return (
        <div id='edit-comment-dialog' ref={el => refContainerDialog = el} className="edit-comment-dialog"></div>
    );
}));

const EditComment = ({comment, onEditComment}) => {
    return (
        Device.phone ?
            <EditCommentPopup comment={comment} onEditComment={onEditComment}/> :
            <EditCommentDialog comment={comment} onEditComment={onEditComment}/>
    )
};

const AddReplyPopup = inject("storeComments")(observer(({storeComments, userInfo, comment, onAddReply}) => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const [stateText, setText] = useState('');
    let refInputReplyComment = useRef(null);

    useEffect(() => {
        f7.popup.open('.add-reply-popup', false);

        if(refInputReplyComment) {
            refInputReplyComment.focus();
        }
    }, []);

    return (
        <Popup className="add-reply-popup">
            <Navbar>
                <NavLeft>
                    <Link onClick={() => {
                        f7.popup.close('.add-reply-popup');
                        setTimeout(() => {
                            storeComments.openAddReply(false);
                        }, 500);
                    }}>{_t.textCancel}</Link>
                </NavLeft>
                <NavTitle>{_t.textAddReply}</NavTitle>
                <NavRight>
                    <Link className={stateText.length === 0 && 'disabled'}
                          onClick={() => {
                              f7.popup.close('.add-reply-popup');
                              setTimeout(() => {
                                  storeComments.openAddReply(false);
                                  onAddReply(comment, stateText);
                              }, 500);
                          }}>
                        {Device.android ? <Icon icon='icon-done-comment-white'/> : _t.textDone}
                    </Link>
                </NavRight>
            </Navbar>
            <div className='wrap-comment'>
                <div className="comment-header">
                    {Device.android &&
                    <div className='initials' style={{backgroundColor: `${userInfo.color}`}}>{userInfo.initials}</div>
                    }
                    <div className='name'>{userInfo.name}</div>
                </div>
                <div className='wrap-textarea'>
                    <textarea placeholder={_t.textAddReply} autoFocus value={stateText} onChange={(event) => {setText(event.target.value);}} ref={el => refInputReplyComment = el}></textarea>
                </div>
            </div>
        </Popup>
    )
}));

const AddReplyDialog = inject("storeComments")(observer(({storeComments, userInfo, comment, onAddReply}) => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const templateInitials = `<div class="initials" style="background-color: ${userInfo.color};">${userInfo.initials}</div>`;
    let refContainerDialog = useRef(null);

    useEffect(() => {
        f7.dialog.create({
            destroyOnClose: true,
            containerEl: document.getElementById('add-reply-dialog'),
            content:
                `<div class="navbar">
                    <div class="navbar-bg"></div>
                    <div class="navbar-inner sliding">
                        <div class="left">
                            <a href="#" id="reply-cancel">${_t.textCancel}</a>
                        </div>
                        <div class="title">${_t.textAddReply}</div>
                        <div class="right">
                            <a href="#" class="done" id="reply-done">${ Device.android ? '<i class="icon icon-done-comment-white"></i>' : _t.textDone}</a>
                        </div>
                    </div>
                </div>
                <div class='wrap-comment'>
                    <div class="comment-header">
                        ${Device.android ? templateInitials : ''}
                        <div class='name'>${userInfo.name}</div>
                    </div>
                    <div class='wrap-textarea'>
                        <textarea id='reply-text' placeholder='${_t.textAddReply}' autofocus></textarea>
                    </div>
                </div>`,
            on: {
                opened: () => {
                    const cancel = document.getElementById('reply-cancel');
                    cancel.addEventListener('click', () => {
                        f7.dialog.close();
                        storeComments.openAddReply(false);
                    });
                    const done = document.getElementById('reply-done');
                    done.addEventListener('click', () => {
                        const value = document.getElementById('reply-text').value;
                        if (value.length > 0) {
                            onAddReply(comment, value);
                            f7.dialog.close();
                            storeComments.openAddReply(false);
                        }
                    });
                    const area = document.getElementById('reply-text');
                    area.addEventListener('input', (event) => {
                        if (event.target.value.length === 0 && !done.classList.contains('disabled')) {
                            done.classList.add('disabled');
                        } else if (event.target.value.length > 0 && done.classList.contains('disabled')) {
                            done.classList.remove('disabled');
                        }
                    });
                    done.classList.add('disabled');
                },
                open: () => {
                    $$('.dialog-backdrop.backdrop-in')[0].classList.add('over-popover');
                },
                closed: () => {
                    $$('.dialog-backdrop.backdrop-in')[0].classList.remove('over-popover');
                }
            }
        }).open();

        if(refContainerDialog) {
            const inputReplyComment = refContainerDialog.querySelector('#reply-text');
            inputReplyComment.focus();
        }
    }, []);

    return (
        <div id='add-reply-dialog' ref={el => refContainerDialog = el} className="add-reply-dialog"></div>
    );
}));

const AddReply = ({userInfo, comment, onAddReply}) => {
    return (
        Device.phone ?
            <AddReplyPopup userInfo={userInfo} comment={comment} onAddReply={onAddReply}/> :
            <AddReplyDialog userInfo={userInfo} comment={comment} onAddReply={onAddReply}/>
    )
};

const EditReplyPopup = inject("storeComments")(observer(({storeComments, comment, reply, onEditReply}) => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const [stateText, setText] = useState(reply.reply);
    let relInputReplyComment = useRef(null);

    useEffect(() => {
        f7.popup.open('.edit-reply-popup', false);

        if(relInputReplyComment) {
            relInputReplyComment.focus();
        }
    }, []);

    return (
        <Popup className="edit-reply-popup">
            <Navbar>
                <NavLeft>
                    <Link onClick={() => {
                        f7.popup.close('.edit-reply-popup');
                        setTimeout(() => {
                            storeComments.openEditReply(false);
                        }, 500);
                    }}>{_t.textCancel}</Link>
                </NavLeft>
                <NavTitle>{_t.textEditReply}</NavTitle>
                <NavRight>
                    <Link className={stateText.length === 0 && 'disabled'}
                          onClick={() => {
                              f7.popup.close('.edit-reply-popup');
                              setTimeout(() => {
                                  storeComments.openEditReply(false);
                                  onEditReply(comment, reply, stateText);
                              }, 500);
                          }}
                    >
                        {Device.android ? <Icon icon='icon-done-comment-white'/> : _t.textDone}
                    </Link>
                </NavRight>
            </Navbar>
            <div className='wrap-comment'>
                <div className="comment-header">
                    {Device.android &&
                    <div className='initials' style={{backgroundColor: `${reply.userColor}`}}>{reply.userInitials}</div>
                    }
                    <div>
                        <div className='name'>{reply.parsedName}</div>
                        <div className='reply-date'>{reply.date}</div>
                    </div>
                </div>
                <div className='wrap-textarea'>
                    <textarea placeholder={_t.textEditReply} autoFocus value={stateText} onChange={(event) => {setText(event.target.value);}} ref={el => relInputReplyComment = el}></textarea>
                </div>
            </div>
        </Popup>
    )
}));

const EditReplyDialog = inject("storeComments")(observer(({storeComments, comment, reply, onEditReply}) => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const templateInitials = `<div class="initials" style="background-color: ${reply.userColor};">${reply.userInitials}</div>`;
    let refContainerDialog = useRef(null);

    useEffect(() => {
        f7.dialog.create({
            destroyOnClose: true,
            containerEl: document.getElementById('edit-reply-dialog'),
            content:
                `<div class="navbar">
                    <div class="navbar-bg"></div>
                    <div class="navbar-inner sliding">
                        <div class="left">
                            <a href="#" id="reply-cancel">${_t.textCancel}</a>
                        </div>
                        <div class="title">${_t.textEditReply}</div>
                        <div class="right">
                            <a href="#" class="done" id="reply-done">${ Device.android ? '<i class="icon icon-done-comment-white"></i>' : _t.textDone}</a>
                        </div>
                    </div>
                </div>
                <div class='wrap-comment'>
                    <div class="comment-header">
                        ${Device.android ? templateInitials : ''}
                        <div>
                            <div class='name'>${reply.parsedName}</div>
                            <div class='reply-date'>${reply.date}</div>
                        </div>
                    </div>
                    <div class='wrap-textarea'>
                        <textarea id='reply-text' placeholder='${_t.textEditComment}' autofocus>${reply.reply}</textarea>
                    </div>
                </div>`,
            on: {
                opened: () => {
                    const cancel = document.getElementById('reply-cancel');
                    cancel.addEventListener('click', () => {
                        f7.dialog.close();
                        storeComments.openEditReply(false);
                    });
                    const done = document.getElementById('reply-done');
                    done.addEventListener('click', () => {
                        const value = document.getElementById('reply-text').value;
                        if (value.length > 0) {
                            onEditReply(comment, reply, value);
                            f7.dialog.close();
                            storeComments.openEditReply(false);
                        }
                    });
                    const area = document.getElementById('reply-text');
                    area.addEventListener('input', (event) => {
                        if (event.target.value.length === 0 && !done.classList.contains('disabled')) {
                            done.classList.add('disabled');
                        } else if (event.target.value.length > 0 && done.classList.contains('disabled')) {
                            done.classList.remove('disabled');
                        }
                    });
                },
                open: () => {
                    $$('.dialog-backdrop.backdrop-in')[0].classList.add('over-popover');
                },
                closed: () => {
                    $$('.dialog-backdrop.backdrop-in')[0].classList.remove('over-popover');
                }
            }
        }).open();

        if(refContainerDialog) {
            const inputReplyComment = refContainerDialog.querySelector('#reply-text');
            inputReplyComment.focus();
        }
    }, []);

    return (
        <div id='edit-reply-dialog' ref={el => refContainerDialog = el} className="edit-reply-dialog"></div>
    );
}));

const EditReply = ({comment, reply, onEditReply}) => {
    return (
        Device.phone ?
            <EditReplyPopup comment={comment} reply={reply} onEditReply={onEditReply}/> :
            <EditReplyDialog comment={comment} reply={reply} onEditReply={onEditReply}/>
    )
};

const pickLink = (message) => {
    let arrayComment = [], offset, len;
    message.replace(Common.Utils.ipStrongRe, function(subStr) {
        let result = /[\.,\?\+;:=!\(\)]+$/.exec(subStr);
        if (result)
            subStr = subStr.substring(0, result.index);
        offset = arguments[arguments.length-2];
        arrayComment.push({start: offset, end: subStr.length+offset, str: <a onClick={() => window.open(subStr)}  href={subStr} target="_blank" data-can-copy="true">{subStr}</a>});
        return '';
    });

    if (message.length<1000 || message.search(/\S{255,}/)<0)
        message.replace(Common.Utils.hostnameStrongRe, function(subStr) {
            let result = /[\.,\?\+;:=!\(\)]+$/.exec(subStr);
            if (result)
                subStr = subStr.substring(0, result.index);
            let ref = (! /(((^https?)|(^ftp)):\/\/)/i.test(subStr) ) ? ('http://' + subStr) : subStr;
            offset = arguments[arguments.length-2];
            len = subStr.length;
            let elem = arrayComment.find(function(item){
                return ( (offset>=item.start) && (offset<item.end) ||
                    (offset<=item.start) && (offset+len>item.start));
            });
            if (!elem)
                arrayComment.push({start: offset, end: len+offset, str: <a onClick={() => window.open(ref)} href={ref} target="_blank" data-can-copy="true">{subStr}</a>});
            return '';
        });

    message.replace(Common.Utils.emailStrongRe, function(subStr) {
        let ref = (! /((^mailto:)\/\/)/i.test(subStr) ) ? ('mailto:' + subStr) : subStr;
        offset = arguments[arguments.length-2];
        len = subStr.length;
        let elem = arrayComment.find(function(item){
            return ( (offset>=item.start) && (offset<item.end) ||
                        (offset<=item.start) && (offset+len>item.start));
        });
        if (!elem)
            arrayComment.push({start: offset, end: len+offset, str: <a onClick={() => window.open(ref)} href={ref}>{subStr}</a>});
        return '';
    });

    arrayComment = arrayComment.sort(function(item1,item2){ return item1.start - item2.start; });
    
    let str_res = (arrayComment.length>0) ? <label>{message.substring(0, arrayComment[0].start)}{arrayComment[0].str}</label> : <label>{message}</label>;

    for (var i=1; i<arrayComment.length; i++) {
        str_res = <label>{str_res}{Common.Utils.String.htmlEncode(message.substring(arrayComment[i-1].end, arrayComment[i].start))}{arrayComment[i].str}</label>;
    }

    if (arrayComment.length>0) {
        str_res = <label>{str_res}{Common.Utils.String.htmlEncode(message.substring(arrayComment[i-1].end, message.length))}</label>;
    }

    return str_res;         
}

// View comments

const ViewComments = inject("storeComments", "storeAppOptions", "storeReview")(observer(({storeComments, storeAppOptions, onCommentMenuClick, onResolveComment, showComment, storeReview, wsProps}) => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const isAndroid = Device.android;
    const displayMode = storeReview.displayMode;
    const isViewer = storeAppOptions.isViewer;
    const canEditComments = storeAppOptions.canEditComments;
    const viewMode = !storeAppOptions.canComments;
    const comments = storeComments.groupCollectionFilter || storeComments.collectionComments;
    const isEdit = storeAppOptions.isEdit || storeAppOptions.isRestrictedEdit;
    const sortComments = comments.length > 0 ? [...comments].sort((a, b) => a.time > b.time ? -1 : 1) : null;
    const isProtected = storeAppOptions.isProtected;
    const typeProtection = storeAppOptions.typeProtection;
    const isAvailableCommenting = !isProtected || typeProtection === Asc.c_oAscEDocProtect.TrackedChanges || typeProtection === Asc.c_oAscEDocProtect.Comments;

    const [clickComment, setComment] = useState();
    const [commentActionsOpened, openActionComment] = useState(false);

    const [reply, setReply] = useState();
    const [replyActionsOpened, openActionReply] = useState(false);

    return (
        <Page>
            <Navbar title={_t.textComments} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose=".coauth__sheet">
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            {!sortComments ?
                <div className='no-comments'>{_t.textNoComments}</div> :
                <List className='comment-list'>
                    {sortComments.map((comment, indexComment) => {
                        return (
                            !comment.hide &&
                            <ListItem key={`comment-${indexComment}`} onClick={e => {
                                    !e.target.closest('.comment-menu') && !e.target.closest('.reply-menu') ? showComment(comment) : null}}>
                                <div slot='header' className='comment-header'>
                                    <div className='left'>
                                        {isAndroid && <div className='initials' style={{backgroundColor: `${comment.userColor ? comment.userColor : '#cfcfcf'}`}}>{comment.userInitials}</div>}
                                        <div>
                                            <div className='user-name'>{comment.parsedName}</div>
                                            <div className='comment-date'>{comment.date}</div>
                                        </div>
                                    </div>
                                    {isEdit && !viewMode &&
                                        <div className='right'>
                                            {(comment.editable && displayMode === 'markup' && !wsProps?.Objects && (!isViewer || canEditComments) && isAvailableCommenting) && <div className='comment-resolve' onClick={() => {onResolveComment(comment);}}><Icon icon={comment.resolved ? 'icon-resolve-comment check' : 'icon-resolve-comment'} /></div> }
                                            {(displayMode === 'markup' && !wsProps?.Objects && (!isViewer || canEditComments) && isAvailableCommenting) &&
                                                <div className='comment-menu'
                                                    onClick={() => {setComment(comment); openActionComment(true);}}>
                                                    <Icon icon='icon-menu-comment'/>
                                                </div>
                                            }
                                        </div>
                                    }
                                </div>
                                <div slot='footer'>
                                    {comment.quote && <div className='comment-quote'>{sliceQuote(comment.quote)}</div>}
                                    <div className='comment-text'><pre>{pickLink(comment.comment)}</pre></div>
                                    {comment.replies.length > 0 &&
                                    <ul className='reply-list'>
                                        {comment.replies.map((reply, indexReply) => {
                                            return (
                                                <li key={`reply-${indexComment}-${indexReply}`}
                                                    className='reply-item'
                                                >
                                                    <div className='item-content'>
                                                        <div className='item-inner'>
                                                            <div className='item-title'>
                                                                <div slot='header' className='reply-header'>
                                                                    <div className='left'>
                                                                        {isAndroid && <div className='initials' style={{backgroundColor: `${reply.userColor ? reply.userColor : '#cfcfcf'}`}}>{reply.userInitials}</div>}
                                                                        <div>
                                                                            <div className='user-name'>{reply.parsedName}</div>
                                                                            <div className='reply-date'>{reply.date}</div>
                                                                        </div>
                                                                    </div>
                                                                    {isEdit && !viewMode && reply.editable && (!isViewer || canEditComments) && isAvailableCommenting &&
                                                                        <div className='right'>
                                                                            <div className='reply-menu'
                                                                                 onClick={() => {setComment(comment); setReply(reply); openActionReply(true);}}
                                                                            >
                                                                                <Icon icon='icon-menu-comment'/>
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                </div>
                                                                <div slot='footer'>
                                                                    <div className='reply-text'><pre>{pickLink(reply.reply)}</pre></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                    }
                                </div>
                            </ListItem>
                        )
                    })}
                </List>
            }

            <CommentActions comment={clickComment} onCommentMenuClick={onCommentMenuClick} opened={commentActionsOpened} openActionComment={openActionComment}/>
            <ReplyActions comment={clickComment} reply={reply} onCommentMenuClick={onCommentMenuClick} opened={replyActionsOpened} openActionReply={openActionReply}/>
        </Page>
    )
}));

const CommentList = inject("storeComments", "storeAppOptions", "storeReview")(observer(({storeComments, storeAppOptions, onCommentMenuClick, onResolveComment, storeReview, wsProps}) => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const isAndroid = Device.android;
    const displayMode = storeReview.displayMode;
    const isViewer = storeAppOptions.isViewer;
    const canEditComments = storeAppOptions.canEditComments;
    const viewMode = !storeAppOptions.canComments;
    const isEdit = storeAppOptions.isEdit || storeAppOptions.isRestrictedEdit;
    const comments = storeComments.showComments;
    const isProtected = storeAppOptions.isProtected;
    const typeProtection = storeAppOptions.typeProtection;
    const isAvailableCommenting = !isProtected || typeProtection === Asc.c_oAscEDocProtect.TrackedChanges || typeProtection === Asc.c_oAscEDocProtect.Comments;

    const [currentIndex, setCurrentIndex] = useState(0);
    const comment = comments[currentIndex];

    const [commentActionsOpened, openActionComment] = useState(false);

    const [reply, setReply] = useState();
    const [replyActionsOpened, openActionReply] = useState(false);

    const onViewPrevComment = () => {
        if (currentIndex - 1 < 0) {
            setCurrentIndex(comments.length - 1);
        } else {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const onViewNextComment = () => {
        if (currentIndex + 1 >= comments.length) {
            setCurrentIndex(0);
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    };

    if(!comment) {
        if (comments.length > 0) {
            onViewNextComment();
        }
        return null;
    }

    return (
        <Fragment>
            <Toolbar position='bottom'>
                {isEdit && !viewMode &&
                    <Link className={`btn-add-reply${((wsProps?.Objects || isViewer) && !canEditComments || !isAvailableCommenting) ? ' disabled' : ''}`} href='#' onClick={() => {onCommentMenuClick('addReply', comment);}}>{_t.textAddReply}</Link>
                }
                {comments.length > 1 &&
                    <div className='comment-navigation row'>
                        <Link href='#' onClick={onViewPrevComment}><Icon slot='media' icon='icon-prev'/></Link>
                        <Link href='#' onClick={onViewNextComment}><Icon slot='media' icon='icon-next'/></Link>
                    </div>
                }
            </Toolbar>
            <div className='pages'>
                <Page className='page-current-comment'>
                    <List className='comment-list'>
                        <ListItem>
                            <div slot='header' className='comment-header'>
                                <div className='left'>
                                    {isAndroid && <div className='initials' style={{backgroundColor: `${comment.userColor ? comment.userColor : '#cfcfcf'}`}}>{comment.userInitials}</div>}
                                    <div>
                                        <div className='user-name'>{comment.parsedName}</div>
                                        <div className='comment-date'>{comment.date}</div>
                                    </div>
                                </div>
                                {isEdit && !viewMode &&
                                    <div className='right'>
                                        {(comment.editable && displayMode === 'markup' && !wsProps?.Objects && (!isViewer || canEditComments) && isAvailableCommenting) && <div className='comment-resolve' onClick={() => {onResolveComment(comment);}}><Icon icon={comment.resolved ? 'icon-resolve-comment check' : 'icon-resolve-comment'}/></div>}
                                        {(displayMode === 'markup' && !wsProps?.Objects && (!isViewer || canEditComments) && isAvailableCommenting) &&
                                            <div className='comment-menu'
                                                onClick={() => {openActionComment(true);}}>
                                                <Icon icon='icon-menu-comment'/>
                                            </div>
                                        }
                                    </div>
                                }
                            </div>
                            <div slot='footer'>
                                {comment.quote && <div className='comment-quote'>{sliceQuote(comment.quote)}</div>}
                                <div className='comment-text'><pre>{pickLink(comment.comment)}</pre></div>
                                {comment.replies.length > 0 &&
                                    <ul className='reply-list'>
                                        {comment.replies.map((reply, indexReply) => {
                                            return (
                                                <li key={`reply-${indexReply}`}
                                                    className='reply-item'
                                                >
                                                    <div className='item-content'>
                                                        <div className='item-inner'>
                                                            <div className='item-title'>
                                                                <div slot='header' className='reply-header'>
                                                                    <div className='left'>
                                                                        {isAndroid && <div className='initials' style={{backgroundColor: `${reply.userColor ? reply.userColor : '#cfcfcf'}`}}>{reply.userInitials}</div>}
                                                                        <div>
                                                                            <div className='user-name'>{reply.parsedName}</div>
                                                                            <div className='reply-date'>{reply.date}</div>
                                                                        </div>
                                                                    </div>
                                                                    {isEdit && !viewMode && reply.editable && (!isViewer || canEditComments) && isAvailableCommenting &&
                                                                        <div className='right'>
                                                                            <div className='reply-menu'
                                                                                onClick={() => {setReply(reply); openActionReply(true);}}
                                                                            >
                                                                                <Icon icon='icon-menu-comment'/>
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                </div>
                                                                <div slot='footer'>
                                                                    <div className='reply-text'><pre>{pickLink(reply.reply)}</pre></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                }
                            </div>
                        </ListItem>
                    </List>
                    <CommentActions comment={comment} onCommentMenuClick={onCommentMenuClick} opened={commentActionsOpened} openActionComment={openActionComment}/>
                    <ReplyActions comment={comment} reply={reply} onCommentMenuClick={onCommentMenuClick} opened={replyActionsOpened} openActionReply={openActionReply}/>
                </Page>
            </div>
        </Fragment>
    )

}));

const ViewCommentSheet = ({closeCurComments, onCommentMenuClick, onResolveComment, wsProps}) => {
    useEffect(() => {
        f7.sheet.open('#view-comment-sheet');
    });

    const [stateHeight, setHeight] = useState('45%');
    const [stateOpacity, setOpacity] = useState(1);

    const [stateStartY, setStartY] = useState();
    const [isNeedClose, setNeedClose] = useState(false);

    const handleTouchStart = (event) => {
        const touchObj = event.changedTouches[0];
        setStartY(parseInt(touchObj.clientY));
    };
    const handleTouchMove = (event) => {
        const touchObj = event.changedTouches[0];
        const dist = parseInt(touchObj.clientY) - stateStartY;
        if (dist < 0) { // to top
            setHeight('90%');
            setOpacity(1);
            setNeedClose(false);
        } else if (dist < 80) {
            setHeight('45%');
            setOpacity(1);
            setNeedClose(false);
        } else {
            setNeedClose(true);
            setOpacity(0.6);
        }
    };
    const handleTouchEnd = (event) => {
        const touchObj = event.changedTouches[0];
        const swipeEnd = parseInt(touchObj.clientY);
        const dist = swipeEnd - stateStartY;
        if (isNeedClose) {
            closeCurComments();
        } else if (stateHeight === '90%' && dist > 20) {
            setHeight('45%');
        }
    };
    return (
        <Sheet id='view-comment-sheet' style={{height: `${stateHeight}`, opacity: `${stateOpacity}`}} backdrop={true} closeByBackdropClick={true}>
            <div id='swipe-handler' className='swipe-container' onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                <Icon icon='icon-swipe'/>
            </div>
            <CommentList wsProps={wsProps} onCommentMenuClick={onCommentMenuClick} onResolveComment={onResolveComment}/>
        </Sheet>
    )
};

const ViewCommentPopover = ({onCommentMenuClick, onResolveComment, wsProps}) => {
    useEffect(() => {
        f7.popover.open('#view-comment-popover', '#btn-coauth');
    });

    return (
        <Popover id='view-comment-popover' style={{height: '410px'}} closeByOutsideClick={false}>
            <CommentList wsProps={wsProps} onCommentMenuClick={onCommentMenuClick} onResolveComment={onResolveComment} />
        </Popover>
    )
};

const ViewCurrentComments = props => {
    return (
        Device.phone ?
            <ViewCommentSheet {...props}/> :
            <ViewCommentPopover {...props}/>
    )
};

export {
    AddComment,
    EditComment,
    AddReply,
    EditReply,
    ViewComments,
    ViewCurrentComments
};
