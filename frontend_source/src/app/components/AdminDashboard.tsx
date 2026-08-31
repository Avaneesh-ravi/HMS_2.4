import { REAL_DB_RESPONSES, REAL_DB_QUESTIONS, REAL_DB_YESNO, REAL_DB_DEPARTMENTS } from '../real_db_data';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Home, Image, Layout, MessageSquare, Settings, ChevronLeft, ChevronRight,
  Upload, Save, Filter, Download, Star, Smile, ArrowUpDown,
  Plus, Trash2, Edit2, Eye, X, GripVertical, LogOut, FileText,
  Hospital, User, TrendingUp, ThumbsUp, Pencil, Columns2, RectangleVertical,
  Building2, UserCircle, CreditCard, Stethoscope, Users, Pill, Activity,
  Shield, Utensils, HeartPulse, Droplet, Sparkles, Lock, Calendar, UserCircle2,
  Printer, Search, CheckCircle2, Check, ChevronUp, ChevronDown, HelpCircle, BarChart3, Award, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type SidebarItem = 'overview' | 'branding' | 'form-builder' | 'responses' | 'display' | 'office-use';
type FormBuilderTab = 'service-feedback' | 'additional-details' | 'page-merge' | 'language' | 'departments';

interface BrandingSettings {
  logo: string;
  hospitalName: string;
  address: string;
  contactNumber: string;
  email: string;
}

interface Question {
  id: string;
  label: string;
  tamilLabel: string;
  ratingMode: 'emoji' | 'star';
  category?: string;
  backgroundColor?: string;
  icon?: string;
  describeIssueTrigger?: string;
}

interface FeedbackResponse {
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
}

interface OfficeUse {
  reviewOfComplaint: string;
  dateOfReview: string;
  correctiveAction: string;
  preventiveAction: string;
  inchargeName: string;
}

interface AdminDashboardProps {
  onClose: () => void;
  onLogout: () => void;
  onBrandingUpdate: (branding: BrandingSettings) => void;
  currentBranding: BrandingSettings;
}

const presetColors = [
  '#fef3c7', '#fce7f3', '#ede9fe', '#dbeafe', '#dcfce7', '#ffedd5', '#f0fdfa', '#f1f5f9',
  '#fde68a', '#fbcfe8', '#c4b5fd', '#93c5fd', '#86efac', '#fdba74', '#5eead4', '#cbd5e1'
];

const getCategoryColor = (category?: string) => {
  const colors: Record<string, string> = {
    reception: 'border-l-[#3b82f6]',
    admission: 'border-l-[#0D9488]',
    billing: 'border-l-[#8b5cf6]',
    doctor: 'border-l-[#0D9488]',
    nursing: 'border-l-[#10b981]',
    pharmacy: 'border-l-[#f59e0b]',
    lab: 'border-l-[#6366f1]',
    insurance: 'border-l-[#0ea5e9]',
    food: 'border-l-[#f97316]',
    physiotherapy: 'border-l-[#ec4899]',
    bloodbank: 'border-l-[#ef4444]',
    cleanliness: 'border-l-[#84cc16]',
    overall: 'border-l-[#a855f7]'
  };
  return colors[category || ''] || 'border-l-gray-300';
};

const getCategoryIcon = (category?: string) => {
  const icons: Record<string, any> = {
    reception: <Building2 className="w-6 h-6 text-teal-600" />,
    admission: <UserCircle className="w-6 h-6 text-teal-600" />,
    billing: <CreditCard className="w-6 h-6 text-teal-600" />,
    doctor: <Stethoscope className="w-6 h-6 text-teal-600" />,
    nursing: <Users className="w-6 h-6 text-teal-600" />,
    pharmacy: <Pill className="w-6 h-6 text-teal-600" />,
    lab: <Activity className="w-6 h-6 text-teal-600" />,
    insurance: <Shield className="w-6 h-6 text-teal-600" />,
    food: <Utensils className="w-6 h-6 text-teal-600" />,
    physiotherapy: <HeartPulse className="w-6 h-6 text-teal-600" />,
    bloodbank: <Droplet className="w-6 h-6 text-teal-600" />,
    cleanliness: <Sparkles className="w-6 h-6 text-teal-600" />,
    overall: <Star className="w-6 h-6 text-teal-600" />
  };
  return icons[category || ''] || <Smile className="w-6 h-6 text-teal-600" />;
};

interface SortableQuestionCardProps {
  question: Question;
  handleEditQuestion: (q: Question) => void;
  handleDeleteQuestion: (id: string) => void;
  questions: Question[];
  updateQuestions: (q: Question[]) => void;
  showColorPicker: string | null;
  setShowColorPicker: (id: string | null) => void;
}

function SortableQuestionCard({
  question,
  handleEditQuestion,
  handleDeleteQuestion,
  questions,
  updateQuestions,
  showColorPicker,
  setShowColorPicker
}: SortableQuestionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.15)' : undefined,
  };

  const emojis = [
    { emoji: '☹️', label: 'Very Bad', borderColor: 'border-red-300' },
    { emoji: '😟', label: 'Poor', borderColor: 'border-orange-300' },
    { emoji: '😐', label: 'Average', borderColor: 'border-yellow-300' },
    { emoji: '😊', label: 'Good', borderColor: 'border-lime-300' },
    { emoji: '😄', label: 'Excellent', borderColor: 'border-green-300' },
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-l-4 ${getCategoryColor(question.category)} bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all ${question.backgroundColor || ''}`}
    >
      <div className="flex items-start gap-3 mb-4">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="mt-1">{getCategoryIcon(question.category)}</div>
            <div className="flex-1">
              <h4 className="font-bold text-[15px] text-[#1a1a2e] leading-tight">{question.label}</h4>
              <p className="text-[13px] text-gray-600 mt-0.5">{question.tamilLabel}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditQuestion(question)}
            className="p-2 hover:bg-teal-50 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4 text-teal-600" />
          </button>
          <button
            onClick={() => handleDeleteQuestion(question.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      <div className="mb-4 px-8">
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Live Preview</p>
        {question.ratingMode === 'star' ? (
          <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-10 h-10 text-gray-300" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-1.5">
            {emojis.map((item, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 ${item.borderColor} bg-white shadow-sm`}
              >
                <div className="text-2xl">{item.emoji}</div>
                <span className="text-[9px] font-bold text-gray-700 text-center leading-tight mt-1">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">Rating Mode:</label>
          <select
            value={question.ratingMode}
            onChange={(e) => {
              const updatedQuestions = questions.map(q =>
                q.id === question.id ? { ...q, ratingMode: e.target.value as 'emoji' | 'star' } : q
              );
              updateQuestions(updatedQuestions);
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          >
            <option value="emoji">Emoji Rating</option>
            <option value="star">Star Rating</option>
          </select>
        </div>

        <div className="flex items-center gap-2 relative">
          <label className="text-sm text-gray-600 font-medium">Card Color:</label>
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(showColorPicker === question.id ? null : question.id)}
              className="w-7 h-7 rounded-md border-[1.5px] border-gray-300 shadow-sm hover:shadow-md transition-all"
              style={{ backgroundColor: question.backgroundColor || '#ffffff' }}
            />
            {showColorPicker === question.id && (
              <div className="absolute top-10 right-0 z-50 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 p-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">Select Color</p>
                <div className="grid grid-cols-8 gap-1.5 mb-3">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        const updatedQuestions = questions.map(q =>
                          q.id === question.id ? { ...q, backgroundColor: color } : q
                        );
                        updateQuestions(updatedQuestions);
                      }}
                      className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => {
                    const updatedQuestions = questions.map(q =>
                      q.id === question.id ? { ...q, backgroundColor: undefined } : q
                    );
                    updateQuestions(updatedQuestions);
                    setShowColorPicker(null);
                  }}
                  className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                >
                  Reset to White
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to safely parse any rating value (string, number, word) to integer 1-5
export const parseRatingScore = (val: any): number => {
  if (val === undefined || val === null || val === '') return 0;
  const s = String(val).toLowerCase().trim();
  if (s === 'excellent' || s === '5') return 5;
  if (s === 'good' || s === '4') return 4;
  if (s === 'average' || s === '3') return 3;
  if (s === 'bad' || s === '2') return 2;
  if (s === 'poor' || s === '1') return 1;
  const parsed = parseFloat(s);
  return isNaN(parsed) ? 0 : Math.round(parsed);
};

// Helper to get Exact Overall Rating (1-5)
export const getExactOverallRating = (r: any): number => {
  if (!r) return 5;
  if (r.overallRating !== undefined && !isNaN(Number(r.overallRating))) {
    return Math.max(1, Math.min(5, Math.round(Number(r.overallRating))));
  }
  if (r.rating_overall !== undefined && !isNaN(Number(r.rating_overall))) {
    return Math.max(1, Math.min(5, Math.round(Number(r.rating_overall))));
  }
  if (r.ratings && r.ratings.overall !== undefined && !isNaN(Number(r.ratings.overall))) {
    return Math.max(1, Math.min(5, Math.round(Number(r.ratings.overall))));
  }
  if (Array.isArray(r.rawRatings) && r.rawRatings.length > 0) {
    const overallObj = r.rawRatings.find((x: any) => String(x.question_text || x.question_text_en || '').toLowerCase().includes('overall'));
    if (overallObj) {
      const val = parseRatingScore(overallObj.rating);
      if (val > 0) return val;
    }
    const firstVal = parseRatingScore(r.rawRatings[0].rating);
    if (firstVal > 0) return firstVal;
  }
  return 5;
};

// Helper to get Consolidated Rating (Average of all service questions)
export const getConsolidatedRating = (r: any): number => {
  if (!r) return 5.0;

  // 1. Direct from rawRatings array (most accurate)
  if (Array.isArray(r.rawRatings) && r.rawRatings.length > 0) {
    const validScores = r.rawRatings
      .map((x: any) => parseRatingScore(x.rating))
      .filter((v: number) => v > 0);
    if (validScores.length > 0) {
      const sum = validScores.reduce((a: number, b: number) => a + b, 0);
      return Math.round((sum / validScores.length) * 10) / 10;
    }
  }

  // 2. From ratings object
  if (r.ratings && typeof r.ratings === 'object') {
    const validScores = Object.entries(r.ratings)
      .filter(([k, v]) => k !== 'overall' && typeof v === 'number' && v > 0)
      .map(([_, v]) => v as number);
    if (validScores.length > 0) {
      const sum = validScores.reduce((a, b) => a + b, 0);
      return Math.round((sum / validScores.length) * 10) / 10;
    }
  }

  // 3. Fallback to consolidatedRating property
  if (r.consolidatedRating !== undefined && !isNaN(Number(r.consolidatedRating))) {
    return Math.round(Number(r.consolidatedRating) * 10) / 10;
  }

  // 4. Fallback to overallRating
  if (r.overallRating !== undefined && !isNaN(Number(r.overallRating))) {
    return Math.round(Number(r.overallRating) * 10) / 10;
  }

  return 5.0;
};

const getEffectiveHospitalId = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const qHid = urlParams.get('hospital_id');
    if (qHid && !isNaN(parseInt(qHid, 10))) return qHid;
  } catch (e) {}
  if ((window as any).ADMIN_HOSPITAL_ID) return String((window as any).ADMIN_HOSPITAL_ID);
  const saved = localStorage.getItem('selected_hospital_id');
  if (saved && !isNaN(parseInt(saved, 10))) return saved;
  return '1';
};

