import { Eye } from 'lucide-react';

const ReadOnlyBanner = () => (
  <div className="mb-6 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
    <Eye className="h-4 w-4 flex-shrink-0" />
    <span>
      Mode consultation — vous pouvez consulter les données mais pas les modifier.
    </span>
  </div>
);

export default ReadOnlyBanner;
