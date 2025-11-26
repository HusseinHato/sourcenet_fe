import React from 'react';
import { Modal } from '../common/Modal';
import { FileText, AlertCircle } from 'lucide-react';

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    previewData: any;
    title: string;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, previewData, title }) => {
    if (!isOpen) return null;

    const parseCSV = (csvText: string) => {
        const lines = csvText.trim().split('\n');
        if (lines.length === 0) return null;

        const headers = lines[0].split(',');
        const rows = lines.slice(1).map(line => line.split(','));

        return { headers, rows };
    };

    const renderPreviewContent = () => {
        if (!previewData) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">No Preview Available</h3>
                        <p className="text-sm text-gray-500 mt-1">The seller hasn't provided a preview for this dataset yet.</p>
                    </div>
                </div>
            );
        }

        // Convert to string if needed
        let content = typeof previewData === 'string' ? previewData : String(previewData);

        // Try to parse as CSV
        const csvData = parseCSV(content);

        if (csvData && csvData.headers.length > 1) {
            // Render as table
            return (
                <div className="overflow-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                {csvData.headers.map((header, idx) => (
                                    <th
                                        key={idx}
                                        className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 last:border-r-0 whitespace-nowrap"
                                    >
                                        {header.trim()}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {csvData.rows.slice(0, 100).map((row, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-gray-50 transition-colors">
                                    {row.map((cell, cellIdx) => (
                                        <td
                                            key={cellIdx}
                                            className="px-4 py-3 text-sm text-gray-900 border-r border-gray-100 last:border-r-0 whitespace-nowrap"
                                        >
                                            {cell.trim()}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {csvData.rows.length > 100 && (
                        <div className="bg-gray-50 px-4 py-3 text-sm text-gray-500 text-center border-t border-gray-200">
                            Showing first 100 rows of {csvData.rows.length} total rows
                        </div>
                    )}
                </div>
            );
        }

        // Fallback to plain text for non-CSV data
        if (typeof previewData === 'object') {
            try {
                content = JSON.stringify(previewData, null, 2);
            } catch (e) {
                content = String(previewData);
            }
        }

        return (
            <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[70vh]">
                <pre className="text-sm font-mono text-gray-100 whitespace-pre-wrap break-all">
                    {content}
                </pre>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Preview: ${title}`} size="4xl" fixedHeight={true}>
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <FileText className="h-4 w-4" />
                    <span>This is a sample of the data contained in this pod.</span>
                </div>

                {renderPreviewContent()}

                <div className="flex justify-end pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Close Preview
                    </button>
                </div>
            </div>
        </Modal>
    );
};
