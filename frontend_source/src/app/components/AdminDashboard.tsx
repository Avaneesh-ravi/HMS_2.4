import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Home, Image, Layout, MessageSquare, Settings, ChevronLeft, ChevronRight,
  Upload, Save, Filter, Download, Star, Smile, ArrowUpDown,
  Plus, Trash2, Edit2, Eye, X, GripVertical, LogOut, FileText,
  Hospital, User, TrendingUp, ThumbsUp, Pencil, Columns2, RectangleVertical,
  Building2, UserCircle, CreditCard, Stethoscope, Users, Pill, Activity,
  Shield, Utensils, HeartPulse, Droplet, Sparkles, Lock, Calendar, UserCircle2
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
  uhid: string;
  patientName: string;
  date: string;
  overallRating: number;
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
  setQuestions: (q: Question[]) => void;
  showColorPicker: string | null;
  setShowColorPicker: (id: string | null) => void;
}

function SortableQuestionCard({
  question,
  handleEditQuestion,
  handleDeleteQuestion,
  questions,
  setQuestions,
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
              setQuestions(updatedQuestions);
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
                        setQuestions(updatedQuestions);
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
                    setQuestions(updatedQuestions);
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

export function AdminDashboard({ onClose, onLogout, onBrandingUpdate, currentBranding }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<SidebarItem>('overview');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [sortField, setSortField] = useState<'date' | 'patientName' | 'overallRating'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [formBuilderTab, setFormBuilderTab] = useState<FormBuilderTab>('service-feedback');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(currentBranding);
  const [logoPreview, setLogoPreview] = useState<string>(currentBranding.logo);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', label: 'Reception Experience', tamilLabel: 'வரவேற்பு அனுபவம்', ratingMode: 'emoji', category: 'reception' },
    { id: '2', label: 'Admission Process', tamilLabel: 'சேர்க்கை செயல்முறை', ratingMode: 'emoji', category: 'admission' },
    { id: '3', label: 'Billing Services', tamilLabel: 'கட்டண சேவைகள்', ratingMode: 'emoji', category: 'billing' },
    { id: '4', label: 'Doctor Treatment', tamilLabel: 'மருத்துவர் சிகிச்சை', ratingMode: 'emoji', category: 'doctor' },
    { id: '5', label: 'Nursing Care', tamilLabel: 'செவிலியர் பராமரிப்பு', ratingMode: 'emoji', category: 'nursing' },
    { id: '6', label: 'Pharmacy Services', tamilLabel: 'மருந்தக சேவைகள்', ratingMode: 'emoji', category: 'pharmacy' },
    { id: '7', label: 'Lab & Scan Services', tamilLabel: 'ஆய்வகம் & ஸ்கேன்', ratingMode: 'emoji', category: 'lab' },
    { id: '8', label: 'Insurance Services', tamilLabel: 'காப்பீடு சேவைகள்', ratingMode: 'emoji', category: 'insurance' },
    { id: '9', label: 'Food Services', tamilLabel: 'உணவு சேவைகள்', ratingMode: 'emoji', category: 'food' },
    { id: '10', label: 'Physiotherapy', tamilLabel: 'உடற்பயிற்சி சிகிச்சை', ratingMode: 'emoji', category: 'physiotherapy' },
    { id: '11', label: 'Blood Bank', tamilLabel: 'இரத்த வங்கி', ratingMode: 'emoji', category: 'bloodbank' },
    { id: '12', label: 'Cleanliness', tamilLabel: 'தூய்மை', ratingMode: 'emoji', category: 'cleanliness' },
    { id: '13', label: 'Overall Experience', tamilLabel: 'ஒட்டுமொத்த அனுபவம்', ratingMode: 'emoji', category: 'overall' },
  ]);

  const [yesNoQuestions, setYesNoQuestions] = useState<Omit<Question, 'ratingMode' | 'category'>[]>([
    { id: 'yesno-1', label: 'Did you face any cleanliness issues?', tamilLabel: 'தூய்மை பிரச்சினைகளை எதிர்கொண்டீர்களா?' },
    { id: 'yesno-2', label: 'Was the cost explained at the time of admission?', tamilLabel: 'சேர்க்கையின் போது செலவு விளக்கப்பட்டதா?' },
    { id: 'yesno-3', label: 'Would you recommend our hospital?', tamilLabel: 'எங்கள் மருத்துவமனையை பரிந்துரைப்பீர்களா?' }
  ]);

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
  const [layoutMode, setLayoutMode] = useState<'2-column' | '1-column'>('2-column');
  const [yesNoLayoutMode, setYesNoLayoutMode] = useState<'2-column' | '1-column'>('2-column');
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, boolean | null>>({});
  const [combinePages, setCombinePages] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const [themeColor, setThemeColor] = useState<string>('#0d9488');
  const [fontSize, setFontSize] = useState<string>('Normal');
  const [showPageTitleLabels, setShowPageTitleLabels] = useState<boolean>(true);
  const [departments, setDepartments] = useState<string[]>([]);
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

  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const getApiUrl = (endpoint: string) => {
      const p = window.location.pathname;
      if (p.includes('api/backend/admin')) return `../ajax/${endpoint}`;
      if (p.includes('api/frontend')) return `../backend/ajax/${endpoint}`;
      return `../api/backend/ajax/${endpoint}`;
    };
    
    fetch(getApiUrl('get-responses.php'), { credentials: 'same-origin' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(text => {
        try {
          const data = JSON.parse(text);
          if (data.success && data.data) {
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
              const parseRatingStr = (r: string) => {
                if(!r) return 0;
                let s = String(r).toLowerCase();
                if(s==='excellent'||s==='5') return 5;
                if(s==='good'||s==='4') return 4;
                if(s==='average'||s==='3') return 3;
                if(s==='bad'||s==='2') return 2;
                if(s==='poor'||s==='1') return 1;
                let parsed = parseInt(s);
                return isNaN(parsed) ? 0 : parsed;
              };
              let computedOverall = 0;
              if (item.rawRatings && item.rawRatings.length > 0) {
                 const sum = item.rawRatings.reduce((acc: number, cur: any) => acc + parseRatingStr(cur.rating), 0);
                 computedOverall = sum / item.rawRatings.length;
              }
              let computedRecommend = false;
              if (item.rawYesNo && item.rawYesNo.length > 0) {
                 const recObj = item.rawYesNo.find((y: any) => String(y.question_text || y.question_en || y.question_text_en).toLowerCase().includes('recommend'));
                 if (recObj) {
                     let ans = String(recObj.answer).toLowerCase();
                     computedRecommend = (ans === '1' || ans === 'yes' || ans === 'true');
                 }
              }
              return {
                ...item,
                overallRating: computedOverall,
                wouldRecommend: computedRecommend,
                ratings: {},
                yesNoAnswers: {},
                appreciations: [],
                whyChooseUs: []
              };
            });
            setResponses(fetchedResponses);
          } else {
             console.error("API returned failure:", data);
             setApiError(data.message || "API returned failure");
          }
        } catch (e) {
          console.error("JSON parse error, text was:", text);
          setApiError("Invalid JSON from server. Check console.");
        }
      })
      .catch(e => {
        console.error("Network or fetch error:", e);
        setApiError(e.message);
      });



    fetch(getApiUrl('get-questions.php'), { credentials: 'same-origin' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
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
      setQuestions(questions.map(q => q.id === editingQuestion.id ? editingQuestion : q));
      setEditingQuestion(null);
      toast.success('Question updated successfully');
    }
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setQuestions(questions.filter(q => q.id !== id));
      toast.success('Question deleted successfully');
    }
  };

  const handleAddQuestion = () => {
    const newId = `new_${Date.now()}`;
    setQuestions([...questions, { id: newId, ...newQuestion }]);
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
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const [isSavingQuestions, setIsSavingQuestions] = useState(false);

  const handleSaveQuestions = async () => {
    setIsSavingQuestions(true);
    try {
      const getApiUrl = (endpoint: string) => {
        const p = window.location.pathname;
        if (p.includes('api/backend/admin')) return `../ajax/${endpoint}`;
        if (p.includes('api/frontend')) return `../backend/ajax/${endpoint}`;
        return `../api/backend/ajax/${endpoint}`;
      };

      const apiUrl = getApiUrl('save-questions.php');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ 
          questions, 
          yesno_questions: yesNoQuestions,
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
        toast.success('Form configuration saved successfully to DB!');
        // Ideally we fetch again to get the real DB IDs for new questions
        const refreshRes = await fetch(getApiUrl('get-questions.php'), { credentials: 'same-origin' });
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          if (refreshData.data && refreshData.data.length > 0) setQuestions(refreshData.data);
          if (refreshData.yesno_data && refreshData.yesno_data.length > 0) setYesNoQuestions(refreshData.yesno_data);
        }
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
     if (r.wouldRecommend) recommendCount++;
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

  // Filtering & Sorting
  const filteredAndSortedResponses = useMemo(() => {
    let result = [...responses];

    // date filter
    if (fromDate || toDate) {
      result = result.filter(res => {
        const parts = String(res.date).split('/');
        if (parts.length === 3) {
          const rDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
          if (fromDate && rDate < fromDate) return false;
          if (toDate && rDate > toDate) return false;
        }
        return true;
      });
    }

    // sort
    result.sort((a, b) => {
      let comp = 0;
      if (sortField === 'date') {
        const aP = String(a.date).split('/');
        const bP = String(b.date).split('/');
        const tA = (aP.length===3) ? new Date(`${aP[2]}-${aP[1]}-${aP[0]}`).getTime() : 0;
        const tB = (bP.length===3) ? new Date(`${bP[2]}-${bP[1]}-${bP[0]}`).getTime() : 0;
        comp = tA > tB ? 1 : tA < tB ? -1 : 0;
      } else if (sortField === 'patientName') {
        comp = (String(a.patientName || '')).localeCompare(String(b.patientName || ''));
      } else if (sortField === 'overallRating') {
        comp = (a.overallRating || 0) - (b.overallRating || 0);
      }
      return sortDirection === 'desc' ? -comp : comp;
    });

    return result;
  }, [responses, fromDate, toDate, sortField, sortDirection]);

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
            onClick={onClose}
            className={`w-full text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm flex items-center gap-2 ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <ChevronLeft className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && 'Back to Form'}
          </button>
          <button
            onClick={onLogout}
            className={`w-full bg-red-500/20 text-white px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors text-sm flex items-center gap-2 ${sidebarCollapsed ? 'justify-center' : ''}`}
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
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h2>

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
                    {apiError && <div className="mt-2 text-xs text-red-600 font-medium">{apiError}</div>}
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Logo</label>
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-gray-200">
                            {logoPreview ? (
                              <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                              <Image className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/svg+xml,image/webp"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <button
                            onClick={handleLogoClick}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all transform hover:scale-105"
                          >
                            <Upload className="w-4 h-4" />
                            Upload Logo
                          </button>
                        </div>
                      </div>

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
                          onClick={() => {
                            if (newDepartment.trim() && !departments.includes(newDepartment.trim())) {
                              setDepartments([...departments, newDepartment.trim()]);
                              setNewDepartment('');
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
                              onClick={() => setDepartments(departments.filter((_, i) => i !== index))}
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
                              onClick={() => setLayoutMode('2-column')}
                              className={`flex items-center gap-2 px-3 py-2 rounded-md font-semibold text-xs transition-all ${
                                layoutMode === '2-column'
                                  ? 'bg-teal-600 text-white'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                              title="2 Column"
                            >
                              <Columns2 className="w-4 h-4" />
                              2 Column
                            </button>
                            <button
                              onClick={() => setLayoutMode('1-column')}
                              className={`flex items-center gap-2 px-3 py-2 rounded-md font-semibold text-xs transition-all ${
                                layoutMode === '1-column'
                                  ? 'bg-teal-600 text-white'
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
                              <SortableQuestionCard 
                                key={question.id} 
                                question={question}
                                handleEditQuestion={handleEditQuestion}
                                handleDeleteQuestion={handleDeleteQuestion}
                                questions={questions}
                                setQuestions={setQuestions}
                                showColorPicker={showColorPicker}
                                setShowColorPicker={setShowColorPicker}
                              />
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
                              onChange={(e) => setCombinePages(e.target.checked)}
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
                  <div className="flex items-center gap-4 mb-6">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                    <div className="flex gap-2 items-center text-sm ml-auto">
  <label className="text-gray-600 font-medium whitespace-nowrap">From:</label>
  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-gray-300 rounded px-2 py-1 outline-none focus:border-teal-500" />
</div>
<div className="flex gap-2 items-center text-sm mr-4">
  <label className="text-gray-600 font-medium whitespace-nowrap">To:</label>
  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-gray-300 rounded px-2 py-1 outline-none focus:border-teal-500" />
</div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Date</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">UHID</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Patient Name</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Overall Rating</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Recommendation</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">View</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Office Use</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedResponses.map((response) => {
                          const officeUseFilled = !!(officeUseByResponse[response.uhid]?.reviewOfComplaint || officeUseByResponse[response.uhid]?.inchargeName);
                          return (
                            <tr key={response.uhid} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-4">{response.date}</td>
                              <td className="py-4 px-4 font-medium">{response.uhid}</td>
                              <td className="py-4 px-4">{response.patientName}</td>
                              <td className="py-4 px-4">
                                <span className="inline-flex items-center gap-1 text-yellow-600">
                                  <Star className="w-4 h-4 fill-current" />
                                  {Math.round(Number(response.overallRating || 0) * 10) / 10}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  response.wouldRecommend ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {response.wouldRecommend ? 'Yes' : 'No'}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <button
                                  onClick={() => setSelectedResponse(response)}
                                  className="p-2 hover:bg-teal-50 rounded-lg transition-colors flex items-center justify-center m-auto"
                                >
                                  <Eye className="w-5 h-5 text-teal-600" />
                                </button>
                              </td>
                              <td className="py-4 px-4">
                                {officeUseFilled ? (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md text-xs font-semibold">
                                    ✓ Done
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setOfficeUseModalData(officeUseByResponse[response.uhid] || { reviewOfComplaint: '', dateOfReview: '', correctiveAction: '', preventiveAction: '', inchargeName: '' });
                                      setOfficeUseModalResponse(response);
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-700 border border-gray-300 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors"
                                  >
                                    Fill ✏️
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
                        onClick={() => {
                          setOfficeUseByResponse({ ...officeUseByResponse, [officeUseModalResponse.uhid]: { ...officeUseModalData } });
                          setOfficeUseModalResponse(null);
                          toast.success('Office Use record saved successfully');
                        }}
                        style={{ background: '#0D9488' }}
                        className="px-6 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
              </>
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
                <button onClick={() => { setYesNoQuestions([...yesNoQuestions, { id: `yesno_new_${Date.now()}`, ...newYesNoQuestion }]); setNewYesNoQuestion({ label: '', tamilLabel: '' }); setShowAddYesNoQuestion(false); }} disabled={!newYesNoQuestion.label} className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300">Add Question</button>
                <button onClick={() => { setShowAddYesNoQuestion(false); setNewYesNoQuestion({ label: '', tamilLabel: '' }); }} className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-2xl font-bold text-gray-900">Feedback Detail</h3>
              <button
                onClick={() => setSelectedResponse(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
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
                    <p className="font-semibold text-teal-600 flex items-center gap-1">
                      <Star className="w-5 h-5 fill-current" />
                      {selectedResponse.overallRating}/5
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
                    <p className="font-semibold text-gray-900">{selectedResponse.mobile}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{selectedResponse.email}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold text-gray-900">{selectedResponse.address}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">City</p>
                    <p className="font-semibold text-gray-900">{selectedResponse.city}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">State</p>
                    <p className="font-semibold text-gray-900">{selectedResponse.state}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Pincode</p>
                    <p className="font-semibold text-gray-900">{selectedResponse.pincode}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Country</p>
                    <p className="font-semibold text-gray-900">{selectedResponse.country}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">Why Did You Choose Us?</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedResponse.whyChooseUs.map((choice, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium"
                    >
                      {choice}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">Service Ratings</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedResponse.rawRatings?.map((rtg: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700 capitalize">{rtg.question_text || 'Service Rating'}</span>
                        <span className="font-semibold text-teal-600">{rtg.rating}/5</span>
                      </div>
                  ))}
                  {(!selectedResponse.rawRatings || selectedResponse.rawRatings.length === 0) && (
                     <div className="col-span-2 text-sm text-gray-500">No service ratings provided.</div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Yes/No Questions</h4>
                <div className="space-y-2">
                  {selectedResponse.rawYesNo?.map((yn: any, idx: number) => {
                     let ans = String(yn.answer).toLowerCase();
                     let isYes = (ans === '1' || ans === 'yes' || ans === 'true');
                     return (
                        <div key={idx} className="flex flex-col p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{yn.question_text || yn.question_en || 'Question'}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isYes ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {isYes ? 'Yes' : 'No'}
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
                  })}
                  {(!selectedResponse.rawYesNo || selectedResponse.rawYesNo.length === 0) && (
                     <div className="text-sm text-gray-500">No Yes/No questions answered.</div>
                  )}
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

              {selectedResponse.appreciations.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Staff Appreciations</h4>
                  <div className="space-y-3">
                    {selectedResponse.appreciations.map((appreciation, index) => (
                      <div key={index} className="p-4 bg-teal-50 rounded-lg border border-teal-100">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="font-semibold text-gray-900">{appreciation.name}</span>
                          <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">{appreciation.department}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{appreciation.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Office Use Only Section */}
              {(() => {
                const key = selectedResponse.uhid;
                const ou: OfficeUse = officeUseByResponse[key] || { reviewOfComplaint: '', dateOfReview: '', correctiveAction: '', preventiveAction: '', inchargeName: '' };
                const isReviewed = !!(ou.reviewOfComplaint || ou.dateOfReview || ou.inchargeName);
                const setOu = (next: OfficeUse) => setOfficeUseByResponse(prev => ({ ...prev, [key]: next }));
                const formatDate = (d: string) => {
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
                      {/* Summary row */}
                      <div style={{ background: '#fff', borderRadius: '8px', padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '0', flexWrap: 'wrap', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                        {[
                          { icon: '🔍', label: 'Complaint Reviewed', value: ou.reviewOfComplaint ? 'Yes' : '—' },
                          { icon: '📅', label: 'Review Date', value: formatDate(ou.dateOfReview) },
                          { icon: '👤', label: 'Incharge', value: ou.inchargeName || '—' },
                        ].map((item, i) => (
                          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0 14px', borderRight: i < 2 ? '1px solid #e2e8f0' : 'none', color: '#374151' }}>
                            <span>{item.icon}</span>
                            <span style={{ color: '#6b7280' }}>{item.label}:</span>
                            <span style={{ fontWeight: 600 }}>{item.value}</span>
                          </span>
                        ))}
                        <span style={{ marginLeft: 'auto', paddingLeft: '14px' }}>
                          <span style={{ background: isReviewed ? '#dcfce7' : '#fef3c7', color: isReviewed ? '#15803d' : '#92400e', padding: '3px 10px', borderRadius: '20px', fontWeight: 600, fontSize: '12px' }}>
                            {isReviewed ? '● Reviewed' : '● Pending Review'}
                          </span>
                        </span>
                      </div>

                      {/* 2-column fields */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {/* Left */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Review of the Complaint</div>
                            {officeUseEditing ? (
                              <textarea value={ou.reviewOfComplaint} onChange={e => setOu({ ...ou, reviewOfComplaint: e.target.value })} rows={3} placeholder="Enter review details..." style={{ width: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', color: '#374151', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
                            ) : (
                              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', color: ou.reviewOfComplaint ? '#374151' : '#9ca3af', fontStyle: ou.reviewOfComplaint ? 'normal' : 'italic', minHeight: '70px' }}>{ou.reviewOfComplaint || 'Not reviewed yet'}</div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Date of Review</div>
                            {officeUseEditing ? (
                              <input type="date" value={ou.dateOfReview} onChange={e => setOu({ ...ou, dateOfReview: e.target.value })} style={{ width: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', color: '#374151', outline: 'none', boxSizing: 'border-box' }} />
                            ) : (
                              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar style={{ width: 16, height: 16, color: '#0d9488' }} />
                                <span>{formatDate(ou.dateOfReview)}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Incharge Name / பொறுப்பாளர் பெயர்</div>
                            {officeUseEditing ? (
                              <input type="text" value={ou.inchargeName} onChange={e => setOu({ ...ou, inchargeName: e.target.value })} placeholder="Enter incharge name" style={{ width: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', color: '#374151', outline: 'none', boxSizing: 'border-box' }} />
                            ) : (
                              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <UserCircle2 style={{ width: 16, height: 16, color: '#0d9488' }} />
                                <span>{ou.inchargeName || '—'}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Corrective Action</div>
                            {officeUseEditing ? (
                              <textarea value={ou.correctiveAction} onChange={e => setOu({ ...ou, correctiveAction: e.target.value })} rows={3} placeholder="Enter corrective action..." style={{ width: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', color: '#374151', resize: 'vertical', outline: 'none', boxSizing: 'border-box', minHeight: '70px' }} />
                            ) : (
                              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', color: ou.correctiveAction ? '#374151' : '#9ca3af', fontStyle: ou.correctiveAction ? 'normal' : 'italic', minHeight: '70px' }}>{ou.correctiveAction || 'Not filled yet'}</div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Preventive Action</div>
                            {officeUseEditing ? (
                              <textarea value={ou.preventiveAction} onChange={e => setOu({ ...ou, preventiveAction: e.target.value })} rows={3} placeholder="Enter preventive action..." style={{ width: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', color: '#374151', resize: 'vertical', outline: 'none', boxSizing: 'border-box', minHeight: '70px' }} />
                            ) : (
                              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', color: ou.preventiveAction ? '#374151' : '#9ca3af', fontStyle: ou.preventiveAction ? 'normal' : 'italic', minHeight: '70px' }}>{ou.preventiveAction || 'Not filled yet'}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Edit / Save button */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                        {officeUseEditing ? (
                          <button
                            onClick={() => { setOfficeUseEditing(false); toast.success('Office details saved'); }}
                            style={{ background: '#0d9488', color: '#fff', border: '1.5px solid #0d9488', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Save style={{ width: 14, height: 14 }} /> Save Details
                          </button>
                        ) : (
                          <button
                            onClick={() => setOfficeUseEditing(true)}
                            style={{ background: '#fff', color: '#0d9488', border: '1.5px solid #0d9488', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 150ms ease' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#0d9488'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; (e.currentTarget as HTMLButtonElement).style.color = '#0d9488'; }}
                          >
                            ✏️ Fill Office Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => { setSelectedResponse(null); setOfficeUseEditing(false); }}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
