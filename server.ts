import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_COUPONS, INITIAL_ORDERS } from './src/data/mockData.js';
import { Order, Product, POSBill, CapturedCustomer } from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory state for live operations
let productsStore: Product[] = [...INITIAL_PRODUCTS];
let ordersStore: Order[] = [...INITIAL_ORDERS];
let posBillsStore: POSBill[] = [];
let customersStore: CapturedCustomer[] = [
  {
    id: 'cust_101',
    name: 'Rajesh Sharma',
    phone: '9839123456',
    whatsappOptIn: true,
    specialOccasion: '1988-11-14',
    city: 'Lucknow (Behta)',
    totalBillsCount: 4,
    totalSpent: 3450,
    lastBillDate: new Date().toISOString().split('T')[0],
    lastBillNo: 'POS-SB-88219',
    capturedSource: 'POS_PRINT',
    whatsappOfferSentCount: 2,
    tags: ['VIP Regular', 'Weekly Grocery']
  },
  {
    id: 'cust_102',
    name: 'Priyanka Verma',
    phone: '7388872588',
    whatsappOptIn: true,
    specialOccasion: '1994-05-22',
    city: 'Lucknow (Alambagh)',
    totalBillsCount: 2,
    totalSpent: 1890,
    lastBillDate: new Date().toISOString().split('T')[0],
    lastBillNo: 'POS-SB-99301',
    capturedSource: 'POS_PRINT',
    whatsappOfferSentCount: 1,
    tags: ['Dairy & Bakery', 'WhatsApp Loyal']
  },
  {
    id: 'cust_103',
    name: 'Amitabh Mishra',
    phone: '9415012389',
    whatsappOptIn: true,
    specialOccasion: '1982-08-05',
    city: 'Lucknow (Mahanagar)',
    totalBillsCount: 6,
    totalSpent: 8200,
    lastBillDate: new Date().toISOString().split('T')[0],
    lastBillNo: 'POS-SB-10492',
    capturedSource: 'POS_PRINT',
    whatsappOfferSentCount: 3,
    tags: ['Bulk Wholesale', 'Atta & Oil']
  }
];

// Helper for Gemini AI
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// ---------------- API ROUTES ----------------

// Get products with optional search, category, sort
app.get('/api/products', (req, res) => {
  const { category, search, sort, isBestSeller, isTrending, minPrice, maxPrice } = req.query;

  let result = [...productsStore];

  if (category && typeof category === 'string' && category !== 'All') {
    result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    result = result.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        (p.hindiName && p.hindiName.includes(q)) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.barcode.includes(q)
    );
  }

  if (isBestSeller === 'true') {
    result = result.filter(p => p.isBestSeller);
  }

  if (isTrending === 'true') {
    result = result.filter(p => p.isTrending);
  }

  if (minPrice) {
    result = result.filter(p => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    result = result.filter(p => p.price <= Number(maxPrice));
  }

  if (sort === 'price_asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'discount') {
    result.sort((a, b) => b.discountPercent - a.discountPercent);
  }

  res.json({ success: true, count: result.length, products: result });
});

// Update or Add product (Admin / POS stock sync)
app.post('/api/products', (req, res) => {
  const productData: Product = req.body;
  const existingIdx = productsStore.findIndex(p => p.id === productData.id);

  if (existingIdx >= 0) {
    productsStore[existingIdx] = { ...productsStore[existingIdx], ...productData };
  } else {
    const newProduct = {
      ...productData,
      id: productData.id || `p_${Date.now()}`,
    };
    productsStore.unshift(newProduct);
  }

  res.json({ success: true, product: productData });
});

// Get Categories
app.get('/api/categories', (req, res) => {
  res.json({ success: true, categories: INITIAL_CATEGORIES });
});

// Coupons
app.get('/api/coupons', (req, res) => {
  res.json({ success: true, coupons: INITIAL_COUPONS });
});

