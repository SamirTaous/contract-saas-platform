import { CheckCircle, FileText, User, DollarSign, Calendar, Building, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../../utils/currency';

const ReviewStep = ({ formData, budgetLines }) => {
  const selectedBudgetLine = budgetLines.find(line => line.uuid === formData.budgetLineId);

  const contractTypeLabels = {
    'SERVICES': { label: 'Services', icon: '🔧' },
    'GOODS': { label: 'Fournitures', icon: '📦' },
    'WORKS': { label: 'Travaux', icon: '🏗️' },
    'CONSULTING': { label: 'Conseil', icon: '💼' }
  };

  const availableAmount = selectedBudgetLine 
    ? selectedBudgetLine.initialAmount - (selectedBudgetLine.committedAmount || 0)
    : 0;

  const isAmountValid = formData.totalAmount && parseFloat(formData.totalAmount) <= availableAmount;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Révision et Confirmation</h3>
        <p className="text-gray-600 mt-2">Vérifiez les informations avant de créer le marché</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Market Information */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              Informations du Marché
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Titre</label>
                <p className="text-gray-900 font-medium">{formData.title}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Fournisseur</label>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">{formData.supplierName}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Type de Contrat</label>
                <div className="flex items-center space-x-2">
                  <span>{contractTypeLabels[formData.contractType]?.icon}</span>
                  <p className="text-gray-900">{contractTypeLabels[formData.contractType]?.label}</p>
                </div>
              </div>
              
              {formData.estimatedDuration && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Durée Estimée</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{formData.estimatedDuration}</p>
                  </div>
                </div>
              )}
              
              {formData.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900 text-sm leading-relaxed">{formData.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Budget Information */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              Informations Budgétaires
            </h4>
            
            {selectedBudgetLine ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Ligne Budgétaire</label>
                  <p className="text-gray-900 font-mono text-sm">{selectedBudgetLine.fullCode}</p>
                  <p className="text-gray-600 text-sm">{selectedBudgetLine.label}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Budget Initial</label>
                    <p className="text-gray-900 font-medium">{formatCurrency(selectedBudgetLine.initialAmount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Déjà Engagé</label>
                    <p className="text-gray-900 font-medium">{formatCurrency(selectedBudgetLine.committedAmount || 0)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Montant du Marché</label>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(parseFloat(formData.totalAmount))}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Reste Après Engagement</label>
                  <p className={`text-lg font-semibold ${
                    availableAmount - parseFloat(formData.totalAmount) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(availableAmount - parseFloat(formData.totalAmount))}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">Aucune ligne budgétaire sélectionnée</p>
            )}
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Building className="h-5 w-5 text-purple-600 mr-2" />
          Résumé de Validation
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border-2 ${
            formData.title && formData.supplierName && formData.contractType
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {formData.title && formData.supplierName && formData.contractType ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${
                formData.title && formData.supplierName && formData.contractType
                  ? 'text-green-900' 
                  : 'text-red-900'
              }`}>
                Informations de Base
              </span>
            </div>
            <p className={`text-sm mt-1 ${
              formData.title && formData.supplierName && formData.contractType
                ? 'text-green-700' 
                : 'text-red-700'
            }`}>
              {formData.title && formData.supplierName && formData.contractType
                ? 'Toutes les informations requises sont renseignées'
                : 'Informations manquantes ou incomplètes'
              }
            </p>
          </div>

          <div className={`p-4 rounded-lg border-2 ${
            selectedBudgetLine && formData.budgetLineId
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {selectedBudgetLine && formData.budgetLineId ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${
                selectedBudgetLine && formData.budgetLineId
                  ? 'text-green-900' 
                  : 'text-red-900'
              }`}>
                Ligne Budgétaire
              </span>
            </div>
            <p className={`text-sm mt-1 ${
              selectedBudgetLine && formData.budgetLineId
                ? 'text-green-700' 
                : 'text-red-700'
            }`}>
              {selectedBudgetLine && formData.budgetLineId
                ? 'Ligne budgétaire sélectionnée et validée'
                : 'Aucune ligne budgétaire sélectionnée'
              }
            </p>
          </div>

          <div className={`p-4 rounded-lg border-2 ${
            isAmountValid && formData.totalAmount
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {isAmountValid && formData.totalAmount ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${
                isAmountValid && formData.totalAmount
                  ? 'text-green-900' 
                  : 'text-red-900'
              }`}>
                Montant
              </span>
            </div>
            <p className={`text-sm mt-1 ${
              isAmountValid && formData.totalAmount
                ? 'text-green-700' 
                : 'text-red-700'
            }`}>
              {isAmountValid && formData.totalAmount
                ? 'Montant valide et dans les limites du budget'
                : 'Montant invalide ou dépassant le budget disponible'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Final Confirmation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Prêt pour la Création</h4>
            <p className="text-sm text-blue-700 mt-1">
              Une fois créé, le marché sera en statut "BROUILLON" et pourra être signé par un administrateur. 
              Le montant sera automatiquement engagé sur la ligne budgétaire sélectionnée.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;