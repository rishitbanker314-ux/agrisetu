import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-paper-ivory font-sans selection:bg-moss/30 selection:text-deep-forest text-ink pb-24">
      <div className="bg-deep-forest text-white py-16 px-6 text-center border-b border-moss">
        <h1 className="text-4xl font-serif font-medium tracking-tight mb-4">Terms and Conditions</h1>
        <p className="text-sand/80 max-w-2xl mx-auto">Please read these terms and conditions carefully before using the AgriSetu platform.</p>
      </div>
      
      <div className="max-w-3xl mx-auto mt-12 px-6">
        <div className="bg-white p-8 rounded-2xl border border-soft-line shadow-sm prose prose-stone max-w-none">
          <p className="text-sm text-ink/60 mb-8">Last updated: September 2026</p>
          
          <h2 className="text-2xl font-serif text-deep-forest mb-4">1. Acceptance of Terms</h2>
          <p className="mb-6 leading-relaxed">
            By accessing and using AgriSetu ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services.
          </p>

          <h2 className="text-2xl font-serif text-deep-forest mb-4">2. Description of Service</h2>
          <p className="mb-6 leading-relaxed">
            AgriSetu provides agricultural intelligence, satellite monitoring, and field reporting tools. The data provided, including NDVI assessments, weather forecasts, and pest risks, are estimates based on available remote sensing data and models. They do not replace professional agronomic consultation.
          </p>

          <h2 className="text-2xl font-serif text-deep-forest mb-4">3. Data Privacy and Security</h2>
          <p className="mb-6 leading-relaxed">
            We prioritize the security of your agricultural data. Your field boundaries, reports, and personal information are stored securely. By using the platform, you consent to the collection and use of this data to generate agronomic insights as outlined in our Privacy Policy.
          </p>

          <h2 className="text-2xl font-serif text-deep-forest mb-4">4. Limitation of Liability</h2>
          <p className="mb-6 leading-relaxed">
            AgriSetu shall not be liable for any direct, indirect, incidental, or consequential agricultural losses resulting from the use or inability to use our services, or from reliance on the data provided by the Platform. Agricultural decisions should always be made in consultation with local experts.
          </p>

          <h2 className="text-2xl font-serif text-deep-forest mb-4">5. User Responsibilities</h2>
          <p className="mb-6 leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials. You agree to use the Platform only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the Platform.
          </p>
        </div>
      </div>
    </div>
  );
}
