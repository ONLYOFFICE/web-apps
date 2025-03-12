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

  const getClassNames = (status) => {
    switch (status) {
      case 'preEnter':
        return `fade-enter`;
      case 'entering':
        return `fade-enter fade-enter-active`;
      case 'entered':
        return `fade-enter-done`;
      case 'exiting':
        return `fade-exit fade-exit-active`;
      case 'exited':
        return `fade-exit-done`;
      default:
        return '';
    }
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