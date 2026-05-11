import { HashRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './hooks/useStore';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ArticlePage from './pages/ArticlePage';
import SettingsPage from './pages/SettingsPage';
import DocsPage from './pages/DocsPage';

function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:id" element={<CategoryPage />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/docs" element={<DocsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}

export default App;
