/* =========================================================
   Store configuration and catalog data
   Edit STORE to change the business name and address.
   Prices are in Egyptian pounds.
   ========================================================= */

window.STORE = {
  name: 'سمايل لتوريدات الأسنان',
  nameEn: 'DENTAL SUPPLIES',
  address: 'التجمع الخامس • شارع التسعين الجنوبي',
  branch: 'التجمع الخامس',
  returnHours: 48,
  storageKey: 'smile-dental-v1'
};

window.CATEGORIES = [
  { id: 'instruments', name: 'أدوات الأسنان', long: 'أدوات وأجهزة قابلة لإعادة الاستخدام', desc: 'هاند بيسات وملحقاتها', icon: 'tool', img: 'assets/images/cat-handpiece.jpg' },
  { id: 'restorative', name: 'مواد الترميم', long: 'مواد حشو وترميم', desc: 'كومبوزيت ومواد تجميلية', icon: 'tooth', img: 'assets/images/cat-composite.jpg' },
  { id: 'protection', name: 'مستلزمات الوقاية', long: 'مستهلكات واستخدام واحد', desc: 'جوانتات ومستهلكات العيادة', icon: 'hand', img: 'assets/images/cat-gloves.jpg' }
];

/* Each variant carries its own price; offerPrice is optional (null = no offer). */
window.DEFAULT_PRODUCTS = [
  {
    id: 'nsk-ti-max-x',
    brand: 'NSK',
    name: 'كونترا أنجل',
    model: 'Ti-Max X',
    short: 'كونترا أنجل بنسبة سرعة 1:1',
    description: 'كونترا أنجل NSK Ti-Max X بنسبة سرعة 1:1، متاح بموديلين: X25 بدون إضاءة و X25L بإضاءة.',
    category: 'instruments',
    variantLabel: 'الموديل',
    variants: [
      { id: 'X25', label: 'X25', note: 'بدون إضاءة • 1:1', basePrice: 6500, offerPrice: null },
      { id: 'X25L', label: 'X25L', note: 'بإضاءة • 1:1', basePrice: 9000, offerPrice: null }
    ],
    defaultVariant: 'X25',
    unit: 'قطعة واحدة',
    details: ['الماركة: NSK', 'الموديل: Ti-Max X', 'نسبة السرعة: 1:1', 'الاختيارات: X25 بدون إضاءة، X25L بإضاءة'],
    images: ['assets/images/catalog-handpiece.jpg', 'assets/images/cat-handpiece.jpg', 'assets/images/cart-handpiece.jpg'],
    thumb: 'assets/images/cart-handpiece.jpg',
    featured: 'assets/images/cat-handpiece.jpg'
  },
  {
    id: 'filtek-z250-xt',
    brand: '3M',
    name: 'كومبوزيت تجميلي',
    model: 'Filtek Z250 XT',
    short: 'كومبوزيت للأسنان الأمامية والخلفية',
    description: 'كومبوزيت 3M Filtek Z250 XT لترميمات الأسنان الأمامية والخلفية، متاح بالدرجات A1 و A2 و A3 و A3.5.',
    category: 'restorative',
    variantLabel: 'الدرجة',
    variants: [
      { id: 'A1', label: 'A1', note: '', basePrice: 1250, offerPrice: 1000 },
      { id: 'A2', label: 'A2', note: '', basePrice: 1250, offerPrice: 1000 },
      { id: 'A3', label: 'A3', note: '', basePrice: 1250, offerPrice: 1000 },
      { id: 'A3.5', label: 'A3.5', note: '', basePrice: 1250, offerPrice: 1000 }
    ],
    defaultVariant: 'A2',
    unit: 'سرنجة واحدة',
    details: ['الماركة: 3M', 'المنتج: Filtek Z250 XT', 'الدرجات المتاحة: A1، A2، A3، A3.5'],
    images: ['assets/images/offer-composite.jpg', 'assets/images/catalog-composite.jpg', 'assets/images/cat-composite.jpg'],
    thumb: 'assets/images/cart-composite.jpg',
    featured: 'assets/images/cat-composite.jpg'
  },
  {
    id: 'ansell-micro-touch',
    brand: 'Ansell',
    name: 'قفازات نيتريل',
    model: 'MICRO-TOUCH',
    short: 'قفازات فحص نيتريل بدون بودرة',
    description: 'جوانتيات نيتريل زرقاء من Ansell MICRO-TOUCH للاستخدام اليومي في عيادات الأسنان، توفر ملمساً مريحاً وحماية موثوقة.',
    category: 'protection',
    variantLabel: 'المقاس',
    variants: [
      { id: 'XS', label: 'XS', note: '', basePrice: 450, offerPrice: null },
      { id: 'S', label: 'S', note: '', basePrice: 450, offerPrice: null },
      { id: 'M', label: 'M', note: '', basePrice: 450, offerPrice: null },
      { id: 'L', label: 'L', note: '', basePrice: 450, offerPrice: null },
      { id: 'XL', label: 'XL', note: '', basePrice: 450, offerPrice: null }
    ],
    defaultVariant: 'M',
    unit: 'علبة ٢٠٠ جوانتي',
    details: ['الماركة: Ansell', 'الخامة: نيتريل', 'اللون: أزرق', 'المقاسات: XS، S، M، L، XL'],
    images: ['assets/images/gloves-main.jpg', 'assets/images/gloves-hand.jpg', 'assets/images/catalog-gloves.jpg'],
    thumb: 'assets/images/cart-gloves.jpg',
    featured: 'assets/images/cat-gloves.jpg'
  }
];

window.ORDER_STATUSES = [
  { id: 'new', label: 'جديد' },
  { id: 'review', label: 'قيد المراجعة' },
  { id: 'confirmed', label: 'تم التأكيد' },
  { id: 'ready', label: 'جاهز للاستلام / الشحن' },
  { id: 'done', label: 'مكتمل' },
  { id: 'cancelled', label: 'ملغي' }
];

window.CITIES = [
  'القاهرة الجديدة / التجمع',
  'مدينة نصر',
  'مصر الجديدة',
  'المعادي',
  'وسط القاهرة',
  'الجيزة',
  'الشيخ زايد / ٦ أكتوبر',
  'الإسكندرية',
  'محافظة أخرى'
];
