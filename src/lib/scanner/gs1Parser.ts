export interface AIRow {
  aiCode: string;
  value: string;
  label: string;
}

const AI_DEFINITIONS: Record<string, { length?: number; varLength?: boolean; label: string }> = {
  "00": { length: 18, label: "SSCC (Serial Shipping Container Code)" },
  "01": { length: 14, label: "GTIN (Global Trade Item Number)" },
  "02": { length: 14, label: "GTIN of Contained Trade Items" },
  "10": { varLength: true, label: "Lot / Batch Number" },
  "11": { length: 6, label: "Production Date (YYMMDD)" },
  "13": { length: 6, label: "Packaging Date (YYMMDD)" },
  "15": { length: 6, label: "Best Before Date (YYMMDD)" },
  "17": { length: 6, label: "Expiry Date (YYMMDD)" },
  "20": { length: 2, label: "Variant Number" },
  "21": { varLength: true, label: "Serial Number" },
  "22": { varLength: true, label: "Consumer Product Variant" },
  "30": { varLength: true, label: "Count of Trade Items" },
  "37": { varLength: true, label: "Count of Units Contained" },
  "400": { varLength: true, label: "Customer Purchase Order Number" },
  "401": { varLength: true, label: "Global Individual Asset Identifier (GIAI)" },
  "410": { length: 13, label: "Ship To / Deliver To GLN" },
  "411": { length: 13, label: "Bill To / Invoice To GLN" },
  "412": { length: 13, label: "Purchased From GLN" },
  "413": { length: 13, label: "Ship For / Deliver For GLN" },
  "414": { length: 13, label: "Identification of a Physical Location (GLN)" },
  "415": { length: 13, label: "GLN of Invoicing Party" },
  "416": { length: 13, label: "GLN of the Production/Service Location" },
  "420": { varLength: true, label: "Ship To / Deliver To Postal Code (Single Country)" },
  "421": { varLength: true, label: "Ship To / Deliver To Postal Code (with Country Code)" },
  "8001": { length: 14, label: "Roll Products (Width/Length/Core Diameter/Direction/Splices)" },
  "8002": { varLength: true, label: "Cellular Mobile Telephone Identifier" },
  "8003": { varLength: true, label: "Global Returnable Asset Identifier (GRAI)" },
  "8004": { varLength: true, label: "Global Individual Asset Identifier (GIAI)" },
  "8005": { length: 6, label: "Price Per Unit of Measure" },
  "8006": { length: 18, label: "Identification of the Components of a Trade Item (ITIP)" },
  "8007": { varLength: true, label: "International Bank Account Number (IBAN)" },
  "8008": { varLength: true, label: "Date and Time of Production" },
  "8009": { varLength: true, label: "Optically Readable Sensor Indicator" },
  "8010": { varLength: true, label: "Component / Part Identifier (CPID)" },
  "90": { varLength: true, label: "Information Mutually Agreed Between Trading Partners" },
  "91": { varLength: true, label: "Company Internal Information (91)" },
  "92": { varLength: true, label: "Company Internal Information (92)" },
  "93": { varLength: true, label: "Company Internal Information (93)" },
  "94": { varLength: true, label: "Company Internal Information (94)" },
  "95": { varLength: true, label: "Company Internal Information (95)" },
  "96": { varLength: true, label: "Company Internal Information (96)" },
  "97": { varLength: true, label: "Company Internal Information (97)" },
  "98": { varLength: true, label: "Company Internal Information (98)" },
  "99": { varLength: true, label: "Company Internal Information (99)" },
};

