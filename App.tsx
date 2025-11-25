import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { KnowledgeBaseManager } from './components/KnowledgeBaseManager';
import { extractTextFromFiles } from './utils/documentProcessor';
import { generateChatResponse } from './services/geminiService';
import { Message, KnowledgeDocument, ChatState } from './types';
import { AlertCircle, CheckCircle2, Lock, X, Eye, EyeOff } from 'lucide-react';

// Configuration
// BEST PRACTICE: Imposta una variabile d'ambiente chiamata ADMIN_PASSWORD nel tuo sistema di hosting (es. Vercel, Netlify, o .env locale).
// Se non viene trovata, la password di default sarà 'admin'.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'; 

export default function App() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  
  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state for toggling visibility
  const [loginError, setLoginError] = useState(false);

  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        id: 'welcome',
        role: 'model',
        content: 'Ciao! Sono il tuo assistente virtuale. Chiedimi pure informazioni su manuali e documenti aziendali.',
        timestamp: Date.now()
      }
    ],
    isLoading: false
  });

  // Default to false so colleagues don't see the manager on load
  const [showManager, setShowManager] = useState(false);
  
  // Ref for password input focus
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Focus password input when modal opens
  useEffect(() => {
    if (showLoginModal && passwordInputRef.current) {
      setTimeout(() => passwordInputRef.current?.focus(), 100);
    }
  }, [showLoginModal]);

  // Handle file uploads/sync
  const handleFilesSelected = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setProcessingStatus('Analisi dei nuovi file in corso...');

    try {
      // Filter out files that are already processed (simple sync simulation by name)
      const newFiles = Array.from(files).filter(file => 
        !documents.some(doc => doc.name === file.name && doc.size === file.size)
      );

      if (newFiles.length === 0) {
        setProcessingStatus('Tutti i file selezionati sono già aggiornati.');
        setTimeout(() => setIsProcessing(false), 2000);
        return;
      }

      setProcessingStatus(`Elaborazione di ${newFiles.length} nuovi documenti...`);
      
      const extractedDocs = await extractTextFromFiles(newFiles);
      
      setDocuments(prev => [...prev, ...extractedDocs]);
      setProcessingStatus(`Sincronizzazione completata: ${newFiles.length} documenti aggiunti.`);
    } catch (error) {
      console.error('Error processing files:', error);
      setProcessingStatus('Errore durante elaborazione dei file.');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingStatus('');
      }, 3000);
    }
  }, [documents]);

  // Handle sending a message
  const handleSendMessage = useCallback(async (text: string) => {
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isLoading: true
    }));

    try {
      // Prepare context from documents
      const context = documents.map(d => `--- INIZIO DOCUMENTO: ${d.name} ---\n${d.content}\n--- FINE DOCUMENTO ---\n`).join('\n');

      const responseText = await generateChatResponse(text, context, chatState.messages);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: Date.now()
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, botMsg],
        isLoading: false
      }));

    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "Mi dispiace, ho riscontrato un errore nel generare la risposta. Assicurati che la chiave API sia configurata correttamente.",
        timestamp: Date.now(),
        isError: true
      };
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMsg],
        isLoading: false
      }));
    }
  }, [documents, chatState.messages]);

  const handleClearChat = () => {
    setChatState({
      messages: [{
        id: Date.now().toString(),
        role: 'model',
        content: 'Chat cancellata. Come posso aiutarti ora?',
        timestamp: Date.now()
      }],
      isLoading: false
    });
  };

  const handleClearDocuments = () => {
    if (confirm('Sei sicuro di voler rimuovere tutta la conoscenza acquisita?')) {
      setDocuments([]);
    }
  };

  // Close manager if admin mode is turned off
  useEffect(() => {
    if (!isAdmin) {
      setShowManager(false);
    }
  }, [isAdmin]);

  const handleAdminToggle = () => {
    if (isAdmin) {
      // Logout
      setIsAdmin(false);
      setShowManager(false);
    } else {
      // Open Login Modal
      setShowLoginModal(true);
      setLoginError(false);
      setPasswordInput('');
      setShowPassword(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setShowManager(true); // Automatically open manager on successful login
    } else {
      setLoginError(true);
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar for navigation/stats */}
      <Sidebar 
        documentCount={documents.length}
        totalChars={documents.reduce((acc, doc) => acc + doc.content.length, 0)}
        onToggleManager={() => setShowManager(!showManager)}
        showManager={showManager}
        isAdmin={isAdmin}
        onToggleAdmin={handleAdminToggle}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full transition-all duration-300">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Assistente Colleghi</h1>
            {isAdmin && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">Admin Mode</span>}
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            {isProcessing && (
              <span className="flex items-center gap-2 text-amber-600 animate-pulse">
                <AlertCircle className="w-4 h-4" />
                {processingStatus}
              </span>
            )}
            {!isProcessing && processingStatus && (
               <span className="flex items-center gap-2 text-emerald-600">
               <CheckCircle2 className="w-4 h-4" />
               {processingStatus}
             </span>
            )}
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
            {/* Chat Area */}
            <div className={`flex-1 flex flex-col h-full relative ${showManager ? 'w-2/3' : 'w-full'}`}>
                <ChatInterface 
                    messages={chatState.messages}
                    isLoading={chatState.isLoading}
                    onSendMessage={handleSendMessage}
                    onClearChat={handleClearChat}
                    hasDocuments={documents.length > 0}
                />
            </div>

            {/* Knowledge Manager Slide-over - Only render if visible (controlled by admin) */}
            {showManager && isAdmin && (
                <div className="w-96 border-l border-slate-200 bg-slate-50 h-full flex flex-col shadow-xl z-20 transition-all duration-300 ease-in-out">
                    <KnowledgeBaseManager 
                        documents={documents}
                        onFilesSelected={handleFilesSelected}
                        isProcessing={isProcessing}
                        onClearDocuments={handleClearDocuments}
                    />
                </div>
            )}
        </div>
      </main>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-slate-700" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-800">Accesso Gestore</h3>
                <p className="text-sm text-slate-500">Inserisci la password per gestire i documenti.</p>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="relative">
                <input
                  ref={passwordInputRef}
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setLoginError(false);
                  }}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border ${loginError ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:ring-slate-200'} focus:outline-none focus:ring-4 transition-all`}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>

                {loginError && (
                  <p className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Password non valida
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
              >
                Accedi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}