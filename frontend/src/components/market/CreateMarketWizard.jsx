import { useState } from 'react';
import { X, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import BasicInfoStep from './steps/BasicInfoStep';
import BudgetSelectionStep from './steps/BudgetSelectionStep';
import ReviewStep from './steps/ReviewStep';

const CreateMarketWizard = ({ isOpen, onClose, onSubmit, budgetLines, submitting }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    supplierName: '',
    totalAmount: '',
    budgetLineId: '',
    description: '',
    estimatedDuration: '',
    contractType: 'SERVICES'
  });
  const [formErrors, setFormErrors] = useState({});

  const steps = [
    { id: 1, title: 'Informations de Base', component: BasicInfoStep },
    { id: 2, title: 'Sélection Budgétaire', component: BudgetSelectionStep },
    { id: 3, title: 'Révision', component: ReviewStep }
  ];

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    const errors = {};
    
    if (currentStep === 1) {
      if (!formData.title.trim()) errors.title = 'Le titre est requis';
      if (!formData.supplierName.trim()) errors.supplierName = 'Le nom du fournisseur est requis';
      if (!formData.contractType) errors.contractType = 'Le type de contrat est requis';
    }
    
    if (currentStep === 2) {
      if (!formData.budgetLineId) errors.budgetLineId = 'La sélection d\'une ligne budgétaire est requise';
      if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
        errors.totalAmount = 'Un montant valide est requis';
      }
      
      // Check budget availability using UUID
      if (formData.budgetLineId && formData.totalAmount) {
        const selectedBudgetLine = budgetLines.find(line => line.uuid === formData.budgetLineId);
        if (selectedBudgetLine) {
          const availableAmount = selectedBudgetLine.initialAmount - (selectedBudgetLine.committedAmount || 0);
          if (parseFloat(formData.totalAmount) > availableAmount) {
            errors.totalAmount = `Le montant dépasse le budget disponible`;
          }
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      title: '',
      supplierName: '',
      totalAmount: '',
      budgetLineId: '',
      description: '',
      estimatedDuration: '',
      contractType: 'SERVICES'
    });
    setFormErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Créer un Nouveau Marché</h2>
            <button
              onClick={handleClose}
              className="text-blue-200 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="mt-6">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                    currentStep > step.id 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : currentStep === step.id 
                        ? 'bg-white border-white text-blue-600' 
                        : 'border-blue-300 text-blue-300'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= step.id ? 'text-white' : 'text-blue-300'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-blue-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <CurrentStepComponent
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            budgetLines={budgetLines}
          />
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Précédent</span>
          </button>

          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            
            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Suivant</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Création...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Créer le Marché</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMarketWizard;