import { useEffect, useState } from 'react';

export interface DeviceViewportMetrics {
  width: number;
  height: number;
  aspect: number;
  isLandscape: boolean;
  isTouchDevice: boolean;
  /** True for all phones & compact tablets in both portrait and landscape */
  isMobileLayout: boolean;
  /** True when viewport height is short (e.g. phone in landscape <= 500px) */
  isCompactHeight: boolean;
  /** True when viewport width is narrow (e.g. small phone <= 375px) */
  isNarrowWidth: boolean;
  /** Proportional radar mini-map diameter in px for this exact screen resolution */
  radarSizePx: number;
  /** Proportional virtual analog joystick diameter in px for this exact screen resolution */
  joystickSizePx: number;
  /** Maximum knob travel radius in px (always proportional to joystickSizePx) */
  joystickRadiusPx: number;
  /** Proportional jump/dash button diameter in px */
  jumpBtnSizePx: number;
  /** Available horizontal width in px between left joystick and right jump button */
  centerSafeWidthPx: number;
}

function computeViewportMetrics(): DeviceViewportMetrics {
  if (typeof window === 'undefined') {
    return {
      width: 1280,
      height: 720,
      aspect: 1280 / 720,
      isLandscape: true,
      isTouchDevice: false,
      isMobileLayout: false,
      isCompactHeight: false,
      isNarrowWidth: false,
      radarSizePx: 148,
      joystickSizePx: 96,
      joystickRadiusPx: 34,
      jumpBtnSizePx: 60,
      centerSafeWidthPx: 860,
    };
  }

  // Prefer visualViewport when available so mobile URL bars & keyboards are respected accurately
  const vv = window.visualViewport;
  const width = Math.max(280, Math.round(vv ? vv.width : window.innerWidth));
  const height = Math.max(240, Math.round(vv ? vv.height : window.innerHeight));
  const aspect = width / height;
  const isLandscape = width > height;

  const isTouchDevice =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches);

  const shortSide = Math.min(width, height);
  // Treat device as mobile layout if width < 1024, height < 560, or touch device with shortSide < 920
  const isMobileLayout = width < 1024 || height < 560 || (isTouchDevice && shortSide < 920);
  const isCompactHeight = height <= 500;
  const isNarrowWidth = width <= 380;

  let radarSizePx = 148;
  let joystickSizePx = 96;
  let jumpBtnSizePx = 60;

  if (isMobileLayout) {
    if (isLandscape) {
      // Landscape HP (e.g. 568x320, 667x375, 740x360, 844x390, 932x430)
      radarSizePx = Math.round(Math.max(48, Math.min(66, height * 0.155)));
      joystickSizePx = Math.round(Math.max(66, Math.min(88, height * 0.215)));
      jumpBtnSizePx = Math.round(Math.max(46, Math.min(58, height * 0.145)));
    } else {
      // Portrait HP (e.g. 320x568, 360x640, 375x812, 390x844, 412x915, 430x932)
      radarSizePx = Math.round(Math.max(58, Math.min(82, width * 0.185)));
      joystickSizePx = Math.round(Math.max(76, Math.min(104, width * 0.24)));
      jumpBtnSizePx = Math.round(Math.max(50, Math.min(64, width * 0.15)));
    }
  } else {
    // Desktop / Large Laptop
    radarSizePx = Math.round(Math.max(124, Math.min(148, shortSide * 0.165)));
  }

  const joystickRadiusPx = Math.round(joystickSizePx * 0.34);

  // Calculate safe center width so bottom dock & proximity prompts never touch Joystick (left) or Jump (right)
  const leftReserved = isMobileLayout ? joystickSizePx + 22 : 180;
  const rightReserved = isMobileLayout ? Math.max(jumpBtnSizePx, radarSizePx) + 22 : 180;
  const centerSafeWidthPx = isMobileLayout
    ? isLandscape
      ? Math.max(220, width - leftReserved - rightReserved)
      : Math.max(260, width - 16)
    : Math.min(860, width - 48);

  return {
    width,
    height,
    aspect,
    isLandscape,
    isTouchDevice,
    isMobileLayout,
    isCompactHeight,
    isNarrowWidth,
    radarSizePx,
    joystickSizePx,
    joystickRadiusPx,
    jumpBtnSizePx,
    centerSafeWidthPx,
  };
}

export function useDeviceViewport(): DeviceViewportMetrics {
  const [metrics, setMetrics] = useState<DeviceViewportMetrics>(() => computeViewportMetrics());

  useEffect(() => {
    let rafId = 0;
    const handleUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setMetrics(computeViewportMetrics());
      });
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('orientationchange', handleUpdate);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleUpdate);
      window.visualViewport.addEventListener('scroll', handleUpdate);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('orientationchange', handleUpdate);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleUpdate);
        window.visualViewport.removeEventListener('scroll', handleUpdate);
      }
    };
  }, []);

  return metrics;
}
