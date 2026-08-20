import React from 'react';
import { Heart, CheckCircle, Shield, Users } from 'lucide-react';

interface Hospital {
  id: number;
  name: string;
  logo: string | null;
  address: string | null;
  contactNumber: string | null;
}

interface WelcomePageProps {
  hospital: Hospital | null;
  language: 'en' | 'ta';
  onContinue: () => void;
}

export function WelcomePage({ hospital, language, onContinue }: WelcomePageProps) {
  if (!hospital) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 py-8 px-4">
      <div className="max-w-2xl w-full">
        {/* Header with Hospital Logo/Icon */}
        <div className="text-center mb-8">
          {hospital.logo ? (
            <img 
              src={hospital.logo} 
              alt={hospital.name} 
              className="h-20 w-20 object-contain mx-auto mb-4 rounded-lg shadow-md"
            />
          ) : (
            <div className="h-20 w-20 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md">
              <Heart className="w-10 h-10 text-white" />
            </div>
          )}
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {language === 'en' ? 'Welcome' : 'வரவேற்கிறோம்'}
          </h1>
          
          <p className="text-xl text-teal-600 font-semibold mb-2">
            {hospital.name}
          </p>
          
          <p className="text-gray-600 text-lg">
            {language === 'en' 
              ? 'We appreciate your valuable feedback' 
              : 'உங்கள் மதிப்புமிக்க கருத்துக்கு நாங்கள் நன்றி'}
          </p>
        </div>

        {/* Main Welcome Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            {language === 'en' 
              ? `Thank you for choosing ${hospital.name} for your healthcare needs. Your feedback is invaluable in helping us provide better services and improve patient care. This survey will take just a few minutes to complete.`
              : `${hospital.name}ஐ தேர்ந்தெடுத்தமைக்கு நன்றி. உங்கள் கருத்து சிறந்த சேவைகளை வழங்கவும் நோயாளி பராமரிப்பை மேம்படுத்தவும் எங்களுக்கு உதவுகிறது. இந்த கணக்கெடுப்பு சில நிமிடங்களில் முடிக்க முடியும்.`}
          </p>

          {/* Hospital Details */}
          {hospital.address && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">{language === 'en' ? 'Address' : 'முகவரி'}</p>
              <p className="text-gray-900 font-medium">{hospital.address}</p>
            </div>
          )}

          {hospital.contactNumber && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1">{language === 'en' ? 'Contact' : 'தொடர்பு'}</p>
              <p className="text-gray-900 font-medium">{hospital.contactNumber}</p>
            </div>
          )}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {language === 'en' ? 'What We Value' : 'நாங்கள் விரும்புவது'}
          </h2>

          <div className="space-y-4">
            {/* Benefit 1 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {language === 'en' ? 'Your Honest Feedback' : 'உங்கள் நேர்மையான கருத்து'}
                </h3>
                <p className="text-gray-600">
                  {language === 'en' 
                    ? 'Help us understand your experience and improve our services.' 
                    : 'உங்கள் அனுபவத்தைப் புரிந்துகொள்ள மற்றும் எங்கள் சேவைகளை மேம்படுத்த உதவுங்கள்.'}
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 mt-1">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {language === 'en' ? 'Complete Confidentiality' : 'முழு ரகசியத்தன்மை'}
                </h3>
                <p className="text-gray-600">
                  {language === 'en' 
                    ? 'Your responses are confidential and used only for service improvement.' 
                    : 'உங்கள் பதிலிகள் ரகசியமாக வைக்கப்படுகின்றன மற்றும் சேவை மேம்பாட்டுக்கு மட்டுமே பயன்படுத்தப்படுகின்றன.'}
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 mt-1">
                <Users className="w-6 h-6 text-teal-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {language === 'en' ? 'Making a Difference' : 'வேறுபாடு உண்டாக்குதல்'}
                </h3>
                <p className="text-gray-600">
                  {language === 'en' 
                    ? 'Your feedback directly influences our decisions to enhance patient care.' 
                    : 'உங்கள் கருத்து நோயாளி பராமரிப்பை மேம்படுத்த எங்கள் முடிவுகளை நேரடியாக பாதிக்கிறது.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info Box */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-6 md:p-8 border-2 border-teal-200 mb-8">
          <p className="text-center text-gray-700 mb-2">
            <span className="font-semibold text-teal-600 text-lg">⏱️ {language === 'en' ? '5-10 minutes' : '5-10 நிமிடங்கள்'}</span>
          </p>
          <p className="text-center text-gray-600">
            {language === 'en' 
              ? 'The feedback form typically takes 5-10 minutes to complete.' 
              : 'கருத்து படிவம் பொதுவாக 5-10 நிமிடங்களில் முடிக்க முடியும்.'}
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 text-lg"
        >
          {language === 'en' ? 'Continue to Feedback Form' : 'கருத்து படிவத்திற்கு செல்க'}
        </button>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-sm mt-6">
          {language === 'en' 
            ? 'Your feedback is confidential and used only to improve patient care.' 
            : 'உங்கள் கருத்து ரகசியமாக வைக்கப்பட்டு நோயாளி பராமரிப்பை மேம்படுத்த மட்டுமே பயன்படுத்தப்படுகிறது.'}
        </p>
      </div>
    </div>
  );
}
