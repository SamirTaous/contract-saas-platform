import { FileText, User, Clock, Building } from 'lucide-react';

const BasicInfoStep = ({ formData, setFormData, formErrors }) => {
  const contractTypes = [
    { value: 'SERVICES', label: 'Services', icon: '🔧' },
    { value: 'GOODS', label: 'Fournitures', icon: '📦' },
    { value: 'WORKS', label: 'Travaux', icon: '🏗️' },
    { value: 'CONSULTING', label: 'Conseil', icon: '💼' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Informations de Base</h3>
        <p className="text-gray-600 mt-2">Renseignez les informations principales du marché</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title Field */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre du Marché *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              formErrors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Ex: Fourniture de matériel informatique"
          />
          {formErrors.title && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {formErrors.title}
            </p>
          )}
        </div>

        {/* Supplier Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du Fournisseur *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={formData.supplierName}
              onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                formErrors.supplierName ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Nom de l'entreprise"
            />
          </div>
          {formErrors.supplierName && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {formErrors.supplierName}
            </p>
          )}
        </div>

        {/* Contract Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de Contrat *
          </label>
          <select
            value={formData.contractType}
            onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              formErrors.contractType ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            {contractTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
          {formErrors.contractType && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {formErrors.contractType}
            </p>
          )}
        </div>

        {/* Estimated Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durée Estimée (optionnel)
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={formData.estimatedDuration}
              onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ex: 6 mois, 1 an"
            />
          </div>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (optionnel)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            placeholder="Description détaillée du marché, objectifs, spécifications techniques..."
          />
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Building className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Information</h4>
            <p className="text-sm text-blue-700 mt-1">
              Ces informations seront utilisées pour générer automatiquement les documents contractuels. 
              Assurez-vous qu'elles sont exactes et complètes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;