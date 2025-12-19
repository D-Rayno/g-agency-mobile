// constants/wilayas.ts
/**
 * Complete list of Algeria's 58 Wilayas with their codes
 * Used for province selection in forms
 */

export interface Wilaya {
    code: string;
    name: string;
    arabicName: string;
}

export const WILAYAS: Wilaya[] = [
    { code: '01', name: 'Adrar', arabicName: 'أدرار' },
    { code: '02', name: 'Chlef', arabicName: 'الشلف' },
    { code: '03', name: 'Laghouat', arabicName: 'الأغواط' },
    { code: '04', name: 'Oum El Bouaghi', arabicName: 'أم البواقي' },
    { code: '05', name: 'Batna', arabicName: 'باتنة' },
    { code: '06', name: 'Béjaïa', arabicName: 'بجاية' },
    { code: '07', name: 'Biskra', arabicName: 'بسكرة' },
    { code: '08', name: 'Béchar', arabicName: 'بشار' },
    { code: '09', name: 'Blida', arabicName: 'البليدة' },
    { code: '10', name: 'Bouira', arabicName: 'البويرة' },
    { code: '11', name: 'Tamanrasset', arabicName: 'تمنراست' },
    { code: '12', name: 'Tébessa', arabicName: 'تبسة' },
    { code: '13', name: 'Tlemcen', arabicName: 'تلمسان' },
    { code: '14', name: 'Tiaret', arabicName: 'تيارت' },
    { code: '15', name: 'Tizi Ouzou', arabicName: 'تيزي وزو' },
    { code: '16', name: 'Alger', arabicName: 'الجزائر' },
    { code: '17', name: 'Djelfa', arabicName: 'الجلفة' },
    { code: '18', name: 'Jijel', arabicName: 'جيجل' },
    { code: '19', name: 'Sétif', arabicName: 'سطيف' },
    { code: '20', name: 'Saïda', arabicName: 'سعيدة' },
    { code: '21', name: 'Skikda', arabicName: 'سكيكدة' },
    { code: '22', name: 'Sidi Bel Abbès', arabicName: 'سيدي بلعباس' },
    { code: '23', name: 'Annaba', arabicName: 'عنابة' },
    { code: '24', name: 'Guelma', arabicName: 'قالمة' },
    { code: '25', name: 'Constantine', arabicName: 'قسنطينة' },
    { code: '26', name: 'Médéa', arabicName: 'المدية' },
    { code: '27', name: 'Mostaganem', arabicName: 'مستغانم' },
    { code: '28', name: 'M\'Sila', arabicName: 'المسيلة' },
    { code: '29', name: 'Mascara', arabicName: 'معسكر' },
    { code: '30', name: 'Ouargla', arabicName: 'ورقلة' },
    { code: '31', name: 'Oran', arabicName: 'وهران' },
    { code: '32', name: 'El Bayadh', arabicName: 'البيض' },
    { code: '33', name: 'Illizi', arabicName: 'إليزي' },
    { code: '34', name: 'Bordj Bou Arréridj', arabicName: 'برج بوعريريج' },
    { code: '35', name: 'Boumerdès', arabicName: 'بومرداس' },
    { code: '36', name: 'El Tarf', arabicName: 'الطارف' },
    { code: '37', name: 'Tindouf', arabicName: 'تندوف' },
    { code: '38', name: 'Tissemsilt', arabicName: 'تيسمسيلت' },
    { code: '39', name: 'El Oued', arabicName: 'الوادي' },
    { code: '40', name: 'Khenchela', arabicName: 'خنشلة' },
    { code: '41', name: 'Souk Ahras', arabicName: 'سوق أهراس' },
    { code: '42', name: 'Tipaza', arabicName: 'تيبازة' },
    { code: '43', name: 'Mila', arabicName: 'ميلة' },
    { code: '44', name: 'Aïn Defla', arabicName: 'عين الدفلى' },
    { code: '45', name: 'Naâma', arabicName: 'النعامة' },
    { code: '46', name: 'Aïn Témouchent', arabicName: 'عين تموشنت' },
    { code: '47', name: 'Ghardaïa', arabicName: 'غرداية' },
    { code: '48', name: 'Relizane', arabicName: 'غليزان' },
    { code: '49', name: 'El M\'Ghair', arabicName: 'المغير' },
    { code: '50', name: 'El Meniaa', arabicName: 'المنيعة' },
    { code: '51', name: 'Ouled Djellal', arabicName: 'أولاد جلال' },
    { code: '52', name: 'Bordj Baji Mokhtar', arabicName: 'برج باجي مختار' },
    { code: '53', name: 'Béni Abbès', arabicName: 'بني عباس' },
    { code: '54', name: 'Timimoun', arabicName: 'تيميمون' },
    { code: '55', name: 'Touggourt', arabicName: 'تقرت' },
    { code: '56', name: 'Djanet', arabicName: 'جانت' },
    { code: '57', name: 'In Salah', arabicName: 'عين صالح' },
    { code: '58', name: 'In Guezzam', arabicName: 'عين قزام' },
];

// Convert to options format for SelectInput
export const WILAYA_OPTIONS = WILAYAS.map(w => ({
    label: `${w.code} - ${w.name}`,
    value: w.code,
}));

// Get wilaya name by code
export function getWilayaName(code: string): string {
    const wilaya = WILAYAS.find(w => w.code === code);
    return wilaya?.name || code;
}
