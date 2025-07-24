import './CommonCSS.css';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const goHomeButton = () => {
    navigate('/');
  }
  return (
    <header className="header">
      <h1 onClick={goHomeButton} style={{ cursor: 'pointer' }}>
        My Development Log
      </h1>

      <nav>
        <a href="/">Home</a>
        <a href="/">Posts</a>
        <a href="/contents">write</a>
      </nav>
    </header>
  );
}

export default Header;
