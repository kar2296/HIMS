/**
 * Turns pharmacy bill detail rows (billing/patientbilldetails/GetPatientPharmacyBillDetails) into one
 * returnable line per item + stock batch, following the rules of the previous AngularJS screen:
 *  - billed quantity  = sum of pharmacy-sale rows of sale type 2 or 6
 *  - returned quantity = last row's ReturnedQuantity, or the quantity of a type-6 pharmacy return
 *  - in-transit quantity = pending stock-return lines for the same item + batch
 *  - rate / GST / batch fields come from the last row of the group
 *  - only items with a billed quantity > 0 are listed, sorted by item name
 */
export interface BillDetailRow {
  Id: number;
  PatientBillId: number;
  ItemMasterId: number;
  ItemName: string;
  ItemCode?: string;
  IsSupplementary?: boolean;
  Quantity: number;
  ReturnedQuantity?: number;
  ReturnQuantity?: number;
  IsPharmacySale?: number | boolean;
  PharmacySaleTypeId?: number;
  IsPharmacyReturn?: number | boolean;
  PharmacyReturnTypeId?: number;
  Rate?: number;
  BatchId?: string;
  ExpiryDate?: string | null;
  StockItemId?: number;
  StockSerialItemId?: number;
  ServiceCategoryId?: number;
  MasterItemId?: number;
  MasterName?: string;
  [key: string]: unknown;
}

export interface StockReturnDetail {
  ItemMasterId: number;
  StockSerialItemId: number;
  ReturnQuantity: number;
}

export interface ReturnableItem {
  PatientBillDetailId: number;
  PatientBillId: number;
  ItemMasterId: number;
  ItemName: string;
  ItemCode?: string;
  IsSupplementary?: boolean;
  Quantity: number;
  ServiceCategoryId?: number;
  MasterName?: string;
  ReturnedQuantity: number;
  ReturnQuantity: number;
  ReturnTransitQuantity: number;
  ReceivedQuantity: number;
  BatchId?: string;
  ExpiryDate?: string | null;
  StockItemId?: number;
  StockSerialItemId?: number;
  Rate: number;
  GSTId?: number;
  GSTPercentage?: number;
  GSTAmount?: number;
  UnitGSTAmount?: number;
  InGstId?: number;
  InGstPercentage?: number;
  InGstAmount?: number;
  UnitInGstAmount?: number;
  CGstId?: number;
  CGstPercentage?: number;
  CGstAmount?: number;
  UnitCGstAmount?: number;
  SGstId?: number;
  SGstPercentage?: number;
  SGstAmount?: number;
  UnitSGstAmount?: number;
  UnitDiscountAmount?: number;
  Status: number;
}

const truthy = (v: unknown) => v === true || v === 1 || v === '1';
const TAX_FIELDS = [
  'GSTId', 'GSTPercentage', 'GSTAmount', 'UnitGSTAmount', 'InGstId', 'InGstPercentage', 'InGstAmount', 'UnitInGstAmount',
  'CGstId', 'CGstPercentage', 'CGstAmount', 'UnitCGstAmount', 'SGstId', 'SGstPercentage', 'SGstAmount', 'UnitSGstAmount', 'UnitDiscountAmount',
] as const;

export function buildReturnableItems(rows: BillDetailRow[], stockReturns: StockReturnDetail[]): ReturnableItem[] {
  const groups = new Map<string, BillDetailRow[]>();
  rows.forEach((row) => {
    if (!(Number(row.ItemMasterId) > 0)) return;
    const key = `${row.ItemMasterId}|${row.StockSerialItemId ?? ''}`;
    const list = groups.get(key);
    if (list) list.push(row);
    else groups.set(key, [row]);
  });

  const items: ReturnableItem[] = [];
  groups.forEach((group) => {
    let quantity = 0;
    let returned = 0;
    let rate = 0;
    group.forEach((row) => {
      if (truthy(row.IsPharmacySale) && (row.PharmacySaleTypeId === 2 || row.PharmacySaleTypeId === 6)) quantity += Number(row.Quantity) || 0;
      if (truthy(row.IsPharmacySale)) rate = Number(row.Rate) || 0;
      if (Number(row.ReturnedQuantity) > 0) returned = Number(row.ReturnedQuantity);
      else if (truthy(row.IsPharmacyReturn) && row.PharmacyReturnTypeId === 6) returned = Number(row.Quantity) || 0;
    });
    const last = group[group.length - 1];
    const inTransit = stockReturns
      .filter((s) => s.ItemMasterId === last.ItemMasterId && s.StockSerialItemId === last.StockSerialItemId)
      .reduce((sum, s) => sum + (Number(s.ReturnQuantity) || 0), 0);

    if (quantity <= 0) return;
    const item: ReturnableItem = {
      PatientBillDetailId: last.Id,
      PatientBillId: last.PatientBillId,
      ItemMasterId: last.ItemMasterId,
      ItemName: last.ItemName,
      ItemCode: last.ItemCode,
      IsSupplementary: last.IsSupplementary,
      Quantity: quantity,
      ServiceCategoryId: last.ServiceCategoryId,
      MasterName: last.MasterName,
      ReturnedQuantity: returned,
      ReturnQuantity: Number(last.ReturnQuantity) || 0,
      ReturnTransitQuantity: inTransit,
      ReceivedQuantity: 0,
      BatchId: last.BatchId,
      ExpiryDate: last.ExpiryDate,
      StockItemId: last.StockItemId,
      StockSerialItemId: last.StockSerialItemId,
      Rate: rate,
      Status: 1,
    };
    TAX_FIELDS.forEach((f) => {
      (item as unknown as Record<string, unknown>)[f] = last[f];
    });
    items.push(item);
  });

  return items.sort((a, b) => (a.ItemName < b.ItemName ? -1 : a.ItemName > b.ItemName ? 1 : 0));
}

/** Validation for a typed return quantity (same rules and messages as before). Returns an error key or null. */
export function checkReturnQuantity(item: ReturnableItem, qty: number): 'exceedsBilled' | 'alreadyReturned' | null {
  if (item.ReturnTransitQuantity > 0 && item.ReturnTransitQuantity - item.Quantity === 0) return 'alreadyReturned';
  if (qty > item.Quantity - item.ReturnTransitQuantity) return 'exceedsBilled';
  return null;
}
