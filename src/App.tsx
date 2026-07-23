import { useState, useEffect } from 'react';
import { DashboardProvider } from './context/DashboardContext';
import { NavBar } from './components/layout/NavBar';
import { StateHero } from './components/layout/StateHero';
import { FilterPanel } from './components/layout/FilterPanel';
import { Dashboard } from './components/layout/Dashboard';
import { EmbedView } from './components/layout/EmbedView';
import { Chatbot } from './components/chat/Chatbot';
import type { ChatConfig } from './services/chatAgent';

function App() {
  const params = new URLSearchParams(window.location.search);
  const isEmbed = params.get('embed') === 'true';
  const [chatConfig, setChatConfig] = useState<ChatConfig | null>(null);

  useEffect(() => {
    fetch('/config.json')
      .then((r) => r.json())
      .then(setChatConfig)
      .catch(() => {});
  }, []);

  if (isEmbed) {
    return (
      <DashboardProvider>
        <EmbedView />
      </DashboardProvider>
    );
  }

  return (
    <DashboardProvider>
      <div className="app">
        <NavBar />
        <div className="page-content">
          <StateHero />
          <FilterPanel />
          <Dashboard />
        </div>
        {chatConfig?.chatbotEnabled && <Chatbot />}
      </div>
    </DashboardProvider>
  );
}

export default App;
