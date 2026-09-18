import { FeedbackResponse, Question, YesNoQuestionItem } from '../types';

export function getEffectiveHospitalId(): string {
  const urlParams = new URLSearchParams(window.location.search);
  const hidParam = urlParams.get('hospital_id') || urlParams.get('id');
  if (hidParam && hidParam.trim() !== '') return hidParam.trim();
  const storedHid = localStorage.getItem('hms_hospital_id') || localStorage.getItem('selectedHospitalId');
  if (storedHid && storedHid.trim() !== '') return storedHid.trim();
  return 'apollo-hospital';
}

export async function fetchHospitalResponses(hospitalId: string): Promise<any> {
  const isVercel = window.location.hostname.includes('vercel.app') || window.location.port !== '';
  let endpoint = isVercel ? `/api/get-responses?hospital_id=${hospitalId}` : `api/get-responses.php?hospital_id=${hospitalId}`;
  if (window.location.pathname.includes('api/frontend') || window.location.pathname.includes('api/backend')) {
    endpoint = `../get-responses.js?hospital_id=${hospitalId}`;
  }
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

export async function saveOfficeUseAction(payload: {
  hospitalId: string;
  uhid: string;
  patientName?: string;
  date?: string;
  reviewOfComplaint: string;
  dateOfReview: string;
  correctiveAction: string;
  preventiveAction: string;
  inchargeName: string;
}): Promise<any> {
  const endpoints = ['/api/save-office-use', 'api/save-office-use', '../save-office-use.js', 'save-office-use.js'];
  let lastError: any = null;
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Failed to save office use details');
}
