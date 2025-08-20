import './CommonCSS.css';
import { supabase } from './supabase';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);

      const { count, error: countError } = await supabase
        .from('development_log')
        .select('id', { count: 'exact', head: true });
      if (countError) {
        console.error('전체 게시글 수 조회 실패:', countError);
        setLoading(false);
        return;
      }
      setTotalCount(count);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from('development_log')
        .select('id, title, savedAt')
        .order('savedAt', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('불러오기 실패:', error);
      } else {
        setLogs(data);
      }

      setLoading(false);
    };

    fetchLogs();
  }, [page]);

  const totalPages = Math.ceil(totalCount / pageSize);

  // 페이지 변경 함수 (1 이상 totalPages 이하로 제한)
  const changePage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="log-list-wrapper">
      {loading && <div>로딩중...</div>}
      {!loading && logs.length === 0 && <div>게시글이 없습니다.</div>}

      {logs.map((log) => (
        <div
          key={log.id}
          className="log-item"
          onClick={() => navigate(`/posts/${log.id}`)}
          style={{ cursor: 'pointer' }}
        >
          <div className="log-title">{log.title}</div>
          <div className="log-date">
            {new Date(log.savedAt).toLocaleString('ko-KR')}
          </div>
        </div>
      ))}

      {/* 페이지네이션 */}
      <div className="pagination">
        <button
          onClick={() => changePage(page - 1)}
          disabled={page === 1}
        >
          이전
        </button>

        {[...Array(totalPages)].map((_, idx) => {
          const pageNum = idx + 1;
          return (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              disabled={pageNum === page}
              className={pageNum === page ? 'active' : ''}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => changePage(page + 1)}
          disabled={page === totalPages}
        >
          다음
        </button>
      </div>

    </div>
  );
};

export default MainPage;
