import React, { useState, useEffect } from 'react';
import { CapturedCustomer } from '../types';
import {
  MessageSquare,
  Users,
  Send,
  Sparkles,
  Phone,
  Gift,
  Copy,
  CheckCircle2,
  Plus,
  Search,
  Calendar,
  ShoppingBag,
  UserPlus,
  Radio,
  FileSpreadsheet,
  Megaphone,
  Smartphone,
  Tag,
  Eye,
  Filter,
  ArrowRight
} from 'lucide-react';

export const WhatsAppCustomersPanel: React.FC = () => {
  const [customers, setCustomers] = useState<CapturedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'directory' | 'campaign' | 'add_customer'>('directory');

  // Search & Filter state for directory
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptInOnly, setFilterOptInOnly] = useState(false);

  // Campaign Composer State
  const [targetSegment, setTargetSegment] = useState<'ALL' | 'OPTIN_ONLY' | 'SPECIAL_OCCASIONS'>('OPTIN_ONLY');
  const [selectedCampaignType, setSelectedCampaignType] = useState('WEEKEND_DEAL');
  const [campaignTitle, setCampaignTitle] = useState('Weekend Grocery Bonanza');
  const [couponCode, setCouponCode] = useState('WEEKEND15');
  const [campaignMessage, setCampaignMessage] = useState(
    '🎉 *SARV MART LUCKNOW WEEKEND SPECIAL* 🎉\n\nDear *{CustomerName}*,\nGet 15% OFF on all fresh groceries, flours & refined oils this weekend!\n\n🏷️ *Use Coupon:* *{CouponCode}*\n📍 *Location:* Sarv Mart, Behta Bazar Lucknow\n\nHave a great weekend!'
  );
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  // Add Customer Panel State
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustOccasion, setNewCustOccasion] = useState('');
  const [newCustCity, setNewCustCity] = useState('Lucknow');
  const [newCustOptIn, setNewCustOptIn] = useState(true);
  const [addCustomerSuccess, setAddCustomerSuccess] = useState<string | null>(null);

  const [copiedStatus, setCopiedStatus] = useState(false);

  // Load captured customers
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success && data.customers) {
        setCustomers(data.customers);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustPhone.trim()) return;

    try {
      const res = await fetch('/api/customers/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustName.trim() || 'Store Customer',
          phone: newCustPhone.trim(),
          whatsappOptIn: newCustOptIn,
          specialOccasion: newCustOccasion.trim(),
          city: newCustCity.trim() || 'Lucknow',
          source: 'POS_PRINT',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAddCustomerSuccess(`✅ Successfully captured ${data.customer.name} (+91 ${data.customer.phone}) into directory!`);
        setNewCustName('');
        setNewCustPhone('');
        setNewCustOccasion('');
        loadCustomers();
      }
    } catch {
      alert('Error adding customer to server.');
    }
  };

  const handleSendSingleWhatsApp = async (customer: CapturedCustomer) => {
    const cleanPhone = customer.phone.replace(/\D/g, '');
    let finalMsg = campaignMessage
      .replace('{CustomerName}', customer.name || 'Valued Customer')
      .replace('{CouponCode}', couponCode || 'SARV10');

    const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(finalMsg)}`;
    window.open(waUrl, '_blank');

    try {
      await fetch('/api/customers/send-whatsapp-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          offerMessage: finalMsg,
          offerCode: couponCode,
        }),
      });
      loadCustomers();
    } catch {
      // Continue
    }
  };

  const insertTagIntoMessage = (tagStr: string) => {
    setCampaignMessage((prev) => prev + ` ${tagStr} `);
  };

  const copyPhoneNumbersList = () => {
    const targetCusts = customers.filter(c => targetSegment === 'OPTIN_ONLY' ? c.whatsappOptIn : true);
    const phones = targetCusts.map((c) => `+91 ${c.phone}`).join(', ');
    navigator.clipboard.writeText(phones);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 3000);
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.specialOccasion && c.specialOccasion.includes(searchQuery));
    const matchesOptIn = filterOptInOnly ? c.whatsappOptIn : true;
    return matchesSearch && matchesOptIn;
  });

  const totalSpentAll = customers.reduce((acc, c) => acc + c.totalSpent, 0);
  const totalOptIn = customers.filter((c) => c.whatsappOptIn).length;

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white p-6 rounded-3xl shadow-xl border border-emerald-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-400 text-emerald-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              POS Print Capture Connected
            </span>
            <span className="text-emerald-300 text-xs font-mono">Sarv Mart CRM</span>
          </div>
          <h2 className="text-2xl font-black mt-1 text-white">WhatsApp Marketing & Customer Hub</h2>
          <p className="text-xs text-emerald-100/80 mt-1">
            Capture customer phone numbers automatically on POS prints, manage directory & trigger direct WhatsApp offers.
          </p>
        </div>

        {/* Sub-Panel Switcher Buttons */}
        <div className="flex items-center bg-gray-900/80 p-1.5 rounded-2xl border border-emerald-500/30 gap-1 self-stretch md:self-auto overflow-x-auto">
          <button
            onClick={() => setSubTab('directory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'directory'
                ? 'bg-emerald-500 text-gray-950 shadow-md'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customer Directory ({customers.length})</span>
          </button>

          <button
            onClick={() => setSubTab('campaign')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'campaign'
                ? 'bg-emerald-500 text-gray-950 shadow-md'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Create Campaign Message</span>
          </button>

          <button
            onClick={() => setSubTab('add_customer')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'add_customer'
                ? 'bg-emerald-500 text-gray-950 shadow-md'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Customer Panel</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase">Captured Contacts</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{customers.length}</p>
          <p className="text-[10px] text-gray-500">POS thermal bills & manual entries</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase">WhatsApp Opted-In</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{totalOptIn}</p>
          <p className="text-[10px] text-emerald-800 font-medium">
            {customers.length > 0 ? Math.round((totalOptIn / customers.length) * 100) : 0}% opt-in rate
          </p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase">Total Customer Spent</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">₹{totalSpentAll}</p>
          <p className="text-[10px] text-gray-500">Tracked sales from captured customers</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase">Offers Dispatched</span>
            <Gift className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">
            {customers.reduce((acc, c) => acc + (c.whatsappOfferSentCount || 0), 0)}
          </p>
          <p className="text-[10px] text-amber-800 font-medium">WhatsApp promotional triggers</p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PANEL 1: CUSTOMER DIRECTORY LIST & MANAGEMENT */}
      {/* ========================================================= */}
      {subTab === 'directory' && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Captured Customer Directory</h3>
              <p className="text-xs text-gray-500">View and manage customers captured from POS thermal bill prints.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSubTab('add_customer')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Single Customer</span>
              </button>
              <button
                onClick={copyPhoneNumbersList}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-3 py-2 rounded-xl border border-gray-200 flex items-center gap-1.5"
              >
                {copiedStatus ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedStatus ? 'Copied List!' : 'Copy Numbers'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, mobile number or birthday..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-9 pr-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
              />
            </div>

            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                checked={filterOptInOnly}
                onChange={(e) => setFilterOptInOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 accent-emerald-600"
              />
              <span>WhatsApp Opted-In Only</span>
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 text-gray-700 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">WhatsApp Mobile</th>
                  <th className="p-3">Captured Source</th>
                  <th className="p-3">Total Bills & Spent</th>
                  <th className="p-3">Last Visit / Bill</th>
                  <th className="p-3">Offers Sent</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      No captured customers found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/80">
                      <td className="p-3">
                        <p className="font-bold text-gray-900">{c.name}</p>
                        {c.specialOccasion && (
                          <span className="text-[10px] text-amber-700 flex items-center gap-1 font-semibold">
                            <Calendar className="w-3 h-3 text-amber-500" /> {c.specialOccasion}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-900">
                        +91 {c.phone}
                        {c.whatsappOptIn ? (
                          <span className="ml-1.5 text-[9px] bg-emerald-100 text-emerald-800 font-sans px-1.5 py-0.5 rounded-full font-extrabold">
                            Opted-In
                          </span>
                        ) : (
                          <span className="ml-1.5 text-[9px] bg-gray-100 text-gray-500 font-sans px-1.5 py-0.5 rounded-full">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-md border border-slate-200">
                          {c.capturedSource === 'POS_PRINT' ? '🖨️ POS Thermal Print' : '🛒 Online Order'}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-gray-900">
                        ₹{c.totalSpent} <span className="text-gray-400 font-normal">({c.totalBillsCount} bills)</span>
                      </td>
                      <td className="p-3 text-gray-600 font-medium">
                        {c.lastBillDate}
                        <p className="text-[10px] font-mono text-gray-400">{c.lastBillNo}</p>
                      </td>
                      <td className="p-3 font-bold text-amber-700">
                        {c.whatsappOfferSentCount || 0} offers
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleSendSingleWhatsApp(c)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1 ml-auto active:scale-95"
                        >
                          <Send className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PANEL 2: SEPARATE DEDICATED WHATSAPP CAMPAIGN COMPOSER */}
      {/* ========================================================= */}
      {subTab === 'campaign' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Campaign Message Studio */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-lg text-gray-900">Create WhatsApp Campaign Message</h3>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
                Broadcast Studio
              </span>
            </div>

            {/* Campaign Preset Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-gray-800">Select Campaign Preset Template</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCampaignType('WEEKEND_DEAL');
                    setCampaignTitle('Weekend Grocery Bonanza');
                    setCouponCode('WEEKEND15');
                    setCampaignMessage(
                      '🎉 *SARV MART LUCKNOW WEEKEND SPECIAL* 🎉\n\nDear *{CustomerName}*,\nGet 15% OFF on all fresh groceries, flours & refined oils this weekend!\n\n🏷️ *Use Coupon:* *{CouponCode}*\n📍 *Location:* Sarv Mart, Behta Bazar Lucknow\n\nHave a great weekend!'
                    );
                  }}
                  className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                    selectedCampaignType === 'WEEKEND_DEAL'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-extrabold text-gray-900">🎉 Weekend Bonanza</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">15% OFF Groceries & Oils</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCampaignType('MONTHLY_STAPLES');
                    setCampaignTitle('Monthly Grocery Combo Offer');
                    setCouponCode('GROCERY150');
                    setCampaignMessage(
                      '🌾 *MONTHLY STAPLES SAVINGS - SARV MART* 🌾\n\nDear *{CustomerName}*,\nSave ₹150 Flat on Atta, Rice, Dal & Cooking Oils combo order above ₹1000!\n\n🏷️ *Use Code:* *{CouponCode}*\n📍 *Store:* Sarv Mart Lucknow'
                    );
                  }}
                  className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                    selectedCampaignType === 'MONTHLY_STAPLES'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-extrabold text-gray-900">🌾 Monthly Staples</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Flat ₹150 OFF Combo</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCampaignType('OCCASION');
                    setCampaignTitle('Birthday & Special Occasion Wish');
                    setCouponCode('CELEBRATE20');
                    setCampaignMessage(
                      '🎂 *HAPPY SPECIAL DAY FROM SARV MART!* 🎈\n\nDear *{CustomerName}*,\nWe wish you a wonderful celebration! Visit Sarv Mart today & enjoy a special 20% discount on your entire bill!\n\n🏷️ *Exclusive Code:* *{CouponCode}*\n❤️ *Sarv Mart Family*'
                    );
                  }}
                  className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                    selectedCampaignType === 'OCCASION'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-extrabold text-gray-900">🎂 Birthday Wish</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">20% Birthday Discount</p>
                </button>
              </div>
            </div>

            {/* Title & Coupon Code Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Campaign Title</label>
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Promotional Coupon Code</label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-800 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Target Audience Segment Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">Target Audience Segment</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetSegment('OPTIN_ONLY')}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between ${
                    targetSegment === 'OPTIN_ONLY'
                      ? 'bg-emerald-700 text-white border-emerald-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  <span>WhatsApp Opted-In ({totalOptIn})</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setTargetSegment('ALL')}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between ${
                    targetSegment === 'ALL'
                      ? 'bg-emerald-700 text-white border-emerald-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  <span>All Captured Contacts ({customers.length})</span>
                  <Users className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Message Text Editor with Dynamic Tag Buttons */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-800">Message Text Content</label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-500">Insert Variable Tag:</span>
                  <button
                    type="button"
                    onClick={() => insertTagIntoMessage('{CustomerName}')}
                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-emerald-300"
                  >
                    + Customer Name
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTagIntoMessage('{CouponCode}')}
                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-emerald-300"
                  >
                    + Coupon Code
                  </button>
                </div>
              </div>

              <textarea
                rows={5}
                value={campaignMessage}
                onChange={(e) => setCampaignMessage(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-2xl p-3 text-xs text-gray-900 outline-none focus:border-emerald-500 font-sans leading-relaxed"
              />
            </div>
          </div>

          {/* Right Side: Live WhatsApp Mobile Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-gray-950 p-5 rounded-3xl text-white shadow-lg space-y-4 text-left border border-emerald-700/50">
              <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-extrabold text-xs text-emerald-200 uppercase tracking-wide">
                    Live WhatsApp Chat Preview
                  </h4>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded">
                  Formatted
                </span>
              </div>

              {/* Simulated WhatsApp Phone Screen Box */}
              <div className="bg-[#0b141a] p-3.5 rounded-2xl border border-gray-800 space-y-2 shadow-inner">
                <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    SM
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white">Sarv Mart Official</p>
                    <p className="text-[9px] text-emerald-400">Verified Business Account</p>
                  </div>
                </div>

                {/* WhatsApp Chat Bubble */}
                <div className="bg-[#005c4b] text-white p-3 rounded-2xl rounded-tl-none text-xs leading-relaxed font-sans shadow-md whitespace-pre-wrap">
                  {campaignMessage
                    .replace('{CustomerName}', 'Rajesh Sharma')
                    .replace('{CouponCode}', couponCode || 'WEEKEND15')}
                  <div className="text-[9px] text-emerald-200/70 text-right mt-1 font-mono">10:42 AM ✓✓</div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    const targetList = customers.filter(c => targetSegment === 'OPTIN_ONLY' ? c.whatsappOptIn : true);
                    if (targetList.length === 0) {
                      alert('No customers found in this target segment.');
                      return;
                    }
                    // Trigger first customer or batch open
                    const firstCust = targetList[0];
                    handleSendSingleWhatsApp(firstCust);
                    setDispatchSuccessMsg(`Triggered WhatsApp link for ${targetList.length} captured customers!`);
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs py-3 px-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Dispatch Campaign via WhatsApp ({customers.filter(c => targetSegment === 'OPTIN_ONLY' ? c.whatsappOptIn : true).length})</span>
                </button>

                <button
                  onClick={copyPhoneNumbersList}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl border border-gray-700 flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedStatus ? 'Copied All Phone Numbers!' : 'Copy Numbers for Bulk Broadcast'}</span>
                </button>

                {dispatchSuccessMsg && (
                  <p className="text-[11px] text-emerald-300 bg-emerald-950/80 p-2 rounded-xl font-bold border border-emerald-500/40 text-center">
                    {dispatchSuccessMsg}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PANEL 3: SEPARATE UNCLUTTERED ADD CUSTOMER PANEL */}
      {/* ========================================================= */}
      {subTab === 'add_customer' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-lg p-6 text-left space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-extrabold text-base text-gray-900">Add Customer Contact</h3>
                <p className="text-xs text-gray-500">
                  Manually add walk-in customers or loyalty program members to WhatsApp marketing list.
                </p>
              </div>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
              Separate Panel
            </span>
          </div>

          {addCustomerSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between">
              <span>{addCustomerSuccess}</span>
              <button
                onClick={() => setAddCustomerSuccess(null)}
                className="text-emerald-700 underline text-[11px]"
              >
                Dismiss
              </button>
            </div>
          )}

          <form onSubmit={handleAddCustomerSubmit} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">WhatsApp Mobile Number *</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="10 digit mobile number"
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-emerald-500 focus:bg-white"
                  />
                  <span className="absolute left-3 top-3 text-[11px] font-bold text-gray-500">+91</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Birthday or Special Occasion (Optional)</label>
                <input
                  type="text"
                  value={newCustOccasion}
                  onChange={(e) => setNewCustOccasion(e.target.value)}
                  placeholder="e.g. 15th August or Anniversary"
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">City / Locality Area</label>
                <input
                  type="text"
                  value={newCustCity}
                  onChange={(e) => setNewCustCity(e.target.value)}
                  placeholder="e.g. Lucknow (Behta Bazar)"
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-emerald-950 text-xs font-medium space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-900 select-none">
                <input
                  type="checkbox"
                  checked={newCustOptIn}
                  onChange={(e) => setNewCustOptIn(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 accent-emerald-600"
                />
                <span>Customer Opted-In to receive WhatsApp offers & store deals</span>
              </label>
              <p className="text-[11px] text-emerald-800">
                Contacts added here automatically synch with POS thermal bill receipt engine & broadcast campaign list.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl shadow-md transition-all active:scale-95 text-xs"
              >
                Save Customer to Directory
              </button>
              <button
                type="button"
                onClick={() => setSubTab('directory')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-5 py-3 rounded-2xl text-xs"
              >
                Back to Directory
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
