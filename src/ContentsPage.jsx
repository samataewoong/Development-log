// ContentsPage.jsx
import './CommonCSS.css';
import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TextBlock from './TextBlock';
import Toolbar from './Toolbar';
import ImageBlock from './ImageBlock';
import { supabase } from './supabase';
import 'prosemirror-view/style/prosemirror.css';

export default function ContentsPage() {
  const { id } = useParams();
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedEditor, setSelectedEditor] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(id ? true : false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [maxContentHeight, setMaxContentHeight] = useState('80vh');

  useEffect(() => {
    const fetchPostForEdit = async () => {
      if (id) {
        setLoading(true);
        const { data, error } = await supabase
          .from('development_log')
          .select('title, raw_elements')
          .eq('id', id)
          .single();

        if (error) {
          console.error('수정할 게시글 불러오기 실패:', error.message);
          alert('수정할 게시글을 불러오는 데 실패했습니다.');
          navigate('/Development-log/');
          return;
        }

        if (data) {
          setTitle(data.title);
          if (data.raw_elements) {
            setElements(data.raw_elements);
          } else {
            setElements([]);
          }
        }
        setLoading(false);
      } else {
        setTitle('');
        setElements([]);
        setLoading(false);
      }
    };

    fetchPostForEdit();
  }, [id, navigate]);

  useEffect(() => {
    let maxY = 0;
    elements.forEach(el => {
      const elementHeight = parseInt(el.size?.height) || (el.type === 'text' ? 100 : el.type === 'image' ? 300 : 0);
      const elementBottom = el.position.y + elementHeight;
      if (elementBottom > maxY) {
        maxY = elementBottom;
      }
    });

    const newMinHeight = Math.max(window.innerHeight * 0.8, maxY + 100);
    setMaxContentHeight(`${newMinHeight}px`);
  }, [elements]);


  const handleSave = async () => {
    const now = new Date().toISOString();

    const dataToSave = {
      title,
      raw_elements: elements,
      savedAt: now,
    };

    console.log('최종 저장/수정할 데이터:', dataToSave);

    try {
      let result;
      if (id) {
        result = await supabase
          .from('development_log')
          .update(dataToSave)
          .eq('id', id);
      } else {
        result = await supabase
          .from('development_log')
          .insert([dataToSave]);
      }

      const { data, error } = result;

      if (error) {
        console.error('저장/수정 실패:', error);
        alert('저장/수정 실패!');
      } else {
        console.log('저장/수정 성공:', data);
        alert('저장/수정 성공!');
        if (id) {
          navigate(`/posts/${id}`);
        } else {
          const newPostId = data && data.length > 0 ? data[0].id : null;
          if (newPostId) {
            navigate(`/post/${newPostId}`);
          } else {
            navigate('/');
          }
        }
      }
    } catch (err) {
      console.error('예외 발생:', err);
      alert('저장/수정 중 예외가 발생했습니다.');
    }
  };

  const addTextBox = () => {
    const newTextBlock = {
      id: Date.now(),
      type: 'text',
      content: '새 텍스트 블록입니다.',
      position: { x: 50, y: 50 },
      size: { width: 300, height: 100 }
    };
    setElements((prevElements) => [...prevElements, newTextBlock]);
  };

  const handleImageButtonClick = () => {
    fileInputRef.current.click();
  };

  // !!! 이 handleFileChange 함수가 여러 파일 업로드를 처리하도록 수정됩니다 !!!
  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files); // FileList를 배열로 변환
    if (files.length === 0) return;

    setLoading(true); // 이미지 업로드 중 로딩 표시

    const uploadPromises = files.map(async (file) => {
      const fileExtension = file.name.split('.').pop(); // 파일 확장자 추출
      const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`; // 타임스탬프 + 랜덤 문자열로 고유 이름 생성
      const filePath = `public/${uniqueFileName}.${fileExtension}`; // 확장자 포함

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file); // <--- 여기서 filePath를 사용하고 있는지 확인

      if (uploadError) {
        console.error(`이미지 업로드 실패 (${file.name}):`, uploadError);
        return null;
      }

      const { data: publicURLData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath); // <--- 여기서 filePath를 사용하고 있는지 확인

      if (publicURLData && publicURLData.publicUrl) {
        return {
          id: Date.now() + Math.random(), // 고유 ID (충돌 방지를 위해 random 추가)
          type: 'image',
          src: publicURLData.publicUrl,
          width: 400,
          height: 'auto',
          position: { x: 50 + Math.random() * 50, y: 50 + Math.random() * 50 }, // 겹치지 않게 랜덤 위치 추가
        };
      } else {
        console.error(`이미지 공개 URL을 가져올 수 없습니다 (${file.name}).`);
        return null;
      }
    });

    const newImageBlocks = (await Promise.all(uploadPromises)).filter(Boolean); // null 값 필터링
    setElements((prevElements) => [...prevElements, ...newImageBlocks]); // 새로운 이미지 블록들 추가

    setLoading(false);
    // 파일 선택 후 input을 초기화하여 동일 파일 재선택 가능하게 함 (선택 사항)
    event.target.value = '';
  };

  const onSelect = (elementId, editorInstance) => {
    console.log('onSelect called. elementId:', elementId, 'editorInstance:', editorInstance);
    setSelectedId(elementId);
    if (editorInstance) {
      setSelectedEditor(editorInstance);
      console.log('selectedEditor updated to:', editorInstance);
    } else {
      // 이 경우가 발생하면, 왜 editorInstance가 null인지 찾아야 합니다.
      console.log('selectedEditor set to null (editorInstance was null/undefined).');
      setSelectedEditor(null); // 명시적으로 null로 설정 (필요에 따라)
    }
  };

  const onUpdate = (elementId, update) => {
    console.log('onUpdate received:', { elementId, update });
    setElements((prevElements) => { // prevElements 사용 권장
      return prevElements.map((el) => {
        if (el.id !== elementId) {
          return el;
        }

        let updatedElement = { ...el }; // 기존 엘리먼트 복사

        // 위치 업데이트 (update.position이 객체 형태로 올 때)
        if (update.position !== undefined) {
          updatedElement.position = {
            ...el.position, // 기존 position 유지
            x: update.position.x !== undefined ? update.position.x : el.position.x,
            y: update.position.y !== undefined ? update.position.y : el.position.y,
          };
        }

        // 크기 업데이트 (update.width, update.height가 개별적으로 올 때)
        if (update.width !== undefined) {
          updatedElement.width = update.width;
        }
        if (update.height !== undefined) {
          updatedElement.height = update.height;
        }

        // src 업데이트 (이미지 변경 시)
        if (update.src !== undefined) {
          updatedElement.src = update.src;
        }

        // 텍스트 내용 업데이트 (TextBlock에서)
        if (update.content !== undefined) {
            updatedElement.content = update.content;
        }
        
        console.log('Updating element:', el.id, 'to:', updatedElement);
        return updatedElement;
      });
    });
  };

  const handleBackgroundClick = (event) => {
  // 이벤트 타겟이 contentsBody 자체인 경우에만 선택 해제 (가장 안전한 방법)
  if (event.target.classList.contains('contentsBody')) {
    console.log("Background clicked, deselecting all.");
    setSelectedId(null);
    setSelectedEditor(null);
  } else {
    // 다른 요소를 클릭한 경우 (예: ImageBlock, TextBlock 내부의 요소)
    // ImageBlock/TextBlock의 onClick에서 stopPropagation()을 했어도,
    // 드래그나 리사이즈와 같은 복합적인 이벤트에서 순서 문제가 생길 수 있습니다.
    // 여기서는 onSelect가 제대로 호출되도록 해야 합니다.
  }
};

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' && selectedId !== null) {
        setElements(elements.filter(el => el.id !== selectedId));
        setSelectedId(null);
        setSelectedEditor(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedId, elements]);


  if (loading) {
    return <div>게시글 불러오는 중...</div>;
  }

  return (
    <div
      className="contents"
      style={{
        paddingTop: '50px',
        display: 'flex',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      {/* 툴바 영역 */}
      <div
        style={{
          width: '70px',
          borderRight: '1px solid #ccc',
          padding: '12px 8px',
          boxSizing: 'border-box',
          minHeight: '100%',
          position: 'sticky',
          top: '50px',
          backgroundColor: '#f7f8fa',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 1000,
          alignItems: 'center',
          boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
        }}
      >
        {selectedEditor ? (
          <Toolbar
            key={`${selectedEditor.options.element.id || 'no-id'}-${selectedEditor.isFocused ? 'focused' : 'blurred'}`}
            editor={selectedEditor}
            vertical={true}
          />
        ) : (
          <div
            style={{
              // ... 스타일 유지 ...
            }}
          >
            선택된 <br />
            텍스트 없음
          </div>
        )}
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto', border: '1px solid #ccc', maxHeight: 'calc(100vh - 50px)', }}>
        <div className="contentsTitle">
          <label htmlFor="titleInput" style={{ fontWeight: 'bold', fontSize: '16px' }}>
            제목
          </label>
          <input
            id="titleInput"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            className="saveButton"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ddd')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#eee')}
            onClick={handleSave}
          >
            저장
          </button>
        </div>
        <div className="toolButtons">
          <button
            onClick={addTextBox}
            title="텍스트 박스 추가"
          >
            T
          </button>

          <button
            onClick={handleImageButtonClick}
            title="이미지 파일 추가"
          >
            Image
          </button>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            multiple
          />
        </div>
        <div
          className="contentsBody"
          onClick={handleBackgroundClick}
          style={{ minHeight: maxContentHeight }}
        >
          {elements.map((el) => {
            if (el.type === 'text') {
              return (
                <TextBlock
                  key={el.id}
                  id={el.id}
                  content={el.content}
                  position={el.position}
                  size={el.size}
                  selected={selectedId === el.id}
                  onSelect={onSelect}
                  onUpdate={onUpdate}
                  editable={true}
                />
              );
            } else if (el.type === 'image') {
              return (
                <ImageBlock
                  key={el.id}
                  id={el.id}
                  src={el.src}
                  width={el.width}
                  height={el.height}
                  position={el.position}
                  selected={selectedId === el.id}
                  onSelect={onSelect}
                  onUpdate={onUpdate}
                  editable={true}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}