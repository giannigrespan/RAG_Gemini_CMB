import React, { useRef } from 'react';
import { Upload, FileText, File, Trash2, RefreshCw, FolderOpen } from 'lucide-react';
import { KnowledgeDocument } from '../types';

interface KnowledgeBaseManagerProps {
    documents: KnowledgeDocument[];
    onFilesSelected: (files: FileList | null) => void;
    isProcessing: boolean;
    onClearDocuments: () => void;
}

export const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({ 
    documents, 
    onFilesSelected, 
    isProcessing,
    onClearDocuments
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFolderSyncClick = () => {
        folderInputRef.current?.click();
    };

    // Helper to format bytes
    const formatBytes = (bytes: number, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-white">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-brand-600" />
                    Knowledge Base
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                    Gestisci i documenti che l'IA utilizzerà come fonte.
                </p>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                        onClick={handleUploadClick}
                        disabled={isProcessing}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-brand-300 hover:text-brand-600 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
                    >
                        <Upload className="w-4 h-4" />
                        Carica File
                    </button>
                     <button
                        onClick={handleFolderSyncClick}
                        disabled={isProcessing}
                        className="flex items-center justify-center gap-2 bg-brand-600 text-white hover:bg-brand-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm shadow-brand-200"
                    >
                        <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                        Sync Cartella
                    </button>
                </div>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => onFilesSelected(e.target.files)} 
                    multiple 
                    accept=".pdf,.docx,.txt"
                    className="hidden" 
                />
                 <input 
                    type="file" 
                    ref={folderInputRef} 
                    onChange={(e) => onFilesSelected(e.target.files)} 
                    // @ts-ignore - webkitdirectory is non-standard but supported in most browsers
                    webkitdirectory="" 
                    directory="" 
                    multiple
                    className="hidden" 
                />
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto p-4">
                {documents.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 m-2">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                            <FileText className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-sm font-medium">Nessun documento</p>
                        <p className="text-xs text-center px-8">Carica PDF o documenti Word per istruire l'IA.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                         <div className="flex justify-between items-center px-1 mb-2">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Documenti ({documents.length})
                            </span>
                            <button 
                                onClick={onClearDocuments}
                                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                            >
                                Rimuovi tutto
                            </button>
                        </div>
                        {documents.map((doc) => (
                            <div 
                                key={doc.id} 
                                className="group bg-white border border-slate-200 hover:border-brand-300 rounded-lg p-3 transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`
                                        w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                                        ${doc.type === 'pdf' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}
                                    `}>
                                        <File className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-slate-800 truncate" title={doc.name}>
                                            {doc.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                                {doc.type}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {formatBytes(doc.size)}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                • {new Date(doc.uploadDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="p-4 bg-slate-100 border-t border-slate-200 text-[10px] text-slate-500 text-center">
                I file vengono processati localmente nel browser. <br/>
                La sincronizzazione riconosce file nuovi o modificati.
            </div>
        </div>
    );
};