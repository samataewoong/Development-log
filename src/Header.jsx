import './CommonCSS.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

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
        <Link to="/">Home</Link>
        <Link to="/">Posts</Link>
        <Link to="/contents">Write</Link>
      </nav>
    </header>
  );
}

export default Header;
