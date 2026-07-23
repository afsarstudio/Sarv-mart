import React, { useState } from 'react';
import { StorePage } from '../types';
import { STORE_DETAILS } from '../data/mockData';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Truck, CheckCircle2, Send, HelpCircle } from 'lucide-react';

interface StaticPagesProps {
  page: StorePage;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ page }) => {
  const [contactForm, setContactForm] = useState({ name: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (page === 'about') {
    return (
      <div className="max-w-4xl mx-auto my-8 px-4 sm:px-8 text-left space-y-6 animate-fade-in">
        <div className="bg-gradient-to-r from-emerald-800 to-green-950 text-white p-8 rounded-3xl shadow-xl space-y-3">
          <span className="text-xs bg-amber-400 text-emerald-950 font-bold px-3 py-1 rounded-full uppercase">
            About Sarv Mart
          </span>
          <h1 className="text-3xl font-black tracking-tight">Lucknow’s Trusted Supermarket</h1>
          <p className="text-emerald-100 text-sm leading-relaxed max-w-2xl">
            Sarv Mart is a premium multi-category retail store located at NKS Plaza, Behta Bazar, Lucknow. We are dedicated to providing fresh groceries, daily home products, dairy, household essentials, and daily items with fast 12 minute express home delivery across Lucknow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-200 text-center space-y-2">
            <Truck className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-sm text-gray-900">12 Minute Express Delivery</h3>
            <p className="text-xs text-gray-500">Fast home delivery from our Behta Bazar store.</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-sm text-gray-900">100% Genuine Quality</h3>
            <p className="text-xs text-gray-500">Handpicked products with quality assurance.</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200 text-center space-y-2">
            <Clock className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-sm text-gray-900">Store Timings</h3>
            <p className="text-xs text-gray-500">Open 06:30 AM to 11:00 PM every day.</p>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'contact') {
    return (
      <div className="max-w-5xl mx-auto my-8 px-4 sm:px-8 text-left space-y-8 animate-fade-in">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Contact Sarv Mart Lucknow</h1>
          <p className="text-xs text-gray-500 font-medium">We are always ready to help you with orders & store visits.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Store Info */}
          <div className="md:col-span-5 bg-emerald-900 text-white p-6 rounded-3xl shadow-xl space-y-5">
            <h2 className="font-black text-lg text-amber-300">Store Address</h2>

            <div className="space-y-4 text-xs text-emerald-100 font-medium">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">Sarv Mart Store</p>
                  <p>{STORE_DETAILS.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-300 shrink-0" />
                <div>
                  <p className="font-bold text-white">Phone Helpline</p>
                  <p>{STORE_DETAILS.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-300 shrink-0" />
                <div>
                  <p className="font-bold text-white">Email Support</p>
                  <p>{STORE_DETAILS.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-300 shrink-0" />
                <div>
                  <p className="font-bold text-white">Working Hours</p>
                  <p>{STORE_DETAILS.hours}</p>
                </div>
              </div>
            </div>

            <a
              href={`https://wa.me/917388872588?text=${encodeURIComponent('Hello Sarv Mart Lucknow, I have an inquiry')}`}
              target="_blank"
              rel="noreferrer"
              className="block text-center bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs py-3 rounded-2xl shadow-md transition-all"
            >
              Chat on WhatsApp (+91 7388872588)
            </a>
          </div>

          {/* Form */}
          <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <h2 className="font-black text-lg text-gray-900">Send us a Message</h2>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="font-bold text-emerald-900">Message sent successfully!</p>
                <p className="text-xs text-emerald-700">Sarv Mart Lucknow team will reply shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitContact} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+91 Phone number"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Type your feedback or inquiry..."
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-semibold outline-none focus:border-emerald-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl shadow-md text-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (page === 'faq') {
    const faqs = [
      { q: 'What are the delivery charges for Lucknow?', a: 'Free delivery on all orders above ₹399. A flat charge of ₹40 applies for orders below ₹399.' },
      { q: 'How fast is Sarv Mart delivery?', a: 'We guarantee home delivery within 12 hours across Lucknow PIN codes (including Behta Bazar 226026).' },
      { q: 'Where is Sarv Mart store located?', a: 'Shop No 1 & 2, NKS Plaza, Near SBI Bank, Behta Bazar, Lucknow, UP 226026.' },
      { q: 'Do you offer Cash on Delivery (COD)?', a: 'Yes, we accept Cash on Delivery, Google Pay/UPI, Credit Cards, and Wallet payments.' },
      { q: 'Can I request a commercial GST invoice?', a: 'Yes! Toggle "Need GST Invoice" at checkout and provide your business 15-digit GSTIN.' },
    ];

    return (
      <div className="max-w-4xl mx-auto my-8 px-4 sm:px-8 text-left space-y-6 animate-fade-in">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <HelpCircle className="w-8 h-8 text-emerald-600" />
          <span>Frequently Asked Questions</span>
        </h1>

        <div className="space-y-3">
          {faqs.map((f, idx) => (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-1">
              <h3 className="font-extrabold text-sm text-gray-900">{f.q}</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 px-4 sm:px-8 text-left bg-white p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
      <h1 className="text-2xl font-black text-gray-900 capitalize">{page.replace('_', ' ')} Policy</h1>
      <p className="text-xs text-gray-600 leading-relaxed">
        At Sarv Mart Lucknow, customer satisfaction is our top priority. All products sold online or in-store at NKS Plaza Behta Bazar are 100% genuine and fresh. If you receive any damaged or unsatisfactory item, you can request an instant return/replacement within 24 hours of delivery.
      </p>
    </div>
  );
};