// Fixed-length AIs for 310x–369x range
function getWeightMeasureAI(ai: string): string | null {
  const prefix = ai.substring(0, 3);
  const measures: Record<string, string> = {
    "310": "Net Weight (kg)", "311": "Length / 1st Dimension (m)", "312": "Width / 2nd Dimension (m)",
    "313": "Depth / 3rd Dimension (m)", "314": "Area (m²)", "315": "Volume (l)",
    "316": "Volume (m³)", "320": "Net Weight (lb)", "321": "Length / 1st Dimension (in)",
    "322": "Length / 1st Dimension (ft)", "323": "Length / 1st Dimension (yd)",
    "324": "Width / 2nd Dimension (in)", "325": "Width / 2nd Dimension (ft)",
    "326": "Width / 2nd Dimension (yd)", "327": "Depth / 3rd Dimension (in)",
    "328": "Depth / 3rd Dimension (ft)", "329": "Depth / 3rd Dimension (yd)",
    "330": "Logistic Weight (kg)", "331": "Length / 1st Dimension (m, log)",
    "332": "Width / 2nd Dimension (m, log)", "333": "Depth / 3rd Dimension (m, log)",
    "334": "Area (m², log)", "335": "Logistic Volume (l)", "336": "Logistic Volume (m³)",
    "337": "Kg per m²", "340": "Logistic Weight (lb)", "341": "Length / 1st Dimension (in, log)",
    "342": "Length / 1st Dimension (ft, log)", "343": "Length / 1st Dimension (yd, log)",
    "344": "Width / 2nd Dimension (in, log)", "345": "Width / 2nd Dimension (ft, log)",
    "346": "Width / 2nd Dimension (yd, log)", "347": "Depth / 3rd Dimension (in, log)",
    "348": "Depth / 3rd Dimension (ft, log)", "349": "Depth / 3rd Dimension (yd, log)",
    "350": "Area (in², log)", "351": "Area (ft², log)", "352": "Area (yd², log)",
    "353": "Area (in²)", "354": "Area (ft²)", "355": "Area (yd²)",
    "356": "Net Weight (t)", "357": "Net Volume (oz)", "360": "Net Volume (qt)",
    "361": "Net Volume (gal)", "362": "Logistic Volume (qt)", "363": "Logistic Volume (gal)",
    "364": "Net Volume (in³)", "365": "Net Volume (ft³)", "366": "Net Volume (yd³)",
    "367": "Logistic Volume (in³)", "368": "Logistic Volume (ft³)", "369": "Logistic Volume (yd³)",
  };
  return measures[prefix] ?? null;
}

const GS1_FNC1 = String.fromCharCode(29); // Group Separator

export function parseGS1(raw: string): AIRow[] {
  const rows: AIRow[] = [];
  let pos = 0;
  const str = raw.replace(/^\]C1|^\]d2|^\]Q3/, ""); // strip symbology identifiers

  while (pos < str.length) {
    if (str[pos] === GS1_FNC1) { pos++; continue; }

    let matched = false;
    // Try 4-digit AIs first, then 3, then 2
    for (const len of [4, 3, 2]) {
      const ai = str.substring(pos, pos + len);
      if (ai.length < len) break;

      // Check weight/measure AIs (310x-369x)
      const wmLabel = getWeightMeasureAI(ai);
      if (wmLabel && len === 4) {
        const value = str.substring(pos + 4, pos + 10);
        if (value.length === 6) {
          rows.push({ aiCode: ai, value, label: wmLabel });
          pos += 10;
          matched = true;
          break;
        }
      }

      const def = AI_DEFINITIONS[ai];
      if (def) {
        pos += len;
        if (def.length) {
          const value = str.substring(pos, pos + def.length);
          rows.push({ aiCode: ai, value, label: def.label });
          pos += def.length;
        } else {
          // Variable-length: read until FNC1 or end
          const end = str.indexOf(GS1_FNC1, pos);
          const value = end === -1 ? str.substring(pos) : str.substring(pos, end);
          rows.push({ aiCode: ai, value, label: def.label });
          pos += value.length;
        }
        matched = true;
        break;
      }
    }

    if (!matched) break; // unknown AI — stop
  }

  return rows;
}

export function isGS1Barcode(type: string): boolean {
  const normalized = type.toUpperCase().replace(/_/g, "");
  return ["GS1128", "CODE128", "DATAMATRIX", "QRCODE", "GS1DATABAR"].some(
    (t) => normalized.includes(t)
  );
}
