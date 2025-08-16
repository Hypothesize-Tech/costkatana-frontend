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
      case 'Cost Analysis': return 'bg-green-100 text-green-700';
      case 'Performance': return 'bg-blue-100 text-blue-700';
      case 'Analytics': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedTemplateData ? `Create from Template: ${selectedTemplateData.name}` : 'Create New Notebook'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter notebook title..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Enter description..."
              />
            </div>
            {selectedTemplateData && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getTemplateIcon(selectedTemplateData.id)}</div>
                  <div>
                    <div className="text-sm font-medium text-blue-800 mb-1">
                      Template: {selectedTemplateData.name}
                    </div>
                    <div className="text-xs text-blue-600 mb-2">
                      {selectedTemplateData.category} • {selectedTemplateData.cells_count} cells • {selectedTemplateData.estimated_time}
                    </div>
                    <div className="text-xs text-blue-700">
                      This template includes pre-built analysis cells for {selectedTemplateData.description.toLowerCase()}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedTemplate('');
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
    <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Analysis Notebooks</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg transition-colors"
              title="Learn how to create notebooks"
            >
              <HelpCircle className="w-4 h-4" />
              Guide
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Notebook
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mt-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('notebooks')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'notebooks'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            My Notebooks ({notebooks.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'templates'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
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
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : activeTab === 'notebooks' ? (
          <div className="space-y-4">
            {notebooks.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notebooks yet</h3>
                <p className="text-gray-600 mb-4">Create your first analysis notebook to get started</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Notebook
                </button>
              </div>
            ) : (
              notebooks.map((notebook) => (
                <div key={notebook.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900">{notebook.title}</h3>
                        {notebook.template_type && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {notebook.template_type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{notebook.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {notebook.cells.length} cells
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(notebook.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectNotebook?.(notebook.id)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Open notebook"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onSelectNotebook?.(notebook.id)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Edit notebook"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteNotebook(notebook.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{getTemplateIcon(template.id)}</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {template.cells_count} cells
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {template.estimated_time}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setShowCreateModal(true);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors text-sm"
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
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                    title="Create notebook immediately with default settings"
                  >
                    ⚡
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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