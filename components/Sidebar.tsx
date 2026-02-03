import React from 'react';
import { Site } from '../types';
import { Plus, Globe, Trash2, ExternalLink } from 'lucide-react';

interface SidebarProps {
  sites: Site[];
  activeSiteId: string | null;
  onSelectSite: (id: string) => void;
  onAddClick: () => void;
  onDeleteSite: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sites, 
  activeSiteId, 
  onSelectSite, 
  onAddClick, 
  onDeleteSite,
  isOpen 
}) => {
  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}
    >
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-50/30">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Mes Applications</h1>
          <p className="text-xs text-primary font-medium mt-1">Rand'eau & Lucioles</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {sites.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 text-primary/50">
              <Globe size={24} />
            </div>
            <p className="text-sm text-gray-500">Aucun site configuré.</p>
            <p className="text-xs text-gray-400 mt-1">Ajoutez votre premier site pour commencer.</p>
          </div>
        ) : (
          sites.map((site) => (
            <div
              key={site.id}
              onClick={() => onSelectSite(site.id)}
              className={`
                group flex items-center justify-between px-3 py-3 rounded-r-xl border-l-4 cursor-pointer transition-all duration-200 mr-2
                ${activeSiteId === site.id 
                  ? 'bg-blue-50 border-accent text-primary shadow-sm' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase transition-colors
                  ${activeSiteId === site.id ? 'bg-accent text-blue-900' : 'bg-gray-200 text-gray-500 group-hover:bg-gray-300'}
                `}>
                  {site.name.slice(0, 2)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate">{site.name}</span>
                  <span className="text-[10px] text-gray-400 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {new URL(site.url).hostname}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(site.url, '_blank');
                  }}
                  className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                  title="Ouvrir dans un nouvel onglet"
                >
                  <ExternalLink size={14} />
                </button>
                <button 
                  onClick={(e) => onDeleteSite(site.id, e)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50/30">
        <button
          onClick={onAddClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primaryDark text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/10"
        >
          <Plus size={18} />
          <span>Ajouter un site</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;