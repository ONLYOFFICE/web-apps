import React from 'react';
import { CSSTransition } from '../../../../../common/mobile/lib/component/CSSTransition'

const Snackbar = ({ isShowSnackbar, message, closeCallback }) => {
  return (
    <CSSTransition
      in={isShowSnackbar}
      timeout={1500}
      classNames="snackbar"
      mountOnEnter
      unmountOnExit
      onEntered={(node, isAppearing) => {
        if(!isAppearing) {
          closeCallback();
        }
      }}
    >
      <div className="snackbar">
        <div className="snackbar__content">
          <p className="snackbar__text">{message}</p>
        </div>
      </div>
    </CSSTransition>
  );
}

export default Snackbar;