import type { LocalizedString } from './products';

export interface BlogPost {
  id: string;
  slug: string;
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString[]; // array of paragraphs
  category: 'Skincare' | 'Haircare' | 'Wellness' | 'Business';
  image: string;
  date: string; // ISO
  readMinutes: number;
  author: {name: LocalizedString;role: LocalizedString;};
  featured?: boolean;
}

export const blogCategories = [
'All',
'Skincare',
'Haircare',
'Wellness',
'Business'] as
const;
export type BlogCategory = (typeof blogCategories)[number];

export const blogPosts: BlogPost[] = [
{
  id: 'post-1',
  slug: 'science-of-natural-hair-oils',
  title: {
    en: 'The Science Behind Natural Hair Oils',
    ar: 'العلم وراء زيوت الشعر الطبيعية'
  },
  excerpt: {
    en: 'Discover how time-tested ingredients like Amla, Brahmi, and Neem deliver visible results — and why formulation matters as much as origin.',
    ar: 'اكتشف كيف تقدّم المكونات المجربة مثل الأملا والبراهمي والنيم نتائج مرئية — ولماذا التركيبة لا تقل أهمية عن المصدر.'
  },
  content: [
  {
    en: 'Natural hair oils have been a cornerstone of beauty rituals across cultures for centuries. But modern haircare goes beyond folklore — today, we understand exactly how these botanical actives interact with the scalp, hair follicle, and cuticle to deliver real, measurable results.',
    ar: 'كانت زيوت الشعر الطبيعية ركيزة لطقوس الجمال عبر الثقافات لقرون. لكن العناية الحديثة بالشعر تتجاوز الفولكلور — فاليوم نفهم بدقة كيف تتفاعل هذه المكونات النباتية الفعالة مع فروة الرأس وبصيلة الشعر والطبقة الخارجية لتقديم نتائج حقيقية وقابلة للقياس.'
  },
  {
    en: 'Amla, rich in vitamin C and polyphenols, strengthens hair follicles and supports the natural pigment that keeps hair vibrant. Brahmi is known to reduce stress on the scalp, encouraging healthier growth. Neem brings powerful antibacterial properties, helping maintain a clean, balanced scalp environment.',
    ar: 'الأملا الغني بفيتامين سي والبوليفينول يقوّي بصيلات الشعر ويدعم الصبغة الطبيعية التي تحافظ على حيوية الشعر. ويُعرف البراهمي بتقليل التوتر على فروة الرأس وتشجيع نمو أكثر صحة. ويوفر النيم خصائص مضادة للبكتيريا قوية تساعد في الحفاظ على بيئة فروة رأس نظيفة ومتوازنة.'
  },
  {
    en: 'But raw ingredients alone are not enough. What separates a forgettable product from a salon-grade formula is the carrier oil, the extraction method, and the balance between actives. At Dream & Shine, every batch is engineered for absorption, stability, and a luxurious sensorial experience.',
    ar: 'لكن المكونات الخام وحدها لا تكفي. ما يفصل المنتج العادي عن تركيبة بمستوى الصالونات هو الزيت الناقل وطريقة الاستخلاص والتوازن بين المواد الفعالة. في دريم آند شاين، تُصمَّم كل دفعة لضمان الامتصاص والاستقرار وتجربة حسية فاخرة.'
  }],

  category: 'Haircare',
  image:'/images/banner/b3.png',
  date: '2026-04-12',
  readMinutes: 5,
  author: {
    name: { en: 'Layla Hassan', ar: 'ليلى حسن' },
    role: { en: 'Head of Formulation', ar: 'رئيسة قسم التركيبات' }
  },
  featured: true
},
{
  id: 'post-2',
  slug: 'understanding-spf',
  title: {
    en: 'Understanding SPF: A Complete Beauty Guide',
    ar: 'فهم عامل الحماية SPF: دليل الجمال الكامل'
  },
  excerpt: {
    en: 'Not all sunscreens are created equal. Learn the difference between SPF numbers, broad-spectrum protection, and how to choose the right formula for your clients.',
    ar: 'ليست كل واقيات الشمس متساوية. تعرّف على الفرق بين أرقام SPF وحماية الطيف الواسع وكيفية اختيار التركيبة المناسبة لعملائك.'
  },
  content: [
  {
    en: 'SPF — Sun Protection Factor — measures how well a sunscreen protects against UVB rays, the primary cause of sunburn. SPF 50+ filters approximately 98% of UVB radiation, making it ideal for daily wear in sunny climates.',
    ar: 'يقيس عامل الحماية SPF مدى فعالية واقي الشمس ضد أشعة UVB، السبب الرئيسي لحروق الشمس. ويفلتر SPF 50+ نحو 98% من إشعاع UVB، مما يجعله مثالياً للاستخدام اليومي في المناخات المشمسة.'
  },
  {
    en: 'But protection from UVB alone is not enough. UVA rays penetrate deeper into the skin, accelerating aging and contributing to long-term damage. That is why broad-spectrum sunscreens — which protect against both UVA and UVB — are the gold standard.',
    ar: 'لكن الحماية من UVB وحدها لا تكفي. أشعة UVA تخترق البشرة بعمق أكبر وتسرّع الشيخوخة وتساهم في الأضرار طويلة الأمد. لهذا تُعدّ واقيات الشمس واسعة الطيف — التي تحمي من UVA وUVB معاً — هي المعيار الذهبي.'
  },
  {
    en: 'A great sunscreen also feels invisible on the skin. Our SPF 50+ formula is enriched with hyaluronic acid and vitamin E for daily hydration, absorbs in seconds, and leaves no white cast — perfect for use under makeup or after skincare routines.',
    ar: 'واقي الشمس الرائع يجب أن يكون غير مرئي على البشرة. تركيبتنا SPF 50+ غنية بحمض الهيالورونيك وفيتامين هـ للترطيب اليومي، تمتص في ثوانٍ ولا تترك أثراً أبيض — مثالية تحت المكياج أو بعد روتين العناية بالبشرة.'
  }],

  category: 'Skincare',
  image:'/images/banner/b1.png',
  date: '2026-03-28',
  readMinutes: 6,
  author: {
    name: { en: 'Dr. Sara Al-Mansouri', ar: 'د. سارة المنصوري' },
    role: { en: 'Dermatology Advisor', ar: 'مستشارة الأمراض الجلدية' }
  },
  featured: true
},
{
  id: 'post-3',
  slug: 'acne-care-myths-vs-facts',
  title: {
    en: 'Acne Care: Myths vs. Facts',
    ar: 'العناية بحب الشباب: الأساطير مقابل الحقائق'
  },
  excerpt: {
    en: 'From scrubbing aggressively to skipping moisturizer — we debunk the most common acne myths and reveal what actually works.',
    ar: 'من الفرك العنيف إلى تجاهل المرطّب — نفنّد أكثر أساطير حب الشباب شيوعاً ونكشف ما ينجح فعلاً.'
  },
  content: [
  {
    en: 'Acne affects millions of people worldwide, but the advice surrounding it is often outdated or simply wrong. The most damaging myth: that acne is caused by "dirty skin" and that aggressive scrubbing will fix it. The reality is far more nuanced.',
    ar: 'يؤثر حب الشباب على ملايين الناس حول العالم، لكن النصائح المتعلقة به غالباً ما تكون قديمة أو خاطئة. الأسطورة الأكثر ضرراً: أن حب الشباب ناتج عن "البشرة المتسخة" وأن الفرك العنيف سيحلّه. الحقيقة أكثر دقة بكثير.'
  },
  {
    en: 'Acne is largely driven by excess sebum, blocked pores, and bacterial activity — often influenced by hormones, stress, and genetics. Over-cleansing strips the skin barrier, triggering more oil production and worsening breakouts. Gentle, targeted formulas like our salicylic-acid face wash address the root cause without compromising skin health.',
    ar: 'ينتج حب الشباب أساساً عن الإفراز الزائد للزيوت وانسداد المسام والنشاط البكتيري — متأثراً بالهرمونات والتوتر والوراثة. التنظيف المفرط يجرّد حاجز البشرة، مما يحفّز إنتاج زيت أكثر ويفاقم الحالة. التركيبات اللطيفة والمستهدفة مثل غسولنا بحمض الساليسيليك تعالج السبب الجذري دون الإضرار بصحة البشرة.'
  },
  {
    en: 'Equally important: never skip moisturizer. Acne-prone skin still needs hydration. Look for lightweight, non-comedogenic formulas that support the barrier without clogging pores.',
    ar: 'الأهم بنفس القدر: لا تتخطَّ المرطّب أبداً. البشرة المعرضة لحب الشباب تحتاج للترطيب. ابحث عن تركيبات خفيفة وغير مسببة للانسداد تدعم حاجز البشرة دون انسداد المسام.'
  }],

  category: 'Skincare',
  image:'/images/banner/b19.png',
  date: '2026-03-15',
  readMinutes: 4,
  author: {
    name: { en: 'Noura Khalifa', ar: 'نورة خليفة' },
    role: { en: 'Beauty Editor', ar: 'محررة الجمال' }
  },
  featured: true
},
{
  id: 'post-4',
  slug: 'sustainable-beauty-business',
  title: {
    en: 'Building a Sustainable Beauty Business',
    ar: 'بناء أعمال تجميل مستدامة'
  },
  excerpt: {
    en: 'For distributors and retailers: how to scale a beauty business while staying anchored in quality, trust, and community.',
    ar: 'للموزعين وتجار التجزئة: كيف توسّع أعمال التجميل مع الحفاظ على الجودة والثقة والمجتمع.'
  },
  content: [
  {
    en: 'The beauty industry is one of the most competitive markets in the world — and also one of the most rewarding. Success in wholesale distribution is not about volume alone. It is about curating a portfolio that earns trust, delivers consistent results, and tells a coherent brand story.',
    ar: 'صناعة التجميل من أكثر الأسواق تنافسية في العالم — ومن أكثرها مكافأةً أيضاً. النجاح في توزيع الجملة ليس بالكميات وحدها. بل بتنسيق محفظة تكسب الثقة وتقدّم نتائج متسقة وتروي قصة علامة تجارية متماسكة.'
  },
  {
    en: 'Start with formulas that solve real problems. Acne care, sun protection, hair restoration — these are evergreen needs. Pair them with packaging and pricing that signal quality without alienating mid-market customers.',
    ar: 'ابدأ بتركيبات تحل مشكلات حقيقية. العناية بحب الشباب والحماية من الشمس واستعادة الشعر — هذه احتياجات دائمة. اقرنها بتغليف وتسعير يدلّان على الجودة دون إبعاد عملاء السوق المتوسطة.'
  },
  {
    en: 'Most importantly, partner with brands that support you with marketing assets, training, and responsive supply chains. At Dream & Shine, we treat every distributor as a long-term partner — not a transaction.',
    ar: 'والأهم من ذلك، اشترك مع علامات تدعمك بالمواد التسويقية والتدريب وسلاسل توريد سريعة الاستجابة. في دريم آند شاين، نتعامل مع كل موزّع كشريك طويل الأمد — لا كصفقة عابرة.'
  }],

  category: 'Business',
  image:
'/images/banner/b6.png',
  date: '2026-02-22',
  readMinutes: 7,
  author: {
    name: { en: 'Omar Tariq', ar: 'عمر طارق' },
    role: { en: 'Partnerships Director', ar: 'مدير الشراكات' }
  }
},
{
  id: 'post-5',
  slug: 'glowing-skin-routine',
  title: {
    en: 'The 5-Step Routine for Glowing Skin',
    ar: 'روتين الخطوات الخمس لبشرة مشرقة'
  },
  excerpt: {
    en: 'A simple, professional-grade daily routine that fits any lifestyle and delivers visible results in two weeks.',
    ar: 'روتين يومي بسيط بمستوى احترافي يناسب أي نمط حياة ويقدّم نتائج مرئية خلال أسبوعين.'
  },
  content: [
  {
    en: 'A great routine does not require ten products. The five essentials — cleanser, treatment serum, moisturizer, sunscreen by day, and a richer cream by night — cover 90% of what most skin types need.',
    ar: 'الروتين الرائع لا يتطلب عشرة منتجات. الأساسيات الخمس — منظّف، سيروم علاجي، مرطّب، واقي شمس نهاراً، وكريم غني ليلاً — تغطي 90% مما تحتاجه معظم أنواع البشرة.'
  },
  {
    en: 'Layer products from thinnest to thickest. Always finish your morning with SPF, even indoors. Consistency, not intensity, is the secret to radiant skin.',
    ar: 'طبّق المنتجات من الأخف إلى الأكثر سماكة. أنهِ صباحك دائماً بواقي الشمس، حتى في الداخل. الانتظام، لا الكثافة، هو سرّ البشرة المشرقة.'
  }],

  category: 'Skincare',
  image:
'/images/banner/b8.png',
  date: '2026-02-08',
  readMinutes: 5,
  author: {
    name: { en: 'Layla Hassan', ar: 'ليلى حسن' },
    role: { en: 'Head of Formulation', ar: 'رئيسة قسم التركيبات' }
  }
},
{
  id: 'post-6',
  slug: 'wellness-beauty-connection',
  title: {
    en: 'The Connection Between Wellness and Beauty',
    ar: 'العلاقة بين الصحة والجمال'
  },
  excerpt: {
    en: 'Sleep, hydration, and stress management shape your skin and hair far more than any single product ever could.',
    ar: 'النوم والترطيب وإدارة التوتر تشكّل بشرتك وشعرك أكثر بكثير من أي منتج واحد.'
  },
  content: [
  {
    en: 'No serum will outperform seven hours of quality sleep. No conditioner will rescue chronically dehydrated hair. Real beauty starts from the inside — and your products are there to amplify, not replace, healthy habits.',
    ar: 'لن يتفوق أي سيروم على سبع ساعات من النوم الجيد. ولن ينقذ أي بلسم شعراً يعاني من الجفاف المزمن. الجمال الحقيقي يبدأ من الداخل — والمنتجات موجودة لتعزيز العادات الصحية لا لتحلّ محلها.'
  },
  {
    en: 'We recommend pairing every Dream & Shine routine with these basics: 2 liters of water daily, a balanced diet rich in antioxidants, and a calming pre-sleep ritual. Your skin will thank you.',
    ar: 'نوصي بإقران كل روتين من دريم آند شاين بهذه الأساسيات: لترين من الماء يومياً، نظام غذائي متوازن غني بمضادات الأكسدة، وطقس مهدّئ قبل النوم. ستشكرك بشرتك.'
  }],

  category: 'Wellness',
  image:
'/images/banner/b2.png',
  date: '2026-01-30',
  readMinutes: 4,
  author: {
    name: { en: 'Noura Khalifa', ar: 'نورة خليفة' },
    role: { en: 'Beauty Editor', ar: 'محررة الجمال' }
  }
}];