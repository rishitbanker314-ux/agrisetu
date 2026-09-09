import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper-ivory font-sans selection:bg-moss/30 selection:text-deep-forest text-ink pb-24">
      <div className="bg-deep-forest text-white py-16 px-6 text-center border-b border-moss">
        <h1 className="text-4xl font-serif font-medium tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-sand/80 max-w-2xl mx-auto">How we collect, use, and protect your agricultural data.</p>
      </div>
      
      <div className="max-w-3xl mx-auto mt-12 px-6">
        <div className="bg-white p-8 md:p-12 rounded-2xl border border-soft-line shadow-sm prose prose-stone max-w-none">
          <p className="text-sm text-ink/60 mb-8 font-medium tracking-wide uppercase">Last updated: September 2026</p>
          
          <h2 className="text-2xl font-serif text-deep-forest mb-4">1. Information We Collect</h2>
          <p className="mb-6 leading-relaxed text-ink/90">
            When you use AgriSetu, we collect personal information you provide to us (such as name, email, and phone number), as well as agricultural data you input or generate (such as farm coordinates, field boundaries, crop types, photos of crops, and field notes). We also collect telemetry data on how you interact with the platform to improve our services.
          </p>

          <h2 className="text-2xl font-serif text-deep-forest mb-4">2. How We Use Your Data</h2>
          <p className="mb-6 leading-relaxed text-ink/90">
            We use your data primarily to provide you with our services: generating NDVI maps, providing weather alerts, and running AI diagnostics on your crop images. Additionally, we use aggregated, anonymized data to train and improve our machine learning models. <strong>We do not sell your personal data to third parties.</strong>
          </p>

          <h2 className="text-2xl font-serif text-deep-forest mb-4">3. Data Security</h2>
          <p className="mb-6 leading-relaxed text-ink/90">
            We implement robust, industry-standard security measures, including data encryption in transit and at rest, to protect your personal and agricultural data from unauthorized access, disclosure, alteration, or destruction. However, no internet transmission or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-serif text-deep-forest mb-4">4. Third-Party Services</h2>
          <p className="mb-6 leading-relaxed text-ink/90">
            AgriSetu integrates with third-party APIs for satellite imagery (e.g., Google Earth Engine), weather data, and authentication (e.g., Supabase). These third parties have their own privacy policies. We only share the minimum necessary data required to utilize these external services for your benefit.
          </p>

          <h2 className="text-2xl font-serif text-deep-forest mb-4">5. Your Rights</h2>
          <p className="mb-6 leading-relaxed text-ink/90">
            Depending on your jurisdiction, you may have the right to access, correct, delete, or export your personal data. You can manage your data through your account settings or by contacting our support team. If you request account deletion, we will remove your personal data, though we may retain anonymized agricultural data for our models.
          </p>

          <div className="mt-12 p-6 bg-sand/30 rounded-xl border border-sand">
            <h3 className="text-xl font-serif text-deep-forest mb-2">Contact Us</h3>
            <p className="text-ink/80 text-sm">
              If you have any questions about this Privacy Policy or your data, please contact our Privacy Officer at: <br/>
              <strong>privacy@agrisetu.in</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
