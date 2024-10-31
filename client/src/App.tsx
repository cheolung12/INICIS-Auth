import { Routes, Route } from 'react-router-dom';
import { Auth } from './pages/Auth';
import { AuthCallback } from './pages/AuthCallback';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  );
}

export default App;