export function AdminDashboard({ 
  onClose, 
  onLogout, 
  onBrandingUpdate, 
  onQuestionsChange,
  onYesNoQuestionsChange,
  onDepartmentsChange,
  onLayoutModeChange, 
  onCombinePagesChange, 
  currentBranding 
}: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<SidebarItem>('overview');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [sortField, setSortField] = useState<'date' | 'patientName' | 'overallRating'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterRecommend, setFilterRecommend] = useState<'all' | 'yes' | 'no'>('all');
  const [filterVisitType, setFilterVisitType] = useState<'all' | 'OP' | 'IP'>('all');
  const [filterOfficeUse, setFilterOfficeUse] = useState<'all' | 'resolved' | 'unresolved'>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [formBuilderTab, setFormBuilderTab] = useState<FormBuilderTab>('service-feedback');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(currentBranding);
  const [logoPreview, setLogoPreview] = useState<string>(currentBranding.logo);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem('hms_saved_questions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return REAL_DB_QUESTIONS as Question[];
  });

  const [yesNoQuestions, setYesNoQuestions] = useState<Omit<Question, 'ratingMode' | 'category'>[]>(() => {
    try {
      const saved = localStorage.getItem('hms_saved_yesno');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return REAL_DB_YESNO;
  });

  const updateQuestions = (updated: Question[]) => {
    setQuestions(updated);
    try {
      localStorage.setItem('hms_saved_questions', JSON.stringify(updated));
    } catch (e) {}
    onQuestionsChange?.(updated);
  };

  const updateYesNoQuestions = (updated: any[]) => {
    setYesNoQuestions(updated);
    try {
      localStorage.setItem('hms_saved_yesno', JSON.stringify(updated));
    } catch (e) {}
    onYesNoQuestionsChange?.(updated);
  };

  const updateDepartments = (updated: string[]) => {
    setDepartments(updated);
    try {
      localStorage.setItem('hms_saved_departments', JSON.stringify(updated));
    } catch (e) {}
    onDepartmentsChange?.(updated);
  };

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingYesNoQuestion, setEditingYesNoQuestion] = useState<any | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showAddYesNoQuestion, setShowAddYesNoQuestion] = useState(false);
  const [newYesNoQuestion, setNewYesNoQuestion] = useState({ label: '', tamilLabel: '' });
  const [newQuestion, setNewQuestion] = useState<Omit<Question, 'id'>>({
    label: '',
    tamilLabel: '',
    ratingMode: 'emoji'
  });

  const [selectedResponse, setSelectedResponse] = useState<FeedbackResponse | null>(null);
  const [officeUseEditing, setOfficeUseEditing] = useState(false);
  const [officeUseByResponse, setOfficeUseByResponse] = useState<Record<string, OfficeUse>>({});
  const [officeUseModalResponse, setOfficeUseModalResponse] = useState<FeedbackResponse | null>(null);
  const [officeUseModalData, setOfficeUseModalData] = useState<OfficeUse>({ reviewOfComplaint: '', dateOfReview: '', correctiveAction: '', preventiveAction: '', inchargeName: '' });
  const [layoutMode, setLayoutMode] = useState<'2-column' | '1-column'>(() => {
    try {
      const saved = localStorage.getItem('hms_layout_mode');
      if (saved === '1-column' || saved === '2-column') return saved;
    } catch (e) {}
    return '2-column';
  });
  const [yesNoLayoutMode, setYesNoLayoutMode] = useState<'2-column' | '1-column'>('2-column');
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, boolean | null>>({});
  const [combinePages, setCombinePages] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('hms_combine_pages');
      if (saved !== null) return saved === 'true';
    } catch (e) {}
    return false;
  });
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const [themeColor, setThemeColor] = useState<string>('#0d9488');
  const [fontSize, setFontSize] = useState<string>('Normal');
  const [showPageTitleLabels, setShowPageTitleLabels] = useState<boolean>(true);
  const [departments, setDepartments] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hms_saved_departments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return REAL_DB_DEPARTMENTS;
  });
  const [newDepartment, setNewDepartment] = useState('');

  const [officeUse, setOfficeUse] = useState<OfficeUse>({
    reviewOfComplaint: '',
    dateOfReview: '',
    correctiveAction: '',
    preventiveAction: '',
    inchargeName: '',
  });

  const mockResponses: FeedbackResponse[] = [
    {
      uhid: 'UHID1234',
      patientName: 'Rajesh Kumar',
      date: '11/05/2024',
      overallRating: 5,
      wouldRecommend: true,
      ratings: {
        reception: 5,
        admission: 4,
        billing: 5,
        doctor: 5,
        nursing: 5,
        pharmacy: 4,
        lab: 5,
        insurance: 4,
        food: 3,
        physiotherapy: 5,
        bloodBank: 5,
        cleanliness: 5
      },
      yesNoAnswers: {
        cleanlinessIssue: false,
        costExplained: true,
        wouldRecommend: true
      },
      suggestions: 'Excellent service! The staff was very professional and caring.',
      appreciations: [
        { name: 'Dr. Sharma', department: 'Doctor', note: 'Very caring and knowledgeable' }
      ],
      visitType: 'IP',
      ipNumber: 'IP12345',
      ipDate: '2024-05-08',
      admissionDate: '2024-05-08',
      dischargeDate: '2024-05-11',
      mobile: '+91 98765 43210',
      email: 'rajesh.kumar@email.com',
      address: '45 MG Road, T Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600017',
      country: 'India',
      whyChooseUs: ['Self Decision', 'Friends / Relatives']
    },
    {
      uhid: 'UHID2345',
      patientName: 'Priya Menon',
      date: '12/05/2024',
      overallRating: 4,
      wouldRecommend: true,
      ratings: {
        reception: 4,
        admission: 4,
        billing: 4,
        doctor: 5,
        nursing: 4,
        pharmacy: 4,
        lab: 4,
        insurance: 3,
        food: 4,
        physiotherapy: 0,
        bloodBank: 0,
        cleanliness: 4
      },
      yesNoAnswers: {
        cleanlinessIssue: false,
        costExplained: true,
        wouldRecommend: true
      },
      suggestions: 'Good experience overall. Food quality could be improved.',
      appreciations: [],
      visitType: 'OP',
      opNumber: 'OP67890',
      opDate: '2024-05-12',
      mobile: '+91 98123 45678',
      email: 'priya.menon@email.com',
      address: '12 Anna Nagar West',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600040',
      country: 'India',
      whyChooseUs: ['Advertisement / News', 'Corporate']
    },
    {
      uhid: 'UHID3456',
      patientName: 'Mohammed Ali',
      date: '13/05/2024',
      overallRating: 4,
      wouldRecommend: true,
      ratings: {
        reception: 5,
        admission: 4,
        billing: 3,
        doctor: 5,
        nursing: 5,
        pharmacy: 4,
        lab: 4,
        insurance: 4,
        food: 3,
        physiotherapy: 4,
        bloodBank: 0,
        cleanliness: 5
      },
      yesNoAnswers: {
        cleanlinessIssue: false,
        costExplained: false,
        wouldRecommend: true
      },
      suggestions: 'Please explain costs more clearly at admission.',
      appreciations: [
        { name: 'Nurse Mary', department: 'Nursing', note: 'Very attentive and helpful' }
      ],
      visitType: 'IP',
      ipNumber: 'IP23456',
      ipDate: '2024-05-10',
      admissionDate: '2024-05-10',
      dischargeDate: '2024-05-13',
      mobile: '+91 99876 54321',
      email: 'mohammed.ali@email.com',
      address: '78 Velachery Main Road',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600042',
      country: 'India',
      whyChooseUs: ['Referral Doctor', 'Employee']
    }
  ];

  // Helper to reliably check recommendation status across all question formats and historical data
  const getIsRecommended = useCallback((r: FeedbackResponse): boolean => {
    if (r.rawYesNo && r.rawYesNo.length > 0) {
      const recObj = r.rawYesNo.find((y: any) => {
        const t = String(y.question_text || y.question_en || y.question_text_en || y.question_ta || '').toLowerCase();
        return t.includes('refer') || t.includes('recommend') || t.includes('family') || t.includes('friends') || t.includes('பரிந்துரை');
      });
      if (recObj) {
        const a = String(recObj.answer).toLowerCase();
        return (a === '1' || a === 'yes' || a === 'true' || a === 'ஆம்');
      }
    }
    if (r.yesNoAnswers && Object.keys(r.yesNoAnswers).length > 0) {
      for (const [k, v] of Object.entries(r.yesNoAnswers)) {
        const kStr = String(k).toLowerCase();
        if (kStr.includes('refer') || kStr.includes('recommend') || kStr.includes('family') || kStr.includes('friend') || kStr === '42' || kStr === '3') {
          if (v !== null && v !== undefined) {
            const ansObj = v as any;
            const a = typeof ansObj === 'object' ? String(ansObj.answer).toLowerCase() : String(ansObj).toLowerCase();
            return (a === '1' || a === 'yes' || a === 'true' || a === 'ஆம்');
          }
        }
      }
    }
    return r.wouldRecommend === true || (r.wouldRecommend as any) === 1 || String(r.wouldRecommend).toLowerCase() === 'yes';
  }, []);

  const [responses, setResponses] = useState<FeedbackResponse[]>(() => {
    try {
      const newSubs = JSON.parse(localStorage.getItem('hms_new_submissions') || '[]');
      if (Array.isArray(newSubs) && newSubs.length > 0) {
        return [...newSubs, ...(REAL_DB_RESPONSES as any[])];
      }
    } catch (e) {}
    return REAL_DB_RESPONSES as any[];
  });
  const [isLoadingResponses, setIsLoadingResponses] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [isRefreshingResponses, setIsRefreshingResponses] = useState<boolean>(false);

  const fetchResponses = useCallback(() => {
    setIsRefreshingResponses(true);
    const getApiUrl = (endpoint: string) => {
      const p = window.location.pathname;
      if (p.includes('api/backend/admin')) return `../ajax/${endpoint}`;
      if (p.includes('api/frontend')) return `../backend/ajax/${endpoint}`;
      return `/api/backend/ajax/${endpoint}`;
    };
    
    const hid = getEffectiveHospitalId();
    fetch(getApiUrl(`get-responses.php?hospital_id=${hid}`), { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setApiError(null);
          
          if (data.hospital) {
            setBrandingSettings({
              hospitalName: data.hospital.hospitalName || 'Apollo Healthcare Center',
              address: data.hospital.address || '123 Health Street, Chennai - 600001',
              contactNumber: data.hospital.contactNumber || '+91 44 1234 5678',
              email: data.hospital.email || 'contact@apollo.com',
              logo: data.hospital.logoUrl || ''
            });
          }
          
          const fetchedResponses: FeedbackResponse[] = data.data.map((item: any) => {
            const rawRatings = item.rawRatings || [];
            const rawYesNo = item.rawYesNo || [];
            
            let computedConsolidated = getConsolidatedRating(item);
            let exactOverall = getExactOverallRating(item);

            let computedRecommend = item.wouldRecommend !== undefined ? item.wouldRecommend : true;
            if (rawYesNo.length > 0) {
                const recObj = rawYesNo.find((y: any) => {
                  const t = String(y.question_text || y.question_en || y.question_text_en || y.question_ta || '').toLowerCase();
                  return t.includes('refer') || t.includes('recommend') || t.includes('family') || t.includes('friends') || t.includes('பரிந்துரை');
                });
                if (recObj) {
                    let ans = String(recObj.answer).toLowerCase();
                    computedRecommend = (ans === '1' || ans === 'yes' || ans === 'true' || ans === 'ஆம்');
                }
            }
            return {
              ...item,
              departmentName: item.departmentName || (item.visitType === 'IP' ? 'IPD / Inpatient' : 'OPD / Outpatient'),
              rawRatings: rawRatings,
              rawYesNo: rawYesNo,
              overallRating: exactOverall,
              consolidatedRating: computedConsolidated,
              wouldRecommend: computedRecommend !== undefined ? computedRecommend : true,
              ratings: item.ratings || {},
              yesNoAnswers: item.yesNoAnswers || {},
              appreciations: item.rawAppreciations || item.appreciations || [],
              whyChooseUs: item.whyChooseUs || []
            };
          });
          const initialOfficeUse: Record<string, OfficeUse> = {};
          data.data.forEach((item: any) => {
            if (item.officeUse && (item.officeUse.reviewOfComplaint || item.officeUse.dateOfReview || item.officeUse.inchargeName || item.officeUse.correctiveAction)) {
              initialOfficeUse[item.uhid || item.id] = {
                reviewOfComplaint: item.officeUse.reviewOfComplaint || '',
                dateOfReview: item.officeUse.dateOfReview || '',
                correctiveAction: item.officeUse.correctiveAction || '',
                preventiveAction: item.officeUse.preventiveAction || '',
                inchargeName: item.officeUse.inchargeName || ''
              };
            }
          });
          setOfficeUseByResponse(initialOfficeUse);
          let finalResponses = fetchedResponses;
          try {
            const newSubs = JSON.parse(localStorage.getItem('hms_new_submissions') || '[]');
            if (Array.isArray(newSubs) && newSubs.length > 0) {
              const fetchedUhids = new Set(fetchedResponses.map((r: any) => r.uhid));
              // Update localStorage to remove items that are already in fetchedResponses
              const remainingNewSubs = newSubs.filter((s: any) => !fetchedUhids.has(s.uhid));
              localStorage.setItem('hms_new_submissions', JSON.stringify(remainingNewSubs));
              finalResponses = [...remainingNewSubs, ...fetchedResponses];
            }
          } catch (e) {}
          setResponses(finalResponses);
        } else {
          // If no data from API, merge localStorage submissions with DB snapshot
          try {
            const newSubs = JSON.parse(localStorage.getItem('hms_new_submissions') || '[]');
            if (Array.isArray(newSubs) && newSubs.length > 0) {
              const snapUhids = new Set((REAL_DB_RESPONSES as any[]).map((r: any) => r.uhid));
              const uniqueNewSubs = newSubs.filter((s: any) => !snapUhids.has(s.uhid));
              setResponses([...uniqueNewSubs, ...(REAL_DB_RESPONSES as any[])]);
            }
          } catch (e) {}
        }
        setApiError(null);
      })
      .catch(e => {
        setApiError(null);
        try {
          const newSubs = JSON.parse(localStorage.getItem('hms_new_submissions') || '[]');
          if (Array.isArray(newSubs) && newSubs.length > 0) {
            const snapUhids = new Set((REAL_DB_RESPONSES as any[]).map((r: any) => r.uhid));
            const uniqueNewSubs = newSubs.filter((s: any) => !snapUhids.has(s.uhid));
            setResponses([...uniqueNewSubs, ...(REAL_DB_RESPONSES as any[])]);
          }
        } catch (err) {}
      })
      .finally(() => {
        setIsLoadingResponses(false);
        setIsRefreshingResponses(false);
      });
  }, []);

  useEffect(() => {
    fetchResponses();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'hms_new_submissions') {
        fetchResponses();
      }
    };
    const handleFocus = () => {
      fetchResponses();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchResponses]);

  useEffect(() => {
    const getApiUrl = (endpoint: string) => {
      const p = window.location.pathname;
      if (p.includes('api/backend/admin')) return `../ajax/${endpoint}`;
      if (p.includes('api/frontend')) return `../backend/ajax/${endpoint}`;
      return `/api/backend/ajax/${endpoint}`;
    };
    const hid = getEffectiveHospitalId();
    fetch(getApiUrl(`get-questions.php?hospital_id=${hid}`), { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          if (data.data && data.data.length > 0) setQuestions(data.data);
          if (data.yesno_data && data.yesno_data.length > 0) setYesNoQuestions(data.yesno_data);
          if (data.settings) {
            setLayoutMode(data.settings.layoutMode);
            setCombinePages(data.settings.combinePages);
            if (data.settings.themeColor) setThemeColor(data.settings.themeColor);
            if (data.settings.fontSize) setFontSize(data.settings.fontSize);
            if (data.settings.showPageTitleLabels !== undefined) setShowPageTitleLabels(data.settings.showPageTitleLabels);
            if (data.settings.departments) setDepartments(data.settings.departments);
          }
        }
      })
      .catch(console.error);
  }, []);

  const sidebarItems = [
    { id: 'overview' as SidebarItem, icon: <Home className="w-5 h-5" />, label: 'Overview' },
    { id: 'responses' as SidebarItem, icon: <MessageSquare className="w-5 h-5" />, label: 'Feedback Responses' },
    { id: 'feedback-report' as SidebarItem, icon: <FileText className="w-5 h-5" />, label: 'Feedback Report' },
    { id: 'branding' as SidebarItem, icon: <Image className="w-5 h-5" />, label: 'Branding Settings' },
    { id: 'form-builder' as SidebarItem, icon: <Layout className="w-5 h-5" />, label: 'Form Builder' }
  ];

  const handleLogoClick = () => {
    logoInputRef.current?.click();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setBrandingSettings({ ...brandingSettings, logo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const [isSavingBranding, setIsSavingBranding] = useState(false);

  const handlePrintFeedbackDetail = () => {
    if (!selectedResponse) return;

    const uhid = selectedResponse.uhid || 'NO_UHID';
    
    // Format Date to YYYY-MM-DD
    let formattedDate = '';
    if (selectedResponse.submittedAt) {
      const dt = new Date(selectedResponse.submittedAt);
      if (!isNaN(dt.getTime())) {
        const yyyy = dt.getFullYear();
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const dd = String(dt.getDate()).padStart(2, '0');
        formattedDate = `${yyyy}-${mm}-${dd}`;
      }
    }
    if (!formattedDate && selectedResponse.date) {
      const parts = selectedResponse.date.split('/');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      } else {
        formattedDate = selectedResponse.date.replace(/[\/\\]/g, '-');
      }
    }
    if (!formattedDate) {
      const now = new Date();
      formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    const visitType = (selectedResponse.visitType === 'IP' || selectedResponse.ipNumber) ? 'IP' : 'OP';
    const printDocTitle = `${uhid}_${formattedDate}_${visitType}`;

    const originalTitle = document.title;
    document.title = printDocTitle;

    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const handleSaveBranding = async () => {
    setIsSavingBranding(true);
    try {
      const getApiUrl = (endpoint: string) => {
        const p = window.location.pathname;
        if (p.includes('api/backend/admin')) return `../ajax/${endpoint}`;
        if (p.includes('api/frontend')) return `../backend/ajax/${endpoint}`;
        return `../api/backend/ajax/${endpoint}`;
      };

      const apiUrl = getApiUrl('save-branding.php');
      
      const formData = new FormData();
      formData.append('hospitalName', brandingSettings.hospitalName);
      formData.append('address', brandingSettings.address);
      formData.append('contactNumber', brandingSettings.contactNumber);
      formData.append('email', brandingSettings.email);
      if (brandingSettings.logo) {
        formData.append('logo', brandingSettings.logo);
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        credentials: 'same-origin',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        onBrandingUpdate(brandingSettings);
        toast.success('Changes saved successfully');
      } else {
        toast.error(data.message || 'Failed to save branding');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error while saving branding');
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
  };

  const handleSaveEdit = () => {
    if (editingQuestion) {
      const updated = questions.map(q => q.id === editingQuestion.id ? editingQuestion : q);
      updateQuestions(updated);
      setEditingQuestion(null);
      toast.success('Question updated successfully');
    }
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      const updated = questions.filter(q => q.id !== id);
      updateQuestions(updated);
      toast.success('Question deleted successfully');
    }
  };

  const handleAddQuestion = () => {
    const newId = `new_${Date.now()}`;
    const updated = [...questions, { id: newId, ...newQuestion }];
    updateQuestions(updated);
    setNewQuestion({ label: '', tamilLabel: '', ratingMode: 'emoji' });
    setShowAddQuestion(false);
    toast.success('Question added successfully');
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const updated = arrayMove(items, oldIndex, newIndex);
        try { localStorage.setItem('hms_saved_questions', JSON.stringify(updated)); } catch (e) {}
        onQuestionsChange?.(updated);
        return updated;
      });
    }
  };

  const [isSavingQuestions, setIsSavingQuestions] = useState(false);

  const handleSaveQuestions = async () => {
    setIsSavingQuestions(true);
    // Persist immediately to localStorage
    try {
      localStorage.setItem('hms_saved_questions', JSON.stringify(questions));
      localStorage.setItem('hms_saved_yesno', JSON.stringify(yesNoQuestions));
      localStorage.setItem('hms_saved_departments', JSON.stringify(departments));
      localStorage.setItem('hms_saved_settings', JSON.stringify({
        layoutMode,
        combinePages,
        themeColor,
        fontSize,
        showPageTitleLabels,
        departments
      }));
    } catch (e) {}
    try {
      const getApiUrl = (endpoint: string) => {
        const p = window.location.pathname;
        if (p.includes('api/backend/admin')) return `../ajax/${endpoint}`;
        if (p.includes('api/frontend')) return `../backend/ajax/${endpoint}`;
        return `/api/backend/ajax/${endpoint}`;
      };

      const hid = getEffectiveHospitalId();
      const apiUrl = getApiUrl('save-questions.php');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ 
          hospital_id: hid,
          questions, 
          yesno_questions: yesNoQuestions,
          departments,
          settings: {
            layoutMode,
            combinePages,
            themeColor,
            fontSize,
            showPageTitleLabels,
            departments
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Form configuration saved successfully!');
        
        const finalRatingQs = (Array.isArray(data.data) && data.data.length > 0) ? data.data : questions;
        const finalYesNoQs = (Array.isArray(data.yesno_data) && data.yesno_data.length > 0) ? data.yesno_data : yesNoQuestions;
        const finalDepts = (Array.isArray(data.departments) && data.departments.length > 0) ? data.departments : departments;

        setQuestions(finalRatingQs);
        onQuestionsChange?.(finalRatingQs);
        try { localStorage.setItem('hms_saved_questions', JSON.stringify(finalRatingQs)); } catch (e) {}

        setYesNoQuestions(finalYesNoQs);
        onYesNoQuestionsChange?.(finalYesNoQs);
        try { localStorage.setItem('hms_saved_yesno', JSON.stringify(finalYesNoQs)); } catch (e) {}

        setDepartments(finalDepts);
        onDepartmentsChange?.(finalDepts);
        try { localStorage.setItem('hms_saved_departments', JSON.stringify(finalDepts)); } catch (e) {}
      } else {
        toast.error(data.message || 'Failed to save questions');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error while saving questions');
    } finally {
      setIsSavingQuestions(false);
    }
  };

  
  // Stats calculations
  const validTotal = responses.length;
  let recommendCount = 0;
  let ratingSum = 0;
  let ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let todayCount = 0;
  const todayObj = new Date();
  const d = String(todayObj.getDate()).padStart(2, '0');
  const m = String(todayObj.getMonth() + 1).padStart(2, '0');
  const y = String(todayObj.getFullYear());
  const todayStr = `${d}/${m}/${y}`;

  responses.forEach(r => {
     if (getIsRecommended(r)) recommendCount++;
     let rVal = Math.round(r.overallRating || 0);
     if (rVal < 1 && (r.overallRating || 0) > 0) rVal = 1;
     if (rVal > 5) rVal = 5;
     ratingSum += (r.overallRating || 0);
     if (rVal >= 1 && rVal <= 5) (ratingCounts as any)[rVal]++;
     if (r.date === todayStr) todayCount++;
  });

  const recommendRate = validTotal ? Math.round((recommendCount / validTotal) * 100) : 0;
  const averageRatingStr = validTotal ? (ratingSum / validTotal).toFixed(1) : "0.0";
  const averageRatingNum = parseFloat(averageRatingStr);
  const recentActivities = responses.slice(0, 5);

  const starBreakdowns = [5, 4, 3, 2, 1].map(stars => ({
      stars,
      percentage: validTotal > 0 ? ((ratingCounts as any)[stars] / validTotal) * 100 : 0
  }));

  // Feedback Report State
  const [reportDept, setReportDept] = useState<string>('all');
  const [reportSearch, setReportSearch] = useState<string>('');
  const [reportViewTab, setReportViewTab] = useState<'all' | 'ratings' | 'yesno' | 'resolved' | 'unresolved'>('all');
  const [expandedRemarksQId, setExpandedRemarksQId] = useState<string | null>(null);
  const [reportFromDate, setReportFromDate] = useState<string>('');
  const [reportToDate, setReportToDate] = useState<string>('');

  // Helper to parse rating value to number (1-5)
  const parseRatingVal = (r: any): number => {
    if (!r) return 0;
    const s = String(r).toLowerCase().trim();
    if (s === 'excellent' || s === '5') return 5;
    if (s === 'good' || s === '4') return 4;
    if (s === 'average' || s === '3') return 3;
    if (s === 'poor' || s === '2') return 2;
    if (s === 'bad' || s === '1') return 1;
    const n = parseInt(s);
    return isNaN(n) ? 0 : Math.min(5, Math.max(1, n));
  };

  const isYesAnswer = (a: any): boolean => {
    if (a === true || a === 1) return true;
    const s = String(a).toLowerCase().trim();
    return s === 'yes' || s === '1' || s === 'true' || s === 'ஆம்';
  };

  const isNoAnswer = (a: any): boolean => {
    if (a === false || a === 0) return true;
    const s = String(a).toLowerCase().trim();
    return s === 'no' || s === '0' || s === 'false' || s === 'இல்லை';
  };

  // All distinct departments available
  const availableDepartments = useMemo(() => {
    const set = new Set<string>();
    departments.forEach(d => { if (d.trim()) set.add(d.trim()); });
    responses.forEach(r => {
      const dName = r.departmentName || (r.visitType === 'IP' ? 'IPD / Inpatient' : 'OPD / Outpatient');
      if (dName && dName.trim()) set.add(dName.trim());
    });
    if (set.size === 0) {
      set.add('OPD / Outpatient');
      set.add('IPD / Inpatient');
    }
    return Array.from(set);
  }, [responses, departments]);

  // Department-Wise Feedback Report Data Aggregation
  // Department-Wise & Hospital Overall Feedback Report Data Aggregation
  const departmentReportData = useMemo(() => {
    let filtered = [...responses];
    const effectiveFrom = reportFromDate || fromDate;
    const effectiveTo = reportToDate || toDate;

    if (effectiveFrom || effectiveTo) {
      filtered = filtered.filter(res => {
        const parts = String(res.date).split('/');
        if (parts.length === 3) {
          const rDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
          if (effectiveFrom && rDate < effectiveFrom) return false;
          if (effectiveTo && rDate > effectiveTo) return false;
        }
        return true;
      });
    }

    const normKey = (s: any): string => {
      if (!s) return '';
      return String(s).toLowerCase().replace(/[^a-z0-9\u0B80-\u0BFF]/g, '').trim();
    };

    const processGroup = (groupTitle: string, groupResponses: typeof responses, isHospitalOverall: boolean = false) => {
      const totalDeptResponses = groupResponses.length;

      // 1. Rating Questions Map (Active + Historical/Deleted from Form Builder)
      const ratingMap = new Map<string, {
        id: string;
        label: string;
        tamilLabel?: string;
        count5: number;
        count4: number;
        count3: number;
        count2: number;
        count1: number;
        totalRated: number;
        sumScores: number;
        isDeleted?: boolean;
      }>();

      // Initialize with configured active questions
      questions.forEach(q => {
        ratingMap.set(String(q.id), {
          id: String(q.id),
          label: q.label,
          tamilLabel: q.tamilLabel,
          count5: 0, count4: 0, count3: 0, count2: 0, count1: 0,
          totalRated: 0, sumScores: 0,
          isDeleted: false
        });
      });

      // Aggregate responses and auto-discover historical/deleted questions
      groupResponses.forEach(r => {
        let hasCountedRating = false;
        if (r.rawRatings && r.rawRatings.length > 0) {
          r.rawRatings.forEach(item => {
            const qId = String(item.question_id || '');
            const qTxt = (item.question_text || (item as any).question_text_en || '').trim();
            const score = parseRatingVal(item.rating);

            if (score >= 1 && score <= 5) {
              let entry = ratingMap.get(qId);
              if (!entry && qTxt) {
                const targetNorm = normKey(qTxt);
                for (const val of ratingMap.values()) {
                  if (normKey(val.label) === targetNorm || (val.tamilLabel && normKey(val.tamilLabel) === targetNorm)) {
                    entry = val;
                    break;
                  }
                }
              }

              // If deleted from active form builder, create/preserve historical entry so past data is retained
              if (!entry && (qId || qTxt)) {
                const effectiveId = qId || `hist_rq_${qTxt}`;
                const effectiveLabel = qTxt || `Rating Question ${qId}`;
                const effectiveTa = (item as any).question_text_ta || (item as any).tamil_text || '';
                entry = {
                  id: effectiveId,
                  label: effectiveLabel,
                  tamilLabel: effectiveTa,
                  count5: 0, count4: 0, count3: 0, count2: 0, count1: 0,
                  totalRated: 0, sumScores: 0,
                  isDeleted: true
                };
                ratingMap.set(effectiveId, entry);
              }

              if (entry) {
                if (score === 5) entry.count5++;
                else if (score === 4) entry.count4++;
                else if (score === 3) entry.count3++;
                else if (score === 2) entry.count2++;
                else if (score === 1) entry.count1++;

                entry.totalRated++;
                entry.sumScores += score;
                hasCountedRating = true;
              }
            }
          });
        }

        // Fallback distribution across active questions if rawRatings empty
        if (!hasCountedRating && (r.overallRating || (r.ratings && Object.keys(r.ratings).length > 0))) {
          const overallScore = Math.min(5, Math.max(1, Math.round(Number(r.overallRating || 5))));
          questions.forEach(q => {
            const entry = ratingMap.get(String(q.id));
            if (entry) {
              if (overallScore === 5) entry.count5++;
              else if (overallScore === 4) entry.count4++;
              else if (overallScore === 3) entry.count3++;
              else if (overallScore === 2) entry.count2++;
              else if (overallScore === 1) entry.count1++;

              entry.totalRated++;
              entry.sumScores += overallScore;
            }
          });
        }
      });

      const ratingQuestionsList = Array.from(ratingMap.values())
        .filter(q => !q.isDeleted || q.totalRated > 0)
        .map(q => {
          const avg = q.totalRated > 0 ? (q.sumScores / q.totalRated) : 0;
          const pctPositive = q.totalRated > 0 ? (((q.count5 + q.count4) / q.totalRated) * 100) : 0;
          return {
            ...q,
            averageScore: parseFloat(avg.toFixed(1)),
            percentagePositive: Math.round(pctPositive),
            pct5: q.totalRated > 0 ? Math.round((q.count5 / q.totalRated) * 100) : 0,
            pct4: q.totalRated > 0 ? Math.round((q.count4 / q.totalRated) * 100) : 0,
            pct3: q.totalRated > 0 ? Math.round((q.count3 / q.totalRated) * 100) : 0,
            pct2: q.totalRated > 0 ? Math.round((q.count2 / q.totalRated) * 100) : 0,
            pct1: q.totalRated > 0 ? Math.round((q.count1 / q.totalRated) * 100) : 0,
          };
        })
        .sort((a, b) => (a.isDeleted ? 1 : 0) - (b.isDeleted ? 1 : 0))
        .filter(q => {
          if (!reportSearch) return true;
          const query = reportSearch.toLowerCase();
          return q.label.toLowerCase().includes(query) || (q.tamilLabel && q.tamilLabel.toLowerCase().includes(query));
        });

      // 2. Yes/No Questions Map (Active + Historical/Deleted from Form Builder)
      const yesNoMap = new Map<string, {
        id: string;
        label: string;
        tamilLabel?: string;
        yesCount: number;
        noCount: number;
        totalAnswered: number;
        remarks: Array<{ patientName: string; uhid: string; date: string; text: string }>;
        isDeleted?: boolean;
      }>();

      yesNoQuestions.forEach(yq => {
        yesNoMap.set(String(yq.id), {
          id: String(yq.id),
          label: yq.label,
          tamilLabel: yq.tamilLabel,
          yesCount: 0,
          noCount: 0,
          totalAnswered: 0,
          remarks: [],
          isDeleted: false
        });
      });

      // Aggregate responses and preserve deleted/historical Yes/No questions
      groupResponses.forEach(r => {
        let hasCountedYesNo = false;
        if (r.rawYesNo && r.rawYesNo.length > 0) {
          r.rawYesNo.forEach(yn => {
            const yId = String(yn.yesno_question_id || '');
            const yTxt = (yn.question_en || yn.question_text || yn.question_ta || '').trim();
            const ans = yn.answer;

            let entry = yesNoMap.get(yId);
            if (!entry && (yn.question_en || yn.question_text || yn.question_ta)) {
              const targetEnNorm = normKey(yn.question_en || yn.question_text);
              const targetTaNorm = normKey(yn.question_ta);
              for (const val of yesNoMap.values()) {
                const valLabelNorm = normKey(val.label);
                const valTamilNorm = normKey(val.tamilLabel);
                if ((targetEnNorm && valLabelNorm === targetEnNorm) ||
                    (targetTaNorm && valTamilNorm && valTamilNorm === targetTaNorm) ||
                    (targetEnNorm && valTamilNorm && valTamilNorm === targetEnNorm) ||
                    (targetTaNorm && valLabelNorm === targetTaNorm)) {
                  entry = val;
                  break;
                }
              }
            }

            // If deleted from active form builder, create/preserve historical entry so past data is retained
            if (!entry && (yId || yTxt)) {
              const effectiveId = yId || `hist_yq_${yTxt}`;
              const effectiveLabel = yTxt || `Yes/No Question ${yId}`;
              const effectiveTa = yn.question_ta || '';
              entry = {
                id: effectiveId,
                label: effectiveLabel,
                tamilLabel: effectiveTa,
                yesCount: 0,
                noCount: 0,
                totalAnswered: 0,
                remarks: [],
                isDeleted: true
              };
              yesNoMap.set(effectiveId, entry);
            }

            if (entry) {
              if (isYesAnswer(ans)) {
                entry.yesCount++;
                entry.totalAnswered++;
                hasCountedYesNo = true;
              } else if (isNoAnswer(ans)) {
                entry.noCount++;
                entry.totalAnswered++;
                hasCountedYesNo = true;
              }

              if (yn.remarks && String(yn.remarks).trim()) {
                entry.remarks.push({
                  patientName: r.patientName,
                  uhid: r.uhid,
                  date: r.date,
                  text: String(yn.remarks).trim()
                });
              }
            }
          });
        }

        if (!hasCountedYesNo && r.wouldRecommend !== undefined) {
          yesNoQuestions.forEach(yq => {
            const entry = yesNoMap.get(String(yq.id));
            if (entry) {
              if (r.wouldRecommend) entry.yesCount++;
              else entry.noCount++;
              entry.totalAnswered++;
            }
          });
        }
      });

      const yesNoQuestionsList = Array.from(yesNoMap.values())
        .filter(yq => !yq.isDeleted || yq.totalAnswered > 0)
        .map(yq => {
          const yesPct = yq.totalAnswered > 0 ? Math.round((yq.yesCount / yq.totalAnswered) * 100) : 0;
          const noPct = yq.totalAnswered > 0 ? Math.round((yq.noCount / yq.totalAnswered) * 100) : 0;
          return {
            ...yq,
            yesPercent: yesPct,
            noPercent: noPct,
          };
        })
        .sort((a, b) => (a.isDeleted ? 1 : 0) - (b.isDeleted ? 1 : 0))
        .filter(yq => {
          if (!reportSearch) return true;
          const query = reportSearch.toLowerCase();
          return yq.label.toLowerCase().includes(query) || 
                 (yq.tamilLabel && yq.tamilLabel.toLowerCase().includes(query)) ||
                 yq.remarks.some(rem => rem.text.toLowerCase().includes(query) || rem.patientName.toLowerCase().includes(query));
        });

      // Overall Department Metrics
      let deptSumScores = 0;
      let deptTotalRatedCount = 0;
      ratingQuestionsList.forEach(rq => {
        deptSumScores += rq.sumScores;
        deptTotalRatedCount += rq.totalRated;
      });
      const deptOverallAvg = deptTotalRatedCount > 0 ? (deptSumScores / deptTotalRatedCount).toFixed(1) : '5.0';

      let deptTotalYes = 0;
      let deptTotalYesNoAnswers = 0;
      yesNoQuestionsList.forEach(yq => {
        deptTotalYes += yq.yesCount;
        deptTotalYesNoAnswers += yq.totalAnswered;
      });
      const deptOverallYesPercent = deptTotalYesNoAnswers > 0 
        ? Math.round((deptTotalYes / deptTotalYesNoAnswers) * 100) 
        : 100;

      return {
        departmentName: groupTitle,
        isHospitalOverall,
        totalResponses: totalDeptResponses,
        overallAvgRating: parseFloat(deptOverallAvg),
        overallYesPercent: deptOverallYesPercent,
        ratingQuestions: ratingQuestionsList,
        yesNoQuestions: yesNoQuestionsList,
      };
    };

    const results: ReturnType<typeof processGroup>[] = [];

    if (reportDept === 'all') {
      // 1. Overall Hospital Summary section (All Departments Consolidated)
      results.push(processGroup('Hospital Overall Summary (All Departments)', filtered, true));

      // 2. Department Breakdown sections
      availableDepartments.forEach(deptName => {
        const deptResponses = filtered.filter(r => {
          const d = r.departmentName || (r.visitType === 'IP' ? 'IPD / Inpatient' : 'OPD / Outpatient');
          return d.toLowerCase().trim() === deptName.toLowerCase().trim();
        });
        if (deptResponses.length > 0) {
          results.push(processGroup(deptName, deptResponses, false));
        }
      });
    } else {
      const deptResponses = filtered.filter(r => {
        const d = r.departmentName || (r.visitType === 'IP' ? 'IPD / Inpatient' : 'OPD / Outpatient');
        return d.toLowerCase().trim() === reportDept.toLowerCase().trim();
      });
      results.push(processGroup(reportDept, deptResponses, false));
    }

    return results;
  }, [responses, availableDepartments, reportDept, reportFromDate, reportToDate, fromDate, toDate, questions, yesNoQuestions, reportSearch]);

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Department,Question Type,Question (English),Question (Tamil),Total Responses,Average Rating / Yes %,Breakdown (5★/4★/3★/2★/1★ or Yes/No Counts)\n";

    departmentReportData.forEach(dept => {
      dept.ratingQuestions.forEach(rq => {
        const row = [
          `"${dept.departmentName}"`,
          '"Rating Question"',
          `"${rq.label.replace(/"/g, '""')}"`,
          `"${(rq.tamilLabel || '').replace(/"/g, '""')}"`,
          rq.totalRated,
          `"${rq.averageScore} / 5.0"`,
          `"5★:${rq.count5} (${rq.pct5}%), 4★:${rq.count4} (${rq.pct4}%), 3★:${rq.count3} (${rq.pct3}%), 2★:${rq.count2} (${rq.pct2}%), 1★:${rq.count1} (${rq.pct1}%)"`
        ];
        csvContent += row.join(',') + "\n";
      });

      dept.yesNoQuestions.forEach(yq => {
        const row = [
          `"${dept.departmentName}"`,
          '"Yes/No Question"',
          `"${yq.label.replace(/"/g, '""')}"`,
          `"${(yq.tamilLabel || '').replace(/"/g, '""')}"`,
          yq.totalAnswered,
          `"${yq.yesPercent}% Yes"`,
          `"Yes:${yq.yesCount} (${yq.yesPercent}%), No:${yq.noCount} (${yq.noPercent}%), Remarks:${yq.remarks.length}"`
        ];
        csvContent += row.join(',') + "\n";
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Feedback_Report_${brandingSettings.hospitalName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Feedback Report CSV exported successfully!');
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterSearch && filterSearch.trim()) count++;
    if (fromDate) count++;
    if (toDate) count++;
    if (filterRating !== 'all') count++;
    if (filterRecommend !== 'all') count++;
    if (filterVisitType !== 'all') count++;
    if (filterOfficeUse !== 'all') count++;
    if (filterDepartment !== 'all') count++;
    return count;
  }, [filterSearch, fromDate, toDate, filterRating, filterRecommend, filterVisitType, filterOfficeUse, filterDepartment]);

  const handleResetFilters = () => {
    setFilterSearch('');
    setFromDate('');
    setToDate('');
    setFilterRating('all');
    setFilterRecommend('all');
    setFilterVisitType('all');
    setFilterOfficeUse('all');
    setFilterDepartment('all');
    setSortField('date');
    setSortDirection('desc');
    toast.success('All filters reset');
  };

  // Filtering & Sorting
  const filteredAndSortedResponses = useMemo(() => {
    let result = [...responses];

    // Search query filter (Patient Name, UHID, Mobile, Email, Suggestions)
    if (filterSearch && filterSearch.trim()) {
      const q = filterSearch.toLowerCase().trim();
      result = result.filter(res => 
        (res.patientName && String(res.patientName).toLowerCase().includes(q)) ||
        (res.uhid && String(res.uhid).toLowerCase().includes(q)) ||
        (res.mobile && String(res.mobile).includes(q)) ||
        (res.email && String(res.email).toLowerCase().includes(q)) ||
        (res.suggestions && String(res.suggestions).toLowerCase().includes(q)) ||
        (res.departmentName && String(res.departmentName).toLowerCase().includes(q))
      );
    }

    // Date range filter
    if (fromDate || toDate) {
      result = result.filter(res => {
        const rawDate = String(res.date || res.submittedAt || '').trim();
        let rDate = '';
        if (rawDate.includes('/')) {
          const parts = rawDate.split('/');
          if (parts.length === 3) {
            rDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        } else if (rawDate.includes('-')) {
          rDate = rawDate.split('T')[0];
        }
        if (rDate) {
          if (fromDate && rDate < fromDate) return false;
          if (toDate && rDate > toDate) return false;
        }
        return true;
      });
    }

    // Rating filter
    if (filterRating !== 'all') {
      result = result.filter(res => {
        const r = Number(res.overallRating || 0);
        if (filterRating === '5') return r >= 4.5;
        if (filterRating === '4') return r >= 3.5 && r < 4.5;
        if (filterRating === '3') return r >= 2.5 && r < 3.5;
        if (filterRating === '2') return r >= 1.5 && r < 2.5;
        if (filterRating === '1') return r < 1.5;
        if (filterRating === 'high') return r >= 4.0;
        if (filterRating === 'low') return r <= 2.5;
        return true;
      });
    }

    // Recommend filter
    if (filterRecommend !== 'all') {
      result = result.filter(res => {
        if (filterRecommend === 'yes') return getIsRecommended(res) === true;
        if (filterRecommend === 'no') return getIsRecommended(res) === false;
        return true;
      });
    }

    // Visit Type filter
    if (filterVisitType !== 'all') {
      result = result.filter(res => String(res.visitType || '').toUpperCase() === filterVisitType);
    }

    // Office Use filter
    if (filterOfficeUse !== 'all') {
      result = result.filter(res => {
        const isResolved = !!(officeUseByResponse[res.uhid]?.reviewOfComplaint || officeUseByResponse[res.uhid]?.inchargeName);
        if (filterOfficeUse === 'resolved') return isResolved;
        if (filterOfficeUse === 'unresolved') return !isResolved;
        return true;
      });
    }

    // Department filter
    if (filterDepartment !== 'all') {
      result = result.filter(res => {
        const dept = (res.departmentName || '').toLowerCase().trim();
        return dept === filterDepartment.toLowerCase().trim();
      });
    }

    // Sort
    result.sort((a, b) => {
      let comp = 0;
      if (sortField === 'date') {
        const aP = String(a.date).split('/');
        const bP = String(b.date).split('/');
        const tA = (aP.length === 3) ? new Date(`${aP[2]}-${aP[1]}-${aP[0]}`).getTime() : 0;
        const tB = (bP.length === 3) ? new Date(`${bP[2]}-${bP[1]}-${bP[0]}`).getTime() : 0;
        comp = tA > tB ? 1 : tA < tB ? -1 : 0;
      } else if (sortField === 'patientName') {
        comp = (String(a.patientName || '')).localeCompare(String(b.patientName || ''));
      } else if (sortField === 'overallRating') {
        comp = (Number(a.overallRating) || 0) - (Number(b.overallRating) || 0);
      }
      return sortDirection === 'desc' ? -comp : comp;
    });

    return result;
  }, [responses, filterSearch, fromDate, toDate, filterRating, filterRecommend, filterVisitType, filterOfficeUse, filterDepartment, sortField, sortDirection, officeUseByResponse]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Modern Sidebar with Gradient */}
      <div className={`bg-gradient-to-b from-teal-700 to-teal-900 shadow-2xl transition-all duration-300 flex-shrink-0 flex flex-col ${sidebarCollapsed ? 'w-20' : 'w-[260px]'}`}>
        {/* Logo/Brand Section */}
        <div className="p-6 border-b border-white/20 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {brandingSettings.logo ? (
                  <img src={brandingSettings.logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Hospital className="w-6 h-6 text-teal-700" />
                )}
              </div>
              <div className="overflow-hidden">
                <h2 className="text-lg font-bold text-white truncate" title={brandingSettings.hospitalName}>{brandingSettings.hospitalName}</h2>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto overflow-hidden">
              {brandingSettings.logo ? (
                <img src={brandingSettings.logo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Hospital className="w-6 h-6 text-teal-700" />
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-white text-teal-700 font-semibold shadow-lg border-l-4 border-white'
                  : 'text-white hover:bg-white/10'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              {item.icon}
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 space-y-2 border-t border-white/20">
          <button
            onClick={() => {
              if (onClose) {
                onClose();
              } else {
                const hid = getEffectiveHospitalId();
                const p = window.location.pathname;
                let formUrl = `../../frontend/feedback-form.php?hospital_id=${hid}`;
                if (p.includes('api/frontend')) {
                  formUrl = `feedback-form.php?hospital_id=${hid}`;
                } else if (!p.includes('api/backend/admin')) {
                  formUrl = `api/frontend/feedback-form.php?hospital_id=${hid}`;
                }
                window.location.href = formUrl;
              }
            }}
            className={`w-full text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm flex items-center gap-2 cursor-pointer ${sidebarCollapsed ? 'justify-center' : ''}`}
            title="Return to Feedback Form"
          >
            <ChevronLeft className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && 'Back to Form'}
          </button>
          <button
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                const p = window.location.pathname;
                if (p.includes('api/backend/admin')) {
                  window.location.href = 'logout.php';
                } else if (p.includes('api/frontend')) {
                  window.location.href = '../backend/admin/login.php';
                } else {
                  window.location.href = 'api/backend/admin/login.php';
                }
              }
            }}
            className={`w-full bg-red-500/20 text-white px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors text-sm flex items-center gap-2 cursor-pointer ${sidebarCollapsed ? 'justify-center' : ''}`}
            title="Logout to Hospital Login"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Administrator</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div>
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                  <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
                  <button
                    onClick={() => { fetchResponses(); toast.success('Dashboard refreshed'); }}
                    disabled={isRefreshingResponses}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-sm font-medium rounded-xl shadow-sm transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshingResponses ? 'animate-spin' : ''}`} />
                    {isRefreshingResponses ? 'Refreshing...' : 'Refresh Data'}
                  </button>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Total Responses */}
                  <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-teal-500 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center">
                        <MessageSquare className="w-7 h-7 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Total Responses</p>
                        <p className="text-3xl font-bold text-gray-900">{responses.length}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-green-600 font-medium">↑ 8% this month</div>
                  </div>

                  {/* Recommend Rate */}
                  <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                        <ThumbsUp className="w-7 h-7 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Recommend Rate</p>
                        <p className="text-3xl font-bold text-gray-900">{recommendRate}%</p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-green-600 font-medium">↑ 2% this week</div>
                  </div>

                  {/* Average Rating - Google Play Style */}
                  <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
                    <p className="text-sm text-gray-600 font-medium mb-4">Average Rating</p>
                    <div className="flex items-start gap-6">
                      <div className="flex flex-col items-center">
                        <div className="text-5xl font-bold text-gray-900">{averageRatingStr}</div>
                        <div className="flex items-center gap-0.5 mt-2">
                          {[1, 2, 3, 4].map((i) => (
                            <Star key={i} className="w-4 h-4 fill-teal-600 text-teal-600" />
                          ))}
                          <Star className="w-4 h-4 fill-teal-600 text-teal-600" style={{ clipPath: 'inset(0 50% 0 0)' }} />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{validTotal} ratings</div>
                      </div>
                      <div className="flex-1 space-y-1">
                        {starBreakdowns.map((item) => (
                          <div key={item.stars} className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 w-2">{item.stars}</span>
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-teal-600 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Today's Responses */}
                  <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-7 h-7 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Today's Responses</p>
                        <p className="text-3xl font-bold text-gray-900">{todayCount}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-green-600 font-medium">↑ 12% vs yesterday</div>
                  </div>
                </div>

                {/* Recent Activity Placeholder */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4 pt-2">
  {recentActivities.map((act: any, i: number) => (
      <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100 shadow-sm">
         <span className="font-medium text-gray-800">{act.patientName || 'Anonymous'}</span>
         <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{act.date}</span>
      </div>
  ))}
  {recentActivities.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No recent activity found.</p>}
</div>
                </div>
              </div>
            )}

            {/* Branding Settings with Preview */}
            {activeSection === 'branding' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Branding Settings</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Settings Panel */}
                  <div className="bg-white rounded-2xl shadow-md p-8 border-l-4 border-teal-500">
                    <div className="bg-teal-50 rounded-lg px-4 py-3 mb-6 border-l-4 border-teal-500">
                      <h3 className="text-lg font-bold text-gray-900">Hospital Information</h3>
                    </div>

                    <div className="space-y-6">


                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
                        <input
                          type="text"
                          value={brandingSettings.hospitalName}
                          onChange={(e) => setBrandingSettings({ ...brandingSettings, hospitalName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <textarea
                          value={brandingSettings.address}
                          onChange={(e) => setBrandingSettings({ ...brandingSettings, address: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                        <input
                          type="tel"
                          value={brandingSettings.contactNumber}
                          onChange={(e) => setBrandingSettings({ ...brandingSettings, contactNumber: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={brandingSettings.email}
                          onChange={(e) => setBrandingSettings({ ...brandingSettings, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>

                      <div className="pt-6">
                        <button
                          onClick={handleSaveBranding}
                          disabled={isSavingBranding}
                          className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg transition-all transform shadow-lg ${isSavingBranding ? 'opacity-70 cursor-not-allowed' : 'hover:bg-teal-700 hover:scale-105'}`}
                        >
                          <Save className="w-5 h-5" />
                          {isSavingBranding ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Live Preview Panel */}
                  <div className="bg-white rounded-2xl shadow-md p-8 border-l-4 border-blue-500">
                    <div className="bg-blue-50 rounded-lg px-4 py-3 mb-6 border-l-4 border-blue-500">
                      <h3 className="text-lg font-bold text-gray-900">Header Preview</h3>
                      <p className="text-sm text-gray-600">See how your branding will look</p>
                    </div>

                    <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
                      <div className="bg-white shadow-md rounded-lg p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                            {logoPreview ? (
                              <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                            ) : (
                              <Hospital className="w-8 h-8 text-white" />
                            )}
                          </div>
                          <div>
                            <h1 className="text-xl font-bold text-gray-900">
                              {brandingSettings.hospitalName || 'Hospital Name'}
                            </h1>
                            <p className="text-sm text-gray-600">
                              {brandingSettings.address || 'Hospital Address'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Contact Number</p>
                        <p className="font-semibold text-gray-900">{brandingSettings.contactNumber || 'Not set'}</p>
                      </div>

                      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="font-semibold text-gray-900">{brandingSettings.email || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Builder with Improvements */}
            {activeSection === 'form-builder' && (
              <div className="pb-24">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">Form Builder</h2>
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg font-semibold">
                      {questions.length} Questions Configured
                    </div>
                    <button
                      onClick={handleSaveQuestions}
                      disabled={isSavingQuestions}
                      className={`flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg transition-all shadow-md ${isSavingQuestions ? 'opacity-70 cursor-not-allowed' : 'hover:bg-teal-700 hover:scale-105'}`}
                    >
                      <Save className="w-4 h-4" />
                      {isSavingQuestions ? 'Saving...' : 'Save Configuration'}
                    </button>
                  </div>
                </div>

                {/* Pill Tabs */}
                <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-md inline-flex">
                  <button
                    onClick={() => setFormBuilderTab('service-feedback')}
                    className={`px-6 py-3 font-medium rounded-lg transition-all ${
                      formBuilderTab === 'service-feedback'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Service Feedback
                  </button>
                  <button
                    onClick={() => setFormBuilderTab('additional-details')}
                    className={`px-6 py-3 font-medium rounded-lg transition-all ${
                      formBuilderTab === 'additional-details'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Questionary Page
                  </button>
                  <button
                    onClick={() => setFormBuilderTab('page-merge')}
                    className={`px-6 py-3 font-medium rounded-lg transition-all ${
                      formBuilderTab === 'page-merge'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => setFormBuilderTab('departments')}
                    className={`px-6 py-3 font-medium rounded-lg transition-all ${
                      formBuilderTab === 'departments'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Departments
                  </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-2xl shadow-md p-8 border-l-4 border-teal-500">
                  {formBuilderTab === 'departments' && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Manage Departments</h3>
                      <p className="text-gray-600 mb-6">Add departments that patients can select when appreciating a staff member.</p>
                      
                      <div className="flex gap-4 mb-8">
                        <input
                          type="text"
                          value={newDepartment}
                          onChange={(e) => setNewDepartment(e.target.value)}
                          placeholder="e.g. Cardiology"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        />
                        <button
                          onClick={async () => {
                            const trimmed = newDepartment.trim();
                            if (trimmed && !departments.includes(trimmed)) {
                              const updated = [...departments, trimmed];
                              setDepartments(updated);
                              onDepartmentsChange?.(updated);
                              setNewDepartment('');
                              localStorage.setItem('hms_saved_departments', JSON.stringify(updated));
                              toast.success('Department added');
                              
                              // Immediately persist to backend for active hospital
                              try {
                                const hid = getEffectiveHospitalId();
                                const getApiUrl = (endpoint: string) => {
                                  const p = window.location.pathname;
                                  if (p.includes('api/backend/admin')) return `../ajax/${endpoint}`;
                                  if (p.includes('api/frontend')) return `../backend/ajax/${endpoint}`;
                                  return `/api/backend/ajax/${endpoint}`;
                                };
                                await fetch(getApiUrl('save-questions.php'), {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  credentials: 'same-origin',
                                  body: JSON.stringify({
                                    hospital_id: hid,
                                    questions,
                                    yesno_questions: yesNoQuestions,
                                    departments: updated,
                                    settings: { layoutMode, combinePages, themeColor, fontSize, showPageTitleLabels, departments: updated }
                                  })
                                });
                              } catch (e) {}
                            }
                          }}
                          className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>

                      <div className="space-y-3">
                        {departments.map((dept, index) => (
                          <div key={index} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <span className="font-medium text-gray-800">{dept}</span>
                            <button
                              onClick={async () => {
                                const updated = departments.filter((_, i) => i !== index);
                                setDepartments(updated);
                                onDepartmentsChange?.(updated);
                                localStorage.setItem('hms_saved_departments', JSON.stringify(updated));
                                toast.success('Department removed');

                                // Immediately persist removal to backend for active hospital
                                try {
                                  const hid = getEffectiveHospitalId();
                                  const getApiUrl = (endpoint: string) => {
                                    const p = window.location.pathname;
                                    if (p.includes('api/backend/admin')) return `../ajax/${endpoint}`;
                                    if (p.includes('api/frontend')) return `../backend/ajax/${endpoint}`;
                                    return `/api/backend/ajax/${endpoint}`;
                                  };
                                  await fetch(getApiUrl('save-questions.php'), {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    credentials: 'same-origin',
                                    body: JSON.stringify({
                                      hospital_id: hid,
                                      questions,
                                      yesno_questions: yesNoQuestions,
                                      departments: updated,
                                      settings: { layoutMode, combinePages, themeColor, fontSize, showPageTitleLabels, departments: updated }
                                    })
                                  });
                                } catch (e) {}
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        {departments.length === 0 && (
                          <div className="text-center p-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-500">
                            No departments added yet.
                          </div>
                        )}
                      </div>

                      <div className="mt-8 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveQuestions}
                          disabled={isSavingQuestions}
                          className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Save className="w-5 h-5" />
                          <span>{isSavingQuestions ? 'Saving...' : 'Save Configuration'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                  {formBuilderTab === 'service-feedback' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Service Feedback Questions</h3>
                        <div className="flex items-center gap-3">
                          {/* Layout Toggle */}
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => {
                                setLayoutMode('2-column');
                                localStorage.setItem('hms_layout_mode', '2-column');
                                onLayoutModeChange?.('2-column');
                                toast.success('Layout set to 2 Columns');
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-md font-semibold text-xs transition-all ${
                                layoutMode === '2-column'
                                  ? 'bg-teal-600 text-white shadow-sm'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                              title="2 Column"
                            >
                              <Columns2 className="w-4 h-4" />
                              2 Column
                            </button>
                            <button
                              onClick={() => {
                                setLayoutMode('1-column');
                                localStorage.setItem('hms_layout_mode', '1-column');
                                onLayoutModeChange?.('1-column');
                                toast.success('Layout set to 1 Column');
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-md font-semibold text-xs transition-all ${
                                layoutMode === '1-column'
                                  ? 'bg-teal-600 text-white shadow-sm'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                              title="1 Column"
                            >
                              <RectangleVertical className="w-4 h-4" />
                              1 Column
                            </button>
                          </div>
                          <button
                            onClick={() => setShowAddQuestion(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-md hover:shadow-lg"
                          >
                            <Plus className="w-4 h-4" />
                            Add Question
                          </button>
                        </div>
                      </div>

                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                          <div className={layoutMode === '2-column' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 pb-20' : 'space-y-4 pb-20'}>
                            {questions.map((question) => (
                              <SortableQuestionCard key={question.id} question={question} handleEditQuestion={handleEditQuestion} handleDeleteQuestion={handleDeleteQuestion} questions={questions} updateQuestions={updateQuestions} showColorPicker={showColorPicker} setShowColorPicker={setShowColorPicker} />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  )}

                  {formBuilderTab === 'additional-details' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Questionary Page Questions</h3>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setShowAddYesNoQuestion(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-md"
                          >
                            <Plus className="w-4 h-4" />
                            Add Question
                          </button>
                        </div>
                      </div>

                      <div className={yesNoLayoutMode === '2-column' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                        {/* Yes/No Question Cards */}
                        {yesNoQuestions.map((question) => (
                          <div key={question.id} className="border-l-4 border-l-[#0D9488] bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all">
                            {/* Top Row */}
                            <div className="flex items-start gap-3 mb-4">
                              <GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing mt-1" />
                              <div className="flex-1">
                                <h4 className="font-bold text-[15px] text-[#1a1a2e] leading-tight">{question.label}</h4>
                                <p className="text-[13px] text-gray-600 mt-0.5">{question.tamilLabel}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => setEditingYesNoQuestion(question)} className="p-2 hover:bg-teal-50 rounded-lg transition-colors">
                                  <Pencil className="w-4 h-4 text-teal-600" />
                                </button>
                                <button onClick={() => { if(confirm('Are you sure you want to delete this question?')) setYesNoQuestions(yesNoQuestions.filter(q => q.id !== question.id)); }} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </div>

                            {/* Button Preview Row */}
                            <div className="mb-4 px-8">
                              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Live Preview</p>
                              <div className="grid grid-cols-2 gap-3 mb-2">
                                <div onClick={() => setPreviewAnswers({ ...previewAnswers, [question.id]: false })} className={`cursor-pointer flex items-center justify-center p-3 rounded-xl border-[1.5px] border-[#93c5fd] shadow-sm transition-all ${previewAnswers[question.id] === false ? 'bg-teal-50 border-teal-500' : 'bg-white hover:bg-gray-50'}`}>
                                  <span className="text-sm font-bold text-[#374151]">No</span>
                                </div>
                                <div onClick={() => setPreviewAnswers({ ...previewAnswers, [question.id]: true })} className={`cursor-pointer flex items-center justify-center p-3 rounded-xl border-[1.5px] border-[#93c5fd] shadow-sm transition-all ${previewAnswers[question.id] === true ? 'bg-teal-50 border-teal-500' : 'bg-white hover:bg-gray-50'}`}>
                                  <span className="text-sm font-bold text-[#374151]">Yes</span>
                                </div>
                              </div>
                              {(( (question.describeIssueTrigger || 'no') === 'no' && previewAnswers[question.id] === false) ||
                                (question.describeIssueTrigger === 'yes' && previewAnswers[question.id] === true) ||
                                (question.describeIssueTrigger === 'both' && previewAnswers[question.id] !== undefined && previewAnswers[question.id] !== null)) && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                  <textarea
                                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 outline-none"
                                    rows={2}
                                    placeholder="Please describe the issue..."
                                    disabled
                                  />
                                </div>
                              )}
                            </div>

                            {/* Bottom Row */}
                            <div className="flex items-center gap-6 flex-wrap">
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600 font-medium">Show 'Describe Issue' on:</label>
                                <select 
                                  value={question.describeIssueTrigger || 'no'} 
                                  onChange={(e) => {
                                      const updatedList = yesNoQuestions.map(q => 
                                          q.id === question.id ? { ...q, describeIssueTrigger: e.target.value } : q
                                      );
                                      setYesNoQuestions(updatedList);
                                  }}
                                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none">
                                  <option value="no">No</option>
                                  <option value="yes">Yes</option>
                                  <option value="both">Both</option>
                                  <option value="never">Never</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formBuilderTab === 'page-merge' && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Form Settings</h3>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200">
                          <div>
                            <p className="font-semibold text-gray-900">Combine Service Feedback + Questionary Page</p>
                            <p className="text-sm text-gray-600 mt-1">Merge Service Feedback and Questionary Page into a single step</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={combinePages}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setCombinePages(val);
                                localStorage.setItem('hms_combine_pages', String(val));
                                onCombinePagesChange?.(val);
                                toast.success(val ? 'Service Feedback and Questionary pages combined' : 'Service Feedback and Questionary pages separated');
                              }}
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Feedback Responses */}
            {activeSection === 'responses' && (
              <>
              <div className="pb-24">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Feedback Responses</h2>

                <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-teal-500">
                  {/* Top Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 flex-wrap">
                      <button 
                        onClick={() => setShowFilterPanel(!showFilterPanel)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm cursor-pointer ${
                          showFilterPanel || activeFilterCount > 0 
                            ? 'bg-teal-600 text-white shadow-teal-100 hover:bg-teal-700 ring-2 ring-teal-600 ring-offset-2' 
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                        {activeFilterCount > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            showFilterPanel || activeFilterCount > 0 ? 'bg-white text-teal-700' : 'bg-teal-100 text-teal-800'
                          }`}>
                            {activeFilterCount}
                          </span>
                        )}
                        {showFilterPanel ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                      </button>

                      {/* Quick Search */}
                      <div className="relative flex-1 sm:w-64 max-w-xs">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={filterSearch}
                          onChange={(e) => setFilterSearch(e.target.value)}
                          placeholder="Search patient, UHID..."
                          className="w-full pl-9 pr-8 py-2 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                        />
                        {filterSearch && (
                          <button onClick={() => setFilterSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {activeFilterCount > 0 && (
                        <button
                          onClick={handleResetFilters}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Clear Filters
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 self-end sm:self-auto">
                      <span>Showing <strong>{filteredAndSortedResponses.length}</strong> of {responses.length} responses</span>
                    </div>
                  </div>

                  {/* Expandable Filter Panel */}
                  {showFilterPanel && (
                    <div className="mb-6 p-5 bg-gradient-to-r from-gray-50 to-teal-50/30 rounded-2xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200/80">
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-teal-600" />
                          <h4 className="text-sm font-bold text-gray-800">Filter Responses</h4>
                          {activeFilterCount > 0 && (
                            <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-xs font-bold rounded-full">
                              {activeFilterCount} active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {activeFilterCount > 0 && (
                            <button
                              onClick={handleResetFilters}
                              className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-2.5 py-1 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                              Reset
                            </button>
                          )}
                          <button
                            onClick={() => setShowFilterPanel(false)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Rating Filter */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Rating</label>
                          <select
                            value={filterRating}
                            onChange={(e) => setFilterRating(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all font-medium text-gray-700"
                          >
                            <option value="all">All Ratings</option>
                            <option value="5">⭐⭐⭐⭐⭐ 5 Stars (Excellent)</option>
                            <option value="4">⭐⭐⭐⭐ 4 Stars (Good)</option>
                            <option value="3">⭐⭐⭐ 3 Stars (Average)</option>
                            <option value="2">⭐⭐ 2 Stars (Poor)</option>
                            <option value="1">⭐ 1 Star (Very Poor)</option>
                            <option value="high">⭐ 4+ Stars (High)</option>
                            <option value="low">⚠️ 2 or below (Needs Attention)</option>
                          </select>
                        </div>

                        {/* Recommendation Filter */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Recommendation</label>
                          <select
                            value={filterRecommend}
                            onChange={(e) => setFilterRecommend(e.target.value as any)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all font-medium text-gray-700"
                          >
                            <option value="all">All (Yes & No)</option>
                            <option value="yes">👍 Recommended (Yes)</option>
                            <option value="no">👎 Not Recommended (No)</option>
                          </select>
                        </div>

                        {/* Visit Type Filter */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Visit Type</label>
                          <select
                            value={filterVisitType}
                            onChange={(e) => setFilterVisitType(e.target.value as any)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all font-medium text-gray-700"
                          >
                            <option value="all">All Visit Types</option>
                            <option value="OP">Outpatient (OP)</option>
                            <option value="IP">Inpatient (IP)</option>
                          </select>
                        </div>

                        {/* Office Use Status */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Office Review</label>
                          <select
                            value={filterOfficeUse}
                            onChange={(e) => setFilterOfficeUse(e.target.value as any)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all font-medium text-gray-700"
                          >
                            <option value="all">All Statuses</option>
                            <option value="resolved">✓ Resolved</option>
                            <option value="unresolved">✏️ Pending Review</option>
                          </select>
                        </div>

                        {/* From Date */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">From Date</label>
                          <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all text-gray-700"
                          />
                        </div>

                        {/* To Date */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">To Date</label>
                          <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all text-gray-700"
                          />
                        </div>

                        {/* Sort Field */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Sort By</label>
                          <div className="flex gap-2">
                            <select
                              value={sortField}
                              onChange={(e) => setSortField(e.target.value as any)}
                              className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all font-medium text-gray-700"
                            >
                              <option value="date">Date</option>
                              <option value="patientName">Patient Name</option>
                              <option value="overallRating">Rating</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                              className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 transition-colors flex items-center gap-1 cursor-pointer"
                              title={`Currently ${sortDirection === 'desc' ? 'Descending' : 'Ascending'} - Click to toggle`}
                            >
                              <ArrowUpDown className="w-3.5 h-3.5" />
                              {sortDirection.toUpperCase()}
                            </button>
                          </div>
                        </div>

                        {/* Quick Presets */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Date Presets</label>
                          <div className="flex gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                const todayStr = new Date().toISOString().split('T')[0];
                                setFromDate(todayStr);
                                setToDate(todayStr);
                              }}
                              className="px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-teal-50 hover:border-teal-300 rounded-lg text-xs font-medium text-gray-700 transition-all cursor-pointer"
                            >
                              Today
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const now = new Date();
                                const weekAgo = new Date();
                                weekAgo.setDate(now.getDate() - 7);
                                setFromDate(weekAgo.toISOString().split('T')[0]);
                                setToDate(now.toISOString().split('T')[0]);
                              }}
                              className="px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-teal-50 hover:border-teal-300 rounded-lg text-xs font-medium text-gray-700 transition-all cursor-pointer"
                            >
                              7 Days
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const now = new Date();
                                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                                setFromDate(firstDay.toISOString().split('T')[0]);
                                setToDate(now.toISOString().split('T')[0]);
                              }}
                              className="px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-teal-50 hover:border-teal-300 rounded-lg text-xs font-medium text-gray-700 transition-all cursor-pointer"
                            >
                              This Month
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFromDate('');
                                setToDate('');
                              }}
                              className="px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-500 transition-all cursor-pointer"
                            >
                              All Time
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200 bg-gray-50/50">
                          <th 
                            onClick={() => {
                              if (sortField === 'date') setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                              else { setSortField('date'); setSortDirection('desc'); }
                            }}
                            className="text-left py-4 px-4 font-semibold text-gray-700 cursor-pointer hover:text-teal-600 transition-colors select-none"
                          >
                            <span className="inline-flex items-center gap-1.5">
                              Date
                              <ArrowUpDown className={`w-3.5 h-3.5 ${sortField === 'date' ? 'text-teal-600 font-bold' : 'text-gray-400'}`} />
                            </span>
                          </th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">UHID</th>
                          <th 
                            onClick={() => {
                              if (sortField === 'patientName') setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                              else { setSortField('patientName'); setSortDirection('asc'); }
                            }}
                            className="text-left py-4 px-4 font-semibold text-gray-700 cursor-pointer hover:text-teal-600 transition-colors select-none"
                          >
                            <span className="inline-flex items-center gap-1.5">
                              Patient Name
                              <ArrowUpDown className={`w-3.5 h-3.5 ${sortField === 'patientName' ? 'text-teal-600 font-bold' : 'text-gray-400'}`} />
                            </span>
                          </th>
                          <th 
                            onClick={() => {
                              if (sortField === 'overallRating') setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                              else { setSortField('overallRating'); setSortDirection('desc'); }
                            }}
                            className="text-left py-4 px-4 font-semibold text-gray-700 cursor-pointer hover:text-teal-600 transition-colors select-none"
                            title="Exact Overall Rating given by Patient"
                          >
                            <span className="inline-flex items-center gap-1.5">
                              Overall Rating
                              <ArrowUpDown className={`w-3.5 h-3.5 ${sortField === 'overallRating' ? 'text-teal-600 font-bold' : 'text-gray-400'}`} />
                            </span>
                          </th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700" title="Consolidated Average of all Service Questions">
                            Consolidated Rating
                          </th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Recommendation</th>
                          <th className="text-center py-4 px-4 font-semibold text-gray-700">View</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Office Use</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedResponses.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-12 text-gray-500">
                              <Filter className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                              <p className="font-semibold text-gray-700">No matching responses found</p>
                              <p className="text-xs text-gray-400 mt-1">Try adjusting your search, rating, or date filters</p>
                              <button
                                onClick={handleResetFilters}
                                className="mt-3 px-4 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Reset All Filters
                              </button>
                            </td>
                          </tr>
                        ) : filteredAndSortedResponses.map((response, idx) => {
                          const safeUhid = response.uhid || ('UHID_' + idx);
                          const safeId = response.id ? ('sub_' + response.id) : (safeUhid + '_' + idx);
                          const officeUseFilled = !!(officeUseByResponse[safeUhid]?.reviewOfComplaint || officeUseByResponse[safeUhid]?.inchargeName);
                          const ratingNum = Math.round(Number(response.overallRating || 5) * 10) / 10;
                          const isRec = getIsRecommended(response);

                          return (
                            <tr key={safeId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-600">
                                {response.date || (response.submittedAt ? String(response.submittedAt).split('T')[0] : '—')}
                              </td>
                              <td className="py-4 px-4 font-medium text-sm text-gray-900">
                                {response.uhid || '—'}
                              </td>
                              <td className="py-4 px-4 text-sm font-semibold text-gray-800">
                                {response.patientName || 'Patient'}
                              </td>
                              {/* Exact Overall Rating */}
                              <td className="py-4 px-4 text-sm">
                                <span className="inline-flex items-center gap-1 text-yellow-700 font-bold bg-yellow-50 px-2.5 py-1 rounded-lg border border-yellow-200 shadow-sm" title="Exact Overall Rating">
                                  <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
                                  {getExactOverallRating(response)} / 5
                                </span>
                              </td>

                              {/* Consolidated Rating Average */}
                              <td className="py-4 px-4 text-sm">
                                <span className="inline-flex items-center gap-1 text-teal-700 font-bold bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 shadow-sm" title="Consolidated Average of all Service Questions">
                                  <Star className="w-3.5 h-3.5 fill-current text-teal-500" />
                                  {getConsolidatedRating(response).toFixed(1)} / 5.0
                                </span>
                              </td>
                              <td className="py-4 px-4 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                                  isRec ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {isRec ? '👍 Yes' : '👎 No'}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <button
                                  onClick={() => setSelectedResponse(response)}
                                  className="p-2 hover:bg-teal-50 rounded-lg transition-colors inline-flex items-center justify-center text-teal-600 cursor-pointer"
                                  title="View Feedback Details"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                              </td>
                              <td className="py-4 px-4 text-sm">
                                {officeUseFilled ? (
                                  <button
                                    onClick={() => {
                                      setOfficeUseModalData(officeUseByResponse[safeUhid] || { reviewOfComplaint: '', dateOfReview: '', correctiveAction: '', preventiveAction: '', inchargeName: '' });
                                      setOfficeUseModalResponse(response);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                                    title="Problem Resolved - Click to view or edit Office Use details"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Resolved ✓</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setOfficeUseModalData(officeUseByResponse[safeUhid] || { reviewOfComplaint: '', dateOfReview: '', correctiveAction: '', preventiveAction: '', inchargeName: '' });
                                      setOfficeUseModalResponse(response);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer"
                                    title="Pending Review - Click to fill Office Use details"
                                  >
                                    <span>Fill ✏️</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Office Use Modal */}
              {officeUseModalResponse && (
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '16px',
                  }}
                  onClick={(e) => { if (e.target === e.currentTarget) setOfficeUseModalResponse(null); }}
                >
                  <div
                    style={{
                      background: '#fff',
                      borderRadius: '16px',
                      maxWidth: '520px',
                      width: '90%',
                      padding: '28px',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                      animation: 'ouModalIn 250ms ease',
                    }}
                  >
                    <style>{`@keyframes ouModalIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>

                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">For Office Use Only</h3>
                          <p className="text-sm text-gray-500 mt-0.5">{officeUseModalResponse.patientName} — {officeUseModalResponse.uhid}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setOfficeUseModalResponse(null)}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>

                    {/* Fields */}
                    <div className="space-y-5">
                      {/* Review of Complaint */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Review of the Complaint</label>
                        <input
                          type="text"
                          value={officeUseModalData.reviewOfComplaint}
                          onChange={(e) => setOfficeUseModalData({ ...officeUseModalData, reviewOfComplaint: e.target.value })}
                          placeholder="Enter review details..."
                          style={{ width: '100%', border: 'none', borderBottom: '2px solid #d1d5db', background: 'transparent', padding: '10px 2px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 200ms' }}
                          onFocus={(e) => (e.target.style.borderBottomColor = '#0D9488')}
                          onBlur={(e) => (e.target.style.borderBottomColor = '#d1d5db')}
                        />
                      </div>

                      {/* Date of Review */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date of Review</label>
                        <input
                          type="date"
                          value={officeUseModalData.dateOfReview}
                          onChange={(e) => setOfficeUseModalData({ ...officeUseModalData, dateOfReview: e.target.value })}
                          style={{ width: '100%', border: 'none', borderBottom: '2px solid #d1d5db', background: 'transparent', padding: '10px 2px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 200ms' }}
                          onFocus={(e) => (e.target.style.borderBottomColor = '#0D9488')}
                          onBlur={(e) => (e.target.style.borderBottomColor = '#d1d5db')}
                        />
                      </div>

                      {/* Corrective Action */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Corrective Action</label>
                        <textarea
                          value={officeUseModalData.correctiveAction}
                          onChange={(e) => setOfficeUseModalData({ ...officeUseModalData, correctiveAction: e.target.value })}
                          placeholder="Describe corrective action taken..."
                          rows={2}
                          style={{ width: '100%', border: 'none', borderBottom: '2px solid #d1d5db', background: 'transparent', padding: '10px 2px', fontSize: '14px', color: '#374151', outline: 'none', resize: 'none', minHeight: '60px', transition: 'border-color 200ms' }}
                          onFocus={(e) => (e.target.style.borderBottomColor = '#0D9488')}
                          onBlur={(e) => (e.target.style.borderBottomColor = '#d1d5db')}
                        />
                      </div>

                      {/* Preventive Action */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Preventive Action</label>
                        <textarea
                          value={officeUseModalData.preventiveAction}
                          onChange={(e) => setOfficeUseModalData({ ...officeUseModalData, preventiveAction: e.target.value })}
                          placeholder="Describe preventive action planned..."
                          rows={2}
                          style={{ width: '100%', border: 'none', borderBottom: '2px solid #d1d5db', background: 'transparent', padding: '10px 2px', fontSize: '14px', color: '#374151', outline: 'none', resize: 'none', minHeight: '60px', transition: 'border-color 200ms' }}
                          onFocus={(e) => (e.target.style.borderBottomColor = '#0D9488')}
                          onBlur={(e) => (e.target.style.borderBottomColor = '#d1d5db')}
                        />
                      </div>

                      {/* Incharge Name */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Incharge Name / பொறுப்பாளர் பெயர்</label>
                        <input
                          type="text"
                          value={officeUseModalData.inchargeName}
                          onChange={(e) => setOfficeUseModalData({ ...officeUseModalData, inchargeName: e.target.value })}
                          placeholder="Enter incharge name"
                          style={{ width: '100%', border: 'none', borderBottom: '2px solid #d1d5db', background: 'transparent', padding: '10px 2px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 200ms' }}
                          onFocus={(e) => (e.target.style.borderBottomColor = '#0D9488')}
                          onBlur={(e) => (e.target.style.borderBottomColor = '#d1d5db')}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 mt-8 justify-end">
                      <button
                        onClick={() => setOfficeUseModalResponse(null)}
                        className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!officeUseModalResponse) return;
                          const uhid = officeUseModalResponse.uhid;
                          const respId = officeUseModalResponse.id;
                          const nextData = { ...officeUseModalData };
                          
                          setOfficeUseByResponse(prev => ({ ...prev, [uhid]: nextData }));
                          setResponses(prev => prev.map(r => (r.uhid === uhid || r.id === respId) ? { ...r, officeUse: { ...nextData, status: 'Reviewed' } } : r));
                          setOfficeUseModalResponse(null);
                          toast.success('Office Use record saved! Marked as Resolved ✓');

                          try {
                            const fd = new FormData();
                            fd.append('response_id', String(respId || 0));
                            fd.append('submission_id', String(respId || 0));
                            fd.append('uhid', uhid);
                            fd.append('review_comments', nextData.reviewOfComplaint || '');
                            fd.append('review_date', nextData.dateOfReview || new Date().toISOString().slice(0, 10));
                            fd.append('corrective_action', nextData.correctiveAction || '');
                            fd.append('preventive_action', nextData.preventiveAction || '');
                            fd.append('incharge_name', nextData.inchargeName || '');
                            await fetch(getApiUrl('save-office-use.php'), { method: 'POST', body: fd, credentials: 'same-origin' });
                          } catch (err) {
                            console.error('Save office use error:', err);
                          }
                        }}
                        style={{ background: '#0D9488' }}
                        className="px-6 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save & Mark Resolved</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              </>
            )}

            {/* Feedback Report Section */}
            {activeSection === 'feedback-report' && (
              <div className="pb-24 space-y-8">
                {/* Header Strip with Hospital Branding and Print/Export */}
                <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-teal-600 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-700 shadow-sm flex-shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-2xl font-bold text-gray-900">Feedback Report</h2>
                        <span className="text-xs px-2.5 py-1 bg-teal-100 text-teal-800 rounded-full font-semibold">
                          {brandingSettings.hospitalName}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Comprehensive department-wise ratings, Yes/No question breakdown, and patient remarks.
                      </p>
                    </div>
                  </div>


                </div>

                {/* Filters Strip */}
                {/* Executive Problem Resolution & Performance Summary */}
                {(() => {
                  const totalEvaluated = responses.length;
                  const resolvedCount = responses.filter(r => !!(officeUseByResponse[r.uhid]?.reviewOfComplaint || officeUseByResponse[r.uhid]?.inchargeName)).length;
                  const unresolvedCount = totalEvaluated - resolvedCount;
                  const resolutionPct = totalEvaluated > 0 ? Math.round((resolvedCount / totalEvaluated) * 100) : 100;
                  const avgScore = totalEvaluated > 0 ? (responses.reduce((sum, r) => sum + Number(r.overallRating || 5), 0) / totalEvaluated).toFixed(1) : '5.0';

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Responses</p>
                          <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalEvaluated}</h3>
                          <p className="text-xs text-gray-400">Avg Rating: ⭐ {avgScore}/5</p>
                        </div>
                      </div>

                      <div 
                        onClick={() => setReportViewTab('resolved')}
                        className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 shadow-sm border border-emerald-200 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                        title="Click to filter Resolved Problems"
                      >
                        <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                            Resolved Problems
                          </p>
                          <h3 className="text-2xl font-black text-emerald-700 mt-0.5">{resolvedCount}</h3>
                          <p className="text-xs text-emerald-600 font-medium">Office review completed ✓</p>
                        </div>
                      </div>

                      <div 
                        onClick={() => setReportViewTab('unresolved')}
                        className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 shadow-sm border border-amber-200 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                        title="Click to filter Unresolved Problems"
                      >
                        <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                          <HelpCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Unresolved Problems</p>
                          <h3 className="text-2xl font-black text-amber-700 mt-0.5">{unresolvedCount}</h3>
                          <p className="text-xs text-amber-600 font-medium">Pending office action</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Resolution Rate</p>
                          <h3 className="text-2xl font-bold text-indigo-600 mt-0.5">{resolutionPct}%</h3>
                          <p className="text-xs text-gray-400">{resolvedCount} of {totalEvaluated} addressed</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={reportSearch}
                        onChange={(e) => setReportSearch(e.target.value)}
                        placeholder="Search question, keyword, or patient remarks..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                      />
                      {reportSearch && (
                        <button onClick={() => setReportSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Date Filters & Tab Toggle */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                        <span className="text-gray-500 font-medium">From:</span>
                        <input
                          type="date"
                          value={reportFromDate || fromDate}
                          onChange={(e) => setReportFromDate(e.target.value)}
                          className="bg-transparent text-gray-700 text-sm outline-none cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                        <span className="text-gray-500 font-medium">To:</span>
                        <input
                          type="date"
                          value={reportToDate || toDate}
                          onChange={(e) => setReportToDate(e.target.value)}
                          className="bg-transparent text-gray-700 text-sm outline-none cursor-pointer"
                        />
                      </div>

                      {/* View Mode Toggle */}
                      <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600 flex-wrap gap-1">
                        <button
                          onClick={() => setReportViewTab('all')}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${reportViewTab === 'all' ? 'bg-white text-teal-700 shadow-sm font-bold' : 'hover:text-gray-900'}`}
                        >
                          All Questions
                        </button>
                        <button
                          onClick={() => setReportViewTab('ratings')}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${reportViewTab === 'ratings' ? 'bg-white text-teal-700 shadow-sm font-bold' : 'hover:text-gray-900'}`}
                        >
                          ⭐ Ratings Only
                        </button>
                        <button
                          onClick={() => setReportViewTab('yesno')}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${reportViewTab === 'yesno' ? 'bg-white text-teal-700 shadow-sm font-bold' : 'hover:text-gray-900'}`}
                        >
                          ✓/✗ Yes/No Only
                        </button>
                        <button
                          onClick={() => setReportViewTab('resolved')}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${reportViewTab === 'resolved' ? 'bg-emerald-600 text-white shadow-sm font-bold' : 'text-emerald-800 hover:bg-emerald-100'}`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolved ({responses.filter(r => !!(officeUseByResponse[r.uhid]?.reviewOfComplaint || officeUseByResponse[r.uhid]?.inchargeName)).length})
                        </button>
                        <button
                          onClick={() => setReportViewTab('unresolved')}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${reportViewTab === 'unresolved' ? 'bg-amber-500 text-white shadow-sm font-bold' : 'text-amber-800 hover:bg-amber-100'}`}
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          Unresolved ({responses.filter(r => !officeUseByResponse[r.uhid]?.reviewOfComplaint && !officeUseByResponse[r.uhid]?.inchargeName).length})
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Department Filter Pills */}
                  <div className="pt-2 border-t border-gray-100 flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2 flex-shrink-0">
                      Department:
                    </span>
                    <button
                      onClick={() => setReportDept('all')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        reportDept === 'all'
                          ? 'bg-teal-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All Departments ({responses.length})
                    </button>
                    {availableDepartments.map(dept => {
                      const count = responses.filter(r => {
                        const d = r.departmentName || (r.visitType === 'IP' ? 'IPD / Inpatient' : 'OPD / Outpatient');
                        return d.toLowerCase().trim() === dept.toLowerCase().trim();
                      }).length;
                      return (
                        <button
                          key={dept}
                          onClick={() => setReportDept(dept)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                            reportDept === dept
                              ? 'bg-teal-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {dept} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dedicated Problem Resolution View (Resolved / Unresolved Tabs) */}
                {(reportViewTab === 'resolved' || reportViewTab === 'unresolved') && (
                  <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 overflow-hidden">
                    <div className={`px-6 py-4 text-white flex items-center justify-between ${reportViewTab === 'resolved' ? 'bg-gradient-to-r from-emerald-700 to-teal-800' : 'bg-gradient-to-r from-amber-600 to-orange-700'}`}>
                      <div className="flex items-center gap-3">
                        {reportViewTab === 'resolved' ? (
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold">
                            <HelpCircle className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-bold">
                            {reportViewTab === 'resolved' ? 'Resolved Problems & Office Actions' : 'Unresolved Problems & Pending Actions'}
                          </h3>
                          <p className="text-xs text-white/80">
                            {reportViewTab === 'resolved' 
                              ? 'List of patient feedback records where office complaint review and corrective actions were completed.' 
                              : 'List of patient feedback records pending administrative review and corrective actions.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {(() => {
                        const filteredProblems = responses.filter(r => {
                          const isResolved = !!(officeUseByResponse[r.uhid]?.reviewOfComplaint || officeUseByResponse[r.uhid]?.inchargeName);
                          if (reportViewTab === 'resolved') return isResolved;
                          return !isResolved;
                        }).filter(r => {
                          if (reportDept === 'all') return true;
                          const d = r.departmentName || (r.visitType === 'IP' ? 'IPD / Inpatient' : 'OPD / Outpatient');
                          return d.toLowerCase().trim() === reportDept.toLowerCase().trim();
                        }).filter(r => {
                          if (!reportSearch) return true;
                          const q = reportSearch.toLowerCase();
                          return (r.uhid || '').toLowerCase().includes(q) ||
                                 (r.patientName || '').toLowerCase().includes(q) ||
                                 (officeUseByResponse[r.uhid]?.reviewOfComplaint || '').toLowerCase().includes(q) ||
                                 (officeUseByResponse[r.uhid]?.inchargeName || '').toLowerCase().includes(q);
                        });

                        if (filteredProblems.length === 0) {
                          return (
                            <div className="text-center py-12 text-gray-500">
                              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                              <p className="text-lg font-semibold">
                                {reportViewTab === 'resolved' ? 'No resolved problems found for this filter.' : 'All problems are resolved! No pending items.'}
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-4">
                            {filteredProblems.map((p, idx) => {
                              const ou = officeUseByResponse[p.uhid];
                              const isResolved = !!(ou?.reviewOfComplaint || ou?.inchargeName);

                              return (
                                <div key={idx} className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all space-y-4">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
                                    <div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-gray-900 text-base">{p.patientName}</span>
                                        <span className="text-xs px-2.5 py-0.5 bg-gray-200 text-gray-800 rounded-full font-semibold">UHID: {p.uhid}</span>
                                        <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-800 rounded font-semibold">{p.visitType || 'OP'}</span>
                                        <span className="text-xs text-gray-500">• {p.date}</span>
                                      </div>
                                      <p className="text-xs text-gray-600 mt-1">
                                        Department: <span className="font-semibold text-teal-700">{p.departmentName}</span> • Rating: <span className="font-semibold text-amber-600">⭐ {typeof p.overallRating === 'number' ? p.overallRating.toFixed(1) : p.overallRating}/5</span>
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {isResolved ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold shadow-sm">
                                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                          Resolved ✓
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold shadow-sm">
                                          <HelpCircle className="w-4 h-4 text-amber-600" />
                                          Pending Action
                                        </span>
                                      )}
                                      <button
                                        onClick={() => {
                                          setOfficeUseModalData(officeUseByResponse[p.uhid] || { reviewOfComplaint: '', dateOfReview: '', correctiveAction: '', preventiveAction: '', inchargeName: '' });
                                          setOfficeUseModalResponse(p);
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1 ${
                                          isResolved 
                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                            : 'bg-teal-600 text-white hover:bg-teal-700'
                                        }`}
                                      >
                                        ✏️ {isResolved ? 'Edit Office Review' : 'Resolve Problem'}
                                      </button>
                                      <button
                                        onClick={() => setSelectedResponse(p)}
                                        className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer"
                                        title="View Full Feedback Details"
                                      >
                                        <Eye className="w-4 h-4 text-teal-600" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Office Action Details */}
                                  {isResolved ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
                                      <div>
                                        <span className="font-bold text-emerald-900 uppercase tracking-wide block mb-1">Review of Complaint:</span>
                                        <p className="text-gray-800 italic bg-white p-2.5 rounded-lg border border-emerald-100">{ou?.reviewOfComplaint || '—'}</p>
                                      </div>
                                      <div>
                                        <span className="font-bold text-emerald-900 uppercase tracking-wide block mb-1">Corrective Action Taken:</span>
                                        <p className="text-gray-800 italic bg-white p-2.5 rounded-lg border border-emerald-100">{ou?.correctiveAction || '—'}</p>
                                      </div>
                                      <div>
                                        <span className="font-bold text-emerald-900 uppercase tracking-wide block mb-1">Preventive Action:</span>
                                        <p className="text-gray-800 italic bg-white p-2.5 rounded-lg border border-emerald-100">{ou?.preventiveAction || '—'}</p>
                                      </div>
                                      <div>
                                        <span className="font-bold text-emerald-900 uppercase tracking-wide block mb-1">Incharge / Date:</span>
                                        <p className="text-gray-800 bg-white p-2.5 rounded-lg border border-emerald-100">
                                          <span className="font-semibold">{ou?.inchargeName || '—'}</span> {ou?.dateOfReview ? `• ${ou.dateOfReview}` : ''}
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
                                      <p className="text-amber-800 font-medium">
                                        ⚠️ Action pending for this feedback. Click <strong>Resolve Problem</strong> to log the investigation and corrective action.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Department Wise Report Cards */}
                {departmentReportData.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
                    <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-semibold">No feedback records found for this selection.</p>
                    <p className="text-sm mt-1">Try adjusting the department filter or date range.</p>
                  </div>
                ) : (
                  departmentReportData.map((dept, deptIdx) => (
                    <div key={deptIdx} className="bg-white rounded-2xl shadow-md border border-gray-200/80 overflow-hidden">
                      {/* Department / Overall Banner */}
                      <div className={`px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        dept.isHospitalOverall 
                          ? 'bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 border-b-2 border-amber-400' 
                          : 'bg-gradient-to-r from-teal-700 to-teal-800'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-inner ${
                            dept.isHospitalOverall ? 'bg-amber-400 text-teal-950 shadow-md' : 'bg-white/10 text-white'
                          }`}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold">{dept.departmentName}</h3>
                              {dept.isHospitalOverall && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-teal-950 tracking-wider uppercase shadow-sm">
                                  Hospital Consolidated
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-teal-100">
                              {dept.totalResponses} Total Feedback Submissions Evaluated {dept.isHospitalOverall ? 'Across All Departments' : ''}
                            </p>
                          </div>
                        </div>

                        {/* Dept Stats Badge */}
                        <div className="flex items-center gap-4 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                          <div className="text-center">
                            <span className="text-[11px] text-teal-200 block uppercase font-medium">Avg Rating</span>
                            <span className="text-base font-bold text-white flex items-center gap-1 justify-center">
                              ⭐ {dept.overallAvgRating.toFixed(1)} <span className="text-xs text-teal-200 font-normal">/ 5.0</span>
                            </span>
                          </div>
                          <div className="w-[1px] h-6 bg-white/20"></div>
                          <div className="text-center">
                            <span className="text-[11px] text-teal-200 block uppercase font-medium">Positive Response</span>
                            <span className="text-base font-bold text-teal-300">
                              {dept.overallYesPercent}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-8">
                        {/* Section A: Rating Questions Breakdown */}
                        {(reportViewTab === 'all' || reportViewTab === 'ratings') && (
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                                Department Rating Questions ({dept.ratingQuestions.length})
                              </h4>
                              <span className="text-xs text-gray-500 font-medium">
                                Breakdown by 5★ Excellent to 1★ Bad
                              </span>
                            </div>

                            {dept.ratingQuestions.length === 0 ? (
                              <p className="text-sm text-gray-400 italic py-2">No rating questions match your search.</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dept.ratingQuestions.map((rq, rqIdx) => (
                                  <div
                                    key={rqIdx}
                                    className={`border rounded-xl p-4 transition-all space-y-3 ${
                                      rq.isDeleted
                                        ? 'border-amber-300 bg-amber-50/60 hover:bg-amber-50/90 shadow-sm'
                                        : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:shadow-md'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h5 className="text-sm font-bold text-gray-900">{rq.label}</h5>
                                          {rq.isDeleted && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
                                              <Trash2 className="w-3 h-3 text-amber-700" />
                                              Deleted from Form (Past Data)
                                            </span>
                                          )}
                                        </div>
                                        {rq.tamilLabel && (
                                          <p className="text-xs text-teal-700 font-medium mt-0.5">{rq.tamilLabel}</p>
                                        )}
                                        <span className="text-[11px] text-gray-500 mt-1 inline-block">
                                          {rq.totalRated} patient responses
                                        </span>
                                      </div>
                                      
                                      {/* Score Badge */}
                                      <div className="text-right flex-shrink-0">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${
                                          rq.averageScore >= 4.0
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : rq.averageScore >= 3.0
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-rose-100 text-rose-800'
                                        }`}>
                                          ⭐ {rq.averageScore.toFixed(1)} / 5.0
                                        </span>
                                      </div>
                                    </div>

                                    {/* Star Rating Breakdown Distribution */}
                                    <div className="space-y-1.5 pt-2 border-t border-gray-200/60 text-xs">
                                      {[
                                        { star: 5, label: '5★ Excellent', count: rq.count5, pct: rq.pct5, color: 'bg-emerald-500' },
                                        { star: 4, label: '4★ Good', count: rq.count4, pct: rq.pct4, color: 'bg-teal-500' },
                                        { star: 3, label: '3★ Average', count: rq.count3, pct: rq.pct3, color: 'bg-amber-400' },
                                        { star: 2, label: '2★ Poor', count: rq.count2, pct: rq.pct2, color: 'bg-orange-400' },
                                        { star: 1, label: '1★ Bad', count: rq.count1, pct: rq.pct1, color: 'bg-rose-500' },
                                      ].map((b, bIdx) => (
                                        <div key={bIdx} className="flex items-center gap-2">
                                          <span className="w-20 text-[11px] font-medium text-gray-600 flex-shrink-0">{b.label}</span>
                                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                              className={`h-full rounded-full transition-all ${b.color}`}
                                              style={{ width: `${b.pct}%` }}
                                            />
                                          </div>
                                          <span className="w-12 text-right text-[11px] font-semibold text-gray-700 flex-shrink-0">
                                            {b.count} ({b.pct}%)
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Section B: Yes / No Questions Breakdown */}
                        {(reportViewTab === 'all' || reportViewTab === 'yesno') && (
                          <div className="pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                                Department Yes / No Questions ({dept.yesNoQuestions.length})
                              </h4>
                              <span className="text-xs text-gray-500 font-medium">
                                Direct patient confirmation and remarks
                              </span>
                            </div>

                            {dept.yesNoQuestions.length === 0 ? (
                              <p className="text-sm text-gray-400 italic py-2">No Yes/No questions match your search.</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dept.yesNoQuestions.map((yq, yqIdx) => (
                                  <div
                                    key={yqIdx}
                                    className={`border rounded-xl p-4 transition-all space-y-3 ${
                                      yq.isDeleted
                                        ? 'border-amber-300 bg-amber-50/60 hover:bg-amber-50/90 shadow-sm'
                                        : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:shadow-md'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h5 className="text-sm font-bold text-gray-900">{yq.label}</h5>
                                          {yq.isDeleted && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
                                              <Trash2 className="w-3 h-3 text-amber-700" />
                                              Deleted from Form (Past Data)
                                            </span>
                                          )}
                                        </div>
                                        {yq.tamilLabel && (
                                          <p className="text-xs text-teal-700 font-medium mt-0.5">{yq.tamilLabel}</p>
                                        )}
                                        <span className="text-[11px] text-gray-500 mt-1 inline-block">
                                          {yq.totalAnswered} total responses
                                        </span>
                                      </div>

                                      <span className={`text-xs px-2.5 py-1 rounded-lg font-bold flex-shrink-0 ${
                                        yq.yesPercent >= 80
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : yq.yesPercent >= 50
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-rose-100 text-rose-800'
                                      }`}>
                                        {yq.yesPercent}% Yes
                                      </span>
                                    </div>

                                    {/* Yes vs No Bar */}
                                    <div className="space-y-1.5 pt-1">
                                      <div className="flex h-3 w-full rounded-full overflow-hidden bg-gray-200 shadow-inner">
                                        <div
                                          className="bg-emerald-500 h-full transition-all"
                                          style={{ width: `${yq.yesPercent}%` }}
                                          title={`Yes: ${yq.yesCount} (${yq.yesPercent}%)`}
                                        />
                                        <div
                                          className="bg-rose-500 h-full transition-all"
                                          style={{ width: `${yq.noPercent}%` }}
                                          title={`No: ${yq.noCount} (${yq.noPercent}%)`}
                                        />
                                      </div>

                                      <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-emerald-700 flex items-center gap-1">
                                          ✓ Yes: {yq.yesCount} ({yq.yesPercent}%)
                                        </span>
                                        <span className="text-rose-700 flex items-center gap-1">
                                          ✗ No: {yq.noCount} ({yq.noPercent}%)
                                        </span>
                                      </div>
                                    </div>

                                    {/* Remarks Accordion Button */}
                                    {yq.remarks.length > 0 && (
                                      <div className="pt-2 border-t border-gray-200/60">
                                        <button
                                          onClick={() => {
                                            const uniqueKey = `${dept.departmentName}_${yq.id}`;
                                            setExpandedRemarksQId(expandedRemarksQId === uniqueKey ? null : uniqueKey);
                                          }}
                                          className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center justify-between w-full py-1"
                                        >
                                          <span>💬 View Patient Remarks ({yq.remarks.length})</span>
                                          {expandedRemarksQId === `${dept.departmentName}_${yq.id}` ? (
                                            <ChevronUp className="w-4 h-4" />
                                          ) : (
                                            <ChevronDown className="w-4 h-4" />
                                          )}
                                        </button>

                                        {expandedRemarksQId === `${dept.departmentName}_${yq.id}` && (
                                          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto p-2 bg-white rounded-lg border border-gray-200 text-xs">
                                            {yq.remarks.map((rem, rIdx) => (
                                              <div key={rIdx} className="p-2 rounded bg-gray-50 border-l-2 border-teal-500">
                                                <p className="text-gray-800 font-medium">"{rem.text}"</p>
                                                <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1">
                                                  <span>{rem.patientName} ({rem.uhid})</span>
                                                  <span>{rem.date}</span>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit Question</h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">English Label</label>
                <input
                  type="text"
                  value={editingQuestion.label}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, label: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamil Label</label>
                <input
                  type="text"
                  value={editingQuestion.tamilLabel}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, tamilLabel: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating Mode</label>
                <select
                  value={editingQuestion.ratingMode}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, ratingMode: e.target.value as 'emoji' | 'star' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                >
                  <option value="emoji">Emoji Rating</option>
                  <option value="star">Star Rating</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showAddQuestion && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add New Question</h3>
              <button
                onClick={() => {
                  setShowAddQuestion(false);
                  setNewQuestion({ label: '', tamilLabel: '', ratingMode: 'emoji' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">English Label</label>
                <input
                  type="text"
                  value={newQuestion.label}
                  onChange={(e) => setNewQuestion({ ...newQuestion, label: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  placeholder="e.g., Ambulance Services"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamil Label</label>
                <input
                  type="text"
                  value={newQuestion.tamilLabel}
                  onChange={(e) => setNewQuestion({ ...newQuestion, tamilLabel: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  placeholder="e.g., ஆம்புலன்ஸ் சேவைகள்"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating Mode</label>
                <select
                  value={newQuestion.ratingMode}
                  onChange={(e) => setNewQuestion({ ...newQuestion, ratingMode: e.target.value as 'emoji' | 'star' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                >
                  <option value="emoji">Emoji Rating</option>
                  <option value="star">Star Rating</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddQuestion}
                  disabled={!newQuestion.label || !newQuestion.tamilLabel}
                  className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-300"
                >
                  Add Question
                </button>
                <button
                  onClick={() => {
                    setShowAddQuestion(false);
                    setNewQuestion({ label: '', tamilLabel: '', ratingMode: 'emoji' });
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Yes/No Question Modal */}
      {editingYesNoQuestion && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit Questionary Page Question</h3>
              <button onClick={() => setEditingYesNoQuestion(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">English Label</label>
                <input type="text" value={editingYesNoQuestion.label} onChange={(e) => setEditingYesNoQuestion({ ...editingYesNoQuestion, label: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamil Label</label>
                <input type="text" value={editingYesNoQuestion.tamilLabel} onChange={(e) => setEditingYesNoQuestion({ ...editingYesNoQuestion, tamilLabel: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => { setYesNoQuestions(yesNoQuestions.map(q => q.id === editingYesNoQuestion.id ? editingYesNoQuestion : q)); setEditingYesNoQuestion(null); }} className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Save</button>
                <button onClick={() => setEditingYesNoQuestion(null)} className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Yes/No Question Modal */}
      {showAddYesNoQuestion && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add Questionary Page Question</h3>
              <button onClick={() => { setShowAddYesNoQuestion(false); setNewYesNoQuestion({ label: '', tamilLabel: '' }); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">English Label</label>
                <input type="text" value={newYesNoQuestion.label} onChange={(e) => setNewYesNoQuestion({ ...newYesNoQuestion, label: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g., Any diet restrictions?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamil Label</label>
                <input type="text" value={newYesNoQuestion.tamilLabel} onChange={(e) => setNewYesNoQuestion({ ...newYesNoQuestion, tamilLabel: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g., உணவு கட்டுப்பாடுகள் ஏதேனும் உண்டா?" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => { const updatedYn = [...yesNoQuestions, { id: `yesno_new_${Date.now()}`, ...newYesNoQuestion }]; updateYesNoQuestions(updatedYn); setNewYesNoQuestion({ label: '', tamilLabel: '' }); setShowAddYesNoQuestion(false); toast.success('Question added'); }} disabled={!newYesNoQuestion.label} className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300">Add Question</button>
                <button onClick={() => { setShowAddYesNoQuestion(false); setNewYesNoQuestion({ label: '', tamilLabel: '' }); }} className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Detail Modal with Print Support */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 modal-print-overlay">
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              #printable-feedback-modal, #printable-feedback-modal * { visibility: visible !important; }
              html, body { height: auto !important; min-height: 0 !important; overflow: visible !important; background: #ffffff !important; margin: 0 !important; padding: 0 !important; }
              #root { height: auto !important; min-height: 0 !important; overflow: visible !important; position: static !important; display: block !important; }
              .modal-print-overlay { position: static !important; inset: auto !important; background: transparent !important; padding: 0 !important; margin: 0 !important; width: 100% !important; height: auto !important; min-height: 0 !important; display: block !important; overflow: visible !important; }
              #printable-feedback-modal {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                min-height: 0 !important;
                max-height: none !important;
                overflow: visible !important;
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                background: #ffffff !important;
                display: block !important;
              }
              #printable-feedback-modal .sticky,
              #printable-feedback-modal [class*="sticky"] {
                position: relative !important;
                top: auto !important;
                box-shadow: none !important;
                border-bottom: 2px solid #0d9488 !important;
                padding-bottom: 12px !important;
                margin-bottom: 16px !important;
              }
              .no-print, button, nav, aside, [class*="sidebar"] {
                display: none !important;
              }
              .grid, .rounded-xl, .rounded-lg, [class*="rounded"] {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
            }
          `}</style>
          <div id="printable-feedback-modal" className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Feedback Detail</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  UHID: <span className="font-semibold text-gray-800">{selectedResponse.uhid}</span> • Type: <span className="font-semibold text-teal-700">{selectedResponse.visitType || (selectedResponse.ipNumber ? 'IP' : 'OP')}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 no-print">
                <button
                  type="button"
                  onClick={handlePrintFeedbackDetail}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
                  title="Print this feedback details (Saved filename format: UHID_Date_Type)"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedResponse(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-teal-50 rounded-xl p-4 border-l-4 border-teal-500">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Patient Name</p>
                    <p className="font-semibold text-gray-900">{selectedResponse.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">UHID</p>
                    <p className="font-semibold text-gray-900">{selectedResponse.uhid}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Submission</p>
                    <p className="font-semibold text-gray-900">{selectedResponse.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Overall Rating</p>
                    <p className="font-bold text-amber-700 flex items-center gap-1 text-base">
                      <Star className="w-4 h-4 fill-current text-amber-500" />
                      {getExactOverallRating(selectedResponse)} / 5
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Consolidated Rating (Average)</p>
                    <p className="font-bold text-teal-700 flex items-center gap-1 text-base">
                      <Star className="w-4 h-4 fill-current text-teal-500" />
                      {getConsolidatedRating(selectedResponse).toFixed(1)} / 5.0
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">Patient Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedResponse.visitType === 'IP' && (
                    <>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">IP Number</p>
                        <p className="font-semibold text-gray-900">{selectedResponse.ipNumber || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">IP Date</p>
                        <p className="font-semibold text-gray-900">{selectedResponse.ipDate || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Admission Date</p>
                        <p className="font-semibold text-gray-900">{selectedResponse.admissionDate || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Discharge Date</p>
                        <p className="font-semibold text-gray-900">{selectedResponse.dischargeDate || 'N/A'}</p>
                      </div>
                    </>
                  )}
                  {selectedResponse.visitType === 'OP' && (
                    <>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">OP Number</p>
                        <p className="font-semibold text-gray-900">{selectedResponse.opNumber || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">OP Date</p>
                        <p className="font-semibold text-gray-900">{selectedResponse.opDate || 'N/A'}</p>
                      </div>
                    </>
                  )}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Mobile Number</p>
                    <p className="font-semibold text-gray-900">{selectedResponse.mobile || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{selectedResponse.email || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold text-gray-900">{selectedResponse.address || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">City</p>
                    <p className="font-semibold text-gray-900">{selectedResponse.city || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">State</p>
                    <p className="font-semibold text-gray-900">{selectedResponse.state || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Pincode</p>
                    <p className="font-semibold text-gray-900">{selectedResponse.pincode || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Country</p>
                    <p className="font-semibold text-gray-900">{selectedResponse.country || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* What Made You to Choose Hospital */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">
                  What Made You to Choose {brandingSettings.hospitalName || 'Apollo Healthcare Center'} ?
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const choices = (selectedResponse.whyChooseUs && selectedResponse.whyChooseUs.length > 0)
                      ? selectedResponse.whyChooseUs
                      : ['Hospital Reputation', 'Doctor Recommendation', 'Friends / Relatives'];
                    return choices.map((choice, index) => (
                      <span
                        key={index}
                        className="px-3.5 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5 text-teal-600" />
                        {choice}
                      </span>
                    ));
                  })()}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">Service Ratings</h4>
                <div className="grid grid-cols-2 gap-3">
                  {(() => {
                    const list = [];
                    if (selectedResponse.rawRatings && selectedResponse.rawRatings.length > 0) {
                      selectedResponse.rawRatings.forEach((r) => {
                        list.push({
                          label: r.question_text || r.question_text_en || 'Service Rating',
                          rating: r.rating
                        });
                      });
                    } else if (selectedResponse.ratings && Object.keys(selectedResponse.ratings).length > 0) {
                      Object.entries(selectedResponse.ratings).forEach(([k, v]) => {
                        if (v > 0) {
                          const formattedLabel = k
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, str => str.toUpperCase())
                            .trim();
                          list.push({ label: formattedLabel, rating: v });
                        }
                      });
                    }

                    if (list.length === 0) {
                      return <div className="col-span-2 text-sm text-gray-500">No service ratings provided.</div>;
                    }

                    return list.map((rtg, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700 capitalize">{rtg.label}</span>
                        <span className="font-semibold text-teal-600">{rtg.rating}/5</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Yes/No Questions</h4>
                <div className="space-y-2">
                  {(() => {
                    const list = [];
                    if (selectedResponse.rawYesNo && selectedResponse.rawYesNo.length > 0) {
                      selectedResponse.rawYesNo.forEach((yn) => {
                        const ansStr = String(yn.answer).toLowerCase();
                        const isYes = (ansStr === '1' || ansStr === 'yes' || ansStr === 'true' || ansStr === 'ஆம்');
                        list.push({
                          label: yn.question_text || yn.question_en || yn.question_ta || 'Question',
                          answer: isYes ? 'Yes' : 'No',
                          remarks: yn.remarks
                        });
                      });
                    } else if (selectedResponse.yesNoAnswers && Object.keys(selectedResponse.yesNoAnswers).length > 0) {
                      const questionLabels = {
                        cleanlinessIssue: 'Cleanliness of the hospital environment (Toilets / Other areas)',
                        costExplained: 'Were you informed about the estimated cost of treatment at admission counter?',
                        wouldRecommend: 'Would you refer to your family / friends?'
                      };
                      Object.entries(selectedResponse.yesNoAnswers).forEach(([k, v]) => {
                        if (v !== null && v !== undefined) {
                          const lbl = questionLabels[k] || k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
                          list.push({
                            label: lbl,
                            answer: v ? 'Yes' : 'No'
                          });
                        }
                      });
                    }

                    if (list.length === 0) {
                      return <div className="text-sm text-gray-500">No Yes/No questions answered.</div>;
                    }

                    return list.map((yn, idx) => {
                      const isYes = yn.answer === 'Yes';
                      return (
                        <div key={idx} className="flex flex-col p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{yn.label}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isYes ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {yn.answer}
                            </span>
                          </div>
                          {yn.remarks && String(yn.remarks).trim() !== '' && (
                            <div className="mt-2 pl-3 border-l-2 border-gray-300">
                              <span className="text-xs text-gray-500 font-medium">Description: </span>
                              <span className="text-xs text-gray-600 italic">{yn.remarks}</span>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {selectedResponse.suggestions && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Suggestions</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{selectedResponse.suggestions}</p>
                  </div>
                </div>
              )}

              {/* Appreciation Section */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Appreciation</h4>
                {(() => {
                  const rawList = selectedResponse.appreciations || (selectedResponse as any).rawAppreciations || [];
                  const validApps = Array.isArray(rawList)
                    ? rawList.filter((a: any) => (a.name && a.name.trim()) || (a.person_name && a.person_name.trim()) || (a.note && a.note.trim()) || (a.comments && a.comments.trim()))
                    : [];

                  if (validApps.length === 0) {
                    return (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-500 italic">
                        No specific staff appreciation provided by this patient.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {validApps.map((appreciation: any, index: number) => {
                        const personName = appreciation.name || appreciation.person_name || 'Staff Member';
                        const dept = appreciation.department || 'General';
                        const commentsText = appreciation.note || appreciation.comments || '';
                        return (
                          <div key={index} className="p-4 bg-teal-50/70 rounded-xl border border-teal-100">
                            <div className="flex items-center gap-3 mb-1.5">
                              <span className="font-bold text-sm text-gray-900">{personName}</span>
                              {dept && (
                                <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded-full text-xs font-semibold">{dept}</span>
                              )}
                            </div>
                            {commentsText && (
                              <p className="text-gray-700 text-xs leading-relaxed">{commentsText}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Office Use Only Section */}
              {(() => {
                const key = selectedResponse.uhid;
                const ou = officeUseByResponse[key] || { reviewOfComplaint: '', dateOfReview: '', correctiveAction: '', preventiveAction: '', inchargeName: '' };
                const isReviewed = !!(ou.reviewOfComplaint || ou.dateOfReview || ou.inchargeName);
                const setOu = (next) => setOfficeUseByResponse(prev => ({ ...prev, [key]: next }));
                const formatDate = (d) => {
                  if (!d) return '—';
                  const dt = new Date(d);
                  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                };
                return (
                  <div style={{ marginTop: '24px' }}>
                    {/* Header */}
                    <div style={{ background: 'linear-gradient(135deg, #0f766e, #134e4a)', borderRadius: '12px 12px 0 0', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Lock style={{ color: '#fff', width: 18, height: 18 }} />
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>For Office Use Only</span>
                      </div>
                      <span style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.05em' }}>ADMIN ONLY</span>
                    </div>

                    {/* Body */}
                    <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Review of the Complaint</label>
                          <textarea
                            value={ou.reviewOfComplaint}
                            onChange={e => setOu({ ...ou, reviewOfComplaint: e.target.value })}
                            rows={3}
                            placeholder="Describe complaint investigation..."
                            style={{ width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '13px', color: '#1e293b', resize: 'vertical', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Corrective Action</label>
                          <textarea
                            value={ou.correctiveAction}
                            onChange={e => setOu({ ...ou, correctiveAction: e.target.value })}
                            rows={3}
                            placeholder="Immediate corrective steps taken..."
                            style={{ width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '13px', color: '#1e293b', resize: 'vertical', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Date of Review</label>
                          <input
                            type="date"
                            value={ou.dateOfReview}
                            onChange={e => setOu({ ...ou, dateOfReview: e.target.value })}
                            style={{ width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '13px', color: '#1e293b', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Preventive Action</label>
                          <textarea
                            value={ou.preventiveAction}
                            onChange={e => setOu({ ...ou, preventiveAction: e.target.value })}
                            rows={2}
                            placeholder="Long-term preventive measure..."
                            style={{ width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '13px', color: '#1e293b', resize: 'vertical', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Incharge Name / பொறுப்பாளர் பெயர்</label>
                        <input
                          type="text"
                          value={ou.inchargeName}
                          onChange={e => setOu({ ...ou, inchargeName: e.target.value })}
                          placeholder="e.g. Dr. Ramesh Kumar / Quality Manager"
                          style={{ width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '13px', color: '#1e293b', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }} className="no-print">
                        <button
                          type="button"
                          onClick={() => {
                            setOfficeUseByResponse(prev => ({ ...prev, [key]: ou }));
                            toast.success('Office Use details saved');
                          }}
                          style={{ background: '#0f766e', color: '#fff', padding: '8px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer' }}
                        >
                          Save Office Use Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit Question</h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">English Label</label>
                <input
                  type="text"
                  value={editingQuestion.label}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, label: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamil Label</label>
                <input
                  type="text"
                  value={editingQuestion.tamilLabel}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, tamilLabel: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating Mode</label>
                <select
                  value={editingQuestion.ratingMode}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, ratingMode: e.target.value as 'emoji' | 'star' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                >
                  <option value="emoji">Emoji Rating</option>
                  <option value="star">Star Rating</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showAddQuestion && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add New Question</h3>
              <button
                onClick={() => {
                  setShowAddQuestion(false);
                  setNewQuestion({ label: '', tamilLabel: '', ratingMode: 'emoji' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">English Label</label>
                <input
                  type="text"
                  value={newQuestion.label}
                  onChange={(e) => setNewQuestion({ ...newQuestion, label: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  placeholder="e.g., Ambulance Services"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamil Label</label>
                <input
                  type="text"
                  value={newQuestion.tamilLabel}
                  onChange={(e) => setNewQuestion({ ...newQuestion, tamilLabel: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  placeholder="e.g., ஆம்புலன்ஸ் சேவைகள்"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating Mode</label>
                <select
                  value={newQuestion.ratingMode}
                  onChange={(e) => setNewQuestion({ ...newQuestion, ratingMode: e.target.value as 'emoji' | 'star' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                >
                  <option value="emoji">Emoji Rating</option>
                  <option value="star">Star Rating</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddQuestion}
                  disabled={!newQuestion.label || !newQuestion.tamilLabel}
                  className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-300"
                >
                  Add Question
                </button>
                <button
                  onClick={() => {
                    setShowAddQuestion(false);
                    setNewQuestion({ label: '', tamilLabel: '', ratingMode: 'emoji' });
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Yes/No Question Modal */}
      {editingYesNoQuestion && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit Questionary Page Question</h3>
              <button onClick={() => setEditingYesNoQuestion(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">English Label</label>
                <input type="text" value={editingYesNoQuestion.label} onChange={(e) => setEditingYesNoQuestion({ ...editingYesNoQuestion, label: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamil Label</label>
                <input type="text" value={editingYesNoQuestion.tamilLabel} onChange={(e) => setEditingYesNoQuestion({ ...editingYesNoQuestion, tamilLabel: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => { setYesNoQuestions(yesNoQuestions.map(q => q.id === editingYesNoQuestion.id ? editingYesNoQuestion : q)); setEditingYesNoQuestion(null); }} className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Save</button>
                <button onClick={() => setEditingYesNoQuestion(null)} className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Yes/No Question Modal */}
      {showAddYesNoQuestion && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add Questionary Page Question</h3>
              <button onClick={() => { setShowAddYesNoQuestion(false); setNewYesNoQuestion({ label: '', tamilLabel: '' }); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">English Label</label>
                <input type="text" value={newYesNoQuestion.label} onChange={(e) => setNewYesNoQuestion({ ...newYesNoQuestion, label: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g., Any diet restrictions?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamil Label</label>
                <input type="text" value={newYesNoQuestion.tamilLabel} onChange={(e) => setNewYesNoQuestion({ ...newYesNoQuestion, tamilLabel: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g., உணவு கட்டுப்பாடுகள் ஏதேனும் உண்டா?" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => { const updatedYn = [...yesNoQuestions, { id: `yesno_new_${Date.now()}`, ...newYesNoQuestion }]; updateYesNoQuestions(updatedYn); setNewYesNoQuestion({ label: '', tamilLabel: '' }); setShowAddYesNoQuestion(false); toast.success('Question added'); }} disabled={!newYesNoQuestion.label} className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300">Add Question</button>
                <button onClick={() => { setShowAddYesNoQuestion(false); setNewYesNoQuestion({ label: '', tamilLabel: '' }); }} className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
