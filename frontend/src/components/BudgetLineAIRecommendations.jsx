import { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { setupApiInterceptors } from '../utils/apiInterceptors';

const aiApi = setupApiInterceptors(axios.create({
  baseURL: 'http://localhost:8082/api/ai'
}));

const BudgetLineAIRecommendations = ({ budgetLineUuid, budgetLine, className = '' }) => {
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (budgetLineUuid) {
      fetchAIRecommendations();
    }
  }, [budgetLineUuid]);

  const fetchAIRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token non trouvé');
      }

      const response = await aiApi.get(`/recommendations/budget/${budgetLineUuid}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setAiResponse(response.data);
    } catch (err) {
      console.error('Failed to fetch AI recommendations for budget line:', err);
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
    if (!budgetLine) {
      return `### Analyse Indisponible\n\nLes recommandations pour cette ligne budgétaire ne sont pas disponibles actuellement.`;
    }

    const utilization = budgetLine.initialAmount > 0 
      ? (budgetLine.committedAmount / budgetLine.initialAmount) * 100 
      : 0;
    
    let recommendations = `### Analyse de la Ligne ${budgetLine.fullCode}\n\n`;

    if (utilization > 90) {
      recommendations += `- **Alerte Critique**: Cette ligne budgétaire a un taux d'utilisation de **${utilization.toFixed(1)}%**. Il est fortement recommandé de suspendre tout nouvel engagement.\n`;
      recommendations += `- **Action Immédiate**: Réallouer les besoins vers d'autres lignes disponibles ou demander un réajustement budgétaire.\n`;
    } else if (utilization > 75) {
      recommendations += `- **Attention**: Cette ligne budgétaire a un taux d'utilisation de **${utilization.toFixed(1)}%**. Surveillez attentivement les nouveaux engagements.\n`;
      recommendations += `- **Planification**: Anticipez vos besoins pour les prochains mois et évaluez la nécessité d'un virement de crédits.\n`;
    } else if (utilization < 25) {
      recommendations += `- **Sous-utilisation**: Cette ligne budgétaire a un taux d'utilisation de **${utilization.toFixed(1)}%** seulement.\n`;
      recommendations += `- **Opportunité**: Considérez l'utilisation de ces crédits disponibles pour des projets prioritaires ou un éventuel transfert.\n`;
    } else {
      recommendations += `- **Utilisation Équilibrée**: Cette ligne budgétaire a un taux d'utilisation de **${utilization.toFixed(1)}%**, ce qui est dans la norme.\n`;
      recommendations += `- **Maintien**: Continuez la gestion actuelle tout en maintenant une surveillance régulière.\n`;
    }

    const available = budgetLine.initialAmount - budgetLine.committedAmount;
    recommendations += `\n*Budget disponible: ${formatCurrency(available)}*`;

    return recommendations;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(amount || 0);
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

  const formatRecommendationText = (text) => {
    if (!text) return null;

    // Split by double newlines to get paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim());

    return paragraphs.map((paragraph, pIndex) => {
      // Check if this is a header (starts with ###)
      if (paragraph.startsWith('###')) {
        return (
          <h4 key={pIndex} className="text-lg font-bold text-gray-900 mb-3">
            {paragraph.replace(/^###\s*/, '')}
          </h4>
        );
      }

      // Check if this is a header (starts with **)
      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
        return (
          <h5 key={pIndex} className="text-md font-semibold text-gray-800 mb-2">
            {paragraph.replace(/\*\*/g, '')}
          </h5>
        );
      }

      // Split by newlines to handle bullet points
      const lines = paragraph.split('\n').filter(l => l.trim());
      
      return (
        <div key={pIndex} className="mb-4">
          {lines.map((line, lIndex) => {
            // Bullet point
            if (line.trim().startsWith('-')) {
              const cleanLine = line.replace(/^-\s*/, '');
              // Parse bold text (**text**)
              const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
              
              return (
                <div key={lIndex} className="flex items-start space-x-3 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-700 flex-1">
                    {parts.map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return (
                          <span key={i} className="font-semibold text-gray-900">
                            {part.replace(/\*\*/g, '')}
                          </span>
                        );
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </p>
                </div>
              );
            }

            // Italic text (*text*)
            if (line.trim().startsWith('*') && !line.trim().startsWith('**')) {
              return (
                <p key={lIndex} className="text-sm text-gray-600 italic mt-2">
                  {line.replace(/\*/g, '')}
                </p>
              );
            }

            // Regular paragraph
            return (
              <p key={lIndex} className="text-sm text-gray-700 mb-2">
                {line}
              </p>
            );
          })}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span>Recommandations IA pour cette Ligne</span>
          </h3>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 text-sm">Analyse de cette ligne budgétaire en cours...</p>
          <p className="text-gray-500 text-xs mt-1">Génération de recommandations personnalisées</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-sm border border-indigo-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          <span>Recommandations IA pour cette Ligne</span>
        </h3>
        
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
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="prose prose-sm max-w-none">
            {formatRecommendationText(aiResponse.text)}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={fetchAIRecommendations}
              className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Rafraîchir l'analyse</span>
            </button>
            
            {budgetLine && (
              <div className="text-xs text-gray-500">
                Ligne: <span className="font-medium text-gray-700">{budgetLine.fullCode}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && !aiResponse && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Aucune recommandation disponible</p>
          <button
            onClick={fetchAIRecommendations}
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
};

export default BudgetLineAIRecommendations;
