import { CheckCircle, FileText, User, Calendar, Eye, Shield } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const MarketCard = ({ market, linkedBudget, onSign }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            📝 BROUILLON
          </span>
        );
      case 'SIGNED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <Shield className="w-3 h-3 mr-1" />
            SIGNÉ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{market.title}</h3>
              <p className="text-sm text-gray-500">ID: {market.uuid?.slice(0, 8)}...</p>
            </div>
          </div>
          {getStatusBadge(market.status)}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Supplier */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{market.supplier}</p>
              <p className="text-xs text-gray-500">Fournisseur</p>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-sm text-green-700 mb-1">Montant du Marché</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(market.totalAmount)}</p>
          </div>

          {/* Budget Line */}
          {linkedBudget ? (
            <div className="bg-gray-50 rounded-lg p-3 border">
              <p className="text-sm text-gray-600 mb-1">Ligne Budgétaire</p>
              <p className="text-sm font-mono font-medium text-gray-900">{linkedBudget.fullCode}</p>
              <p className="text-xs text-gray-500 truncate mt-1">{linkedBudget.label}</p>
              <p className="text-xs text-blue-600 mt-1">
                Budget: {formatCurrency(linkedBudget.initialAmount)}
              </p>
            </div>
          ) : (
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-sm text-red-700">Budget non trouvé</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              Créé le {new Date(market.createdAt || Date.now()).toLocaleDateString('fr-FR')}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {market.status === 'DRAFT' && (
              <button
                onClick={() => onSign(market.uuid)}
                className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Signer</span>
              </button>
            )}
            {market.status === 'SIGNED' && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium text-sm">Terminé</span>
              </div>
            )}
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketCard;