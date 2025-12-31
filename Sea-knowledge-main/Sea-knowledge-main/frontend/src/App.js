import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatbotPage from "./pages/ChatbotPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatbotPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;