import Header from './Header';
import Footer from './Footer';
import MainPage from './MainPage';
import './CommonCSS.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ContentsPage from './ContentsPage';
import PostView from './PostView';

function App() {


  return (
    <Router>
      <div className="mainContainer">
        <Header />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/contents" element={<ContentsPage />} />
          <Route path="/posts/:id" element={<PostView />} />
          <Route path="/edit/:id" element={<ContentsPage />} />
        </Routes>    
        <Footer />
      </div>
    </Router>
  )
}

export default App
