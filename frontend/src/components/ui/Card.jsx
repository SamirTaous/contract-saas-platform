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
    <div className={`${designSystem.layout.card} ${className}`}>
      {(title || Icon || action) && (
        <div className={`px-6 py-4 border-b border-gray-200 ${!padding ? 'pb-0' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {Icon && <Icon className="h-5 w-5 text-blue-600" />}
              <div>
                {title && (
                  <h3 className={designSystem.typography.cardTitle}>{title}</h3>
                )}
                {subtitle && (
                  <p className={designSystem.typography.body}>{subtitle}</p>
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