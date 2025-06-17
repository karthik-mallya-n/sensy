"use client";

interface ChatResizeHandleProps {
  navWidth: number;
  setNavWidth: (width: number) => void;
  sidebarMotion: any;
  maxSidebarWidth: number;
  minNavWidth: number;
}

export default function ChatResizeHandle({
  navWidth,
  setNavWidth,
  sidebarMotion,
  maxSidebarWidth,
  minNavWidth,
}: ChatResizeHandleProps) {
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startNavWidth = navWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      const newWidth = Math.min(
        Math.max(minNavWidth, startNavWidth + delta),
        maxSidebarWidth
      );
      sidebarMotion.set(newWidth);
    };

    const handleMouseUp = (e: MouseEvent) => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      const finalDelta = e.clientX - startX;
      const finalWidth = Math.min(
        Math.max(minNavWidth, startNavWidth + finalDelta),
        maxSidebarWidth
      );
      setNavWidth(finalWidth);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className="absolute top-0 left-0 w-2 h-full cursor-ew-resize hover:bg-transparent z-10"
      onMouseDown={onMouseDown}
    />
  );
}
