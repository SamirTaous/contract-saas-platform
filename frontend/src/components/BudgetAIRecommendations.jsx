import { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, AlertCircle, CheckCircle, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { setupApiInterceptors } from '../utils/apiInterceptors';

const aiApi = setupApiInterceptors(axios.create({
  baseURL: 'http://localhost:8082/api/ai'
}));

const BudgetAIRecommendations = ({ className = '' }) => {
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAIRecommendations();
  }, []);

  const fetchAIRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token non trouvé');
      }

      const response = await aiApi.get('/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setAiResponse(response.data);
    } catch (err) {
      console.error('Failed to fetch AI recommendations:', err);
      setError(err.response?.data?.message || 'Impossible de charger les recommandations IA');
      
      // Provide fallback recommendations if API fails
      setAiResponse({
        text: generateFallbackRecommendations(),
        engine: 'LOCAL_FALLBACK'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackRecommendations = () => {
    return `### Recommandations Budgétaires

**Analyse Disponible Bientôt**

En l'absence de connexion au service d'IA, voici quelques bonnes pratiques générales pour la gestion budgétaire :

- **Surveillance Continue**: Vérifiez régulièrement vos taux d'engagement pour éviter les dépassements.
- **Priorisation**: Concentrez vos ressources sur les lignes budgétaires stratégiques.
- **Documentation**: Maintenez une traçabilité claire de toutes les opérations budgétaires.
- **Anticipation**: Planifiez vos dépenses futures en fonction de votre rythme de consommation actuel.

*Conseil*: Consultez les alertes dans le tableau de bord pour une analyse détaillée de votre situation budgétaire.`;
  };

  const getEngineIcon = (engine) => {
    switch (engine) {
      case 'GEMINI_AI':
        return <Sparkles className="h-5 w-5 text-purple-600" />;
      case 'ALGORITHMIC_FALLBACK':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'LOCAL_FALLBACK':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Brain className="h-5 w-5 text-gray-600" />;
    }
  };

  const getEngineLabel = (engine) => {
    switch (engine) {
      case 'GEMINI_AI':
        return 'Analyse IA (Gemini)';
      case 'ALGORITHMIC_FALLBACK':
        return 'Analyse Algorithmique';
      case 'LOCAL_FALLBACK':
        return 'Mode Hors-ligne';
      default:
        return 'Assistant Budgétaire';
    }
  };

  const getEngineBadgeColor = (engine) => {
    switch (engine) {
      case 'GEMINI_AI':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ALGORITHMIC_FALLBACK':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOCAL_FALLBACK':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const parseAndFormatRecommendations = (text) => {
    if (!text) return null;

    // Parse the text to extract structured recommendations
    const lines = text.split('\n').filter(l => l.trim());
    const recommendations = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Skip headers starting with ### but keep processing
      if (trimmed.startsWith('###')) {
        return;
      }

      // Skip standalone bold headers but keep processing
      if (trimmed.match(/^\*\*[^*]+\*\*$/) && !trimmed.includes(':')) {
        return;
      }

      // Bullet points with bold labels (e.g., "- **Label**: Description")
      if (trimmed.startsWith('-')) {
        const content = trimmed.replace(/^-\s*/, '');
        
        // Extract bold text (label) and description
        const boldMatch = content.match(/^\*\*(.+?)\*\*:\s*(.+)$/);
        if (boldMatch) {
          recommendations.push({
            type: 'recommendation',
            label: boldMatch[1],
            description: boldMatch[2],
            priority: getPriorityFromLabel(boldMatch[1])
          });
        } else {
          // Simple bullet point without bold formatting - treat as medium priority
          const cleanContent = content.replace(/\*\*/g, '');
          recommendations.push({
            type: 'recommendation',
            label: 'Information',
            description: cleanContent,
            priority: 'low'
          });
        }
      }
      // Italic notes (e.g., "*Note: ...")
      else if (trimmed.startsWith('*') && !trimmed.startsWith('**')) {
        recommendations.push({
          type: 'info',
          content: trimmed.replace(/\*/g, '')
        });
      }
      // Regular text that's not a header - treat as note
      else if (trimmed && !trimmed.startsWith('#')) {
        // Check if it contains bold text
        if (trimmed.includes('**')) {
          const cleanText = trimmed.replace(/\*\*/g, '');
          recommendations.push({
            type: 'note',
            content: cleanText
          });
        }
      }
    });

    return recommendations;
  };

  const getPriorityFromLabel = (label) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('alerte') || lowerLabel.includes('critique') || lowerLabel.includes('attention')) {
      return 'high';
    } else if (lowerLabel.includes('surveillance') || lowerLabel.includes('modéré')) {
      return 'medium';
    }
    return 'low';
  };

  const getRecommendationIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  const getRecommendationStyle = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      default:
        return 'bg-green-50 border-green-200 hover:bg-green-100';
    }
  };

  const renderRecommendations = (recommendations) => {
    if (!recommendations || recommendations.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <p className="text-sm">Aucune recommandation spécifique pour le moment.</p>
          <p className="text-xs mt-1">Votre situation budgétaire semble stable.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {recommendations.map((rec, index) => {
          if (rec.type === 'recommendation') {
            return (
              <div
                key={index}
                className={`flex items-start space-x-4 p-4 rounded-lg border transition-all ${getRecommendationStyle(rec.priority)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getRecommendationIcon(rec.priority)}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-gray-900 mb-1">{rec.label}</h5>
                  <p className="text-sm text-gray-700">{rec.description}</p>
                </div>
              </div>
            );
          } else if (rec.type === 'note') {
            return (
              <div key={index} className="flex items-start space-x-3 px-4 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">{rec.content}</p>
              </div>
            );
          } else if (rec.type === 'info') {
            return (
              <div key={index} className="px-4 py-2">
                <p className="text-xs text-gray-600 italic">{rec.content}</p>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span>Recommandations IA</span>
          </h3>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 text-sm">Analyse de votre budget en cours...</p>
          <p className="text-gray-500 text-xs mt-1">Génération de recommandations personnalisées</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span>Assistant IA Budgétaire</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">Analyse intelligente de votre situation budgétaire</p>
        </div>
        
        {aiResponse && (
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getEngineBadgeColor(aiResponse.engine)}`}>
            {getEngineIcon(aiResponse.engine)}
            <span className="text-xs font-medium">
              {getEngineLabel(aiResponse.engine)}
            </span>
          </div>
        )}
      </div>

      {error && !aiResponse && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Service temporairement indisponible</p>
              <p className="text-xs text-yellow-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {aiResponse && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          {renderRecommendations(parseAndFormatRecommendations(aiResponse.text))}

          <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={fetchAIRecommendations}
              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Rafraîchir l'analyse</span>
            </button>
            
            <div className="text-xs text-gray-500">
              Dernière mise à jour: <span className="font-medium text-gray-700">maintenant</span>
            </div>
          </div>
        </div>
      )}

      {!loading && !aiResponse && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Aucune recommandation disponible</p>
          <button
            onClick={fetchAIRecommendations}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
};

export default BudgetAIRecommendations;
