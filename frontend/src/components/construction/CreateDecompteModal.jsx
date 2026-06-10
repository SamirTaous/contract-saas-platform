import { useState, useEffect } from 'react';
import { X, FileText, Building, AlertTriangle, DollarSign } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { formatCurrency } from '../../utils/currency';

const CreateDecompteModal = ({ isOpen, onClose, onSubmit, projects, selectedProject, submitting }) => {
  const [formData, setFormData] = useState({
    label: '',
    amount: '',
    projectUuid: ''
  });
  
  const [errors, setErrors] = useState({});
  const [selectedProjectData, setSelectedProjectData] = useState(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        label: '',
        amount: '',
        projectUuid: selectedProject?.uuid || ''
      });
      setErrors({});
      setSelectedProjectData(selectedProject || null);
    }
  }, [isOpen, selectedProject]);

  // Update selected project when projectUuid changes
  useEffect(() => {
    if (formData.projectUuid) {
      const project = projects.find(p => p.uuid === formData.projectUuid);
      setSelectedProjectData(project);
    } else {
      setSelectedProjectData(null);
    }
  }, [formData.projectUuid, projects]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Le libellé du décompte est requis';
    } else if (formData.label.trim().length < 5) {
      newErrors.label = 'Le libellé doit contenir au moins 5 caractères';
    }

    if (!formData.amount) {
      newErrors.amount = 'Le montant est requis';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Le montant doit être un nombre positif';
      } else if (selectedProjectData) {
        // Calculate remaining contract value
        const contractTotal = selectedProjectData.marketTitle ? 0 : 0; // We don't have direct access to market total
        const alreadyPaid = selectedProjectData.totalPaidAmount || 0;
        const projectedTotal = alreadyPaid + amount;
        
        // Note: We'll implement this validation on the backend
        // For now, just check if amount is reasonable
        if (amount > 10000000) { // 10M MAD seems reasonable as max
          newErrors.amount = 'Le montant semble trop élevé';
        }
      }
    }

    if (!formData.projectUuid) {
      newErrors.projectUuid = 'Veuillez sélectionner un projet';
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

  const handleAmountChange = (value) => {
    // Allow only numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return; // Don't update if more than one decimal point
    }
    
    handleInputChange('amount', numericValue);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="lg"
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Créer un Décompte
            </h3>
            <p className="text-sm text-gray-500">
              Demande de paiement pour un projet de construction
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
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun Projet Disponible
            </h3>
            <p className="text-gray-600 mb-4">
              Il n'y a aucun projet de construction disponible pour créer un décompte.
              Créez d'abord un projet à partir d'un marché signé.
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
            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Projet de Construction *
              </label>
              <select
                value={formData.projectUuid}
                onChange={(e) => handleInputChange('projectUuid', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.projectUuid ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={submitting || !!selectedProject}
              >
                <option value="">Sélectionner un projet</option>
                {projects.map((project) => (
                  <option key={project.uuid} value={project.uuid}>
                    {project.name} - {project.marketTitle} ({project.marketSupplier})
                  </option>
                ))}
              </select>
              {errors.projectUuid && (
                <p className="text-red-600 text-sm mt-1">{errors.projectUuid}</p>
              )}
            </div>

            {/* Selected Project Info */}
            {selectedProjectData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Projet Sélectionné
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nom du Projet:</span>
                    <span className="font-medium">{selectedProjectData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Marché:</span>
                    <span className="font-medium">{selectedProjectData.marketTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fournisseur:</span>
                    <span className="font-medium">{selectedProjectData.marketSupplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progrès Physique:</span>
                    <span className="font-medium">
                      {selectedProjectData.physicalProgress?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Déjà Payé:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(selectedProjectData.totalPaidAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Decompte Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Libellé du Décompte *
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => handleInputChange('label', e.target.value)}
                placeholder="ex: Décompte N°1 - Gros œuvre"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.label ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={submitting}
              />
              {errors.label && (
                <p className="text-red-600 text-sm mt-1">{errors.label}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Utilisez une description claire du type de travaux
              </p>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant à Payer *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-10 pr-16 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">MAD</span>
                </div>
              </div>
              {errors.amount && (
                <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
              )}
              {formData.amount && !errors.amount && (
                <p className="text-green-600 text-sm mt-1">
                  Montant: {formatCurrency(parseFloat(formData.amount) || 0)}
                </p>
              )}
            </div>

            {/* Warning Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Important</p>
                  <ul className="space-y-1">
                    <li>• Le montant total payé ne peut pas dépasser la valeur du contrat</li>
                    <li>• Le décompte sera en attente de validation après création</li>
                    <li>• Une fois validé et payé, l'argent sera transféré du budget engagé vers dépensé</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {projects.length > 0 && (
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
              icon={FileText}
              loading={submitting}
              disabled={submitting}
            >
              {submitting ? 'Création...' : 'Créer le Décompte'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default CreateDecompteModal;