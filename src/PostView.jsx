// PostView.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from './supabase';
import TextBlock from './TextBlock';
import ImageBlock from './ImageBlock';
import './CommonCSS.css';
import { useNavigate } from 'react-router-dom'; 

const PostView = () => {
    const { id } = useParams();

    const [title, setTitle] = useState('');
    const [savedAt, setSavedAt] = useState('');
    const [loading, setLoading] = useState(true);
    const [displayElements, setDisplayElements] = useState([]);
    const navigate = useNavigate(); // useNavigate 훅 사용

    useEffect(() => {
        const fetchPost = async () => {
            const { data, error } = await supabase
                .from('development_log')
                .select('title, savedAt, raw_elements')
                .eq('id', id)
                .single();

            if (error) {
                console.error('불러오기 실패:', error.message);
                setLoading(false);
                // 오류 발생 시 사용자에게 알림 또는 적절한 에러 페이지로 리다이렉트
                alert('게시글을 불러오는 데 실패했습니다.');
                navigate('/Development-log/'); // 예시: 홈으로 이동
                return;
            }

            console.log('불러온 데이터:', data);

            setTitle(data.title);
            setSavedAt(data.savedAt);

            if (data.raw_elements) {
                setDisplayElements(data.raw_elements);
            } else {
                console.warn("raw_elements 데이터가 없습니다. ContentsPage에서 저장되었는지 확인하세요.");
                setDisplayElements([]);
            }

            setLoading(false);
        };

        // useEffect의 의존성 배열에 navigate를 추가하는 것이 좋음 (React Hooks 규칙)
        fetchPost();
    }, [id, navigate]); // navigate를 의존성 배열에 추가

    const deleteContents = async () => {
        if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            return;
        }
        const { error } = await supabase.from('development_log').delete().eq('id', id);
        if (error) {
            console.error('게시글 삭제 실패:', error.message);
            alert('게시글 삭제에 실패했습니다: ' + error.message);
        } else {
            console.log('게시글 삭제 성공');
            alert('게시글이 성공적으로 삭제되었습니다.');
            navigate('/');
        }
    };

    // **새로 추가될 수정 버튼 클릭 핸들러**
    const handleEdit = () => {
        navigate(`/edit/${id}`); // `/edit/게시글ID` 경로로 이동
    };

    if (loading) return <div>불러오는 중...</div>;

    // 데이터가 없거나 로딩 후에도 게시글을 찾을 수 없는 경우
    if (!title && !displayElements.length && !loading) {
        return <div>게시글을 찾을 수 없습니다.</div>;
    }


    return (
        <div className="postViewContetns">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>{title}</h1>
                <div> {/* 버튼들을 감싸는 div 추가 (선택 사항) */}
                    <button
                        onClick={handleEdit} // <-- 수정 버튼에 handleEdit 함수 연결
                        className="editButton" // CSS 클래스는 존재한다고 가정
                    >
                        수정
                    </button>
                    <button
                        onClick={deleteContents}
                        className="deleteButton" // CSS 클래스는 존재한다고 가정
                    >
                        삭제
                    </button>
                </div>
            </div>
            <p style={{ color: '#888', marginBottom: '20px' }}>
                저장된 시간: {new Date(savedAt).toLocaleString('ko-KR')}
            </p>

            <div className="postViewBody">
                {displayElements.map((el) => {
                    if (el.type === 'text') {
                        return (
                            <TextBlock
                                key={el.id}
                                id={el.id}
                                content={el.content}
                                position={el.position}
                                size={el.size}
                                selected={false}
                                onSelect={() => { }}
                                onUpdate={() => { }}
                                editable={false} // 읽기 전용
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
                                selected={false}
                                onSelect={() => { }}
                                onUpdate={() => { }}
                                editable={false} // 읽기 전용
                            />
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

export default PostView;