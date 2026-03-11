import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { DocumentAnalyzer } from './components/DocumentAnalyzer';
import { Drafter } from './components/Drafter';
import { NotificationHub } from './components/NotificationHub';
import { AppView, ChatMessage, AnalyzedDocumentHistory, AppNotification, NotificationType, DraftingState, DocumentAnalysisState, LegalDomain } from './types';

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);
  const [currentDomain, setCurrentDomain] = useState<LegalDomain>('mercantil');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  const notify = useCallback((message: string, type: NotificationType = 'info', title?: string) => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, { id, type, message, title }]);
    if (type === 'success' || type === 'info') {
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
    }
  }, []);

  const dismissNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([{ 
    role: 'model', 
    text: 'Sistema Estratégico inicializado. Estoy a su disposición para brindarle asesoría técnica especializada. ¿En qué puedo asistirle en esta sesión?' 
  }]);
  
  const [analysisHistory, setAnalysisHistory] = useState<AnalyzedDocumentHistory[]>([]);
  
  const [draftingState, setDraftingState] = useState<DraftingState>({ 
    prompt: '', 
    generatedDoc: '' 
  });
  
  const [documentAnalysisState, setDocumentAnalysisState] = useState<DocumentAnalysisState>({ 
    files: [], 
    result: null, 
    customInstruction: '' 
  });

  const handleAddAnalysis = (item: AnalyzedDocumentHistory) => {
    setAnalysisHistory(prev => [item, ...prev]);
    notify("Expediente incorporado satisfactoriamente", "success", "Análisis Completado");
  };

  const handleNewCase = () => {
    if (confirm("Al iniciar una nueva sesión se purgarán los datos actuales para garantizar la confidencialidad. ¿Desea proceder?")) {
      setChatHistory([{ role: 'model', text: 'Nueva sesión estratégica iniciada. Quedo a su disposición para cualquier consulta técnica.' }]);
      setAnalysisHistory([]);
      setDraftingState({ prompt: '', generatedDoc: '' });
      setDocumentAnalysisState({ files: [], result: null, customInstruction: '' });
      setCurrentView(AppView.CHAT);
      notify("Memoria volátil purgada. Nueva sesión iniciada.", "info", "Sistema Reiniciado");
    }
  };

  const renderView = () => {
    return (
      <div className="h-full w-full animate-fade-in">
        {(() => {
          switch (currentView) {
            case AppView.CHAT:
              return <ChatInterface messages={chatHistory} setMessages={setChatHistory} analysisHistory={analysisHistory} domain={currentDomain} notify={notify} />;
            case AppView.DOCUMENT_ANALYSIS:
              return <DocumentAnalyzer state={documentAnalysisState} setState={setDocumentAnalysisState} onAddAnalysis={handleAddAnalysis} domain={currentDomain} notify={notify} />;
            case AppView.DRAFTING:
              return <Drafter state={draftingState} setState={setDraftingState} domain={currentDomain} notify={notify} />;
            default:
              return <ChatInterface messages={chatHistory} setMessages={setChatHistory} analysisHistory={analysisHistory} domain={currentDomain} notify={notify} />;
          }
        })()}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans selection:bg-legal-gold/30">
      <NotificationHub notifications={notifications} onDismiss={dismissNotification} />
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        onNewCase={handleNewCase} 
        currentDomain={currentDomain}
        onChangeDomain={setCurrentDomain}
      />
      <main className="flex-1 relative overflow-hidden">
        {renderView()}
      </main>
    </div>
  );
}

export default App;