// Create Order
app.post('/api/orders', (req, res) => {
  const { items, address, deliverySlot, paymentMethod, couponCode, subtotal, discount, gstAmount, deliveryFee, totalAmount, gstin } = req.body;

  const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
  const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
  const invNo = `INV/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;

  // Deduct stock for ordered items
  items.forEach((item: { product: Product; quantity: number }) => {
    const p = productsStore.find(prod => prod.id === item.product.id);
    if (p) {
      p.stock = Math.max(0, p.stock - item.quantity);
    }
  });

  const newOrder: Order = {
    id: orderId,
    items,
    subtotal,
    discount,
    couponCode,
    gstAmount,
    deliveryFee,
    totalAmount,
    status: 'pending',
    address,
    deliverySlot: deliverySlot || 'Express Within 12 Hours',
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
    otp,
    createdAt: new Date().toISOString(),
    estimatedDelivery: '30-45 mins',
    invoiceNumber: invNo,
    gstin,
    rider: {
      id: 'r_101',
      name: 'Santosh Kumar',
      phone: '+91 7388872588',
      vehicleNo: 'UP 32 BK 8821',
      rating: 4.9,
      totalDeliveries: 840,
      isOnline: true,
      currentLocation: { lat: 26.8467, lng: 80.9462 },
    },
  };

  ordersStore.unshift(newOrder);
  res.json({ success: true, order: newOrder });
});

// Update Order Status (Admin / Rider)
app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = ordersStore.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = status;
  if (status === 'delivered') {
    order.paymentStatus = 'Paid';
  }

  res.json({ success: true, order });
});

// Get all orders
app.get('/api/orders', (req, res) => {
  res.json({ success: true, orders: ordersStore });
});

// POS Billing Endpoint
app.post('/api/pos/bill', (req, res) => {
  const billData: POSBill = req.body;
  const billNo = `POS-SB-${Date.now().toString().slice(-6)}`;

  const completeBill: POSBill = {
    ...billData,
    id: `bill_${Date.now()}`,
    billNo: billData.billNo || billNo,
    timestamp: new Date().toISOString(),
  };

  // Adjust stock
  completeBill.items.forEach(item => {
    const p = productsStore.find(prod => prod.id === item.product.id);
    if (p) {
      p.stock = Math.max(0, p.stock - item.quantity);
    }
  });

  // Auto-capture customer details if phone number provided on bill
  if (completeBill.customerPhone && completeBill.customerPhone.trim().length >= 8) {
    const cleanPhone = completeBill.customerPhone.replace(/\D/g, '');
    const existingCust = customersStore.find(c => c.phone.replace(/\D/g, '') === cleanPhone);

    if (existingCust) {
      existingCust.totalBillsCount += 1;
      existingCust.totalSpent += completeBill.finalTotal;
      existingCust.lastBillDate = new Date().toISOString().split('T')[0];
      existingCust.lastBillNo = completeBill.billNo;
      if (completeBill.customerName && completeBill.customerName !== 'Walk-in Customer') {
        existingCust.name = completeBill.customerName;
      }
      if (completeBill.customerBirthOrAnniversary) {
        existingCust.specialOccasion = completeBill.customerBirthOrAnniversary;
      }
      if (completeBill.whatsappOptIn !== undefined) {
        existingCust.whatsappOptIn = completeBill.whatsappOptIn;
      }
    } else {
      customersStore.unshift({
        id: `cust_${Date.now()}`,
        name: completeBill.customerName && completeBill.customerName.trim() ? completeBill.customerName : 'POS Customer',
        phone: completeBill.customerPhone,
        whatsappOptIn: completeBill.whatsappOptIn !== false,
        specialOccasion: completeBill.customerBirthOrAnniversary || '',
        city: 'Lucknow Store',
        totalBillsCount: 1,
        totalSpent: completeBill.finalTotal,
        lastBillDate: new Date().toISOString().split('T')[0],
        lastBillNo: completeBill.billNo,
        capturedSource: 'POS_PRINT',
        whatsappOfferSentCount: 0,
        tags: ['POS Print Capture']
      });
    }
  }

  posBillsStore.unshift(completeBill);
  res.json({ success: true, bill: completeBill });
});

// Customer Directory & Capture Routes
app.get('/api/customers', (req, res) => {
  res.json({ success: true, count: customersStore.length, customers: customersStore });
});

app.post('/api/customers/capture', (req, res) => {
  const { name, phone, whatsappOptIn, specialOccasion, city, billNo, totalAmount, source } = req.body;

  if (!phone || phone.trim().length < 8) {
    return res.status(400).json({ success: false, message: 'Valid phone or WhatsApp number is required' });
  }

  const cleanPhone = phone.replace(/\D/g, '');
  const existingIndex = customersStore.findIndex(c => c.phone.replace(/\D/g, '') === cleanPhone);

  let updatedCustomer: CapturedCustomer;

  if (existingIndex >= 0) {
    const existing = customersStore[existingIndex];
    updatedCustomer = {
      ...existing,
      name: name && name.trim() ? name : existing.name,
      whatsappOptIn: whatsappOptIn !== undefined ? whatsappOptIn : existing.whatsappOptIn,
      specialOccasion: specialOccasion || existing.specialOccasion,
      city: city || existing.city,
      totalBillsCount: existing.totalBillsCount + (billNo ? 1 : 0),
      totalSpent: existing.totalSpent + (totalAmount ? Number(totalAmount) : 0),
      lastBillDate: new Date().toISOString().split('T')[0],
      lastBillNo: billNo || existing.lastBillNo,
    };
    customersStore[existingIndex] = updatedCustomer;
  } else {
    updatedCustomer = {
      id: `cust_${Date.now()}`,
      name: name && name.trim() ? name : 'Store Customer',
      phone: phone,
      whatsappOptIn: whatsappOptIn !== false,
      specialOccasion: specialOccasion || '',
      city: city || 'Lucknow',
      totalBillsCount: billNo ? 1 : 0,
      totalSpent: totalAmount ? Number(totalAmount) : 0,
      lastBillDate: new Date().toISOString().split('T')[0],
      lastBillNo: billNo || 'N/A',
      capturedSource: source || 'POS_PRINT',
      whatsappOfferSentCount: 0,
      tags: ['Captured At Checkout']
    };
    customersStore.unshift(updatedCustomer);
  }

  res.json({ success: true, customer: updatedCustomer });
});

app.post('/api/customers/send-whatsapp-offer', (req, res) => {
  const { customerId, offerMessage, offerCode } = req.body;
  const customer = customersStore.find(c => c.id === customerId);

  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  customer.whatsappOfferSentCount = (customer.whatsappOfferSentCount || 0) + 1;

  res.json({
    success: true,
    message: `WhatsApp campaign logged for ${customer.name}`,
    whatsappUrl: `https://wa.me/91${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
      offerMessage || `Hello ${customer.name}, Thank you for shopping at Sarv Mart! Use code ${offerCode || 'SARV10'} on your next visit for 10% OFF!`
    )}`
  });
});

// Get POS Sales summary
app.get('/api/pos/summary', (req, res) => {
  const totalSales = posBillsStore.reduce((acc, b) => acc + b.finalTotal, 0);
  const totalBills = posBillsStore.length;
  res.json({ success: true, totalSales, totalBills, bills: posBillsStore });
});

// AI Search & Smart Recipe / Meal Planner Route (Powered by Gemini)
app.post('/api/ai/search', async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ success: false, message: 'Query is required' });
  }

  try {
    const ai = getGeminiClient();
    if (!ai) {
      // Fallback matching logic
      const matched = productsStore.filter(
        p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      );
      return res.json({
        success: true,
        aiExplanation: `Showing matching supermarket products for "${query}".`,
        matchedProducts: matched,
        recipeOrTips: ['Try preparing fresh Indian delicacies using our daily fresh ingredients from Behta Bazar store.'],
      });
    }

    const availableProductsSummary = productsStore.map(p => `${p.id}: ${p.name} (${p.category}, ₹${p.price}/${p.unit})`).join('\n');

    const prompt = `You are Sarv Mart Lucknow's AI Supermarket Assistant.
