'use client';

import { Sprout, MapPin, Brain, Mic, LineChart, ShieldAlert, Camera, ArrowRight, Leaf, Droplets, Sun } from 'lucide-react';
import Link from 'next/link';

const features = [
  { icon: MapPin, title: 'Live Field Data', desc: 'Click any point on the map to get real-time weather, soil moisture, and NDVI health.' },
  { icon: Brain, title: 'AI Advisory', desc: 'Get instant, AI-generated farming recommendations based on your exact conditions.' },
  { icon: Camera, title: 'Crop Diagnosis', desc: 'Upload a photo of a diseased leaf and get an AI-powered diagnosis in seconds.' },
  { icon: LineChart, title: 'Market Insights', desc: 'Live commodity prices and sell/hold advice for your crop in your region.' },
  { icon: Mic, title: 'Voice Copilot', desc: 'Ask any agronomy question by voice — get an instant spoken AI answer.' },
  { icon: ShieldAlert, title: 'Climate Alerts', desc: 'Early warnings for frost, floods, and heatwaves sent to your phone via SMS/WhatsApp.' },
];

const steps = [
  { num: '1', icon: MapPin, title: 'Select Your Field', desc: 'Click anywhere on the interactive map to pin your farm location.' },
  { num: '2', icon: Sun, title: 'Get Real-Time Data', desc: 'Instantly receive live weather, soil, and satellite health data for that exact spot.' },
  { num: '3', icon: Leaf, title: 'Receive AI Advice', desc: 'Our AI analyzes your conditions and generates actionable farming recommendations.' },
];

export default function HeroLanding() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* HERO */}
      <section className="bg-green-800 border-b-4 border-green-900">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24 flex flex-col items-center text-center">
          <div className="bg-white text-green-800 p-3 rounded-md border-2 border-green-900 shadow-sm mb-6">
            <Sprout className="w-10 h-10" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl">
            AI-Powered Farm Intelligence
          </h1>
          <p className="text-green-100 text-lg lg:text-xl font-medium mt-4 max-w-2xl leading-relaxed">
            Real-time satellite data, AI-driven crop advisory, voice assistance, and market insights — all in one dashboard built for farmers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              href="/en/dashboard"
              className="bg-white hover:bg-gray-100 text-green-800 border-2 border-green-900 text-lg font-black py-3 px-8 rounded-sm transition-colors shadow-sm flex items-center gap-2"
            >
              Enter Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/en/login"
              className="bg-green-700 hover:bg-green-600 text-white border-2 border-green-900 text-lg font-bold py-3 px-8 rounded-sm transition-colors"
            >
              Sign In with Google
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black text-gray-900 text-center mb-2">What You Get</h2>
        <p className="text-gray-500 font-bold text-center mb-10 uppercase tracking-widest text-sm">Six integrated tools in one dashboard</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white border-2 border-gray-300 rounded-md p-6 flex flex-col gap-3">
              <div className="bg-green-100 border border-green-800 w-10 h-10 rounded-sm flex items-center justify-center">
                <f.icon className="w-5 h-5 text-green-800" />
              </div>
              <h3 className="text-lg font-black text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white border-y-2 border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-2">How It Works</h2>
          <p className="text-gray-500 font-bold text-center mb-10 uppercase tracking-widest text-sm">Three steps to smarter farming</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="flex flex-col items-center text-center">
                <div className="bg-green-800 text-white w-14 h-14 rounded-sm flex items-center justify-center text-2xl font-black border-2 border-green-900 mb-4">
                  {s.num}
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="bg-green-800 border-2 border-green-900 rounded-md p-10 lg:p-16">
          <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">Ready to Monitor Your Farm?</h2>
          <p className="text-green-100 font-medium text-lg mb-8 max-w-xl mx-auto">
            Select your field location and get instant AI-powered insights — no signup required.
          </p>
          <Link
            href="/en/dashboard"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-green-800 border-2 border-green-900 text-lg font-black py-3 px-10 rounded-sm transition-colors shadow-sm"
          >
            Open Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 border-t-4 border-green-800 mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-800 text-white p-1.5 rounded-sm border border-green-900">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="text-white font-black text-lg">AgriSetu</span>
            <span className="text-gray-500 text-sm font-bold">— BRICS Agricultural Innovation</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span className="bg-gray-800 px-2 py-1 rounded-sm border border-gray-700">Next.js</span>
            <span className="bg-gray-800 px-2 py-1 rounded-sm border border-gray-700">Supabase</span>
            <span className="bg-gray-800 px-2 py-1 rounded-sm border border-gray-700">Gemini AI</span>
            <span className="bg-gray-800 px-2 py-1 rounded-sm border border-gray-700">Leaflet</span>
          </div>
          <p className="text-gray-500 text-xs font-bold">© 2026 AgriSetu</p>
        </div>
      </footer>
    </div>
  );
}
