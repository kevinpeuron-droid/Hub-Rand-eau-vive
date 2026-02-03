import React, { useState, useEffect } from 'react';
import { Site } from './types';
import Sidebar from './components/Sidebar';
import AddSiteModal from './components/AddSiteModal';
import { Menu, ExternalLink, AlertTriangle } from 'lucide-react';

const STORAGE_KEY = 'my_app_sites_v1';

// Initial placeholder data just in case storage is empty
const DEFAULT_SITES: Site[] = [
  {
    id: '1',
    name: "Rand'eau Vive",
    url: 'https://www.randeauvive.com', // Placeholder URL
    addedAt: Date.now(),
  },
  {
    id: '2',
    name: "Trail des Lucioles",
    url: 'https://traildeslucioles.fr', // Placeholder URL
    addedAt: Date.now(),
  }
];

const App: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); // Used to force reload iframe

  // Load sites from local storage
  useEffect(() => {
    const storedSites = localStorage.getItem(STORAGE_KEY);
    if (storedSites) {
      try {
        const parsed = JSON.parse(storedSites);
        setSites(parsed);
        if (parsed.length > 0) {
          setActiveSiteId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse sites", e);
        setSites(DEFAULT_SITES);
        setActiveSiteId(DEFAULT_SITES[0].id);
      }
    } else {
      setSites(DEFAULT_SITES);
      setActiveSiteId(DEFAULT_SITES[0].id);
    }
  }, []);

  // Save sites when changed
  useEffect(() => {
    if (sites.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
    }
  }, [sites]);

  const activeSite = sites.find(s => s.id === activeSiteId);

  const handleAddSite = (name: string, url: string) => {
    const newSite: Site = {
      id: crypto.randomUUID(),
      name,
      url,
      addedAt: Date.now()
    };
    const updatedSites = [...sites, newSite];
    setSites(updatedSites);
    setActiveSiteId(newSite.id);
  };

  const handleDeleteSite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer ce site de votre tableau de bord ?')) {
      const newSites = sites.filter(s => s.id !== id);
      setSites(newSites);
      if (activeSiteId === id) {
        setActiveSiteId(newSites.length > 0 ? newSites[0].id : null);
      }
      if (newSites.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      
      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar
        sites={sites}
        activeSiteId={activeSiteId}
        onSelectSite={(id) => {
          setActiveSiteId(id);
          setIsSidebarOpen(false);
        }}
        onAddClick={() => setIsModalOpen(true)}
        onDeleteSite={handleDeleteSite}
        isOpen={isSidebarOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative w-full">
        {/* Mobile Header */}
        <div className="md:hidden h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between flex-shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <span className="font-semibold text-gray-800 truncate">
            {activeSite ? activeSite.name : 'Gestionnaire'}
          </span>
          <div className="w-8" /> {/* Spacer for balance */}
        </div>

        {/* Content View */}
        <div className="flex-1 relative bg-white md:rounded-tl-2xl overflow-hidden shadow-inner md:border-t md:border-l border-gray-200">
          {activeSite ? (
            <div className="absolute inset-0 flex flex-col">
              {/* Site Toolbar */}
              <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4 text-xs text-gray-500">
                <div className="flex items-center gap-2 truncate max-w-[70%]">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="truncate" title={activeSite.url}>{activeSite.url}</span>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                    onClick={handleRefresh}
                    className="hover:text-primary transition-colors font-medium px-2 py-1 rounded hover:bg-gray-200"
                  >
                    Actualiser
                  </button>
                  <a 
                    href={activeSite.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition-colors font-medium px-2 py-1 rounded hover:bg-gray-200"
                  >
                    Ouvrir <ExternalLink size={12} />
                  </a>
                </div>
              </div>
              
              {/* Iframe Container */}
              <div className="flex-1 relative bg-gray-100">
                 <iframe
                  key={`${activeSite.id}-${iframeKey}`}
                  src={activeSite.url}
                  title={`Vue de ${activeSite.name}`}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                />
                
                {/* Overlay for "Cannot Load" hints (visually behind iframe, visible if transparent or fails) - tough to detect, so we add a footer note */}
                <div className="absolute -z-10 inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center p-6">
                    <p>Chargement du contenu...</p>
                  </div>
                </div>
              </div>
              
              {/* Security Warning Footer */}
              <div className="bg-yellow-50 px-4 py-2 border-t border-yellow-100 flex items-start gap-3 text-xs text-yellow-800">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-yellow-600" />
                <p>
                  Si le site ne s'affiche pas (page blanche ou erreur), cela signifie que le propriétaire du site bloque l'affichage intégré pour des raisons de sécurité (X-Frame-Options). Dans ce cas, utilisez le bouton "Ouvrir" en haut à droite.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
              <div className="bg-blue-50 p-6 rounded-full mb-4">
                <Menu size={48} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Bienvenue</h2>
              <p className="max-w-md">
                Sélectionnez une application dans le menu de gauche ou ajoutez-en une nouvelle pour commencer à gérer vos sites Rand'eau Vive et Trail des Lucioles.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 px-6 py-3 bg-primary text-white rounded-lg font-medium shadow-lg shadow-primary/30 hover:bg-primaryDark transition-all"
              >
                Ajouter mon premier site
              </button>
            </div>
          )}
        </div>
      </main>

      <AddSiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddSite}
      />
    </div>
  );
};

export default App;