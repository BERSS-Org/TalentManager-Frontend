/**
 * Catalog of currencies the workspace can be configured with.
 * Keep the list reasonably broad — common ISO 4217 codes used worldwide.
 * The label is shown in dropdowns; the symbol is used by the CurrencyPipe.
 */
export interface CurrencyOption {
  /** ISO 4217 alpha code, used as the canonical identifier. */
  code: string;
  /** Locally displayed name in Spanish — works fine alongside the English UI. */
  nameEs: string;
  /** Locally displayed name in English. */
  nameEn: string;
  /** Visual symbol (used by some labels and chips). */
  symbol: string;
}

export const CURRENCY_CATALOG: CurrencyOption[] = [
  { code: 'USD', nameEs: 'Dólar estadounidense',     nameEn: 'United States dollar',  symbol: '$' },
  { code: 'EUR', nameEs: 'Euro',                     nameEn: 'Euro',                  symbol: '€' },
  { code: 'GBP', nameEs: 'Libra esterlina',          nameEn: 'British pound',         symbol: '£' },
  { code: 'JPY', nameEs: 'Yen japonés',              nameEn: 'Japanese yen',          symbol: '¥' },
  { code: 'CHF', nameEs: 'Franco suizo',             nameEn: 'Swiss franc',           symbol: 'CHF' },
  { code: 'CAD', nameEs: 'Dólar canadiense',         nameEn: 'Canadian dollar',       symbol: 'C$' },
  { code: 'AUD', nameEs: 'Dólar australiano',        nameEn: 'Australian dollar',     symbol: 'A$' },
  { code: 'NZD', nameEs: 'Dólar neozelandés',        nameEn: 'New Zealand dollar',    symbol: 'NZ$' },
  { code: 'CNY', nameEs: 'Yuan chino',               nameEn: 'Chinese yuan',          symbol: '¥' },
  { code: 'HKD', nameEs: 'Dólar de Hong Kong',       nameEn: 'Hong Kong dollar',      symbol: 'HK$' },
  { code: 'SGD', nameEs: 'Dólar de Singapur',        nameEn: 'Singapore dollar',      symbol: 'S$' },
  { code: 'KRW', nameEs: 'Won surcoreano',           nameEn: 'South Korean won',      symbol: '₩' },
  { code: 'INR', nameEs: 'Rupia india',              nameEn: 'Indian rupee',          symbol: '₹' },
  { code: 'IDR', nameEs: 'Rupia indonesia',          nameEn: 'Indonesian rupiah',     symbol: 'Rp' },
  { code: 'PHP', nameEs: 'Peso filipino',            nameEn: 'Philippine peso',       symbol: '₱' },
  { code: 'THB', nameEs: 'Baht tailandés',           nameEn: 'Thai baht',             symbol: '฿' },
  { code: 'VND', nameEs: 'Dong vietnamita',          nameEn: 'Vietnamese dong',       symbol: '₫' },
  { code: 'MYR', nameEs: 'Ringgit malayo',           nameEn: 'Malaysian ringgit',     symbol: 'RM' },
  { code: 'TRY', nameEs: 'Lira turca',               nameEn: 'Turkish lira',          symbol: '₺' },
  { code: 'AED', nameEs: 'Dírham emiratí',           nameEn: 'UAE dirham',            symbol: 'د.إ' },
  { code: 'SAR', nameEs: 'Riyal saudí',              nameEn: 'Saudi riyal',           symbol: '﷼' },
  { code: 'ILS', nameEs: 'Nuevo séquel israelí',     nameEn: 'Israeli new shekel',    symbol: '₪' },
  { code: 'EGP', nameEs: 'Libra egipcia',            nameEn: 'Egyptian pound',        symbol: 'E£' },
  { code: 'ZAR', nameEs: 'Rand sudafricano',         nameEn: 'South African rand',    symbol: 'R' },
  { code: 'NGN', nameEs: 'Naira nigeriana',          nameEn: 'Nigerian naira',        symbol: '₦' },
  { code: 'KES', nameEs: 'Chelín keniano',           nameEn: 'Kenyan shilling',       symbol: 'KSh' },
  { code: 'MAD', nameEs: 'Dírham marroquí',          nameEn: 'Moroccan dirham',       symbol: 'د.م.' },

  { code: 'MXN', nameEs: 'Peso mexicano',            nameEn: 'Mexican peso',          symbol: 'MX$' },
  { code: 'BRL', nameEs: 'Real brasileño',           nameEn: 'Brazilian real',        symbol: 'R$' },
  { code: 'ARS', nameEs: 'Peso argentino',           nameEn: 'Argentine peso',        symbol: '$' },
  { code: 'CLP', nameEs: 'Peso chileno',             nameEn: 'Chilean peso',          symbol: 'CLP$' },
  { code: 'COP', nameEs: 'Peso colombiano',          nameEn: 'Colombian peso',        symbol: 'COL$' },
  { code: 'PEN', nameEs: 'Sol peruano',              nameEn: 'Peruvian sol',          symbol: 'S/' },
  { code: 'UYU', nameEs: 'Peso uruguayo',            nameEn: 'Uruguayan peso',        symbol: '$U' },
  { code: 'PYG', nameEs: 'Guaraní paraguayo',        nameEn: 'Paraguayan guarani',    symbol: '₲' },
  { code: 'BOB', nameEs: 'Boliviano',                nameEn: 'Bolivian boliviano',    symbol: 'Bs' },
  { code: 'VES', nameEs: 'Bolívar venezolano',       nameEn: 'Venezuelan bolívar',    symbol: 'Bs.S' },
  { code: 'DOP', nameEs: 'Peso dominicano',          nameEn: 'Dominican peso',        symbol: 'RD$' },
  { code: 'CRC', nameEs: 'Colón costarricense',      nameEn: 'Costa Rican colón',     symbol: '₡' },
  { code: 'GTQ', nameEs: 'Quetzal guatemalteco',     nameEn: 'Guatemalan quetzal',    symbol: 'Q' },
  { code: 'HNL', nameEs: 'Lempira hondureña',        nameEn: 'Honduran lempira',      symbol: 'L' },
  { code: 'NIO', nameEs: 'Córdoba nicaragüense',     nameEn: 'Nicaraguan córdoba',    symbol: 'C$' },
  { code: 'PAB', nameEs: 'Balboa panameña',          nameEn: 'Panamanian balboa',     symbol: 'B/.' },

  { code: 'NOK', nameEs: 'Corona noruega',           nameEn: 'Norwegian krone',       symbol: 'kr' },
  { code: 'SEK', nameEs: 'Corona sueca',             nameEn: 'Swedish krona',         symbol: 'kr' },
  { code: 'DKK', nameEs: 'Corona danesa',            nameEn: 'Danish krone',          symbol: 'kr' },
  { code: 'ISK', nameEs: 'Corona islandesa',         nameEn: 'Icelandic króna',       symbol: 'kr' },
  { code: 'PLN', nameEs: 'Esloti polaco',            nameEn: 'Polish złoty',          symbol: 'zł' },
  { code: 'CZK', nameEs: 'Corona checa',             nameEn: 'Czech koruna',          symbol: 'Kč' },
  { code: 'HUF', nameEs: 'Forinto húngaro',          nameEn: 'Hungarian forint',      symbol: 'Ft' },
  { code: 'RON', nameEs: 'Leu rumano',               nameEn: 'Romanian leu',          symbol: 'lei' },
  { code: 'BGN', nameEs: 'Lev búlgaro',              nameEn: 'Bulgarian lev',         symbol: 'лв' },
  { code: 'UAH', nameEs: 'Grivna ucraniana',         nameEn: 'Ukrainian hryvnia',     symbol: '₴' },
  { code: 'RUB', nameEs: 'Rublo ruso',               nameEn: 'Russian ruble',         symbol: '₽' },

  { code: 'TWD', nameEs: 'Dólar taiwanés',           nameEn: 'New Taiwan dollar',     symbol: 'NT$' },
  { code: 'PKR', nameEs: 'Rupia pakistaní',          nameEn: 'Pakistani rupee',       symbol: '₨' },
  { code: 'BDT', nameEs: 'Taka bangladesí',          nameEn: 'Bangladeshi taka',      symbol: '৳' },
  { code: 'LKR', nameEs: 'Rupia esrilanquesa',       nameEn: 'Sri Lankan rupee',      symbol: 'Rs' },
  { code: 'QAR', nameEs: 'Riyal catarí',             nameEn: 'Qatari riyal',          symbol: 'ر.ق' },
  { code: 'KWD', nameEs: 'Dinar kuwaití',            nameEn: 'Kuwaiti dinar',         symbol: 'د.ك' },
  { code: 'BHD', nameEs: 'Dinar bahreiní',           nameEn: 'Bahraini dinar',        symbol: '.د.ب' },
  { code: 'OMR', nameEs: 'Rial omaní',               nameEn: 'Omani rial',            symbol: 'ر.ع.' },
  { code: 'JOD', nameEs: 'Dinar jordano',            nameEn: 'Jordanian dinar',       symbol: 'د.ا' }
];

export function findCurrency(code: string): CurrencyOption | undefined {
  if (!code) return undefined;
  return CURRENCY_CATALOG.find(option => option.code.toLowerCase() === code.toLowerCase());
}

export function currencyLabel(option: CurrencyOption, language: 'es' | 'en'): string {
  const name = language === 'en' ? option.nameEn : option.nameEs;
  return `${option.code} (${name})`;
}
