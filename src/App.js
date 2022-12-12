import { HashRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Overview from './pages/Overview';

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route exact path="/" element={<Overview />} />
      </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </HashRouter>
  );
}

export default App;
