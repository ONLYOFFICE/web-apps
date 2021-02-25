import React, {useState, useEffect} from 'react';
import {observer, inject} from "mobx-react";
import { f7, Popup, Page, Navbar, NavLeft, NavRight, NavTitle, Link, Input, Icon, List, ListItem } from 'framework7-react';
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
                        props.storeComments.openAddComment(false);
                        f7.popup.close('.add-comment-popup');
                    }}>{_t.textCancel}</Link>
                </NavLeft>
                <NavTitle>{_t.textAddComment}</NavTitle>
                <NavRight>
                    <Link className={stateText.length === 0 && 'disabled'}
                          onClick={() => {
                              if (props.onAddNewComment(stateText, false)) {
                                  props.storeComments.openAddComment(false);
                                  f7.popup.close('.add-comment-popup');
                              }
                    }}>
                        {Device.android ? <Icon icon='icon-done-comment-white'/> : _t.textDone}
                    </Link>
                </NavRight>
            </Navbar>
            <div className='wrap-comment'>
                <div className="header-comment">
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
                    <div class="header-comment">
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
                        props.storeComments.openAddComment(false);
                    });
                    const done = document.getElementById('comment-done');
                    done.addEventListener('click', () => {
                        const value = document.getElementById('comment-text').value;
                        if (value.length > 0 && props.onAddNewComment(value, false)) {
                            f7.dialog.close();
                            props.storeComments.openAddComment(false);
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
            <AddCommentPopup userInfo={props.userInfo} onAddNewComment={props.onAddNewComment} /> :
            <AddCommentDialog userInfo={props.userInfo} onAddNewComment={props.onAddNewComment} />
    )
};

// View comments
const ViewComments = ({storeComments}) => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});

    const comments = storeComments.sortComments;
    return (
        <Page>
            <Navbar title={_t.textComments} backLink={_t.textBack}/>
            {!comments ?
                <div className='no-comments'>{_t.textNoComments}</div> :
                <List className='comment-list'>
                    {comments.map((comment, indexComment) => {
                        return (
                            <ListItem key={`comment-${indexComment}`}>
                                <div slot='header'>
                                    <div className='user-name'>{comment.userName}</div>
                                    <div className='comment-date'>{comment.date}</div>
                                </div>
                                <div slot='footer'>
                                    <div className='comment-quote'>{comment.quote}</div>
                                    <div className='comment-text'><pre>{comment.comment}</pre></div>
                                    {comment.replies.length > 0 &&
                                    <ul className='list-reply'>
                                        {comment.replies.map((reply, indexReply) => {
                                            return (
                                                <li key={`reply-${indexComment}-${indexReply}`}
                                                    className='reply-item'
                                                >
                                                    <div className='item-content'>
                                                        <div className='item-inner'>
                                                            <div className='item-title'>
                                                                <div slot='header'>
                                                                    <div className='user-name'>{reply.userName}</div>
                                                                    <div className='reply-date'>{reply.date}</div>
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

        </Page>
    )
};

const _ViewComments = inject('storeComments')(observer(ViewComments));

export {
    AddComment,
    _ViewComments as ViewComments
}
