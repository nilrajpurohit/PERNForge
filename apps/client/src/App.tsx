import { Link, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <header>
        <h1>PERN Passport JWT Auth</h1>
        <nav>
          <Link to="/login" style={{ marginRight: 12 }}>
            Login
          </Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>

      <main style={{ marginTop: 24 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
