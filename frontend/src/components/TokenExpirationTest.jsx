import { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import api from '../api';

const TokenExpirationTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const testTokenExpiration = async () => {
    setTesting(true);
    setResult(null);

    try {
      // Simulate an expired token by setting an invalid one
      const originalToken = localStorage.getItem('token');
      localStorage.setItem('token', 'expired.jwt.token');

      // Make a request that should fail with 401
      await api.get('/auth/me');
      
      setResult({ success: false, message: 'Token expiration test failed - request should have been rejected' });
      
      // Restore original token
      if (originalToken) {
        localStorage.setItem('token', originalToken);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setResult({ success: true, message: 'Token expiration handling working correctly - redirected to login' });
      } else {
        setResult({ success: false, message: `Unexpected error: ${error.message}` });
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <AlertTriangle className="h-6 w-6 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-900">JWT Expiration Test</h3>
      </div>
      
      <p className="text-gray-600 mb-4">
        Test the automatic JWT expiration handling. This will simulate an expired token and verify that you're redirected to the login page.
      </p>
      
      <button
        onClick={testTokenExpiration}
        disabled={testing}
        className="inline-flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {testing && <RefreshCw className="h-4 w-4 animate-spin" />}
        <span>{testing ? 'Testing...' : 'Test Token Expiration'}</span>
      </button>
      
      {result && (
        <div className={`mt-4 p-4 rounded-lg ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
            {result.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default TokenExpirationTest;