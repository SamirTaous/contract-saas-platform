import { FileText, CheckCircle, Clock, XCircle, DollarSign, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/currency';

const DecompteCard = ({ decompte, onPay, showProject = true }) => {
  const navigate = useNavigate();
  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Payé
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            En Attente
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejeté
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">
              {decompte.label}
            </h4>
            {showProject && (
              <p className="text-sm text-gray-600 truncate">
                Projet: {decompte.projectName}
              </p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {getStatusBadge(decompte.status)}
        </div>
      </div>

      {/* Decompte Details */}
      <div className="space-y-3">
        {/* Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Montant</span>
          </div>
          <span className="font-bold text-green-600 text-lg">
            {formatCurrency(parseFloat(decompte.amount) || 0)}
          </span>
        </div>

        {/* Validation Date if paid */}
        {decompte.status === 'PAID' && decompte.validationDate && (
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-gray-600">Payé le:</span>
            <span className="font-medium text-gray-900">
              {new Date(decompte.validationDate).toLocaleDateString('fr-FR')}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          {decompte.status === 'PENDING' && (
            <div className="flex space-x-2">
              <Button
                variant="success"
                size="sm"
                icon={CheckCircle}
                onClick={() => onPay(decompte.uuid)}
                className="flex-1"
              >
                Valider et Payer
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Eye}
                onClick={() => navigate(`/construction/decomptes/${decompte.uuid}`)}
                className="flex-1"
              >
                Voir Détails
              </Button>
            </div>
          )}

          {decompte.status === 'PAID' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span className="font-medium">Paiement Effectué</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={Eye}
                onClick={() => navigate(`/construction/decomptes/${decompte.uuid}`)}
              >
                Détails
              </Button>
            </div>
          )}

          {decompte.status === 'REJECTED' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-red-600">
                <XCircle className="h-4 w-4 mr-2" />
                <span className="font-medium">Décompte Rejeté</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={Eye}
                onClick={() => navigate(`/construction/decomptes/${decompte.uuid}`)}
              >
                Détails
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DecompteCard;