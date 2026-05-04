import { useState, useCallback } from 'react';
import {
    Upload,
    FileText,
    AlertCircle,
    CheckCircle,
    X,
    Download,
    Calendar,
    Database,
    Info
} from 'lucide-react';
import axios from 'axios';
import { setupApiInterceptors } from '../utils/apiInterceptors';

const budgetApi = setupApiInterceptors(axios.create({
    baseURL: 'http://localhost:8082/api/budget'
}));

const BudgetImport = ({ onImportSuccess }) => {
    const [file, setFile] = useState(null);
    const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear());
    const [isRAM, setIsRAM] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                droppedFile.type === 'application/vnd.ms-excel') {
                setFile(droppedFile);
            } else {
                alert('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
            }
        }
    }, []);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                selectedFile.type === 'application/vnd.ms-excel') {
                setFile(selectedFile);
            } else {
                alert('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Veuillez sélectionner un fichier');
            return;
        }

        setUploading(true);
        setUploadResult(null);

        try {
            // Ensure year is sent as integer
            const yearValue = parseInt(fiscalYear);
            if (isNaN(yearValue)) {
                throw new Error('Année fiscale invalide');
            }

            const formData = new FormData();
            formData.append('file', file);

            // Debug: Log what we're sending
            console.log('Sending import request with:', {
                year: yearValue,
                isRAM: isRAM,
                fileName: file.name
            });

            // Send year and isRAM as query parameters
            const response = await budgetApi.post(`/import?year=${yearValue}&isRAM=${isRAM}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setUploadResult({
                success: true,
                message: 'Fichier importé avec succès',
                data: response.data
            });

            // Reset form
            setFile(null);

            // Call the success callback if provided
            if (onImportSuccess) {
                setTimeout(() => {
                    onImportSuccess();
                }, 1500); // Give user time to see the success message
            }

        } catch (error) {
            console.error('Upload error:', error);
            setUploadResult({
                success: false,
                message: error.response?.data?.message || 'Erreur lors de l\'importation du fichier',
                error: error.response?.data
            });
        } finally {
            setUploading(false);
        }
    };

    const removeFile = () => {
        setFile(null);
        setUploadResult(null);
    };

    const downloadTemplate = () => {
        // Create a sample Excel template
        const link = document.createElement('a');
        link.href = '/budget-template.xlsx'; // You would need to provide this template file
        link.download = 'modele-budget.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

    return (
        <div>
            {/* Instructions Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="w-full">
                        <h3 className="text-sm font-medium text-blue-900 mb-3">Instructions d'importation</h3>

                        {/* General Instructions */}
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-blue-800 mb-2">Exigences générales:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Le fichier doit être au format Excel (.xlsx ou .xls)</li>
                                <li>• La première ligne doit contenir les en-têtes de colonnes</li>
                                <li>• Sélectionnez l'année fiscale appropriée</li>
                                <li>• Cochez "Reste à Mandater" si applicable</li>
                            </ul>
                        </div>

                        {/* Column Mapping */}
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-blue-800 mb-2">Format des colonnes requis (dans cet ordre):</h4>
                            <div className="bg-white rounded-lg p-3 text-xs">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="font-medium text-gray-700 mb-1">Colonnes A-D:</div>
                                        <div className="space-y-1 text-gray-600">
                                            <div>A: <span className="font-medium">Article</span></div>
                                            <div>B: <span className="font-medium">Paragraphe</span></div>
                                            <div>C: <span className="font-medium">Ligne</span></div>
                                            <div>D: <span className="font-medium">Type</span> (MDD/INV)</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-700 mb-1">Colonnes E-F:</div>
                                        <div className="space-y-1 text-gray-600">
                                            <div>E: <span className="font-medium">Libellé</span></div>
                                            <div>F: <span className="font-medium">Montant Initial</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Important Notes */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                            <h4 className="text-sm font-semibold text-yellow-800 mb-1">⚠️ Important:</h4>
                            <ul className="text-xs text-yellow-700 space-y-1">
                                <li>• Le <strong>Montant Initial</strong> doit être en colonne F (6ème colonne)</li>
                                <li>• Utilisez des nombres sans formatage spécial (ex: 50000 au lieu de 50 000,00)</li>
                                <li>• Ne pas inclure l'année fiscale dans le fichier Excel</li>
                            </ul>
                        </div>

                        <button
                            onClick={downloadTemplate}
                            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            <Download className="h-4 w-4" />
                            <span>Télécharger le modèle Excel</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="space-y-6">
                    {/* Configuration */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h2>

                        <div className="space-y-4">
                            {/* Fiscal Year */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="inline h-4 w-4 mr-1" />
                                    Année Fiscale
                                </label>
                                <select
                                    value={fiscalYear}
                                    onChange={(e) => setFiscalYear(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {yearOptions.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            {/* isRAM Checkbox */}
                            <div>
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={isRAM}
                                        onChange={(e) => setIsRAM(e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">
                                            <Database className="inline h-4 w-4 mr-1" />
                                            Reste à Mandater (RAM)
                                        </span>
                                        <p className="text-xs text-gray-500">
                                            Cochez si ce budget représente des montants restant à mandater
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Fichier Excel</h2>

                        {!file ? (
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg font-medium text-gray-900 mb-2">
                                    Glissez votre fichier Excel ici
                                </p>
                                <p className="text-gray-600 mb-4">ou</p>
                                <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                                    <span>Sélectionner un fichier</span>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-xs text-gray-500 mt-2">
                                    Formats acceptés: .xlsx, .xls (max 10MB)
                                </p>
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="h-8 w-8 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={removeFile}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Upload Button */}
                        {file && (
                            <div className="mt-6">
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Importation en cours...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4" />
                                            <span>Importer le fichier</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {/* Upload Result */}
                    {uploadResult && (
                        <div className={`rounded-lg p-6 border ${uploadResult.success
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                            }`}>
                            <div className="flex items-start space-x-3">
                                {uploadResult.success ? (
                                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <h3 className={`text-lg font-medium ${uploadResult.success ? 'text-green-900' : 'text-red-900'
                                        }`}>
                                        {uploadResult.success ? 'Import réussi' : 'Erreur d\'import'}
                                    </h3>
                                    <p className={`mt-1 text-sm ${uploadResult.success ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                        {uploadResult.message}
                                    </p>

                                    {uploadResult.success && uploadResult.data && (
                                        <div className="mt-4 space-y-2">
                                            <div className="text-sm text-green-800">
                                                <strong>Résumé de l'importation:</strong>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 text-sm">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="text-gray-600">Lignes traitées:</span>
                                                        <span className="font-medium ml-2">{uploadResult.data.processed || 0}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Année fiscale:</span>
                                                        <span className="font-medium ml-2">{fiscalYear}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">RAM:</span>
                                                        <span className="font-medium ml-2">{isRAM ? 'Oui' : 'Non'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Import History */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Historique des imports</h2>
                        <div className="space-y-3">
                            <div className="text-sm text-gray-500 text-center py-8">
                                Aucun import récent
                            </div>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Guide de Mapping</h2>
                        <div className="space-y-4">
                            {/* Field Mapping Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-2 px-3 font-medium text-gray-700">Colonne Excel</th>
                                            <th className="text-left py-2 px-3 font-medium text-gray-700">Champ</th>
                                            <th className="text-left py-2 px-3 font-medium text-gray-700">Exemple</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-600">
                                        <tr className="border-b border-gray-100">
                                            <td className="py-2 px-3 font-mono">A</td>
                                            <td className="py-2 px-3">Article</td>
                                            <td className="py-2 px-3">12</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-2 px-3 font-mono">B</td>
                                            <td className="py-2 px-3">Paragraphe</td>
                                            <td className="py-2 px-3">01</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-2 px-3 font-mono">C</td>
                                            <td className="py-2 px-3">Ligne</td>
                                            <td className="py-2 px-3">001</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-2 px-3 font-mono">D</td>
                                            <td className="py-2 px-3">Type</td>
                                            <td className="py-2 px-3">MDD ou INV</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-2 px-3 font-mono">E</td>
                                            <td className="py-2 px-3">Libellé</td>
                                            <td className="py-2 px-3">Description du budget</td>
                                        </tr>
                                        <tr className="bg-yellow-50">
                                            <td className="py-2 px-3 font-mono font-bold">F</td>
                                            <td className="py-2 px-3 font-bold">Montant Initial</td>
                                            <td className="py-2 px-3 font-bold">50000</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Additional Tips */}
                            <div className="mt-4 space-y-2 text-sm text-gray-600">
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p><strong>Montant Initial:</strong> Doit être un nombre entier sans virgules ni espaces</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p><strong>Type:</strong> Uniquement "MDD" ou "INV" (sensible à la casse)</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p><strong>Année fiscale:</strong> Sélectionnée dans l'interface, pas dans le fichier</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetImport;