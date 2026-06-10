import { useState, useEffect } from 'react';
import { X, Hammer, Building, AlertTriangle, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { formatCurrency } from '../../utils/currency';

const CreateProjectWizard = ({ isOpen, onClose, onSubmit, markets, submitting }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    marketUuid: '',
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  const [selectedMarket, setSelectedMarket] = useState(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        projectName: '',
        marketUuid: '',
        description: ''
      });
      setErrors({});
      setSelectedMarket(null);
    }
  }, [isOpen]);

  // Update selected market when marketUuid changes
  useEffect(() => {
    if (formData.marketUuid) {
      const market = markets.find(m => m.uuid === formData.marketUuid);
      setSelectedMarket(market);
      
      // Auto-populate project name based on market title
      if (market && !formData.projectName) {
        setFormData(prev => ({
          ...prev,
          projectName: `Projet - ${market.title}`
        }));
      }
    } else {
      setSelectedMarket(null);
    }
  }, [formData.marketUuid, markets]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Le nom du projet est requis';
    } else if (formData.projectName.trim().length < 3) {
      newErrors.projectName = 'Le nom du projet doit contenir au moins 3 caractères';
    }

    if (!formData.marketUuid) {
      newErrors.marketUuid = 'Veuillez sélectionner un marché';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Filter available markets (only signed markets without existing projects)
  const availableMarkets = markets.filter(market => market.status === 'SIGNED');

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="lg"
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Hammer className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Créer un Projet de Construction
            </h3>
            <p className="text-sm text-gray-500">
              Démarrer un nouveau projet à partir d'un marché signé
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          disabled={submitting}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {availableMarkets.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun Marché Disponible
            </h3>
            <p className="text-gray-600 mb-4">
              Il n'y a aucun marché signé disponible pour créer un projet.
              Vous devez d'abord signer un marché dans la section "Marchés Publics".
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Fermer
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Market Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marché Associé *
              </label>
              <select
                value={formData.marketUuid}
                onChange={(e) => handleInputChange('marketUuid', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.marketUuid ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={submitting}
              >
                <option value="">Sélectionner un marché signé</option>
                {availableMarkets.map((market) => (
                  <option key={market.uuid} value={market.uuid}>
                    {market.title} - {market.supplier} ({formatCurrency(market.totalAmount)})
                  </option>
                ))}
              </select>
              {errors.marketUuid && (
                <p className="text-red-600 text-sm mt-1">{errors.marketUuid}</p>
              )}
            </div>

            {/* Selected Market Info */}
            {selectedMarket && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Marché Sélectionné
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Titre:</span>
                    <span className="font-medium">{selectedMarket.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fournisseur:</span>
                    <span className="font-medium">{selectedMarket.supplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant Total:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(selectedMarket.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut:</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Signé
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du Projet *
              </label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => handleInputChange('projectName', e.target.value)}
                placeholder="ex: Projet - Construction École Primaire"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.projectName ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={submitting}
              />
              {errors.projectName && (
                <p className="text-red-600 text-sm mt-1">{errors.projectName}</p>
              )}
            </div>

            {/* Description (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optionnel)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description additionnelle du projet..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={submitting}
              />
            </div>

            {/* Info Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">À propos des projets de construction</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Un projet ne peut être créé qu'à partir d'un marché signé</li>
                    <li>• Le projet servira à gérer les décomptes et paiements</li>
                    <li>• Le progrès physique sera suivi au fil des paiements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {availableMarkets.length > 0 && (
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Hammer}
              loading={submitting}
              disabled={submitting}
            >
              {submitting ? 'Création...' : 'Créer le Projet'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default CreateProjectWizard;