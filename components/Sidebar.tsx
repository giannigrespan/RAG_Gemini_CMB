import React from 'react';
import { MessageSquare, Database, ShieldCheck, Lock, LockOpen } from 'lucide-react';

interface SidebarProps {
    documentCount: number;
    totalChars: number;
    onToggleManager: () => void;
    showManager: boolean;
    isAdmin: boolean;
    onToggleAdmin: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    documentCount, 
    totalChars, 
    onToggleManager, 
    showManager,
    isAdmin,
    onToggleAdmin
}) => {
    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    };

    return (
        <aside className="w-16 md:w-20 bg-slate-900 flex flex-col items-center py-6 gap-6 shrink-0 z-30">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30 mb-4">
                <ShieldCheck className="text-white w-6 h-6" />
            </div>

            <nav className="flex-1 flex flex-col gap-4 w-full px-2">
                <TooltipButton 
                    active={!showManager} 
                    onClick={() => { if(showManager) onToggleManager(); }} 
                    icon={<MessageSquare className="w-5 h-5" />} 
                    label="Chat" 
                />
                
                {/* Only show Knowledge Base button if Admin */}
                {isAdmin && (
                    <TooltipButton 
                        active={showManager} 
                        onClick={onToggleManager} 
                        icon={<Database className="w-5 h-5" />} 
                        label="Gestione" 
                    />
                )}
            </nav>

            {isAdmin && (
                <div className="flex flex-col items-center gap-2 mb-4 text-slate-400 animate-in fade-in duration-300">
                    <div className="text-[10px] font-mono text-center leading-tight opacity-50">
                        <div>DOCS</div>
                        <div className="text-white font-bold">{documentCount}</div>
                    </div>
                    <div className="w-8 h-[1px] bg-slate-700"></div>
                    <div className="text-[10px] font-mono text-center leading-tight opacity-50">
                        <div>TOKENS</div>
                        <div className="text-white font-bold">~{formatNumber(Math.floor(totalChars / 4))}</div>
                    </div>
                </div>
            )}

            {/* Hidden admin toggle - effectively acts as a login/logout for management features */}
            <button 
                onClick={onToggleAdmin}
                className={`p-3 transition-colors ${isAdmin ? 'text-amber-400 hover:text-amber-300' : 'text-slate-700 hover:text-slate-500'}`}
                title={isAdmin ? "Chiudi Admin Mode" : "Admin Mode"}
            >
                {isAdmin ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>
        </aside>
    );
};

const TooltipButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button 
        onClick={onClick}
        className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 group relative
            ${active ? 'bg-slate-800 text-brand-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
        `}
    >
        {icon}
        <span className="text-[9px] font-medium">{label}</span>
    </button>
);