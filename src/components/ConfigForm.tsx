import React, { useState, useEffect } from 'react';
import SpringBootApi from '../services/springBootApi';

// Create a single instance of the Spring Boot API
const springBootApi = new SpringBootApi();

export interface BookStackConfigDTO {
  sourceBaseUrl: string;
  sourceTokenId: string;
  sourceTokenSecret: string;
  destinationBaseUrl: string;
  destinationTokenId: string;
  destinationTokenSecret: string;
}

// Custom event for config updates
export const CONFIG_UPDATED_EVENT = 'bookstack-config-updated';

export function ConfigForm() {
  const [config, setConfig] = useState<BookStackConfigDTO>({
    sourceBaseUrl: '',
    sourceTokenId: '',
    sourceTokenSecret: '',
    destinationBaseUrl: '',
    destinationTokenId: '',
    destinationTokenSecret: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({
    type: null,
    text: '',
  });

  useEffect(() => {
    loadSavedConfig();
  }, []);

  const loadSavedConfig = async () => {
    try {
      const savedConfig = await springBootApi.getConfig();
      if (savedConfig) {
        setConfig(savedConfig);
      }
    } catch (error) {
      console.error('Error loading saved config:', error);
    }
  };

  const handleChange = (field: keyof BookStackConfigDTO, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const saveConfig = async () => {
    setIsSaving(true);
    setMessage({ type: null, text: '' });
    
    try {
      await springBootApi.saveConfig(config);
      
      // Dispatch a custom event to notify other components that config has been updated
      window.dispatchEvent(new CustomEvent(CONFIG_UPDATED_EVENT));
      
      setMessage({
        type: 'success',
        text: 'Configuration saved successfully',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save configuration',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const verifyCredentials = async () => {
    setIsVerifying(true);
    setMessage({ type: null, text: '' });
    
    try {
      const result = await springBootApi.verifyCredentials();
      
      setMessage({
        type: 'success',
        text: `Source credentials: ${result.sourceCredentialsValid ? 'Valid' : 'Invalid'}${
          result.destinationCredentialsValid !== undefined 
            ? `\nDestination credentials: ${result.destinationCredentialsValid ? 'Valid' : 'Invalid'}`
            : ''
        }`,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to verify credentials',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">BookStack Sync Configuration</h2>
      
      <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-md">
        <p className="text-sm">
          <strong>Note:</strong> This configuration will be used for all API operations. The values will be stored temporarily in your browser's session storage and sent as headers with each API request.
        </p>
        <p className="text-sm mt-2">
          For security reasons, credentials are not permanently stored and will be lost when you close the browser tab.
        </p>
      </div>
      
      {message.type && (
        <div 
          className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Source BookStack</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source URL</label>
            <input
              type="text"
              value={config.sourceBaseUrl}
              onChange={(e) => handleChange('sourceBaseUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://source-bookstack.example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Token ID</label>
            <input
              type="text"
              value={config.sourceTokenId}
              onChange={(e) => handleChange('sourceTokenId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter source API token ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Token</label>
            <input
              type="password"
              value={config.sourceTokenSecret}
              onChange={(e) => handleChange('sourceTokenSecret', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter source API token"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Destination BookStack</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination URL</label>
            <input
              type="text"
              value={config.destinationBaseUrl}
              onChange={(e) => handleChange('destinationBaseUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://destination-bookstack.example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Token ID</label>
            <input
              type="text"
              value={config.destinationTokenId}
              onChange={(e) => handleChange('destinationTokenId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter destination API token ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Token</label>
            <input
              type="password"
              value={config.destinationTokenSecret}
              onChange={(e) => handleChange('destinationTokenSecret', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter destination API token"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={saveConfig}
          disabled={isSaving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
        <button
          onClick={verifyCredentials}
          disabled={isVerifying}
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
        >
          {isVerifying ? 'Verifying...' : 'Verify Credentials'}
        </button>
      </div>
    </div>
  );
} 