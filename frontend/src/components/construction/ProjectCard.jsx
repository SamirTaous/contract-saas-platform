import { Building, User, TrendingUp, Plus, Eye, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/currency';

const ProjectCard = ({ project, onCreateDecompte }) => {
  const navigate = useNavigate();
  const progressPercent = project.physicalProgress || 0;
  const totalPaid = project.totalPaidAmount || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">
              {project.name}
            </h4>
            <p className="text-sm text-gray-600 truncate">
              {project.marketTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="space-y-3">
        {/* Supplier */}
        <div className="flex items-center space-x-2 text-sm">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">Fournisseur:</span>
          <span className="font-medium text-gray-900">{project.marketSupplier}</span>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-sm">
              <Percent className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Progrès Physique</span>
            </div>
            <span className="text-sm font-semibold text-blue-600">
              {progressPercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progressPercent >= 90 ? 'bg-green-500' :
                progressPercent >= 50 ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Total Paid */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-gray-600">Total Payé</span>
          </div>
          <span className="font-bold text-green-600 text-lg">
            {formatCurrency(totalPaid)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => onCreateDecompte(project)}
            className="flex-1"
          >
            Nouveau Décompte
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Eye}
            onClick={() => navigate(`/construction/projects/${project.uuid}`)}
            className="flex-1"
          >
            Voir Détails
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;