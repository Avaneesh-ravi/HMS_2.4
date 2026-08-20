import React, { useState, useEffect } from 'react';
import { Hospital, Search, Shield, ArrowLeft, X, Lock } from 'lucide-react';

interface Hospital {
  id: number;
  name: string;
  logo: string | null;
  address: string | null;
  contactNumber: string | null;
}

interface HospitalSelectionProps {
  selectedHospitalId: number | null;
  onHospitalSelect: (hospital: Hospital) => void;
  language: 'en' | 'ta';
  loading?: boolean;
}

export function HospitalSelection({ 
  selectedHospitalId, 
  onHospitalSelect, 
  language, 
  loading = false 
}: HospitalSelectionProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Login State
  const [selectedHospitalForLogin, setSelectedHospitalForLogin] = useState<Hospital | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoadingHospitals(true);
      setError(null);
      
      const getApiUrl = (endpoint: string) => {
        const p = window.location.pathname;
        if (p.includes('api/backend/admin')) return `../ajax/${endpoint}`;
        if (p.includes('api/frontend')) return `../backend/ajax/${endpoint}`;
        return `../api/backend/ajax/${endpoint}`;
      };

      const response = await fetch(getApiUrl('get-hospitals.php'), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.hospitals)) {
        setHospitals(data.hospitals);
      } else {
        throw new Error(data.message || 'Failed to fetch hospitals');
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      // Fallback for testing
      setHospitals([
        {
          id: 1,
          name: 'Apollo Healthcare Center',
          logo: null,
          address: '123 Health Street, Chennai - 600001',
          contactNumber: '+91 44 1234 5678'
        },
        {
          id: 2,
          name: 'City General Hospital',
          logo: null,
          address: '456 Medical Blvd, Chennai - 600002',
          contactNumber: '+91 44 9876 5432'
        }
      ]);
    } finally {
      setLoadingHospitals(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospitalForLogin) return;

    if (!loginUsername || !loginPassword) {
      setLoginError('Username and password are required');
      return;
    }
    
    setIsLoggingIn(true);
    setLoginError('');
    
    try {
      const getApiUrl = (endpoint: string) => {
        const p = window.location.pathname;
        if (p.includes('api/backend/admin')) return `../ajax/${endpoint}`;
        if (p.includes('api/frontend')) return `../backend/ajax/${endpoint}`;
        return `../api/backend/ajax/${endpoint}`;
      };

      const response = await fetch(getApiUrl('login-ajax.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginUsername, password: loginPassword })
      });
      const data = await response.json();
      
      if (data.success) {
        onHospitalSelect(selectedHospitalForLogin);
      } else {
        setLoginError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      setLoginError('Failed to connect to authentication server');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const filteredHospitals = hospitals.filter(hospital => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return false;
    
    const nameStr = hospital.name.toLowerCase();
    
    // As requested: STRICTLY match only from the very first letter of the hospital name
    return nameStr.startsWith(q);
  });

  return (
    <div className="w-full flex flex-col items-center pt-8 md:pt-14 px-4 sm:px-6">
      <div className="text-center mb-8 md:mb-12 w-full">
        <h1 className="text-3xl md:text-[2.5rem] font-extrabold text-slate-900 mb-3 md:mb-5 tracking-tight">
          {language === 'en' ? 'Welcome' : 'வரவேற்கிறோம்'}
        </h1>
        <p className="text-gray-500 text-[15px] md:text-[17px] max-w-sm md:max-w-md mx-auto leading-relaxed px-2">
          {language === 'en'
            ? 'Please select your healthcare center to continue providing your valuable feedback.'
            : 'உங்கள் மதிப்புமிக்க கருத்தை வழங்க தொடர உங்கள் சுகாதார மையத்தை தேர்ந்தெடுக்கவும்.'}
        </p>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-2 md:p-3 mb-12 md:mb-16 transition-shadow duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        
        {!selectedHospitalForLogin ? (
          <>
            <div className="relative p-1 md:p-2">
              <Search className="w-5 h-5 text-teal-600/80 absolute left-5 md:left-7 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search your hospital...' : 'உங்கள் மருத்துவமனையைத் தேடுங்கள்...'}
                className="w-full pl-11 md:pl-14 pr-4 py-3.5 md:py-4 bg-slate-50/50 hover:bg-slate-50 border border-gray-200/80 rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all duration-300 text-slate-800 text-[15px] md:text-base font-medium placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            {/* Results */}
            <div className={`px-2 pb-2 ${searchQuery.trim().length > 0 ? 'block' : 'hidden'}`}>
              {loadingHospitals || loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
              ) : filteredHospitals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {language === 'en'
                    ? 'No healthcare centers found matching your search.'
                    : 'உங்கள் தேடலுக்கு ஏற்ற மருத்துவமனைகள் எதுவும் கிடைக்கவில்லை.'}
                </div>
              ) : (
                <div className="mt-2 block">
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredHospitals.map((hospital) => (
                      <button
                        key={hospital.id}
                        onClick={() => setSelectedHospitalForLogin(hospital)}
                        className="w-full text-left p-3.5 md:p-4 rounded-xl border border-transparent hover:border-teal-100 hover:bg-teal-50/50 hover:shadow-sm transition-all duration-300 group flex items-center md:items-start gap-4 cursor-pointer"
                      >
                        <div className="flex-shrink-0 p-2.5 md:p-3 bg-teal-50 group-hover:bg-teal-500 rounded-lg md:rounded-xl transition-colors duration-300">
                          <Hospital className="w-5 h-5 md:w-6 md:h-6 text-teal-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[15px] md:text-[17px] font-bold text-slate-800 mb-0.5 md:mb-1 group-hover:text-teal-900 transition-colors truncate">
                            {hospital.name}
                          </h3>
                          {hospital.address && (
                            <p className="text-[13px] md:text-[14px] text-slate-500 font-medium truncate group-hover:text-teal-700/70 transition-colors">
                              {hospital.address}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-5 sm:p-8">
            <button 
              onClick={() => {
                setSelectedHospitalForLogin(null);
                setLoginError('');
                setLoginUsername('');
                setLoginPassword('');
              }}
              className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 mb-6 md:mb-8 group w-fit"
            >
              <div className="p-1 rounded-md group-hover:bg-slate-100 transition-colors">
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span className="font-semibold text-[14px] md:text-[15px]">
                {language === 'en' ? 'Back to search' : 'தேடலுக்குத் திரும்பு'}
              </span>
            </button>
            
            <div className="mb-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                <div className="p-2.5 sm:p-3 bg-teal-50 border border-teal-100/50 rounded-xl shadow-sm">
                  <Hospital className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                </div>
                <h3 className="text-[19px] sm:text-[22px] font-extrabold text-slate-800 leading-tight">{selectedHospitalForLogin.name}</h3>
              </div>
              <p className="text-slate-500 text-[14px] sm:text-[15px] sm:pl-[3.5rem] font-medium leading-relaxed">
                {language === 'en'
                  ? "Please securely authenticate to access this facility's feedback form."
                  : 'இந்த மருத்துவமனையின் கருத்துப் படிவத்தை அணுக பாதுகாப்பாக உள்நுழையவும்.'}
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5 sm:pl-[3.5rem] max-w-sm">
              <div>
                <label className="block text-[13px] sm:text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  {language === 'en' ? 'Username / Email' : 'பயனர்பெயர் / மின்னஞ்சல்'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal text-[15px]"
                    placeholder={language === 'en' ? 'Enter username' : 'பயனர்பெயரை உள்ளிடவும்'}
                    disabled={isLoggingIn}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[13px] sm:text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  {language === 'en' ? 'Password' : 'கடவுச்சொல்'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal text-[15px]"
                    placeholder={language === 'en' ? 'Enter password' : 'கடவுச்சொல்லை உள்ளிடவும்'}
                    disabled={isLoggingIn}
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 text-red-700 text-[13px] sm:text-sm font-medium rounded-xl border border-red-100 flex items-start gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-1">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 text-red-500" />
                  <p className="leading-snug">{loginError}</p>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 sm:py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-70 shadow-md hover:shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 mt-2"
              >
                {isLoggingIn ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-[15px] sm:text-[16px]">
                      {language === 'en' ? 'Login & Continue' : 'உள்நுழைந்து தொடரவும்'}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
      
      <p className="text-[13px] md:text-[15px] font-semibold text-slate-400 mt-2 md:mt-6 text-center px-6">
        {language === 'en'
          ? 'Your feedback is strictly confidential and used solely to improve patient care.'
          : 'உங்கள் கருத்து முற்றிலும் ரகசியமானது மற்றும் நோயாளி பராமரிப்பை மேம்படுத்த மட்டுமே பயன்படுத்தப்படுகிறது.'}
      </p>
    </div>
  );
}
