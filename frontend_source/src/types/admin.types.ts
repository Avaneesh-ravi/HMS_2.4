export type SidebarItem = 'overview' | 'branding' | 'form-builder' | 'responses' | 'display' | 'office-use' | 'feedback-report';
export type FormBuilderTab = 'service-feedback' | 'additional-details' | 'page-merge' | 'language' | 'departments';

export interface BrandingSettings {
  logo: string;
  hospitalName: string;
  address: string;
  contactNumber: string;
  email: string;
}

export interface AdminDashboardProps {
  onClose: () => void;
  onLogout: () => void;
  onBrandingUpdate: (branding: BrandingSettings) => void;
  currentBranding: BrandingSettings;
}

export type SortField = 'date' | 'uhid' | 'patientName' | 'overallRating';
export type SortDirection = 'asc' | 'desc';
