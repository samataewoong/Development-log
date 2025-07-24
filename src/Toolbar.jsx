// Toolbar.jsx
import React, { useCallback, useEffect } from 'react';

export default function Toolbar({ editor, vertical }) {
  // ************ 추가된 유효성 검사: editor와 editor.view 모두 존재하는지 확인 ************
  if (!editor || !editor.view) {
    console.log('Toolbar: Editor instance or editor view not available. Or not mounted yet.');
    return null; // editor 또는 editor.view 가 없으면 툴바를 렌더링하지 않음
  }

  // 이 로그는 디버깅이 끝난 후 제거해도 됩니다.
  useEffect(() => {
    console.log('Toolbar useEffect: editor or editor.isFocused changed.');
    console.log('Current editor (inside useEffect):', editor);
    console.log('Current editor.isFocused (inside useEffect):', editor.isFocused);
  }, [editor, editor.isFocused]);

  // 폰트 크기 변경 핸들러
  const setFontSize = useCallback((e) => {
    e.preventDefault(); // 이벤트의 기본 동작 방지 (예: select 박스 포커스)
    e.stopPropagation(); // 이벤트 버블링 방지

    const size = e.target.value;
    console.log('setFontSize: Attempting to set size:', size, 'Editor focused:', editor.isFocused);

    editor.chain().focus().updateAttributes('textStyle', { fontSize: size === '' ? null : size }).run();
    console.log('setFontSize: Command executed successfully.');
  }, [editor]);

  // 텍스트 색상 변경 핸들러
  const setTextColor = useCallback((e) => {
    e.preventDefault(); // 이벤트의 기본 동작 방지 (예: color picker 포커스)
    e.stopPropagation(); // 이벤트 버블링 방지

    const color = e.target.value;
    console.log('setTextColor: Attempting to set color:', color, 'Editor focused:', editor.isFocused);

    editor.chain().focus().setColor(color).run();
    console.log('setTextColor: Command executed successfully.');
  }, [editor]);

  // 볼드 토글 핸들러
  const toggleBold = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    editor.chain().focus().toggleBold().run();
  }, [editor]);

  // 이탤릭 토글 핸들러
  const toggleItalic = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    editor.chain().focus().toggleItalic().run();
  }, [editor]);

  // 스트라이크스루 토글 핸들러
  const toggleStrike = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    editor.chain().focus().toggleStrike().run();
  }, [editor]);

  // 언더라인 토글 핸들러
  const toggleUnderline = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    editor.chain().focus().toggleUnderline().run();
  }, [editor]);

  // 실행 취소 핸들러
  const undo = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    editor.chain().focus().undo().run();
  }, [editor]);

  // 다시 실행 핸들러
  const redo = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
      editor.chain().focus().redo().run();
  }, [editor]);

  const toolbarStyle = {
    display: 'flex',
    flexDirection: vertical ? 'column' : 'row', // vertical prop에 따라 정렬 방향 변경
    gap: '8px',
    padding: '8px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const buttonStyle = {
    padding: '6px 10px',
    border: '1px solid #ccc',
    borderRadius: '3px',
    backgroundColor: '#eee',
    cursor: 'pointer',
    fontSize: '14px',
    lineHeight: '1', // 텍스트와 아이콘 정렬을 위해
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#a2c2e0', // 활성화된 버튼 색상
    borderColor: '#5b9eff',
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f5f5f5',
    color: '#aaa',
    cursor: 'not-allowed',
  };

  const selectStyle = {
    padding: '6px 10px',
    border: '1px solid #ccc',
    borderRadius: '3px',
    backgroundColor: '#eee',
    fontSize: '14px',
    cursor: 'pointer',
  };

  const inputColorStyle = {
    width: '30px',
    height: '30px',
    border: '1px solid #ccc',
    borderRadius: '3px',
    cursor: 'pointer',
    padding: '0', // input type="color"의 기본 패딩 제거
  };

  // isFocused 값을 미리 계산하여 사용 (editor.view.hasFocus 접근 최소화)
  const isEditorFocused = editor.isFocused;

  return (
    <div style={toolbarStyle}>
      {/* 폰트 크기 드롭다운 */}
      <select
        onChange={setFontSize}
        value={editor.getAttributes('textStyle')?.fontSize || ''}
        disabled={!isEditorFocused} // isFocused 변수 사용
        style={selectStyle}
      >
        <option value="">크기</option>
        <option value="12px">12px</option>
        <option value="14px">14px</option>
        <option value="16px">16px</option>
        <option value="18px">18px</option>
        <option value="20px">20px</option>
        <option value="24px">24px</option>
        <option value="30px">30px</option>
      </select>

      {/* 텍스트 색상 피커 */}
      <input
        type="color"
        onChange={setTextColor}
        value={editor.getAttributes('textStyle')?.color || '#000000'}
        disabled={!isEditorFocused} // isFocused 변수 사용
        style={inputColorStyle}
      />

      {/* 볼드 버튼 */}
      <button
        onClick={toggleBold}
        // editor.can()은 내부적으로 editor.view에 접근하지만, 컴포넌트 시작에서 이미 유효성 검사했으므로 안전함
        disabled={!editor.can().chain().focus().toggleBold().run()}
        style={editor.isActive('bold') ? activeButtonStyle : (isEditorFocused ? buttonStyle : disabledButtonStyle)}
      >
        B
      </button>

      {/* 이탤릭 버튼 */}
      <button
        onClick={toggleItalic}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        style={editor.isActive('italic') ? activeButtonStyle : (isEditorFocused ? buttonStyle : disabledButtonStyle)}
      >
        I
      </button>

      {/* 스트라이크스루 버튼 */}
      <button
        onClick={toggleStrike}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        style={editor.isActive('strike') ? activeButtonStyle : (isEditorFocused ? buttonStyle : disabledButtonStyle)}
      >
        S
      </button>

      {/* 언더라인 버튼 */}
      <button
        onClick={toggleUnderline}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        style={editor.isActive('underline') ? activeButtonStyle : (isEditorFocused ? buttonStyle : disabledButtonStyle)}
      >
        U
      </button>

      {/* 실행 취소 버튼 */}
      <button
        onClick={undo}
        disabled={!editor.can().undo()}
        style={isEditorFocused ? buttonStyle : disabledButtonStyle}
      >
        Undo
      </button>

      {/* 다시 실행 버튼 */}
      <button
        onClick={redo}
        disabled={!editor.can().redo()}
        style={isEditorFocused ? buttonStyle : disabledButtonStyle}
      >
        Redo
      </button>
    </div>
  );
}