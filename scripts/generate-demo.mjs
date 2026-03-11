#!/usr/bin/env node

/**
 * Generates a demo label PDF with fake data for social media screenshots.
 * Run: node scripts/generate-demo.mjs
 * Output: demo-label.pdf in project root
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// We need jsPDF and JsBarcode - use dynamic import from node_modules
const { jsPDF } = await import("jspdf");

// For barcode generation, we'll use a canvas polyfill approach
// Since we're in Node.js, we'll skip the barcode image and draw a placeholder

const W = 105;
const H = 200;
const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [W, H], putOnlyUsedFonts: true });

doc.setProperties({
  title: "Pakkelapp - Demo Label",
  creator: "pakkelapp.no",
});

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
const hLine = (yPos) => {
  doc.setLineWidth(0.25);
  doc.setDrawColor(0);
  doc.line(L, yPos, R, yPos);
};
const hLineThick = (yPos) => {
  doc.setLineWidth(0.5);
  doc.setDrawColor(0);
  doc.line(L, yPos, R, yPos);
};

// Demo data
const data = {
  consignorName: "Ola Nordmann",
  consignorAddress: "STORGATA 1",
  consignorPostcode: "NO-0182",
  consignorCity: "OSLO",
  consignorCountry: "Norway",
  consigneeName: "Kari Hansen",
  consigneeAddress: "KIRKEGATA 15",
  date: "11.03.2026",
  postcode: "NO-5003",
  city: "BERGEN",
  phoneNumber: "98765432",
  addressCountry: "Norway",
  licensePlate: "370700000012345678",
  numberOfParcels: "1/1",
  weight: "5.00",
  volume: "216.00",
  consignmentId: "70700000045678901",
  customerNumber: "CN-100012345",
  transportInstructions: "Recipient: Kari Hansen  KIRKEGATA 15  5003 BERGEN",
  deliveryInstructions: "",
  additionalServices: "1036: Choice of pickup point",
  productName: "Norgespakke",
  productId: "3067",
  priorityCode: "3",
  licensePlateBarcode: "00370700000012345678",
  senderReference: "",
  recipientReference: "",
};

// FROM
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
doc.text(data.consignorCountry.toUpperCase(), L + 1, y);
y += 3;

// TO box
const toStartY = y;
doc.setLineWidth(0.5);
doc.setDrawColor(0);

y += 3.5;
formText(7);
doc.text("To:", L + 2, y);
contentText(10);
doc.text(data.date, R - 2, y, { align: "right" });
y += 4.5;

contentText(12);
doc.text(data.consigneeName, L + 2, y);
y += 5;

contentText(13, true);
doc.text(data.consigneeAddress, L + 2, y);
y += 5;

y += 2;
contentText(24, true);
doc.text(data.postcode, L + 2, y);
const pcWidth = doc.getTextWidth(data.postcode);
contentText(18, true);
doc.text(data.city, L + 4 + pcWidth + 2, y - 0.5);
y += 5;

// Phone
const phoneLineY = y;
y += 3.5;
formText(7);
doc.text("Phone:", L + (R - L) * 0.75, y, { align: "center" });
y += 3.5;
contentText(10);
doc.text(data.phoneNumber, L + (R - L) * 0.75, y, { align: "center" });
y += 2.5;

const toEndY = y;
doc.setLineWidth(0.5);
doc.setDrawColor(0);
doc.rect(L, toStartY, R - L, toEndY - toStartY);
hLine(phoneLineY);

// Country
const cStartY = y;
contentText(11, true);
doc.text(data.addressCountry.toUpperCase(), L + 2, y + 4.5);
y += 6;
hLine(cStartY);
hLine(y);

// Details grid
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
doc.text(data.customerNumber.replace("CN-", ""), L + 42, y);
y += 2;
hLine(detStartY);
hLine(y);

// Transport instructions
const transStartY = y;
y += 3;
formText(7);
doc.text("Transport instructions:", L + 1, y);
doc.text("Recipient:", L + 46, y);
y += 3.5;
contentText(8);
doc.text(data.consigneeName, L + 46, y);
y += 3.5;
doc.text("KIRKEGATA 15", L + 46, y);
y += 3.5;
doc.text("5003 BERGEN", L + 46, y);
y += 3.5;
y += 1;
hLine(transStartY);

// Spacer
y += 14;

// Services
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

// Product section
const prodStartY = y;
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

// Sender's reference
y += 3;
formText(7);
doc.text("Sender's reference:", L + 1, y);
y += 5.5;

// Recipient's reference
hLine(y);
y += 3;
formText(7);
doc.text("Recipient's reference:", L + 1, y);
y += 5.5;
hLine(y);

// Barcode section
hLineThick(y);
y += 3;
formText(7);
doc.text("License plate no:", L + 1, y);
y += 2;

// Draw placeholder barcode bars (since we can't use JsBarcode in Node without canvas)
const bcY = y;
const bcH = 25;
const bcX = L + 10;
const bcW = R - L - 20;
doc.setFillColor(0, 0, 0);
// Generate pseudo-barcode bars
const barPattern = [2,1,3,1,2,1,1,3,2,1,1,2,3,1,2,1,1,2,1,3,1,2,1,1,3,2,1,1,2,3,1,2,1,1,2,1,3,2,1,1,2,1,3,1,2,1,1,3,2,1];
let bx = bcX;
const totalUnits = barPattern.reduce((a, b) => a + b, 0);
const unitW = bcW / totalUnits;
for (let i = 0; i < barPattern.length; i++) {
  const w = barPattern[i] * unitW;
  if (i % 2 === 0) {
    doc.rect(bx, bcY, w, bcH, "F");
  }
  bx += w;
}
y += bcH + 2;

contentText(10);
doc.setFont("courier", "normal");
doc.text(`(00)${data.licensePlate}`, L + (R - L) / 2, y, { align: "center" });

// Save
const outPath = join(__dirname, "..", "demo-label.pdf");
const pdfOutput = doc.output("arraybuffer");
writeFileSync(outPath, Buffer.from(pdfOutput));
console.log(`Demo label saved to: ${outPath}`);
