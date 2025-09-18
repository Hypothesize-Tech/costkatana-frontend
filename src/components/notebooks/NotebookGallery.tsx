import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Clock, Play, Trash2, Edit3, FileText, HelpCircle } from 'lucide-react';
import NotebookService, { Notebook, NotebookTemplate } from '../../services/notebook.service';
import NotebookGuide from './NotebookGuide';

interface NotebookGalleryProps {
  onSelectNotebook?: (notebookId: string) => void;
  onCreateNotebook?: (notebook: Notebook) => void;
  className?: string;
}

export const NotebookGallery: React.FC<NotebookGalleryProps> = ({
  onSelectNotebook,
  onCreateNotebook,
  className = ''
}) => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [templates, setTemplates] = useState<NotebookTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'notebooks' | 'templates'>('notebooks');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [notebooksData, templatesData] = await Promise.all([
        NotebookService.getNotebooks(),
        NotebookService.getTemplates()
      ]);
      setNotebooks(notebooksData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNotebook = async (title: string, description: string, templateType?: string) => {
    try {
      const notebook = await NotebookService.createNotebook(title, description, templateType);
      setNotebooks([...notebooks, notebook]);
      onCreateNotebook?.(notebook);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create notebook:', error);
    }
  };

  const deleteNotebook = async (id: string) => {
    try {
      await NotebookService.deleteNotebook(id);
      setNotebooks(notebooks.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notebook:', error);
    }
  };

  const getTemplateIcon = (templateId: string) => {
    switch (templateId) {
      case 'cost_spike': return '💰';
      case 'model_performance': return '🚀';
      case 'usage_patterns': return '📊';
      default: return '📝';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cost Analysis': return 'bg-gradient-success/20 text-success-700 dark:text-success-300';
      case 'Performance': return 'bg-gradient-primary/20 text-primary-700 dark:text-primary-300';
      case 'Analytics': return 'bg-gradient-accent/20 text-accent-700 dark:text-accent-300';
      default: return 'bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300';
    }
  };

  const CreateNotebookModal = () => {
    const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
    const [title, setTitle] = useState(selectedTemplateData ? `${selectedTemplateData.name} - ${new Date().toLocaleDateString()}` : '');
    const [description, setDescription] = useState(selectedTemplateData ? selectedTemplateData.description : '');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (title.trim()) {
        createNotebook(title, description, selectedTemplate || undefined);
        setTitle('');
        setDescription('');
        setSelectedTemplate('');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel w-full max-w-md p-6">
          <h3 className="text-xl font-display font-bold gradient-text-primary mb-6">
            {selectedTemplateData ? `Create from Template: ${selectedTemplateData.name}` : 'Create New Notebook'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-display font-semibold gradient-text-primary mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input w-full"
                placeholder="Enter notebook title..."
                required
              />
            </div>
            <div>
              <label className="block font-display font-semibold gradient-text-primary mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input w-full resize-none"
                rows={3}
                placeholder="Enter description..."
              />
            </div>
            {selectedTemplateData && (
              <div className="glass p-4 rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary/20 flex items-center justify-center shadow-lg text-2xl">
                    {getTemplateIcon(selectedTemplateData.id)}
                  </div>
                  <div className="flex-1">
                    <div className="font-display font-semibold gradient-text-primary mb-2">
                      Template: {selectedTemplateData.name}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-display font-medium ${getCategoryColor(selectedTemplateData.category)}`}>
                        {selectedTemplateData.category}
                      </span>
                      <span className="text-light-text-tertiary dark:text-dark-text-tertiary">•</span>
                      <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{selectedTemplateData.cells_count} cells</span>
                      <span className="text-light-text-tertiary dark:text-dark-text-tertiary">•</span>
                      <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{selectedTemplateData.estimated_time}</span>
                    </div>
                    <div className="font-body text-sm text-light-text-primary dark:text-dark-text-primary">
                      This template includes pre-built analysis cells for {selectedTemplateData.description.toLowerCase()}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedTemplate('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                {selectedTemplateData ? 'Create from Template' : 'Create Notebook'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className={`glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-primary-200/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-display font-bold gradient-text-primary">Analysis Notebooks</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGuide(true)}
              className="btn-secondary flex items-center gap-2"
              title="Learn how to create notebooks"
            >
              <HelpCircle className="w-4 h-4" />
              Guide
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Notebook
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mt-6 border-b border-primary-200/30">
          <button
            onClick={() => setActiveTab('notebooks')}
            className={`px-6 py-3 font-display font-semibold border-b-2 transition-all duration-300 ${activeTab === 'notebooks'
              ? 'border-primary-500 gradient-text-primary'
              : 'border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
              }`}
          >
            My Notebooks ({notebooks.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 font-display font-semibold border-b-2 transition-all duration-300 ${activeTab === 'templates'
              ? 'border-primary-500 gradient-text-primary'
              : 'border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
              }`}
          >
            Templates ({templates.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-2xl">📓</span>
              </div>
              <div className="font-body text-light-text-secondary dark:text-dark-text-secondary">Loading...</div>
            </div>
          </div>
        ) : activeTab === 'notebooks' ? (
          <div className="space-y-4">
            {notebooks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gradient-primary/20 flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-display font-bold gradient-text-primary mb-3">No notebooks yet</h3>
                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-6">Create your first analysis notebook to get started</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  Create Notebook
                </button>
              </div>
            ) : (
              notebooks.map((notebook) => (
                <div key={notebook.id} className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl hover:border-primary-300/50 transition-all duration-300 hover:scale-[1.01]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-display font-bold gradient-text-primary">{notebook.title}</h3>
                        {notebook.template_type && (
                          <span className="px-3 py-1 bg-gradient-primary/20 text-primary-700 dark:text-primary-300 rounded-full font-display font-medium text-sm">
                            {notebook.template_type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-4">{notebook.description}</p>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 font-display font-medium text-sm">
                          <FileText className="w-3 h-3" />
                          {notebook.cells.length} cells
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-accent/20 text-accent-700 dark:text-accent-300 font-display font-medium text-sm">
                          <Clock className="w-3 h-3" />
                          {new Date(notebook.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectNotebook?.(notebook.id)}
                        className="w-10 h-10 rounded-lg glass border border-success-200/30 flex items-center justify-center text-success-600 hover:text-success-800 hover:border-success-300/50 transition-all duration-300 hover:scale-110"
                        title="Open notebook"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onSelectNotebook?.(notebook.id)}
                        className="w-10 h-10 rounded-lg glass border border-primary-200/30 flex items-center justify-center text-primary-600 hover:text-primary-800 hover:border-primary-300/50 transition-all duration-300 hover:scale-110"
                        title="Edit notebook"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteNotebook(notebook.id)}
                        className="w-10 h-10 rounded-lg glass border border-danger-200/30 flex items-center justify-center text-danger-600 hover:text-danger-800 hover:border-danger-300/50 transition-all duration-300 hover:scale-110"
                        title="Delete notebook"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl hover:border-primary-300/50 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary/20 flex items-center justify-center shadow-lg text-2xl">
                    {getTemplateIcon(template.id)}
                  </div>
                  <span className={`px-3 py-1 rounded-full font-display font-medium text-sm ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </span>
                </div>
                <h3 className="text-lg font-display font-bold gradient-text-primary mb-3">{template.name}</h3>
                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-4">{template.description}</p>
                <div className="flex items-center justify-between mb-6">
                  <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 font-display font-medium text-sm">
                    <FileText className="w-3 h-3" />
                    {template.cells_count} cells
                  </span>
                  <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-accent/20 text-accent-700 dark:text-accent-300 font-display font-medium text-sm">
                    <Clock className="w-3 h-3" />
                    {template.estimated_time}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setShowCreateModal(true);
                    }}
                    className="btn-primary flex-1"
                  >
                    Customize & Create
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const defaultTitle = `${template.name} - ${new Date().toLocaleDateString()}`;
                        const notebook = await NotebookService.createNotebook(defaultTitle, template.description, template.id);
                        setNotebooks([...notebooks, notebook]);

                        // Auto-execute the notebook to show immediate value
                        setTimeout(async () => {
                          try {
                            await NotebookService.executeNotebook(notebook.id);
                          } catch (error) {
                            console.warn('Auto-execution failed:', error);
                          }
                        }, 1000);

                        onCreateNotebook?.(notebook);
                      } catch (error) {
                        console.error('Failed to create notebook:', error);
                      }
                    }}
                    className="w-12 h-12 rounded-lg bg-gradient-success text-white flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg"
                    title="Create notebook immediately with default settings"
                  >
                    <span className="text-lg">⚡</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && <CreateNotebookModal />}

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <NotebookGuide
              onClose={() => setShowGuide(false)}
              onCreateExample={(templateId) => {
                setSelectedTemplate(templateId);
                setShowGuide(false);
                setShowCreateModal(true);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NotebookGallery;