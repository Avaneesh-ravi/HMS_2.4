import React from 'react';
import { X, Lock, Save, Loader2 } from 'lucide-react';
import { OfficeUseData } from '../../../types';

interface OfficeUseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  data: OfficeUseData;
  setData: React.Dispatch<React.SetStateAction<OfficeUseData>>;
  isSaving: boolean;
  response: any;
}

export const OfficeUseModal: React.FC<OfficeUseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  data,
  setData,
  isSaving,
  response
}) => {
  if (!isOpen || !response) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Office Use Review & Action</h3>
              <p className="text-xs text-gray-500">
                UHID: <span className="font-semibold text-gray-800">{response.uhid}</span> • Patient: <span className="font-semibold text-gray-800">{response.patientName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              Review of Complaint:
            </label>
            <textarea
              value={data.reviewOfComplaint}
              onChange={(e) => setData({ ...data, reviewOfComplaint: e.target.value })}
              rows={3}
              placeholder="Enter detailed review of the complaint or issue..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Date of Review:
              </label>
              <input
                type="date"
                value={data.dateOfReview}
                onChange={(e) => setData({ ...data, dateOfReview: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Incharge / Officer Name:
              </label>
              <input
                type="text"
                value={data.inchargeName}
                onChange={(e) => setData({ ...data, inchargeName: e.target.value })}
                placeholder="Name of reviewing officer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              Corrective Action Taken:
            </label>
            <textarea
              value={data.correctiveAction}
              onChange={(e) => setData({ ...data, correctiveAction: e.target.value })}
              rows={2}
              placeholder="Immediate steps taken to resolve the issue..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              Preventive Action:
            </label>
            <textarea
              value={data.preventiveAction}
              onChange={(e) => setData({ ...data, preventiveAction: e.target.value })}
              rows={2}
              placeholder="Long term policy/training to prevent recurrence..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving...' : 'Save Office Details'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
