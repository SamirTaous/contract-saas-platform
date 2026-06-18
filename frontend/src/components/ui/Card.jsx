import { designSystem } from '../../styles/designSystem';

const Card = ({ 
  children, 
  title, 
  subtitle,
  icon: Icon,
  action,
  padding = true,
  className = '' 
}) => {
  return (
    <div className={`${designSystem.layout.card} transition-all duration-300 ${className}`}>
      {(title || Icon || action) && (
        <div className={`px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-transparent ${!padding ? 'pb-0' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {Icon && (
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
              )}
              <div>
                {title && (
                  <h3 className={`${designSystem.typography.cardTitle} text-gray-900`}>{title}</h3>
                )}
                {subtitle && (
                  <p className={`${designSystem.typography.body} mt-0.5`}>{subtitle}</p>
                )}
              </div>
            </div>
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={padding ? designSystem.layout.cardPadding : ''}>
        {children}
      </div>
    </div>
  );
};

export default Card;