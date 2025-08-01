// ImageBlock.jsx
import React, { useEffect, useState } from 'react'; // useState import 추가
import { Rnd } from 'react-rnd';

export default function ImageBlock({ id, src, width, height, position, selected, onSelect, onUpdate, editable = true }) {
  // position prop을 초기값으로 사용하고, onDrag에서 직접 업데이트하도록 변경
  // 즉, rndX, rndY는 이제 prop.position의 사본이 아니라, Rnd 컴포넌트의 "실시간" 위치를 반영합니다.
  const [rndX, setRndX] = useState(position.x || 50);
  const [rndY, setRndY] = useState(position.y || 80);

  // 이 useEffect는 이제 초기 마운트 시 또는 prop.position이 외부에서 "강제로" 변경될 때만 작동합니다.
  // 드래그에 의한 내부 상태 변경 시에는 작동하지 않도록 합니다.
  useEffect(() => {
    // position prop이 변경되었고, 현재 내부 상태와 다를 경우만 업데이트
    // 이는 외부(ContentsPage)에서 elements 상태가 변경되어 position이 내려왔을 때 동기화 위함
    if (position.x !== rndX || position.y !== rndY) {
      console.log(`ImageBlock ${id}: Prop position changed to (${position.x}, ${position.y}). Updating internal state.`);
      setRndX(position.x);
      setRndY(position.y);
    }
  }, [position.x, position.y]); // id, rndX, rndY는 이제 종속성에서 제거 (순환 참조 방지)

  const rndSize = {
    width: typeof width === 'string' ? parseInt(width, 10) : (width || 300),
    height: typeof height === 'string' && height !== 'auto' ? parseInt(height, 10) : (height || 'auto')
  };

  return (
    <Rnd
      key={`${id}`}
      size={{ width: rndSize.width, height: rndSize.height }}
      position={{ x: rndX, y: rndY }} // 내부 상태 사용
      bounds=".contentsBody"
      dragAxis={editable ? "both" : "none"}
      onDragStart={(e, data) => {
        // 드래그 시작 시 아무것도 안 해도 됨, Rnd가 자동으로 시작 위치에서 그림
        // console.log(`ImageBlock ${id}: onDragStart - Initial pos (${data.x}, ${data.y})`);
      }}
      onDrag={(e, data) => {
        // 드래그 중 실시간으로 rndX, rndY 업데이트
        // 이렇게 하면 Rnd의 시각적 움직임과 컴포넌트의 내부 상태가 일치합니다.
        setRndX(data.x);
        setRndY(data.y);
        // console.log(`ImageBlock ${id}: onDrag - Current pos (${data.x}, ${data.y})`);
      }}
      onDragStop={(e, d) => {
        if (editable) {
          console.log(`ImageBlock ${id}: onDragStop - FINAL new pos (x:${d.x}, y:${d.y}). Calling onUpdate.`);
          // 여기서 onUpdate를 호출하여 ContentsPage의 elements 상태를 업데이트합니다.
          // d.x와 d.y는 Rnd가 계산한 최종 위치입니다.
          onUpdate(id, { position: { x: d.x, y: d.y } }); // src는 변경되지 않았으므로 굳이 다시 전달할 필요 없음
        }
      }}
      onResizeStop={(e, direction, ref, delta, newPosition) => {
        if (editable) {
          const newWidth = ref.offsetWidth;
          const newHeight = ref.offsetHeight;
          console.log(`ImageBlock ${id}: onResizeStop - New size (${newWidth}, ${newHeight}), New pos (${newPosition.x}, ${newPosition.y}). Calling onUpdate.`);
          onUpdate(id, { width: newWidth, height: newHeight, position: newPosition }); // src는 변경되지 않았으므로 굳이 다시 전달할 필요 없음
        }
      }}
      style={{
        border: selected && editable ? '2px solid #5b9eff' : 'none',
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: editable ? 'auto' : 'none',
        zIndex: selected ? 100 : 10,
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