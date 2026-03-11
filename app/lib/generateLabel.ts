import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";
import { LabelData } from "./types";

function generateBarcodeDataURL(value: string): string {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, value, {
    format: "CODE128",
    width: 2.5,
    height: 80,
    displayValue: false,
    text: " ",
    margin: 2,
  });
  return canvas.toDataURL("image/png");
}

// Bring Parcels MITL label spec: 105mm x ~200mm
// Font: Arial (using Helvetica which is near-identical in jsPDF)
// Pts reference from Bring spec: form text=7pt, contents vary per field

export function generateLabelPDF(
  data: LabelData,
  logoDataURL?: string | null
): jsPDF {
  const W = 105;
  const H = 200;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [W, H], putOnlyUsedFonts: true });
  doc.setProperties({
    title: "Pakkelapp - Bring/Posten Label",
    subject: `Label ${data.licensePlate}`,
    creator: "pakkelapp.no",
  });
  doc.setDisplayMode("fullpage", "single");

  const L = 3;
  const R = W - 3;
  let y = 0;

  const formText = (size = 7) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(0, 0, 0);
  };
  const contentText = (size = 10, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(0, 0, 0);
  };
  const hLine = (yPos: number) => {
    doc.setLineWidth(0.25);
    doc.setDrawColor(0);
    doc.line(L, yPos, R, yPos);
  };
  const hLineThick = (yPos: number) => {
    doc.setLineWidth(0.5);
    doc.setDrawColor(0);
    doc.line(L, yPos, R, yPos);
  };

  // ═══ A: FROM / Sender address (7pt label, 8pt content) ═══
  y = 4;
  formText(7);
  doc.text("From:", L + 1, y);
  y += 3;
  contentText(8);
  doc.text(data.consignorName, L + 1, y);
  y += 3;
  doc.text(data.consignorAddress, L + 1, y);
  y += 4.5;
  doc.text(`${data.consignorPostcode} ${data.consignorCity}`, L + 1, y);
  y += 3;
  doc.text(data.consignorCountry?.toUpperCase() || "", L + 1, y);
  y += 3;

  // ═══ B: TO / Delivery address — this one keeps the full rect (thick border) ═══
  const toStartY = y;
  doc.setLineWidth(0.5);
  doc.setDrawColor(0);

  y += 3.5;
  formText(7);
  doc.text("To:", L + 2, y);

  // C: Date
  contentText(10);
  doc.text(data.date, R - 2, y, { align: "right" });
  y += 4.5;

  contentText(12);
  doc.text(data.consigneeName, L + 2, y);
  y += 5;

  contentText(13, true);
  const addrParts = data.consigneeAddress.split(",").map((s) => s.trim());
  for (const part of addrParts) {
    doc.text(part, L + 2, y);
    y += 5;
  }

  // Postcode + city
  y += 2;
  contentText(24, true);
  doc.text(data.postcode, L + 2, y);
  const pcWidth = doc.getTextWidth(data.postcode);
  contentText(18, true);
  doc.text(data.city, L + 4 + pcWidth + 2, y - 0.5);
  y += 5;

  // D: Phone (right-aligned area)
  const phoneLineY = y;
  y += 3.5;
  formText(7);
  doc.text("Phone:", L + (R - L) * 0.75, y, { align: "center" });
  y += 3.5;
  contentText(10);
  doc.text(data.phoneNumber || "", L + (R - L) * 0.75, y, { align: "center" });
  y += 2.5;

  const toEndY = y;
  // TO box: full rect with thick border
  doc.setLineWidth(0.5);
  doc.setDrawColor(0);
  doc.rect(L, toStartY, R - L, toEndY - toStartY);
  // Phone separator (thin)
  hLine(phoneLineY);

  // Country row — horizontal lines only
  const cStartY = y;
  contentText(11, true);
  doc.text(data.addressCountry?.toUpperCase() || "", L + 2, y + 4.5);
  y += 6;
  hLine(cStartY);
  hLine(y);

  // ═══ E/F/G: Details grid — horizontal lines only ═══
  const detStartY = y;
  y += 3;

  formText(7);
  doc.text("License plate no:", L + 1, y);
  doc.text("Packages:", L + 42, y);
  doc.text("Weight (kg):", L + 58, y);
  doc.text("Volume (dm\u00B3):", L + 78, y);
  y += 3.5;
  contentText(10);
  doc.text(data.licensePlate, L + 1, y);
  contentText(10, true);
  doc.text(data.numberOfParcels, L + 42, y);
  doc.text(data.weight, L + 58, y);
  doc.text(data.volume, L + 78, y);

  y += 3;
  formText(7);
  doc.text("Consignment ID:", L + 1, y);
  doc.text("Customer No:", L + 42, y);
  y += 3.5;
  contentText(10);
  doc.text(data.consignmentId, L + 1, y);
  doc.text(data.customerNumber?.replace("CN-", "") || "", L + 42, y);
  y += 2;
  hLine(detStartY);
  hLine(y);

  // ═══ Transport instructions + Recipient — horizontal lines only ═══
  const transStartY = y;
  y += 3;
  formText(7);
  doc.text("Transport instructions:", L + 1, y);
  doc.text("Recipient:", L + 46, y);
  y += 3.5;
  contentText(8);
  if (data.deliveryInstructions) {
    const instrLines = doc.splitTextToSize(data.deliveryInstructions, 40);
    doc.text(instrLines, L + 1, y);
  }
  contentText(8);
  doc.text(data.consigneeName, L + 46, y);
  y += 3.5;
  const ti = data.transportInstructions || "";
  const recipientLines = ti
    .replace(/^Recipient:\s*/i, "")
    .replace(data.consigneeName, "")
    .trim()
    .split(/\s{2,}/)
    .filter(Boolean);
  for (const rl of recipientLines) {
    doc.text(rl, L + 46, y);
    y += 3.5;
  }
  y += 1;
  hLine(transStartY);

  // Spacer (empty, no borders)
  y += 14;

  // ═══ N: Services — horizontal lines only ═══
  if (data.additionalServices) {
    const svcStartY = y;
    y += 3;
    formText(7);
    doc.text("Services:", L + 1, y);
    y += 4.5;
    contentText(14);
    doc.text(data.additionalServices, L + 1, y);
    y += 4.5;
    hLine(svcStartY);
    hLine(y);
  }

  // ═══ O/P/Q/R: Product section — horizontal lines only ═══
  const prodStartY = y;

  if (logoDataURL) {
    doc.addImage(logoDataURL, "PNG", L + 1, prodStartY + 1.5, 14, 14);
  }

  y += 3;
  formText(7);
  doc.text("Product:", L + 19, y);
  y += 4;
  contentText(14);
  doc.text(data.productName, L + 19, y);

  y += 3;
  formText(7);
  doc.text("Product ID:", L + 19, y);
  y += 6;
  contentText(20, true);
  doc.text(data.productId, L + 19, y);

  contentText(36, true);
  doc.text(data.priorityCode, R - 4, y, { align: "right" });

  y += 2;
  hLine(prodStartY);
  hLine(y);

  // ═══ S: Sender's reference — horizontal lines only ═══
  y += 3;
  formText(7);
  doc.text("Sender's reference:", L + 1, y);
  y += 3;
  contentText(8);
  if (data.senderReference) {
    doc.text(data.senderReference, L + 1, y);
  }
  y += 2.5;

  // Recipient's reference
  hLine(y);
  y += 3;
  formText(7);
  doc.text("Recipient's reference:", L + 1, y);
  y += 3;
  contentText(8);
  if (data.recipientReference) {
    doc.text(data.recipientReference, L + 1, y);
  }
  y += 2.5;
  hLine(y);

  // ═══ U/V: SSCC Barcode — thick top line, horizontal lines only ═══
  hLineThick(y);
  y += 3;
  formText(7);
  doc.text("License plate no:", L + 1, y);
  y += 2;

  try {
    const barcodeImg = generateBarcodeDataURL(data.licensePlateBarcode);
    const barcodeH = Math.min(28, H - y - 8);
    doc.addImage(barcodeImg, "PNG", L + 6, y, R - L - 12, barcodeH);
    y += barcodeH + 2;
  } catch {
    y += 22;
  }

  contentText(10);
  doc.setFont("courier", "normal");
  doc.text(`(00)${data.licensePlate}`, L + (R - L) / 2, y, {
    align: "center",
  });
  y += 4;

  return doc;
}

export function downloadLabelPDF(
  data: LabelData,
  logoDataURL?: string | null
): void {
  const doc = generateLabelPDF(data, logoDataURL);
  const filename = `pakkelapp-${data.licensePlate || "label"}.pdf`;
  doc.save(filename);
}

export function getLabelBlobURL(
  data: LabelData,
  logoDataURL?: string | null
): string {
  const doc = generateLabelPDF(data, logoDataURL);
  const blob = doc.output("blob");
  return URL.createObjectURL(blob);
}
