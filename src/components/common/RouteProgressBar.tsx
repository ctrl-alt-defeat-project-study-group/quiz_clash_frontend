import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const RouteProgressBar: React.FC = () => {
  const location = useLocation();
  const isFirstRender = useRef(true);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    let raf1 = 0;
    let raf2 = 0;
    let completeTimer: number | undefined;
    let hideTimer: number | undefined;

    raf1 = window.requestAnimationFrame(() => {
      setVisible(true);
      setProgress(18);

      raf2 = window.requestAnimationFrame(() => {
        setProgress(82);
      });

      completeTimer = window.setTimeout(() => {
        setProgress(100);
        hideTimer = window.setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 200);
      }, 220);
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      if (completeTimer !== undefined) window.clearTimeout(completeTimer);
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
    };
  }, [location.pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className={`route-progress-track${visible ? ' is-visible' : ''}`}
      aria-hidden="true"
    >
      <div
        className="route-progress-bar"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
