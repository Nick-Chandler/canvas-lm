'use client';

import { useEffect, useRef } from 'react';
import Konva from 'konva';

export default function InfiniteCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const stage = new Konva.Stage({
      container: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      draggable: true,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    const rect = new Konva.Rect({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      fill: 'red',
      draggable: true,
    });

    layer.add(rect);
    layer.draw();

    // Zoom Configuration
    const scaleBy = 1.1; // Multiplier for zoom speed

    stage.on('wheel', (e) => {
      e.evt.preventDefault(); // Stop default page scrolling

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();

      if (!pointer) return;

      // Calculate coordinates relative to the stage scale
      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      // Determine zoom direction
      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

      // Update scale
      stage.scale({ x: newScale, y: newScale });

      // Recalculate position to keep pointer anchored
      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      
      stage.position(newPos);
    });

    return () => {
      stage.destroy();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} 
    />
  );
}