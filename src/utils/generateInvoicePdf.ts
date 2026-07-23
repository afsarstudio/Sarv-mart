import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../types';

export function generateInvoicePdf(order: Order) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Theme Colors
  const primaryColor: [number, number, number] = [16, 128, 67]; // Emerald Green
  const darkTextColor: [number, number, number] = [30, 41, 59]; // Slate 800
  const lightGrayColor: [number, number, number] = [241, 245, 249]; // Slate 100

  // 1. Header Banner & Store Identity
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SARV MART SUPERMARKET', 14, 13);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Fresh Groceries, Household & Daily Essentials | Lucknow (UP)', 14, 19);
  doc.text('GSTIN: 09SARVMART8821Z5 | FSSAI: 12723001000492 | Helpline: +91 7388872588', 14, 24);

  // Invoice Title Badge
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(138, 5, 58, 18, 2, 2, 'F');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TAX INVOICE', 167, 12, { align: 'center' });
  doc.setFontSize(8);
  doc.text(`NO: ${order.invoiceNumber || order.id}`, 167, 18, { align: 'center' });

  // 2. Billing & Delivery Info Box
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);

  // Left Column - Billed Customer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('BILLED TO / DELIVERED TO:', 14, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`${order.address?.fullName || 'Customer'}`, 14, 42);
  doc.text(`Mobile: +91 ${order.address?.phone || ''}`, 14, 47);
  doc.text(`${order.address?.streetAddress || ''}, ${order.address?.landmark || ''}`, 14, 52);
  doc.text(`${order.address?.area || ''}, ${order.address?.city || 'Lucknow'} - ${order.address?.pincode || ''}`, 14, 57);

  // Right Column - Order Meta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ORDER METADATA:', 125, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Order Ref ID: ${order.id}`, 125, 42);
  doc.text(`Date & Time: ${order.createdAt}`, 125, 47);
  doc.text(`Payment Mode: ${order.paymentMethod} (${order.paymentStatus || 'Paid'})`, 125, 52);
  doc.text(`Delivery Slot: ${order.deliverySlot || 'Express 15-Min Delivery'}`, 125, 57);

  // Divider line
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(14, 62, 196, 62);

  // 3. Itemized Products Table
  const tableData = order.items.map((item, index) => {
    const itemTotal = item.product.price * item.quantity;
    const mrpTotal = (item.product.mrp || item.product.price) * item.quantity;
    return [
      (index + 1).toString(),
      `${item.product.name}\n${item.product.brand ? item.product.brand + ' | ' : ''}${item.product.unit || ''}`,
      `${item.product.gstRate ?? 5}%`,
      `₹${item.product.mrp || item.product.price}`,
      `₹${item.product.price}`,
      item.quantity.toString(),
      `₹${itemTotal.toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: 66,
    head: [['#', 'Item Description', 'GST %', 'MRP', 'Price', 'Qty', 'Amount (₹)']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: darkTextColor,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 70 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 26, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  // Y coordinate after table
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : 150;

  // 4. Totals & Savings Summary
  const totalMRP = order.items.reduce((acc, it) => acc + ((it.product.mrp || it.product.price) * it.quantity), 0);
  const calculatedSavings = totalMRP > order.subtotal ? (totalMRP - order.subtotal) + (order.discount || 0) : (order.discount || 0);

  // Total Summary box on right
  doc.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
  doc.roundedRect(110, finalY, 86, 46, 3, 3, 'F');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Subtotal (Items Total):`, 115, finalY + 8);
  doc.text(`₹${order.subtotal.toFixed(2)}`, 190, finalY + 8, { align: 'right' });

  doc.text(`Promo / Offer Discount:`, 115, finalY + 15);
  doc.setTextColor(220, 38, 38);
  doc.text(`- ₹${(order.discount || 0).toFixed(2)}`, 190, finalY + 15, { align: 'right' });

  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(`Delivery & Handling Fee:`, 115, finalY + 22);
  doc.text(order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee.toFixed(2)}`, 190, finalY + 22, { align: 'right' });

  doc.text(`GST Included in Total:`, 115, finalY + 29);
  doc.text(`₹${(order.gstAmount || 0).toFixed(2)}`, 190, finalY + 29, { align: 'right' });

  doc.setLineWidth(0.3);
  doc.setDrawColor(180, 180, 180);
  doc.line(113, finalY + 33, 193, finalY + 33);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`NET PAYABLE AMOUNT:`, 115, finalY + 41);
  doc.text(`₹${order.totalAmount.toFixed(2)}`, 190, finalY + 41, { align: 'right' });

  // Savings Highlight Badge on left
  if (calculatedSavings > 0) {
    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.setDrawColor(52, 211, 153);
    doc.roundedRect(14, finalY, 88, 22, 3, 3, 'FD');

    doc.setTextColor(16, 128, 67);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`🎉 YOU SAVED ₹${calculatedSavings.toFixed(2)} ON THIS ORDER!`, 18, finalY + 9);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Thank you for shopping with Sarv Mart Lucknow.`, 18, finalY + 16);
  }

  // 5. Terms & Signature Footer
  const footerY = Math.max(finalY + 54, 252);
  doc.setDrawColor(220, 220, 220);
  doc.line(14, footerY, 196, footerY);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Terms: 1. Goods once sold can be returned within 7 days as per Sarv Mart store return guidelines.', 14, footerY + 5);
  doc.text('2. This is an authenticated computer-generated GST tax invoice and does not require physical signature.', 14, footerY + 9);
  doc.text('Store Address: Main Market, Behta Bazar, Lucknow - 226101 (UP) | WhatsApp Helpline: +91 7388872588', 14, footerY + 13);

  // Trigger Download
  const filename = `SarvMart_Invoice_${order.invoiceNumber || order.id}.pdf`;
  doc.save(filename);
}
