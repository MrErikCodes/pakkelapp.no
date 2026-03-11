import { LabelData } from "./types";

const fieldMap: Record<string, keyof LabelData> = {
  Label: "label",
  ConsignorName: "consignorName",
  ConsignorAddress: "consignorAddress",
  ConsignorPostcode: "consignorPostcode",
  ConsignorCity: "consignorCity",
  ConsignorCountry: "consignorCountry",
  ConsigneeName: "consigneeName",
  ConsigneeAttention: "consigneeAttention",
  ConsigneeAddress: "consigneeAddress",
  Date: "date",
  Postcode: "postcode",
  City: "city",
  PostalAddress: "postalAddress",
  PhoneNumber: "phoneNumber",
  AddressCountry: "addressCountry",
  LicensePlate: "licensePlate",
  NumberOfParcels: "numberOfParcels",
  Weight: "weight",
  Volume: "volume",
  ConsignmentID: "consignmentId",
  CustomerNumber: "customerNumber",
  TransportInstructions: "transportInstructions",
  AdditionalServices: "additionalServices",
  ProductName: "productName",
  ProductID: "productId",
  PriorityCode: "priorityCode",
  LicensePlateBarcode: "licensePlateBarcode",
  RecipientReference: "recipientReference",
  SenderReference: "senderReference",
  DeliveryInstructions: "deliveryInstructions",
  CODAmount: "codAmount",
  BankAccount: "bankAccount",
  KIDCODReference: "kidCodReference",
};

export function parseQRData(raw: string): LabelData {
  const result: Record<string, string> = {};

  // Initialize all fields to empty string
  for (const key of Object.values(fieldMap)) {
    result[key] = "";
  }

  // Split by pipe and parse key=value pairs
  const segments = raw.split("|");
  for (const segment of segments) {
    const eqIndex = segment.indexOf("=");
    if (eqIndex > 0) {
      const key = segment.substring(0, eqIndex).trim();
      const value = segment.substring(eqIndex + 1).trim();
      const mappedKey = fieldMap[key];
      if (mappedKey) {
        result[mappedKey] = value;
      }
    }
  }

  return result as unknown as LabelData;
}
