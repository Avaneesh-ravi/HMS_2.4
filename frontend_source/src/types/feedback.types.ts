export interface Question {
  id: string;
  label: string;
  tamilLabel: string;
  ratingMode: 'emoji' | 'star';
  category?: string;
  backgroundColor?: string;
  icon?: string;
  describeIssueTrigger?: string;
  isDeleted?: boolean;
}

export interface YesNoQuestionItem {
  id: string;
  label: string;
  tamilLabel?: string;
  category?: string;
  isDeleted?: boolean;
}

export interface FeedbackResponse {
  id?: number | string;
  departmentId?: number;
  departmentName?: string;
  rawRatings?: any[];
  rawYesNo?: any[];
  uhid: string;
  patientName: string;
  date: string;
  overallRating: number;
  consolidatedRating?: number;
  wouldRecommend: boolean;
  ratings: Record<string, number>;
  yesNoAnswers: Record<string, boolean | null>;
  suggestions: string;
  appreciations: Array<{ name: string; department: string; note: string }>;
  visitType: 'OP' | 'IP';
  ipNumber?: string;
  ipDate?: string;
  opNumber?: string;
  opDate?: string;
  admissionDate?: string;
  dischargeDate?: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  whyChooseUs: string[];
  officeUse?: {
    reviewOfComplaint: string;
    dateOfReview: string;
    correctiveAction: string;
    preventiveAction: string;
    inchargeName: string;
  };
}

export interface RatingQuestionBreakdown {
  id: string;
  label: string;
  tamilLabel: string;
  category: string;
  averageScore: number;
  totalRated: number;
  count5: number;
  count4: number;
  count3: number;
  count2: number;
  count1: number;
  pct5: number;
  pct4: number;
  pct3: number;
  pct2: number;
  pct1: number;
  isDeleted?: boolean;
}

export interface YesNoQuestionBreakdown {
  id: string;
  label: string;
  tamilLabel: string;
  category: string;
  totalAnswered: number;
  yesCount: number;
  noCount: number;
  yesPercent: number;
  noPercent: number;
  isDeleted?: boolean;
}

export interface DepartmentReportData {
  departmentName: string;
  totalResponses: number;
  overallAvgRating: number;
  overallYesPercent: number;
  isHospitalOverall?: boolean;
  ratingQuestions: RatingQuestionBreakdown[];
  yesNoQuestions: YesNoQuestionBreakdown[];
}