The user is searching for: "${query}".
Here is Sarv Mart's available product list:
${availableProductsSummary}

Respond strictly in valid JSON format:
{
  "aiExplanation": "A friendly 1-2 sentence response explaining what products fit their request.",
  "matchedProductIds": ["p1", "p2"],
  "recipeOrTips": ["Brief cooking tip or recipe idea if applicable"]
}
Only include product IDs that exist in the list above.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);

    const matchedProducts = productsStore.filter(p => (parsed.matchedProductIds || []).includes(p.id));

    res.json({
      success: true,
      aiExplanation: parsed.aiExplanation || `Found results for ${query}`,
      matchedProducts,
      recipeOrTips: parsed.recipeOrTips || [],
    });
  } catch (error) {
    console.error('AI Search Error:', error);
    // Fallback response
    const matched = productsStore.filter(
      p => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase())
    );
    res.json({
      success: true,
      aiExplanation: `Found ${matched.length} items matching your search.`,
      matchedProducts: matched,
      recipeOrTips: [],
    });
  }
});

// AI Bill / Purchase Invoice Photo OCR Scanner for Inventory
app.post('/api/inventory/scan-bill', async (req, res) => {
  const { imageBase64, mimeType } = req.body;

  // Default sample fallback bill products if Gemini key is unavailable or processing fails
  const mockBillParsedResult = {
    success: true,
    invoiceNumber: `BILL/WH/${Math.floor(10000 + Math.random() * 90000)}`,
    supplierName: 'Sarv Wholesale & FMCG Distributors Lucknow',
    totalBillAmount: 8450,
    billDate: new Date().toISOString().split('T')[0],
    items: [
      {
        name: 'Fortune Sunlite Refined Sunflower Oil',
        hindiName: 'फॉर्च्यून सनलाइट रिफाइंड ऑयल',
        brand: 'Fortune',
        category: 'Oil, Masala & Spices',
        subcategory: 'Refined Oil',
        barcode: '8906007281010',
        mrp: 165,
        price: 145,
        purchasePrice: 125,
        unit: '1 L',
        stockToAdd: 50,
        gstRate: 5,
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Aashirvaad Shuddh Chakki Atta',
        hindiName: 'आशीर्वाद शुद्ध चक्की आटा',
        brand: 'Aashirvaad',
        category: 'Atta, Rice & Dal',
        subcategory: 'Wheat Atta',
        barcode: '8901058852312',
        mrp: 260,
        price: 235,
        purchasePrice: 195,
        unit: '5 kg',
        stockToAdd: 40,
        gstRate: 0,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Surf Excel Easy Wash Detergent Powder',
        hindiName: 'सर्फ़ एक्सेल डिटर्जेंट पाउडर',
        brand: 'Surf Excel',
        category: 'Household & Cleaning',
        subcategory: 'Detergent Powder',
        barcode: '8901030612015',
        mrp: 150,
        price: 135,
        purchasePrice: 105,
        unit: '1 kg',
        stockToAdd: 30,
        gstRate: 18,
        image: 'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Tata Salt Vacuum Evaporated Iodized Salt',
        hindiName: 'टाटा नमक',
        brand: 'Tata',
        category: 'Oil, Masala & Spices',
        subcategory: 'Salt & Sugar',
        barcode: '8901058000010',
        mrp: 28,
        price: 25,
        purchasePrice: 20,
        unit: '1 kg',
        stockToAdd: 100,
        gstRate: 0,
        image: 'https://images.unsplash.com/photo-1518110168401-f282472c8b32?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Maggi 2-Minute Masala Noodles Pack of 4',
        hindiName: 'मैगी 2-मिनट नूडल्स',
        brand: 'Nestle',
        category: 'Snacks & Packed Food',
        subcategory: 'Instant Noodles',
        barcode: '8901058850020',
        mrp: 60,
        price: 54,
        purchasePrice: 42,
        unit: '280 g',
        stockToAdd: 60,
        gstRate: 12,
        image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Amul Pasteurised Butter',
        hindiName: 'अमुल बटर',
        brand: 'Amul',
        category: 'Dairy, Bread & Eggs',
        subcategory: 'Butter & Cream',
        barcode: '8901262010055',
        mrp: 58,
        price: 55,
        purchasePrice: 48,
        unit: '100 g',
        stockToAdd: 35,
        gstRate: 12,
        image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400'
      }
    ]
  };

  try {
    const ai = getGeminiClient();

    if (!ai || !imageBase64) {
      return res.json(mockBillParsedResult);
    }

    // Strip base64 prefix if passed full data URL
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const promptText = `Analyze this supplier invoice / purchase bill image for a retail supermarket.
Extract all product items listed on the bill into structured JSON.

For each item listed on the bill, return:
- name: string (clean English product name)
- hindiName: string (Hindi product title)
- brand: string (e.g., Fortune, Aashirvaad, Amul, Tata, Surf Excel, etc.)
- category: string (e.g. 'Groceries', 'Daily Grocery Items', 'Dairy', 'Bakery', 'Stationery', 'Kitchen', 'Household', 'Beauty', 'Personal Care', 'Electronics', 'Daily Essentials')
- subcategory: string (e.g., 'Refined Oil', 'Wheat Atta', 'Detergent', etc.)
- barcode: string (12-13 digit string)
- mrp: number (Maximum retail price)
- price: number (Retail selling price)
- purchasePrice: number (Wholesale cost price on bill)
- unit: string (e.g. '1 kg', '500 g', '1 L', '100 g')
- stockToAdd: number (quantity purchased on bill)
- gstRate: number (0, 5, 12, 18)

Return strictly valid JSON with this format:
{
  "invoiceNumber": "string",
  "supplierName": "string",
  "totalBillAmount": number,
  "billDate": "YYYY-MM-DD",
  "items": [ ... ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        },
        promptText,
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
      return res.json({
        success: true,
        invoiceNumber: parsed.invoiceNumber || mockBillParsedResult.invoiceNumber,
        supplierName: parsed.supplierName || 'Scanned Wholesale Distributor',
        totalBillAmount: parsed.totalBillAmount || 0,
        billDate: parsed.billDate || new Date().toISOString().split('T')[0],
        items: parsed.items,
      });
    }

    res.json(mockBillParsedResult);
  } catch (err) {
    console.error('Bill OCR Gemini Error:', err);
    res.json(mockBillParsedResult);
  }
});

// Bulk Sync Items from Bill into Inventory
app.post('/api/inventory/bulk-sync', (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ success: false, message: 'Items array is required' });
  }

  let updatedCount = 0;
  let newCount = 0;

  items.forEach((item: any) => {
    // Check match by barcode or exact name
    const existingIdx = productsStore.findIndex(
      p => (p.barcode && item.barcode && p.barcode === item.barcode) || p.name.toLowerCase() === item.name.toLowerCase()
    );

    if (existingIdx >= 0) {
      const p = productsStore[existingIdx];
      productsStore[existingIdx] = {
        ...p,
        stock: p.stock + Number(item.stockToAdd || item.stock || 0),
        price: Number(item.price || p.price),
        mrp: Number(item.mrp || p.mrp),
        gstRate: Number(item.gstRate ?? p.gstRate),
      };
      updatedCount++;
    } else {
      const newProd: Product = {
        id: `p_synced_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: item.name,
        hindiName: item.hindiName || item.name,
        category: item.category || 'Daily Grocery Items',
        subcategory: item.subcategory || 'General',
        brand: item.brand || 'Sarv Mart',
        price: Number(item.price || item.mrp || 100),
        mrp: Number(item.mrp || item.price || 110),
        unit: item.unit || '1 unit',
        stock: Number(item.stockToAdd || item.stock || 10),
        rating: 4.8,
        reviewsCount: 12,
        image: item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
        discountPercent: item.mrp && item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 10,
        description: `Fresh stock synced from supplier invoice. Premium quality from Sarv Mart Lucknow.`,
        gstRate: Number(item.gstRate || 5),
        barcode: item.barcode || `${Math.floor(8901000000000 + Math.random() * 999999999)}`,
      };
      productsStore.unshift(newProd);
      newCount++;
    }
  });

  res.json({
    success: true,
    message: `Inventory successfully synced! ${updatedCount} products updated, ${newCount} new products added.`,
    products: productsStore,
    updatedCount,
    newCount,
  });
});

// Start Server with Vite Middleware in Dev
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sarv Mart Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
