/**
 * `value` is what we store on each bill line (disambiguated where symbols collide).
 * `iso` is the ISO 4217 code. `fullName` is the English name.
 * The list is sorted alphabetically by `iso` (A–Z).
 */
type CurrencyDef = {
  value: string;
  iso: string;
  symbol: string;
  flag: string;
  fullName: string;
};

const BILL_CURRENCIES_UNSORTED: readonly CurrencyDef[] = [
  { value: "AED", iso: "AED", symbol: "AED", flag: "🇦🇪", fullName: "United Arab Emirates dirham" },
  { value: "؋", iso: "AFN", symbol: "؋", flag: "🇦🇫", fullName: "Afghan afghani" },
  { value: "ALL", iso: "ALL", symbol: "L", flag: "🇦🇱", fullName: "Albanian lek" },
  { value: "دج", iso: "DZD", symbol: "د.ج", flag: "🇩🇿", fullName: "Algerian dinar" },
  { value: "A$", iso: "AUD", symbol: "A$", flag: "🇦🇺", fullName: "Australian dollar" },
  { value: "₼", iso: "AZN", symbol: "₼", flag: "🇦🇿", fullName: "Azerbaijani manat" },
  { value: "AR$", iso: "ARS", symbol: "AR$", flag: "🇦🇷", fullName: "Argentine peso" },
  { value: "৳", iso: "BDT", symbol: "৳", flag: "🇧🇩", fullName: "Bangladeshi taka" },
  { value: "лв", iso: "BGN", symbol: "лв", flag: "🇧🇬", fullName: "Bulgarian lev" },
  { value: "BHD", iso: "BHD", symbol: "BD", flag: "🇧🇭", fullName: "Bahraini dinar" },
  { value: "BM$", iso: "BMD", symbol: "B$", flag: "🇧🇲", fullName: "Bermudian dollar" },
  { value: "BND", iso: "BND", symbol: "B$", flag: "🇧🇳", fullName: "Brunei dollar" },
  { value: "Bs", iso: "BOB", symbol: "Bs", flag: "🇧🇴", fullName: "Bolivian boliviano" },
  { value: "R$", iso: "BRL", symbol: "R$", flag: "🇧🇷", fullName: "Brazilian real" },
  { value: "C$", iso: "CAD", symbol: "C$", flag: "🇨🇦", fullName: "Canadian dollar" },
  { value: "Fr", iso: "CHF", symbol: "Fr", flag: "🇨🇭", fullName: "Swiss franc" },
  { value: "CL$", iso: "CLP", symbol: "CL$", flag: "🇨🇱", fullName: "Chilean peso" },
  { value: "CN¥", iso: "CNY", symbol: "CN¥", flag: "🇨🇳", fullName: "Chinese yuan" },
  { value: "COL$", iso: "COP", symbol: "COL$", flag: "🇨🇴", fullName: "Colombian peso" },
  { value: "₡", iso: "CRC", symbol: "₡", flag: "🇨🇷", fullName: "Costa Rican colón" },
  { value: "Kč", iso: "CZK", symbol: "Kč", flag: "🇨🇿", fullName: "Czech koruna" },
  { value: "Dkr", iso: "DKK", symbol: "Dkr", flag: "🇩🇰", fullName: "Danish krone" },
  { value: "RD$", iso: "DOP", symbol: "RD$", flag: "🇩🇴", fullName: "Dominican peso" },
  { value: "E£", iso: "EGP", symbol: "E£", flag: "🇪🇬", fullName: "Egyptian pound" },
  { value: "€", iso: "EUR", symbol: "€", flag: "🇪🇺", fullName: "Euro" },
  { value: "£", iso: "GBP", symbol: "£", flag: "🇬🇧", fullName: "Pound sterling" },
  { value: "GEL", iso: "GEL", symbol: "₾", flag: "🇬🇪", fullName: "Georgian lari" },
  { value: "GH₵", iso: "GHS", symbol: "₵", flag: "🇬🇭", fullName: "Ghanaian cedi" },
  { value: "Q", iso: "GTQ", symbol: "Q", flag: "🇬🇹", fullName: "Guatemalan quetzal" },
  { value: "GYD", iso: "GYD", symbol: "G$", flag: "🇬🇾", fullName: "Guyanese dollar" },
  { value: "HK$", iso: "HKD", symbol: "HK$", flag: "🇭🇰", fullName: "Hong Kong dollar" },
  { value: "HNL", iso: "HNL", symbol: "L", flag: "🇭🇳", fullName: "Honduran lempira" },
  { value: "Ft", iso: "HUF", symbol: "Ft", flag: "🇭🇺", fullName: "Hungarian forint" },
  { value: "Rp", iso: "IDR", symbol: "Rp", flag: "🇮🇩", fullName: "Indonesian rupiah" },
  { value: "₪", iso: "ILS", symbol: "₪", flag: "🇮🇱", fullName: "Israeli new shekel" },
  { value: "₹", iso: "INR", symbol: "₹", flag: "🇮🇳", fullName: "Indian rupee" },
  { value: "ISK", iso: "ISK", symbol: "kr", flag: "🇮🇸", fullName: "Icelandic króna" },
  { value: "JD", iso: "JOD", symbol: "JD", flag: "🇯🇴", fullName: "Jordanian dinar" },
  { value: "J$", iso: "JMD", symbol: "J$", flag: "🇯🇲", fullName: "Jamaican dollar" },
  { value: "¥", iso: "JPY", symbol: "¥", flag: "🇯🇵", fullName: "Japanese yen" },
  { value: "Ksh", iso: "KES", symbol: "Ksh", flag: "🇰🇪", fullName: "Kenyan shilling" },
  { value: "៛", iso: "KHR", symbol: "៛", flag: "🇰🇭", fullName: "Cambodian riel" },
  { value: "₩", iso: "KRW", symbol: "₩", flag: "🇰🇷", fullName: "South Korean won" },
  { value: "KD", iso: "KWD", symbol: "KD", flag: "🇰🇼", fullName: "Kuwaiti dinar" },
  { value: "₸", iso: "KZT", symbol: "₸", flag: "🇰🇿", fullName: "Kazakhstani tenge" },
  { value: "LBP", iso: "LBP", symbol: "L£", flag: "🇱🇧", fullName: "Lebanese pound" },
  { value: "Re", iso: "LKR", symbol: "Re", flag: "🇱🇰", fullName: "Sri Lankan rupee" },
  { value: "DH", iso: "MAD", symbol: "DH", flag: "🇲🇦", fullName: "Moroccan dirham" },
  { value: "MDL", iso: "MDL", symbol: "L", flag: "🇲🇩", fullName: "Moldovan leu" },
  { value: "MGA", iso: "MGA", symbol: "Ar", flag: "🇲🇬", fullName: "Malagasy ariary" },
  { value: "MWK", iso: "MWK", symbol: "MK", flag: "🇲🇼", fullName: "Malawian kwacha" },
  { value: "RM", iso: "MYR", symbol: "RM", flag: "🇲🇾", fullName: "Malaysian ringgit" },
  { value: "MX$", iso: "MXN", symbol: "MX$", flag: "🇲🇽", fullName: "Mexican peso" },
  { value: "TMT", iso: "TMT", symbol: "T", flag: "🇹🇲", fullName: "Turkmen manat" },
  { value: "Nkr", iso: "NOK", symbol: "Nkr", flag: "🇳🇴", fullName: "Norwegian krone" },
  { value: "₦", iso: "NGN", symbol: "₦", flag: "🇳🇬", fullName: "Nigerian naira" },
  { value: "NPR", iso: "NPR", symbol: "Re", flag: "🇳🇵", fullName: "Nepalese rupee" },
  { value: "NZ$", iso: "NZD", symbol: "NZ$", flag: "🇳🇿", fullName: "New Zealand dollar" },
  { value: "OMR", iso: "OMR", symbol: "OMR", flag: "🇴🇲", fullName: "Omani rial" },
  { value: "B/.", iso: "PAB", symbol: "B/.", flag: "🇵🇦", fullName: "Panamanian balboa" },
  { value: "S/", iso: "PEN", symbol: "S/", flag: "🇵🇪", fullName: "Peruvian sol" },
  { value: "₱", iso: "PHP", symbol: "₱", flag: "🇵🇭", fullName: "Philippine peso" },
  { value: "PKR", iso: "PKR", symbol: "Rs", flag: "🇵🇰", fullName: "Pakistani rupee" },
  { value: "zł", iso: "PLN", symbol: "zł", flag: "🇵🇱", fullName: "Polish złoty" },
  { value: "QR", iso: "QAR", symbol: "QR", flag: "🇶🇦", fullName: "Qatari riyal" },
  { value: "lei", iso: "RON", symbol: "lei", flag: "🇷🇴", fullName: "Romanian leu" },
  { value: "₽", iso: "RUB", symbol: "₽", flag: "🇷🇺", fullName: "Russian ruble" },
  { value: "RWF", iso: "RWF", symbol: "FRw", flag: "🇷🇼", fullName: "Rwandan franc" },
  { value: "SR", iso: "SAR", symbol: "SR", flag: "🇸🇦", fullName: "Saudi riyal" },
  { value: "kr", iso: "SEK", symbol: "kr", flag: "🇸🇪", fullName: "Swedish krona" },
  { value: "S$", iso: "SGD", symbol: "S$", flag: "🇸🇬", fullName: "Singapore dollar" },
  { value: "฿", iso: "THB", symbol: "฿", flag: "🇹🇭", fullName: "Thai baht" },
  { value: "TJS", iso: "TJS", symbol: "TJS", flag: "🇹🇯", fullName: "Tajikistani somoni" },
  { value: "TSh", iso: "TZS", symbol: "TSh", flag: "🇹🇿", fullName: "Tanzanian shilling" },
  { value: "TT$", iso: "TTD", symbol: "TT$", flag: "🇹🇹", fullName: "Trinidad and Tobago dollar" },
  { value: "₺", iso: "TRY", symbol: "₺", flag: "🇹🇷", fullName: "Turkish lira" },
  { value: "NT$", iso: "TWD", symbol: "NT$", flag: "🇹🇼", fullName: "New Taiwan dollar" },
  { value: "USh", iso: "UGX", symbol: "USh", flag: "🇺🇬", fullName: "Ugandan shilling" },
  { value: "₴", iso: "UAH", symbol: "₴", flag: "🇺🇦", fullName: "Ukrainian hryvnia" },
  { value: "$", iso: "USD", symbol: "$", flag: "🇺🇸", fullName: "United States dollar" },
  { value: "UY$", iso: "UYU", symbol: "UY$", flag: "🇺🇾", fullName: "Uruguayan peso" },
  { value: "so'm", iso: "UZS", symbol: "so'm", flag: "🇺🇿", fullName: "Uzbekistani soʻm" },
  { value: "₫", iso: "VND", symbol: "₫", flag: "🇻🇳", fullName: "Vietnamese đồng" },
  { value: "Vt", iso: "VUV", symbol: "Vt", flag: "🇻🇺", fullName: "Vanuatu vatu" },
  { value: "YER", iso: "YER", symbol: "YER", flag: "🇾🇪", fullName: "Yemeni rial" },
  { value: "R", iso: "ZAR", symbol: "R", flag: "🇿🇦", fullName: "South African rand" },
  { value: "ZK", iso: "ZMW", symbol: "ZK", flag: "🇿🇲", fullName: "Zambian kwacha" },
];

// Ensure unique `value` keys
const _seen = new Set<string>();
for (const c of BILL_CURRENCIES_UNSORTED) {
  if (_seen.has(c.value)) {
    throw new Error(`Duplicate currency value: ${c.value} (${c.iso})`);
  }
  _seen.add(c.value);
}

function sortByIso(a: CurrencyDef, b: CurrencyDef): number {
  return a.iso.localeCompare(b.iso, "en");
}

export const BILL_CURRENCIES: readonly CurrencyDef[] = Object.freeze(
  [...BILL_CURRENCIES_UNSORTED].sort(sortByIso)
);

export type BillCurrency = CurrencyDef;

export function getCurrencyByValue(value: string): BillCurrency | undefined {
  return BILL_CURRENCIES.find((c) => c.value === value);
}

/**
 * For filters / search. Matches ISO code, English name, symbol, or stored value.
 */
export function currencyMatchesQuery(c: BillCurrency, query: string): boolean {
  const s = query.trim().toLowerCase();
  if (!s) {
    return true;
  }
  return (
    c.iso.toLowerCase().includes(s) ||
    c.fullName.toLowerCase().includes(s) ||
    c.symbol.toLowerCase().includes(s) ||
    c.value.toLowerCase().includes(s)
  );
}
