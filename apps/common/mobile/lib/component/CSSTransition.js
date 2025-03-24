import React from 'react';
import { useTransitionState } from 'react-transition-state';

export const CSSTransition = ({
  in: inProp = false,
  timeout = 300,
  children,
  mountOnEnter = false,
  unmountOnExit = false,
  onEntered,
}) => {
  const [{ status, isMounted }, toggle] = useTransitionState({
    timeout,
    mountOnEnter,
    unmountOnExit,
    preEnter: true,
    initialEntered: inProp
  });

  React.useEffect(() => {
    toggle(inProp);
  }, [inProp, toggle]);

  const classNameMap = {
    'preEnter': 'fade-enter',
    'entering': 'fade-enter fade-enter-active',
    'entered': 'fade-enter-done',
    'exiting': 'fade-exit fade-exit-active',
    'exited': 'fade-exit-done',
  };

  const getClassNames = (status) => {
    return classNameMap[status] || '';
  };

  React.useEffect(() => {
    switch (status) {
      case 'entered':
        onEntered?.();
        break;
      default:
        break;
    }
  }, [status, onEntered]);

  if (!isMounted) {
    return null;
  }

  return React.cloneElement(children, {
    className: `${children.props.className || ''} ${getClassNames(status)}`.trim()
  });
};