export interface OfficeUseData {
  reviewOfComplaint: string;
  dateOfReview: string;
  correctiveAction: string;
  preventiveAction: string;
  inchargeName: string;
}

export interface OfficeUseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: OfficeUseData) => Promise<void>;
  initialData: OfficeUseData;
  isSaving: boolean;
  patientInfo?: {
    patientName: string;
    uhid: string;
    date: string;
    departmentName?: string;
  };
}
