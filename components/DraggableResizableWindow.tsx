"use client";

import { useState, useRef, useEffect, ReactNode, useCallback } from "react";

interface DraggableResizableWindowProps {
  title?: string;
  minimized: boolean;
  onToggleMinimize: () => void;
  onClose: () => void;
  onFocus: () => void;
  zIndex: number;
  children: ReactNode;
  initialWidth?: number;
  initialHeight?: number;
  onWindowResize?: (width: number, height: number) => void;
  maximizeOnMount?: boolean;
}

export default function DraggableResizableWindow({
  title = "Untitled",
  minimized,
  onToggleMinimize,
  onClose,
  onFocus,
  zIndex,
  children,
  initialWidth = 400,
  initialHeight = 300,
  onWindowResize,
  maximizeOnMount = false,
}: DraggableResizableWindowProps) {
  const [position, setPosition] = useState({ x: 100, y: 40 });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevState, setPrevState] = useState<{
    position: { x: number; y: number };
    size: { width: number; height: number };
  } | null>(null);

  // Refs para drag
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });

  // Refs para resize (similar a como ya tienes)
  const isResizing = useRef(false);
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });
  const resizeStartPosition = useRef({ x: 0, y: 0 });
  const currentHandle = useRef<string>("");

  // Maximizar al montar
  useEffect(() => {
    if (maximizeOnMount) {
      setPrevState({ position: { x: 100, y: 40 }, size: { width: initialWidth, height: initialHeight } });
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight - 40 });
      if (onWindowResize) {
        onWindowResize(window.innerWidth, window.innerHeight - 40);
      }
      setIsMaximized(true);
    }
  }, [maximizeOnMount, initialWidth, initialHeight, onWindowResize]);

  /* ----------- DRAG con Pointer Events ----------- */
  const onPointerDownHeader = (e: React.PointerEvent) => {
    // Si se hizo clic sobre un elemento dentro de los controles, no iniciar el drag
    if ((e.target as HTMLElement).closest('.app-window-controls')) {
      return;
    }
    if (isMaximized) return;
    isDragging.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragOffset.current = { x: position.x, y: position.y };
    e.currentTarget.setPointerCapture(e.pointerId);
    onFocus();
  };

  const onPointerMoveHeader = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    console.log("onPointerMoveHeader:", e.clientX, e.clientY, "dx:", dx, "dy:", dy);
    setPosition({ x: dragOffset.current.x + dx, y: dragOffset.current.y + dy });
  }, []);

  const onPointerUpHeader = (e: React.PointerEvent) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  /* ----------- RESIZE con Pointer Events (similar) ----------- */
  const onPointerDownResize = (e: React.PointerEvent, handle: string) => {
    if (isMaximized) return;
    isResizing.current = true;
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    resizeStartSize.current = { width: size.width, height: size.height };
    resizeStartPosition.current = { ...position };
    currentHandle.current = handle;
    e.stopPropagation();
    onFocus();
    // Captura el pointer en el handle
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMoveResize = useCallback((e: React.PointerEvent) => {
    if (!isResizing.current) return;
    const dx = e.clientX - resizeStartPos.current.x;
    const dy = e.clientY - resizeStartPos.current.y;
    let newWidth = resizeStartSize.current.width;
    let newHeight = resizeStartSize.current.height;
    let newX = resizeStartPosition.current.x;
    let newY = resizeStartPosition.current.y;
    switch (currentHandle.current) {
      case "right":
        newWidth = Math.max(200, resizeStartSize.current.width + dx);
        break;
      case "left":
        newWidth = Math.max(200, resizeStartSize.current.width - dx);
        newX = resizeStartPosition.current.x + dx;
        break;
      case "bottom":
        newHeight = Math.max(100, resizeStartSize.current.height + dy);
        break;
      case "top":
        newHeight = Math.max(100, resizeStartSize.current.height - dy);
        newY = resizeStartPosition.current.y + dy;
        break;
      case "top-right":
        newWidth = Math.max(200, resizeStartSize.current.width + dx);
        newHeight = Math.max(100, resizeStartSize.current.height - dy);
        newY = resizeStartPosition.current.y + dy;
        break;
      case "top-left":
        newWidth = Math.max(200, resizeStartSize.current.width - dx);
        newHeight = Math.max(100, resizeStartSize.current.height - dy);
        newX = resizeStartPosition.current.x + dx;
        newY = resizeStartPosition.current.y + dy;
        break;
      case "bottom-right":
        newWidth = Math.max(200, resizeStartSize.current.width + dx);
        newHeight = Math.max(100, resizeStartSize.current.height + dy);
        break;
      case "bottom-left":
        newWidth = Math.max(200, resizeStartSize.current.width - dx);
        newX = resizeStartPosition.current.x + dx;
        newHeight = Math.max(100, resizeStartSize.current.height + dy);
        break;
    }
    setSize({ width: newWidth, height: newHeight });
    if (onWindowResize) {
      onWindowResize(newWidth, newHeight);
    }
    setPosition({ x: newX, y: newY });
  }, [onWindowResize]);

  const onPointerUpResize = (e: React.PointerEvent) => {
    isResizing.current = false;
    currentHandle.current = "";
    // Soltar la captura del pointer
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  /* ----------- MAXIMIZAR/RESTAURAR y estilos ----------- */
  const toggleMaximize = () => {
    if (!isMaximized) {
      setPrevState({ position, size });
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight - 40 });
      if (onWindowResize) {
        onWindowResize(window.innerWidth, window.innerHeight - 40);
      }
      setIsMaximized(true);
    } else {
      if (prevState) {
        setPosition(prevState.position);
        setSize(prevState.size);
        if (onWindowResize) {
          onWindowResize(prevState.size.width, prevState.size.height);
        }
      }
      setIsMaximized(false);
    }
  };

  const windowStyle = minimized
    ? { display: "none" }
    : {
        position: "absolute" as const,
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      };

  return (
    <div
      className="app-window"
      style={{ ...windowStyle, zIndex }}
      onPointerDown={() => onFocus()}
    >
      <div
        className="app-window-header"
        onPointerDown={onPointerDownHeader}
        onPointerMove={onPointerMoveHeader}
        onPointerUp={onPointerUpHeader}
      >
        <span className="app-window-title">{title}</span>
        <div className="app-window-controls">
          <button onClick={onToggleMinimize} className="minimize-btn">
            _
          </button>
          <button onClick={toggleMaximize} className="maximize-btn">
            {isMaximized ? "🗗" : "🗖"}
          </button>
          <button onClick={onClose} className="close-btn">
            X
          </button>
        </div>
      </div>
      <div className="app-window-content" style={{ width: "100%", height: "100%" }}>
        {children}
      </div>
      {/* Handles de resize */}
      <div
  className="resize-handle top"
  onPointerDown={(e) => onPointerDownResize(e, "top")}
  onPointerMove={onPointerMoveResize}
  onPointerUp={onPointerUpResize}
></div>
<div
  className="resize-handle bottom"
  onPointerDown={(e) => onPointerDownResize(e, "bottom")}
  onPointerMove={onPointerMoveResize}
  onPointerUp={onPointerUpResize}
></div>
<div
  className="resize-handle left"
  onPointerDown={(e) => onPointerDownResize(e, "left")}
  onPointerMove={onPointerMoveResize}
  onPointerUp={onPointerUpResize}
></div>
<div
  className="resize-handle right"
  onPointerDown={(e) => onPointerDownResize(e, "right")}
  onPointerMove={onPointerMoveResize}
  onPointerUp={onPointerUpResize}
></div>
<div
  className="resize-handle top-left"
  onPointerDown={(e) => onPointerDownResize(e, "top-left")}
  onPointerMove={onPointerMoveResize}
  onPointerUp={onPointerUpResize}
></div>
<div
  className="resize-handle top-right"
  onPointerDown={(e) => onPointerDownResize(e, "top-right")}
  onPointerMove={onPointerMoveResize}
  onPointerUp={onPointerUpResize}
></div>
<div
  className="resize-handle bottom-left"
  onPointerDown={(e) => onPointerDownResize(e, "bottom-left")}
  onPointerMove={onPointerMoveResize}
  onPointerUp={onPointerUpResize}
></div>
<div
  className="resize-handle bottom-right"
  onPointerDown={(e) => onPointerDownResize(e, "bottom-right")}
  onPointerMove={onPointerMoveResize}
  onPointerUp={onPointerUpResize}
></div>
    </div>
  );
}
