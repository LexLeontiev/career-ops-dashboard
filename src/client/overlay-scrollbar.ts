import React from "react";

type Axis = "horizontal" | "vertical";

interface OverlayScrollbarState {
  visible: boolean;
  offset: number;
  size: number;
}

const HIDE_DELAY_MS = 900;
const MIN_THUMB_PERCENT = 10;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function scrollMetrics(element: HTMLElement, axis: Axis) {
  if (axis === "horizontal") {
    return {
      clientSize: element.clientWidth,
      scrollPosition: element.scrollLeft,
      scrollSize: element.scrollWidth,
    };
  }

  return {
    clientSize: element.clientHeight,
    scrollPosition: element.scrollTop,
    scrollSize: element.scrollHeight,
  };
}

export function useElementOverlayScrollbar(axis: Axis) {
  const [scrollbar, setScrollbar] = React.useState<OverlayScrollbarState>({
    visible: false,
    offset: 0,
    size: 100,
  });
  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollElement = React.useRef<HTMLElement | null>(null);
  const cancelDrag = React.useRef<(() => void) | undefined>(undefined);

  const revealScrollbar = React.useCallback(
    (element: HTMLElement) => {
      const { clientSize, scrollPosition, scrollSize } = scrollMetrics(element, axis);
      const maxScroll = Math.max(scrollSize - clientSize, 0);
      const size =
        scrollSize > 0 ? Math.max((clientSize / scrollSize) * 100, MIN_THUMB_PERCENT) : 100;
      const offset = maxScroll > 0 ? (scrollPosition / maxScroll) * (100 - size) : 0;

      setScrollbar({ visible: true, offset, size });
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(
        () => setScrollbar((current) => ({ ...current, visible: false })),
        HIDE_DELAY_MS,
      );
    },
    [axis],
  );

  const onScroll = React.useCallback(
    (event: React.UIEvent<HTMLElement>) => {
      scrollElement.current = event.currentTarget;
      revealScrollbar(event.currentTarget);
    },
    [revealScrollbar],
  );

  const onThumbPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLSpanElement>) => {
      const element = scrollElement.current;
      if (!element) return;

      event.preventDefault();
      cancelDrag.current?.();

      const startCoordinate = axis === "horizontal" ? event.clientX : event.clientY;
      const { clientSize, scrollPosition, scrollSize } = scrollMetrics(element, axis);
      const scrollRange = Math.max(scrollSize - clientSize, 0);
      const thumbSize =
        scrollSize > 0
          ? Math.max((clientSize / scrollSize) * clientSize, clientSize * 0.1)
          : clientSize;
      const trackRange = Math.max(clientSize - thumbSize, 0);

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== event.pointerId || trackRange === 0 || scrollRange === 0)
          return;
        const coordinate = axis === "horizontal" ? moveEvent.clientX : moveEvent.clientY;
        const nextPosition = clamp(
          scrollPosition + ((coordinate - startCoordinate) * scrollRange) / trackRange,
          0,
          scrollRange,
        );
        if (axis === "horizontal") element.scrollLeft = nextPosition;
        else element.scrollTop = nextPosition;
        revealScrollbar(element);
      };

      const stopDragging = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", stopDragging);
        window.removeEventListener("pointercancel", stopDragging);
        cancelDrag.current = undefined;
      };

      cancelDrag.current = stopDragging;
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", stopDragging);
      window.addEventListener("pointercancel", stopDragging);
    },
    [axis, revealScrollbar],
  );

  React.useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      cancelDrag.current?.();
    },
    [],
  );

  return { onScroll, onThumbPointerDown, scrollbar };
}

export function usePageOverlayScrollbar() {
  const [scrollbar, setScrollbar] = React.useState<OverlayScrollbarState>({
    visible: false,
    offset: 0,
    size: 100,
  });
  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cancelDrag = React.useRef<(() => void) | undefined>(undefined);

  const revealScrollbar = React.useCallback(() => {
    const documentHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
    );
    const viewportHeight = window.innerHeight;
    const maxScroll = Math.max(documentHeight - viewportHeight, 0);
    const size =
      documentHeight > 0
        ? Math.max((viewportHeight / documentHeight) * 100, MIN_THUMB_PERCENT)
        : 100;
    const offset = maxScroll > 0 ? (window.scrollY / maxScroll) * (100 - size) : 0;

    setScrollbar({ visible: true, offset, size });
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(
      () => setScrollbar((current) => ({ ...current, visible: false })),
      HIDE_DELAY_MS,
    );
  }, []);

  React.useEffect(() => {
    window.addEventListener("scroll", revealScrollbar, { passive: true });
    return () => {
      window.removeEventListener("scroll", revealScrollbar);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      cancelDrag.current?.();
    };
  }, [revealScrollbar]);

  const onThumbPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLSpanElement>) => {
      event.preventDefault();
      cancelDrag.current?.();

      const documentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );
      const viewportHeight = window.innerHeight;
      const maxScroll = Math.max(documentHeight - viewportHeight, 0);
      const thumbSize =
        documentHeight > 0
          ? Math.max((viewportHeight / documentHeight) * viewportHeight, viewportHeight * 0.1)
          : viewportHeight;
      const trackRange = Math.max(viewportHeight - thumbSize, 0);
      const startCoordinate = event.clientY;
      const startScroll = window.scrollY;

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== event.pointerId || trackRange === 0 || maxScroll === 0) return;
        const nextScroll = clamp(
          startScroll + ((moveEvent.clientY - startCoordinate) * maxScroll) / trackRange,
          0,
          maxScroll,
        );
        window.scrollTo({ top: nextScroll });
        revealScrollbar();
      };

      const stopDragging = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", stopDragging);
        window.removeEventListener("pointercancel", stopDragging);
        cancelDrag.current = undefined;
      };

      cancelDrag.current = stopDragging;
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", stopDragging);
      window.addEventListener("pointercancel", stopDragging);
    },
    [revealScrollbar],
  );

  return { onThumbPointerDown, scrollbar };
}
