import './CommonCSS.css';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const goHomeButton = () => {
    navigate('/Development-log/');
  }
  return (
    <header className="header">
      <h1 onClick={goHomeButton} style={{ cursor: 'pointer' }}>
        My Development Log
      </h1>

      <nav>
        <a href="/Development-log/">Home</a>
        <a href="/Development-log/">Posts</a>
        <a href="/Development-log/contents">write</a>
      </nav>
    </header>
  );
}

export default Header;
