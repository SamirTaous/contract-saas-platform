import { useState, useRef, useEffect } from 'react';
import { Search, DollarSign, X, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../../utils/currency';

const BudgetSelectionStep = ({ formData, setFormData, formErrors, budgetLines }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredBudgetLines = budgetLines.filter(line =>
    line.fullCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    line.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    line.article?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedBudgetLine = budgetLines.find(line => line.uuid === formData.budgetLineId);
  
  const availableAmount = selectedBudgetLine 
    ? selectedBudgetLine.initialAmount - (selectedBudgetLine.committedAmount || 0)
    : 0;

  const isAmountValid = formData.totalAmount && parseFloat(formData.totalAmount) <= availableAmount;
  const amountPercentage = selectedBudgetLine && formData.totalAmount 
    ? (parseFloat(formData.totalAmount) / availableAmount) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Sélection Budgétaire</h3>
        <p className="text-gray-600 mt-2">Choisissez la ligne budgétaire et définissez le montant</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Budget Line Selection */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Ligne Budgétaire</h4>
          
          {selectedBudgetLine ? (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Ligne Sélectionnée</span>
                  </div>
                  <p className="font-mono text-sm text-green-800 mb-1">{selectedBudgetLine.fullCode}</p>
                  <p className="text-sm text-green-700 mb-2">{selectedBudgetLine.label}</p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-green-600">Budget Initial:</span>
                      <p className="font-medium text-green-900">{formatCurrency(selectedBudgetLine.initialAmount)}</p>
                    </div>
                    <div>
                      <span className="text-green-600">Disponible:</span>
                      <p className="font-medium text-green-900">{formatCurrency(availableAmount)}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFormData({ ...formData, budgetLineId: '' });
                    setSearchTerm('');
                  }}
                  className="p-1 text-green-400 hover:text-green-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par code, libellé ou article..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowDropdown(searchTerm.length > 0)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    formErrors.budgetLineId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
              </div>
              
              {showDropdown && searchTerm && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                  {filteredBudgetLines.length > 0 ? (
                    filteredBudgetLines.map((line) => {
                      const available = line.initialAmount - (line.committedAmount || 0);
                      
                      return (
                        <button
                          key={line.uuid}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, budgetLineId: line.uuid });
                            setSearchTerm('');
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-sm font-medium text-gray-900">{line.fullCode}</p>
                              <p className="text-sm text-gray-600 truncate">{line.label}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-500">{line.article}</span>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-gray-500">{line.type}</span>
                              </div>
                            </div>
                            <div className="text-right ml-4 flex-shrink-0">
                              <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(line.initialAmount)}
                              </p>
                              <p className={`text-xs ${available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Disponible: {formatCurrency(available)}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p>Aucune ligne budgétaire trouvée</p>
                      <p className="text-xs mt-1">Essayez avec d'autres termes de recherche</p>
                    </div>
                  )}
                </div>
              )}
              
              {formErrors.budgetLineId && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {formErrors.budgetLineId}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Amount Configuration */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Montant du Marché</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant Total *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                max={availableAmount}
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  formErrors.totalAmount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0,00"
                disabled={!selectedBudgetLine}
              />
            </div>
            {formErrors.totalAmount && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span>
                {formErrors.totalAmount}
              </p>
            )}
          </div>

          {/* Budget Usage Visualization */}
          {selectedBudgetLine && formData.totalAmount && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Utilisation du Budget</span>
                <span className={`text-sm font-medium ${isAmountValid ? 'text-green-600' : 'text-red-600'}`}>
                  {amountPercentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isAmountValid ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(amountPercentage, 100)}%` }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-600">Montant Demandé:</span>
                  <p className="font-medium text-gray-900">{formatCurrency(parseFloat(formData.totalAmount))}</p>
                </div>
                <div>
                  <span className="text-gray-600">Reste Disponible:</span>
                  <p className={`font-medium ${
                    availableAmount - parseFloat(formData.totalAmount) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(availableAmount - parseFloat(formData.totalAmount))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warning/Success Messages */}
      {selectedBudgetLine && formData.totalAmount && (
        <div className={`rounded-lg p-4 ${
          isAmountValid 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {isAmountValid ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <h4 className={`text-sm font-medium ${
                isAmountValid ? 'text-green-900' : 'text-red-900'
              }`}>
                {isAmountValid ? 'Budget Suffisant' : 'Budget Insuffisant'}
              </h4>
              <p className={`text-sm mt-1 ${
                isAmountValid ? 'text-green-700' : 'text-red-700'
              }`}>
                {isAmountValid 
                  ? 'Le montant demandé est dans les limites du budget disponible.'
                  : 'Le montant demandé dépasse le budget disponible pour cette ligne budgétaire.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Budget Summary */}
      {!selectedBudgetLine && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Sélection Budgétaire</h4>
              <p className="text-sm text-blue-700 mt-1">
                Recherchez et sélectionnez une ligne budgétaire pour continuer. 
                Le système vérifiera automatiquement la disponibilité des fonds.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetSelectionStep;