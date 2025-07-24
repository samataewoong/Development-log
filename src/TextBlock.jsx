// TextBlock.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
// 다음 라인들은 StarterKit에 이미 포함되어 있으므로 제거합니다.
// import { Underline } from '@tiptap/extension-underline';
// import { Strike } from '@tiptap/extension-strike';
// import { Bold } from '@tiptap/extension-bold';
// import { Italic } from '@tiptap/extension-italic';

import './CommonCSS.css';
import { debounce } from './utils/debounce'; // debounce 함수 경로 확인

// 폰트 크기 확장은 TextStyle을 기반으로 합니다.
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize,
        renderHTML: attributes => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          };
        },
      },
    };
  },
}).configure({ types: ['textStyle'] });


export default function TextBlock({ id, content, selected, onSelect, onUpdate, editable = true, position: initialPosition, size: initialSize }) {
  const [position, setPosition] = useState(initialPosition || { x: 50, y: 80 });
  const [size, setSize] = useState(initialSize || { width: 300, height: 'auto' });
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  const debouncedOnUpdate = useMemo(
    () => debounce((updateId, updateContent, updatePosition, updateSize) => {
      onUpdate(updateId, { content: updateContent, position: updatePosition, size: updateSize });
    }, 300),
    [onUpdate]
  );

  const editor = useEditor({
    extensions: [
      StarterKit, // StarterKit이 대부분의 기본 확장을 포함합니다.
      TextStyle,  // FontSize 확장을 위해 필요하며, StarterKit에도 포함되지만 FontSize 확장이 이를 필요로 하므로 같이 둡니다.
      Color,      // 텍스트 색상 변경을 위해 필요
      FontSize,   // 커스텀 폰트 크기 확장
      // StarterKit에 이미 포함된 다음 확장팩들은 여기서 제거합니다.
      // Bold,
      // Italic,
      // Strike,
      // Underline,
    ],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      if (editable) {
        debouncedOnUpdate(id, editor.getJSON(), position, size);
      }
    },
    onFocus: ({ editor }) => {
      setIsEditorFocused(true);
      if (editable) {
        onSelect(id, editor);
      }
    },
    onBlur: () => {
      setIsEditorFocused(false);
    }
  });

  useEffect(() => {
    if (editor) {
      if (selected && editable && !editor.isFocused) {
        editor.commands.focus();
      } else if (!selected && editor.isFocused) {
        editor.commands.blur();
      }
    }
  }, [selected, editor, editable]);

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  useEffect(() => {
    if (initialSize) {
      setSize(initialSize);
    }
  }, [initialSize]);

  if (!editor) {
    return null;
  }

  const handleRndClick = useCallback((e) => {
    e.stopPropagation();
    if (editable) {
      editor.commands.focus();
      Promise.resolve().then(() => {
        onSelect(id, editor);
      });
    }
  }, [id, editor, editable, onSelect]);

  const handleEditorContentClick = useCallback((e) => {
    e.stopPropagation();
    if (editable) {
      if (!editor.isFocused) {
        editor.commands.focus();
      }
      Promise.resolve().then(() => {
        onSelect(id, editor);
      });
    }
  }, [id, editor, editable, onSelect]);


  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      bounds=".contentsBody"
      dragAxis={isEditorFocused ? "none" : "both"}
      disableDragging={isEditorFocused}
      onDragStop={(e, d) => {
        if (editable) {
          setPosition({ x: d.x, y: d.y });
          debouncedOnUpdate(id, editor.getJSON(), { x: d.x, y: d.y }, size);
        }
      }}
      onResizeStop={(e, direction, ref, delta, newPosition) => {
        if (editable) {
          const newWidth = ref.offsetWidth;
          const newHeight = ref.offsetHeight;
          setSize({ width: newWidth, height: newHeight });
          setPosition(newPosition);
          debouncedOnUpdate(id, editor.getJSON(), newPosition, { width: newWidth, height: newHeight });
        }
      }}
      style={{
        border: selected ? '2px solid #5b9eff' : 'none',
        backgroundColor: 'white',
        padding: '4px',
        borderRadius: '4px',
        pointerEvents: editable ? 'auto' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        boxSizing: 'border-box',
        cursor: isEditorFocused ? 'text' : 'grab',
        zIndex: selected ? 100 : 1,
      }}
      enableResizing={editable ? {
        top: true, right: true, bottom: true, left: true,
        topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
      } : false}
      onClick={handleRndClick}
    >
      <EditorContent
        editor={editor}
        className="tiptap-editor-content"
        style={{
          flexGrow: 1,
          outline: 'none',
          minHeight: '1em',
          padding: '4px',
          userSelect: 'text',
          WebkitUserSelect: 'text',
        }}
        onClick={handleEditorContentClick}
      />
    </Rnd>
  );
}