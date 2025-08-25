import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";

function App() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        {!user ? (
          <Route path="*" element={<AuthPage />} />
        ) : (
          <Route path="*" element={<ChatPage />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
