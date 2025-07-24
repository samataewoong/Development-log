// ImageBlock.jsx
import React, { useEffect } from 'react';
import { Rnd } from 'react-rnd';

export default function ImageBlock({ id, src, width, height, position, selected, onSelect, onUpdate, editable = true }) {
  const [rndX, setRndX] = React.useState(position.x || 50);
  const [rndY, setRndY] = React.useState(position.y || 80);

  // 이 useEffect는 prop과 내부 상태를 동기화하는 역할입니다.
  useEffect(() => {
    // 현재 prop.position과 내부 상태가 다를 때만 업데이트
    if (position.x !== rndX || position.y !== rndY) {
      setRndX(position.x);
      setRndY(position.y);
      console.log(`ImageBlock ${id}: Prop position changed to (${position.x}, ${position.y}). Updating internal state.`);
    }
  }, [position.x, position.y, id, rndX, rndY]);

  const rndSize = {
    width: typeof width === 'string' ? parseInt(width, 10) : (width || 300),
    height: typeof height === 'string' && height !== 'auto' ? parseInt(height, 10) : (height || 'auto')
  };

  return (
    <Rnd
      key={`${id}`}
      size={{ width: rndSize.width, height: rndSize.height }}
      position={{ x: rndX, y: rndY }}
      bounds=".contentsBody"
      dragAxis={editable ? "both" : "none"}
      // ************ 디버깅용 로그 추가 ************
      onDragStart={(e, data) => {
        console.log(`ImageBlock ${id}: onDragStart - Initial pos (${data.x}, ${data.y})`);
      }}
      onDrag={(e, data) => {
        // 드래그 중 실시간 위치를 확인하고 싶을 때 사용. 너무 많이 찍힐 수 있으니 필요할 때만 활성화.
        // console.log(`ImageBlock ${id}: onDrag - Current pos (${data.x}, ${data.y})`);
      }}
      onDragStop={(e, d) => {
        if (editable) {
          console.log(`ImageBlock ${id}: onDragStop - FINAL new pos (x:${d.x}, y:${d.y}). Calling onUpdate.`);
          onUpdate(id, { position: { x: d.x, y: d.y }, src: src });
        }
      }}
      onResizeStop={(e, direction, ref, delta, newPosition) => {
        if (editable) {
          const newWidth = ref.offsetWidth;
          const newHeight = ref.offsetHeight;
          console.log(`ImageBlock ${id}: onResizeStop - New size (${newWidth}, ${newHeight}), New pos (${newPosition.x}, ${newPosition.y}). Calling onUpdate.`);
          onUpdate(id, { width: newWidth, height: newHeight, position: newPosition, src: src });
        }
      }}
      style={{
        border: selected && editable ? '2px solid #5b9eff' : 'none',
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: editable ? 'auto' : 'none',
        zIndex: selected ? 100 : 10, // 다른 요소 위에 오도록 z-index 설정
      }}
      enableResizing={editable}
      onClick={(e) => {
        e.stopPropagation();
        if (editable) {
          onSelect(id);
        }
      }}
    >
      <img
        src={src}
        alt="content image"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'contain',
        }}
      />
    </Rnd>
  );
}