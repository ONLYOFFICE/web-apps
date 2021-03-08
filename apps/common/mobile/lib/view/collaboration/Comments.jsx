import React, {useState, useEffect, Fragment} from 'react';
import {observer, inject} from "mobx-react";
import { f7, Popup, Sheet, Popover, Page, Toolbar, Navbar, NavLeft, NavRight, NavTitle, Link, Input, Icon, List, ListItem, Actions, ActionsGroup, ActionsButton } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../utils/device';

// Add comment

const AddCommentPopup = inject("storeComments")(observer(props => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    useEffect(() => {
        f7.popup.open('.add-comment-popup');
    });
    const userInfo = props.userInfo;
    const [stateText, setText] = useState('');
    return (
        <Popup className="add-comment-popup">
            <Navbar>
                <NavLeft>
                    <Link onClick={() => {
                        props.closeAddComment();
                        f7.popup.close('.add-comment-popup');
                    }}>{_t.textCancel}</Link>
                </NavLeft>
                <NavTitle>{_t.textAddComment}</NavTitle>
                <NavRight>
                    <Link className={stateText.length === 0 && 'disabled'}
                          onClick={() => {
                              if (props.onAddNewComment(stateText, false)) {
                                  props.closeAddComment();
                                  f7.popup.close('.add-comment-popup');
                              }
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
                    <Input type='textarea' placeholder={_t.textAddComment} autofocus value={stateText} onChange={(event) => {setText(event.target.value);}}></Input>
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
                        <textarea id='comment-text' placeholder='${_t.textAddComment}' autofocus></textarea>
                    </div>
                </div>`,
            on: {
                opened: () => {
                    const cancel = document.getElementById('comment-cancel');
                    cancel.addEventListener('click', () => {
                        f7.dialog.close();
                        props.closeAddComment();
                    });
                    const done = document.getElementById('comment-done');
                    done.addEventListener('click', () => {
                        const value = document.getElementById('comment-text').value;
                        if (value.length > 0 && props.onAddNewComment(value, false)) {
                            f7.dialog.close();
                            props.closeAddComment();
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
    });
    return (
        <div id='add-comment-dialog'></div>
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
                    {!comment.resolved ?
                        <ActionsButton onClick={() => {onCommentMenuClick('resolve', comment);}}>{_t.textResolve}</ActionsButton> :
                        <ActionsButton onClick={() => {onCommentMenuClick('resolve', comment);}}>{_t.textReopen}</ActionsButton>
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
    useEffect(() => {
        f7.popup.open('.edit-comment-popup');
    });
    const [stateText, setText] = useState(comment.comment);
    return (
        <Popup className="edit-comment-popup">
            <Navbar>
                <NavLeft>
                    <Link onClick={() => {
                        f7.popup.close('.edit-comment-popup');
                        storeComments.openEditComment(false);
                    }}>{_t.textCancel}</Link>
                </NavLeft>
                <NavTitle>{_t.textEditComment}</NavTitle>
                <NavRight>
                    <Link className={stateText.length === 0 && 'disabled'}
                          onClick={() => {
                              onEditComment(comment, stateText);
                              f7.popup.close('.edit-comment-popup');
                              storeComments.openEditComment(false);
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
                        <div className='name'>{comment.userName}</div>
                        <div className='comment-date'>{comment.date}</div>
                    </div>
                </div>
                <div className='wrap-textarea'>
                    <Input type='textarea' placeholder={_t.textEditComment} autofocus value={stateText} onChange={(event) => {setText(event.target.value);}}></Input>
                </div>
            </div>
        </Popup>
    )
}));

const EditCommentDialog = inject("storeComments")(observer(({storeComments, comment, onEditComment}) => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const templateInitials = `<div class="initials" style="background-color: ${comment.userColor};">${comment.userInitials}</div>`;
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
                            <div class='name'>${comment.userName}</div>
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
                }
            }
        }).open();
    });
    return (
        <div id='edit-comment-dialog'></div>
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
    useEffect(() => {
        f7.popup.open('.add-reply-popup');
    });
    const [stateText, setText] = useState('');
    return (
        <Popup className="add-reply-popup">
            <Navbar>
                <NavLeft>
                    <Link onClick={() => {
                        storeComments.openAddReply(false);
                        f7.popup.close('.add-reply-popup');
                    }}>{_t.textCancel}</Link>
                </NavLeft>
                <NavTitle>{_t.textAddReply}</NavTitle>
                <NavRight>
                    <Link className={stateText.length === 0 && 'disabled'}
                          onClick={() => {
                              onAddReply(comment, stateText);
                              storeComments.openAddReply(false);
                              f7.popup.close('.add-reply-popup');
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
                    <Input type='textarea' placeholder={_t.textAddReply} autofocus value={stateText} onChange={(event) => {setText(event.target.value);}}></Input>
                </div>
            </div>
        </Popup>
    )
}));

const AddReplyDialog = inject("storeComments")(observer(({storeComments, userInfo, comment, onAddReply}) => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const templateInitials = `<div class="initials" style="background-color: ${userInfo.color};">${userInfo.initials}</div>`;
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
                }
            }
        }).open();
    });
    return (
        <div id='add-reply-dialog'></div>
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
    useEffect(() => {
        f7.popup.open('.edit-reply-popup');
    });
    const [stateText, setText] = useState(reply.reply);
    return (
        <Popup className="edit-reply-popup">
            <Navbar>
                <NavLeft>
                    <Link onClick={() => {
                        f7.popup.close('.edit-reply-popup');
                        storeComments.openEditReply(false);
                    }}>{_t.textCancel}</Link>
                </NavLeft>
                <NavTitle>{_t.textEditReply}</NavTitle>
                <NavRight>
                    <Link className={stateText.length === 0 && 'disabled'}
                          onClick={() => {
                              onEditReply(comment, reply, stateText);
                              f7.popup.close('.edit-reply-popup');
                              storeComments.openEditReply(false);
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
                        <div className='name'>{reply.userName}</div>
                        <div className='reply-date'>{reply.date}</div>
                    </div>
                </div>
                <div className='wrap-textarea'>
                    <Input type='textarea' placeholder={_t.textEditReply} autofocus value={stateText} onChange={(event) => {setText(event.target.value);}}></Input>
                </div>
            </div>
        </Popup>
    )
}));

const EditReplyDialog = inject("storeComments")(observer(({storeComments, comment, reply, onEditReply}) => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const templateInitials = `<div class="initials" style="background-color: ${reply.userColor};">${reply.userInitials}</div>`;
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
                            <div class='name'>${reply.userName}</div>
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
                }
            }
        }).open();
    });
    return (
        <div id='edit-reply-dialog'></div>
    );
}));

const EditReply = ({comment, reply, onEditReply}) => {
    return (
        Device.phone ?
            <EditReplyPopup comment={comment} reply={reply} onEditReply={onEditReply}/> :
            <EditReplyDialog comment={comment} reply={reply} onEditReply={onEditReply}/>
    )
};

// View comments
const ViewComments = ({storeComments, storeAppOptions, onCommentMenuClick, onResolveComment}) => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const isAndroid = Device.android;

    const viewMode = !storeAppOptions.canComments;
    const comments = storeComments.sortComments;
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

    const [clickComment, setComment] = useState();
    const [commentActionsOpened, openActionComment] = useState(false);

    const [reply, setReply] = useState();
    const [replyActionsOpened, openActionReply] = useState(false);

    return (
        <Page>
            <Navbar title={_t.textComments} backLink={_t.textBack}/>
            {!comments ?
                <div className='no-comments'>{_t.textNoComments}</div> :
                <List className='comment-list'>
                    {comments.map((comment, indexComment) => {
                        return (
                            <ListItem key={`comment-${indexComment}`}>
                                <div slot='header' className='comment-header'>
                                    <div className='left'>
                                        {isAndroid && <div className='initials' style={{backgroundColor: `${comment.userColor ? comment.userColor : '#cfcfcf'}`}}>{comment.userInitials}</div>}
                                        <div>
                                            <div className='user-name'>{comment.userName}</div>
                                            <div className='comment-date'>{comment.date}</div>
                                        </div>
                                    </div>
                                    {!viewMode &&
                                        <div className='right'>
                                            <div className='comment-resolve' onClick={() => {onResolveComment(comment);}}><Icon icon={comment.resolved ? 'icon-resolve-comment check' : 'icon-resolve-comment'} /></div>
                                            <div className='comment-menu'
                                                 onClick={() => {setComment(comment); openActionComment(true);}}
                                            ><Icon icon='icon-menu-comment'/></div>
                                        </div>
                                    }
                                </div>
                                <div slot='footer'>
                                    {comment.quote && <div className='comment-quote'>{sliceQuote(comment.quote)}</div>}
                                    <div className='comment-text'><pre>{comment.comment}</pre></div>
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
                                                                            <div className='user-name'>{reply.userName}</div>
                                                                            <div className='reply-date'>{reply.date}</div>
                                                                        </div>
                                                                    </div>
                                                                    {!viewMode &&
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
                                                                    <div className='reply-text'><pre>{reply.reply}</pre></div>
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
};

const _ViewComments = inject('storeComments', 'storeAppOptions')(observer(ViewComments));

const CommentList = () => {
    return (
        <List>

        </List>
    )
};

const ViewCommentSheet = ({closeCurComments}) => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});

    const appHeight = f7.height;
    //const [sheetHeight, setSheetHeight] = useState('45%');

    let swipeStart,
        swipeChange;

    useEffect(() => {
        f7.sheet.open('#view-comment-sheet');
        const swipeHandler = document.getElementById('swipe-handler');
        swipeHandler.addEventListener('touchstart', handleTouchStart);
        swipeHandler.addEventListener('touchmove', handleTouchMove);
        swipeHandler.addEventListener('touchend', handleTouchEnd);
    });
    const handleTouchStart = (event) => {
        console.log('start');
        const touchObj = event.changedTouches[0];
        swipeStart = parseInt(touchObj.clientY);
        swipeChange = parseInt(touchObj.clientY);
    };
    const handleTouchMove = (event) => {
        console.log('move');
        const touchObj = event.changedTouches[0];
        const dist = parseInt(touchObj.clientY) - swipeStart;
        const height = (appHeight - parseInt(touchObj.clientY)).toString();
        document.getElementById('view-comment-sheet').style.setProperty('height', `${height}px`);
        /*if (dist < 0) {
            newHeight = '100%';
            me.swipeFull = true;
            me.closeCommentPicker = false;
            if (window.SSE) {
                if ($('.container-view-comment').hasClass('onHide')) {
                    $('.container-view-comment').removeClass('onHide');
                }
            } else {
                $('.container-view-comment').css('opacity', '1');
            }
        } else if (dist < 100) {
            newHeight = '50%';
            me.swipeFull = false;
            me.closeCommentPicker = false;
            if (window.SSE) {
                if ($('.container-view-comment').hasClass('onHide')) {
                    $('.container-view-comment').removeClass('onHide');
                }
            } else {
                $('.container-view-comment').css('opacity', '1');
            }
        } else {
            me.closeCommentPicker = true;
            if (window.SSE) {
                if (!$('.container-view-comment').hasClass('onHide')) {
                    $('.container-view-comment').addClass('onHide');
                }
            } else {
                $('.container-view-comment').css('opacity', '0.6');
            }
        }
        $('.container-view-comment').css('height', newHeight);
        me.swipeHeight = newHeight;
        e.preventDefault();*/
    };
    const handleTouchEnd = () => {
        console.log('end');
        /*var touchobj = e.changedTouches[0];
        var swipeEnd = parseInt(touchobj.clientY);
        var dist = swipeEnd - me.swipeStart;
        if (me.closeCommentPicker) {
            uiApp.closeModal();
            me.modalViewComment.remove();
        } else if (me.swipeFull) {
            if (dist > 20) {
                $('.container-view-comment').css('height', '50%');
            }
        }
        me.swipeHeight = undefined;
        me.swipeChange = undefined;
        me.closeCommentPicker = undefined;*/
    };
    return (
        <Sheet id='view-comment-sheet'>
            <Toolbar position='bottom'>
                <Link className='btn-add-reply' href='#'>{_t.textAddReply}</Link>
                <div className='comment-navigation row'>
                    <Link href='#'><Icon slot='media' icon='icon-prev'/></Link>
                    <Link href='#'><Icon slot='media' icon='icon-next'/></Link>
                </div>
            </Toolbar>
            <div id='swipe-handler' className='swipe-container'>
                <Icon icon='icon-swipe'/>
            </div>
            <CommentList />
        </Sheet>
    )
};

const ViewCommentPopover = () => {
    useEffect(() => {
        f7.popover.open('#view-comment-popover', '#btn-coauth');
    });
    return (
        <Popover id='view-comment-popover'>
            <CommentList />
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
    _ViewComments as ViewComments,
    ViewCurrentComments
};
