import { signal, computed } from '@preact/signals'

export type Locale = 'en' | 'th'

export const locale = signal<Locale>('en')

const translations = {
  en: {
    title: 'Thai Fuel Price',
    subtitle: 'How much more are you paying since the war?',
    fuelType: 'Fuel type',
    priceTrend: 'Price trend',
    compareRange: 'Compare range',
    preWar: 'Pre US-Iran war',
    clickDateA: 'Click chart to select date A',
    nowClickB: 'now click date B',
    byCarModel: 'By car model',
    custom: 'Custom',
    fillLevel: 'Fill level',
    litresToFill: 'Litres to fill',
    dateA: 'Date A',
    dateB: 'Date B',
    perLitre: 'THB / litre',
    cheaperAtB: 'Cheaper at B',
    moreExpensiveAtB: 'More expensive at B',
    noChange: 'No change',
    samePrice: 'Same price',
    selectTwoDates: 'Select two dates on the chart to compare prices.',
    full: 'Full',
    gasoline95: 'Gasoline 95',
    gasohol95: 'Gasohol 95',
    gasohol91: 'Gasohol 91',
    gasoholE20: 'Gasohol E20',
    gasoholE85: 'Gasohol E85',
    diesel: 'Diesel',
    dieselB20: 'Diesel B20',
  },
  th: {
    title: 'ราคาน้ำมันไทย',
    subtitle: 'คุณจ่ายแพงขึ้นเท่าไหร่ตั้งแต่สงคราม?',
    fuelType: 'ชนิดน้ำมัน',
    priceTrend: 'แนวโน้มราคา',
    compareRange: 'ช่วงเปรียบเทียบ',
    preWar: 'ก่อนสงคราม US-Iran',
    clickDateA: 'คลิกกราฟเพื่อเลือกวันที่ A',
    nowClickB: 'คลิกเลือกวันที่ B',
    byCarModel: 'ตามรุ่นรถ',
    custom: 'กำหนดเอง',
    fillLevel: 'ระดับเติม',
    litresToFill: 'จำนวนลิตร',
    dateA: 'วันที่ A',
    dateB: 'วันที่ B',
    perLitre: 'บาท / ลิตร',
    cheaperAtB: 'ถูกกว่าที่ B',
    moreExpensiveAtB: 'แพงกว่าที่ B',
    noChange: 'ไม่เปลี่ยนแปลง',
    samePrice: 'ราคาเท่ากัน',
    selectTwoDates: 'เลือกสองวันบนกราฟเพื่อเปรียบเทียบราคา',
    full: 'เต็มถัง',
    gasoline95: 'เบนซิน 95',
    gasohol95: 'แก๊สโซฮอล์ 95',
    gasohol91: 'แก๊สโซฮอล์ 91',
    gasoholE20: 'แก๊สโซฮอล์ E20',
    gasoholE85: 'แก๊สโซฮอล์ E85',
    diesel: 'ดีเซล',
    dieselB20: 'ดีเซล B20',
  },
} as const

export type TranslationKey = keyof typeof translations.en

export const t = computed(() => translations[locale.value])

export function toggleLocale() {
  locale.value = locale.value === 'en' ? 'th' : 'en'
}
