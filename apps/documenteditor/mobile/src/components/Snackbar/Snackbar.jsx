import React from 'react';

const Snackbar = props => {
    return (
        <div className="snackbar">
            <div className="snackbar__content">
                <p className="snackbar__text">{props.text}</p>
            </div>
        </div>
    )
}

export default Snackbar;