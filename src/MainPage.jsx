import './CommonCSS.css';
import { supabase } from './supabase';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('development_log')
        .select('id, title, savedAt')
        .order('savedAt', { ascending: false });

      if (data) setLogs(data);
      else console.error('불러오기 실패:', error);
    };

    fetchLogs();
  }, []);

  return (
    <div className="log-list-wrapper">
      {logs.map((log) => (
        <div
          key={log.id}
          className="log-item"
          onClick={() => navigate(`/posts/${log.id}`)}
        >
          <div className="log-title">{log.title}</div>
          <div className="log-date">
            {new Date(log.savedAt).toLocaleString('ko-KR')}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MainPage;
