export interface LocalizedString {
  en: string;
  ar: string;
}

export type ProductCategory =
'Hair Care' |
'Skin Care' |
'Sun Protection' |
'Anti Acne' |
'Body Care';

export interface Product {
  id: string;
  name: LocalizedString;
  category: ProductCategory;
  shortDescription: LocalizedString;
  fullDescription: LocalizedString;
  image: string;
  bg: string;
  featured?: boolean;
  benefits: LocalizedString[];
  ingredients: LocalizedString[];
  /** Direction for use, optional — shown in modal when present. */
  directions?: LocalizedString;
  sizes: LocalizedString[];
}

export const categories = [
'All',
'Hair Care',
'Skin Care',
'Sun Protection',
'Anti Acne',
'Body Care'] as
const;
export type Category = (typeof categories)[number];

// Image pool — rotated across products so the catalog feels visually rich.
const IMG = {
  herbalOil:
'/images/oil1.png',
  arganOil:
  '/images/oil4.png',
  amlaOil:
  '/images/oil5.png',
  oliveOil:
'/images/oil2.png',
  garlicOil:
'/images/oil6.png',
  blackSeedOil:
'/images/oil3.png',
  hairSerum:
'/images/hair.png',  conditioner:
'/images/hair2.png',  hygieneWash:
'/images/woman.png',  calamineLotion:
'/images/care2.png',
  calamineCream:
'/images/care.png',
  sunscreen30lotion:
'/images/sun1.png',

sunscreen50lotion:
'/images/sun3.png',

sunscreen30cream:
'/images/sun4.png',

sunscreen50cream:
'/images/sun2.png',
anti_dandruff_shampoo:
'/images/sh1.png',
Hair_Fall_Control_Shampoo:
'/images/sh2.png',
Anti_Lice_Shampoo:
'/images/sh3.png',
  faceWash:
'/images/v1.png',
  gel:'/images/v2.png',
  Anti_Acne_Body_Spray:'/images/ant5.png',
    soap:'/images/ant2.png',
  panthenolcream:
'/images/scan1.png',
panthenolLotion:
'/images/scan2.png',
  melasmaLotion:
'/images/ant1.png',
melasmaCream:
'/images/ant3.png',
};

const BG = [
'bg-brand-pink',
'bg-brand-peach',
'bg-brand-purple',
'bg-brand-cream'];


export const products: Product[] = [
// ───────────────────────── HAIR OILS ─────────────────────────
{
  id: 'herbal-hair-oil',
  name: { en: 'Herbal Hair Oil', ar: 'زيت الشعر العشبي' },
  category: 'Hair Care',
  shortDescription: {
    en: 'Ayurvedic-inspired blend of 12+ herbal extracts that nourishes the scalp and supports healthy, strong hair.',
    ar: 'خليط مستوحى من الأيورفيدا يحتوي على أكثر من 12 خلاصة عشبية لتغذية فروة الرأس ودعم شعر صحي وقوي.'
  },
  fullDescription: {
    en: 'A signature ayurvedic-inspired hair oil formulated with a rich blend of natural extracts including Amla, Bhringraj, Brahmi, Jaborandi, Arnica, Jatamansi, Karanj, Mulethi, Mehandi, Methi, Neem, and Tea Tree Oil — carried in Til, Coconut, Sunflower, and Olive oils. Designed to deeply nourish the scalp, strengthen roots, and restore vitality to dull or weak hair.',
    ar: 'زيت شعر مستوحى من الأيورفيدا بتركيبة غنية من الخلاصات الطبيعية تشمل الأملا والبهرنغراج والبراهمي والجابوراندي والأرنيكا والجاتاماسي والكارانج والميولثي والحناء والميثي والنيم وزيت شجرة الشاي — في قاعدة من زيوت السمسم وجوز الهند وعباد الشمس والزيتون. مصمم لتغذية فروة الرأس بعمق وتقوية الجذور واستعادة حيوية الشعر الضعيف أو الباهت.'
  },
  image: IMG.herbalOil,
  bg: BG[0],
  featured: true,
  benefits: [
  {
    en: 'Nourishes scalp with 12+ herbal extracts',
    ar: 'يغذّي فروة الرأس بأكثر من 12 خلاصة عشبية'
  },
  {
    en: 'Strengthens hair roots and reduces breakage',
    ar: 'يقوّي جذور الشعر ويقلل التقصف'
  },
  { en: 'Supports healthy hair growth', ar: 'يدعم نمو الشعر الصحي' },
  { en: 'Suitable for all hair types', ar: 'مناسب لجميع أنواع الشعر' }],

  ingredients: [
  { en: 'Til Oil (Sesamum Indicum)', ar: 'زيت السمسم' },
  { en: 'Coconut Oil', ar: 'زيت جوز الهند' },
  { en: 'Sunflower Oil', ar: 'زيت عباد الشمس' },
  { en: 'Olive Oil', ar: 'زيت الزيتون' },
  { en: 'Amla Extract', ar: 'خلاصة الأملا' },
  { en: 'Bhringraj Extract', ar: 'خلاصة البهرنغراج' },
  { en: 'Brahmi Extract', ar: 'خلاصة البراهمي' },
  { en: 'Jaborandi Extract', ar: 'خلاصة الجابوراندي' },
  { en: 'Arnica Extract', ar: 'خلاصة الأرنيكا' },
  { en: 'Neem Seed Extract', ar: 'خلاصة بذور النيم' },
  { en: 'Tea Tree Oil', ar: 'زيت شجرة الشاي' }],

  directions: {
    en: 'Apply a sufficient quantity to the scalp and hair. Massage gently all over the scalp and leave overnight for best results.',
    ar: 'ضعي كمية مناسبة على فروة الرأس والشعر. دلّكي بلطف على فروة الرأس بالكامل واتركيه طوال الليل للحصول على أفضل النتائج.'
  },
  sizes: [{ en: '200ml', ar: '200 مل' }]
},
{
  id: 'argan-hair-oil',
  name: { en: 'Argan Hair Oil', ar: 'زيت الأرغان للشعر' },
  category: 'Hair Care',
  shortDescription: {
    en: 'Lightweight argan and olive oil blend that softens hair and adds a luxurious, healthy shine.',
    ar: 'خليط خفيف من زيتي الأرغان والزيتون ينعّم الشعر ويمنحه لمعاناً صحياً فاخراً.'
  },
  fullDescription: {
    en: 'A premium hair treatment combining cold-pressed argan oil with olive oil to deeply moisturize, smooth flyaways, and restore shine. Ideal for dry, frizzy, or chemically treated hair.',
    ar: 'علاج فاخر للشعر يجمع زيت الأرغان المعصور على البارد مع زيت الزيتون لترطيب عميق وتنعيم الشعر المتطاير واستعادة اللمعان. مثالي للشعر الجاف أو المجعد أو المعالج كيميائياً.'
  },
  image: IMG.arganOil,
  bg: BG[1],
  benefits: [
  {
    en: 'Smooths frizz and flyaways',
    ar: 'يقضي على التطاير والشعر المجعد'
  },
  { en: 'Restores natural shine', ar: 'يستعيد اللمعان الطبيعي' },
  { en: 'Deeply moisturizes dry hair', ar: 'يرطّب الشعر الجاف بعمق' }],

  ingredients: [
  { en: 'Argan Oil', ar: 'زيت الأرغان' },
  { en: 'Olive Oil', ar: 'زيت الزيتون' },
  { en: 'Mineral Oil', ar: 'الزيت المعدني' }],

  directions: {
    en: 'Apply a sufficient quantity to the scalp and hair. Massage gently and leave overnight for best results.',
    ar: 'ضعي كمية مناسبة على فروة الرأس والشعر. دلّكي بلطف واتركيه طوال الليل للحصول على أفضل النتائج.'
  },
  sizes: [{ en: '200ml', ar: '200 مل' }]
},
{
  id: 'amla-hair-oil',
  name: { en: 'Amla Hair Oil', ar: 'زيت الأملا للشعر' },
  category: 'Hair Care',
  shortDescription: {
    en: 'Classic Amla hair oil enriched with coconut and sesame to nourish roots and support natural pigment.',
    ar: 'زيت الأملا الكلاسيكي للشعر، غني بزيتي جوز الهند والسمسم لتغذية الجذور ودعم الصبغة الطبيعية.'
  },
  fullDescription: {
    en: 'A traditional Amla-based hair oil that combines Indian gooseberry extract with coconut and sesame oils. Helps strengthen roots, reduce premature greying, and leave hair soft, dark, and full of life.',
    ar: 'زيت شعر تقليدي مبني على الأملا يجمع خلاصة عنب الثعلب الهندي مع زيتي جوز الهند والسمسم. يساعد على تقوية الجذور وتقليل الشيب المبكر وترك الشعر ناعماً وغامقاً ومفعماً بالحيوية.'
  },
  image: IMG.amlaOil,
  bg: BG[2],
  benefits: [
  { en: 'Rich in vitamin C from Amla', ar: 'غني بفيتامين سي من الأملا' },
  {
    en: 'Strengthens hair from root to tip',
    ar: 'يقوّي الشعر من الجذور حتى الأطراف'
  },
  {
    en: 'Helps reduce premature greying',
    ar: 'يساعد على تقليل الشيب المبكر'
  }],

  ingredients: [
  { en: 'Amla Extract', ar: 'خلاصة الأملا' },
  { en: 'Coconut Oil', ar: 'زيت جوز الهند' },
  { en: 'Sesame (Til) Oil', ar: 'زيت السمسم' },
  { en: 'Mineral Oil', ar: 'الزيت المعدني' }],

  directions: {
    en: 'Apply to scalp and hair. Massage gently and leave overnight for best results.',
    ar: 'ضعيه على فروة الرأس والشعر. دلّكي بلطف واتركيه طوال الليل للحصول على أفضل النتائج.'
  },
  sizes: [{ en: '200ml', ar: '200 مل' }]
},
{
  id: 'olive-hair-oil',
  name: { en: 'Olive Hair Oil', ar: 'زيت الزيتون للشعر' },
  category: 'Hair Care',
  shortDescription: {
    en: 'Mediterranean olive oil with lemon and aloe vera for soft, conditioned, easy-to-manage hair.',
    ar: 'زيت زيتون متوسطي مع الليمون والصبار لشعر ناعم ومرطّب وسهل التصفيف.'
  },
  fullDescription: {
    en: 'Pure olive oil enriched with lemon and aloe vera extracts to soften hair, soothe the scalp, and add manageable, healthy shine without weighing strands down.',
    ar: 'زيت زيتون نقي معزّز بخلاصتي الليمون والصبار لتنعيم الشعر وتهدئة فروة الرأس وإضافة لمعان صحي سهل التصفيف دون إثقال الخصلات.'
  },
  image: IMG.oliveOil,
  bg: BG[3],
  benefits: [
  { en: 'Conditions and softens hair', ar: 'يرطّب وينعّم الشعر' },
  { en: 'Soothes the scalp', ar: 'يهدّئ فروة الرأس' },
  { en: 'Adds healthy shine', ar: 'يضيف لمعاناً صحياً' }],

  ingredients: [
  { en: 'Olive Oil', ar: 'زيت الزيتون' },
  { en: 'Coconut Oil', ar: 'زيت جوز الهند' },
  { en: 'Sesame (Til) Oil', ar: 'زيت السمسم' },
  { en: 'Lemon Extract', ar: 'خلاصة الليمون' },
  { en: 'Aloe Vera Extract', ar: 'خلاصة الصبار' }],

  directions: {
    en: 'Apply to scalp and hair, massage gently, leave overnight.',
    ar: 'ضعيه على فروة الرأس والشعر ودلّكي بلطف واتركيه طوال الليل.'
  },
  sizes: [{ en: '200ml', ar: '200 مل' }]
},
{
  id: 'garlic-hair-oil',
  name: { en: 'Garlic Hair Oil', ar: 'زيت الثوم للشعر' },
  category: 'Hair Care',
  shortDescription: {
    en: 'Garlic-powered scalp treatment with rosemary and lemon to support thicker, stronger hair.',
    ar: 'علاج لفروة الرأس مدعّم بالثوم وإكليل الجبل والليمون لدعم شعر أكثر كثافة وقوة.'
  },
  fullDescription: {
    en: 'A clarifying and strengthening oil that uses concentrated garlic extract with rosemary and lemon to stimulate the scalp and support healthier hair density. The coconut and sesame base softens the natural pungency.',
    ar: 'زيت منقّي ومقوٍّ يستخدم خلاصة الثوم المركزة مع إكليل الجبل والليمون لتنشيط فروة الرأس ودعم كثافة شعر أكثر صحة. قاعدة من زيتي جوز الهند والسمسم لتلطيف الرائحة الطبيعية.'
  },
  image: IMG.garlicOil,
  bg: BG[0],
  benefits: [
  { en: 'Stimulates the scalp', ar: 'ينشّط فروة الرأس' },
  { en: 'Supports thicker hair', ar: 'يدعم كثافة الشعر' },
  { en: 'Enriched with rosemary', ar: 'معزّز بإكليل الجبل' }],

  ingredients: [
  { en: 'Garlic Extract', ar: 'خلاصة الثوم' },
  { en: 'Coconut Oil', ar: 'زيت جوز الهند' },
  { en: 'Sesame (Til) Oil', ar: 'زيت السمسم' },
  { en: 'Lemon Extract', ar: 'خلاصة الليمون' },
  { en: 'Rosemary Extract', ar: 'خلاصة إكليل الجبل' }],

  directions: {
    en: 'Apply to scalp and hair, massage gently, leave overnight.',
    ar: 'ضعيه على فروة الرأس والشعر ودلّكي بلطف واتركيه طوال الليل.'
  },
  sizes: [{ en: '200ml', ar: '200 مل' }]
},
{
  id: 'black-seed-hair-oil',
  name: { en: 'Black Seed Hair Oil', ar: 'زيت الحبة السوداء  للشعر' },
  category: 'Hair Care',
  shortDescription: {
    en: 'Black seed (Habbatussauda) oil with vitamin E to revitalize tired hair and protect the scalp.',
    ar: 'زيت   الحبة السوداء مع فيتامين هـ لإحياء الشعر المتعب وحماية فروة الرأس.'
  },
  fullDescription: {
    en: 'A revitalizing hair oil featuring traditional black seed (Nigella sativa) extract combined with olive, coconut, and sesame oils, plus vitamin E. Supports a balanced scalp and brings life back to dull, fatigued hair.',
    ar: 'زيت شعر منعش يحتوي على خلاصة الحبة السوداء التقليدية مع زيوت الزيتون وجوز الهند والسمسم بالإضافة إلى فيتامين هـ. يدعم توازن فروة الرأس ويعيد الحياة للشعر الباهت والمتعب.'
  },
  image: IMG.blackSeedOil,
  bg: BG[1],
  benefits: [
  { en: 'Rich in antioxidants', ar: 'غني بمضادات الأكسدة' },
  { en: 'Revitalizes dull hair', ar: 'ينعش الشعر الباهت' },
  { en: 'Vitamin E enriched', ar: 'معزّز بفيتامين هـ' }],

  ingredients: [
  { en: 'Black Seed Extract', ar: 'خلاصة الحبة السوداء  ' },
  { en: 'Olive Oil', ar: 'زيت الزيتون' },
  { en: 'Coconut Oil', ar: 'زيت جوز الهند' },
  { en: 'Vitamin E (Tocopheryl Acetate)', ar: 'فيتامين هـ' }],

  directions: {
    en: 'Apply to scalp and hair, massage gently, leave overnight.',
    ar: 'ضعيه على فروة الرأس والشعر ودلّكي بلطف واتركيه طوال الليل.'
  },
  sizes: [{ en: '200ml', ar: '200 مل' }]
},

// ───────────────────────── HAIR CARE ─────────────────────────
{
  id: 'hair-serum',
  name: { en: 'Hair Serum', ar: 'سيروم الشعر' },
  category: 'Hair Care',
  shortDescription: {
    en: 'Lightweight smoothing serum for silky, shiny, frizz-free hair.',
    ar: 'سيروم خفيف للتنعيم لشعر حريري ولامع خالٍ من التطاير.'
  },
  fullDescription: {
    en: 'A leave-in styling serum infused with sunflower, coconut, and almond oils plus vitamin E. Tames frizz, locks in moisture, and delivers a glossy, salon-finish shine without weighing hair down.',
    ar: 'سيروم تصفيف يُترك على الشعر، مغذٍّ بزيوت عباد الشمس وجوز الهند واللوز إلى جانب فيتامين هـ. يروّض التطاير ويحبس الترطيب ويمنح لمعاناً بمستوى الصالونات دون إثقال الشعر.'
  },
  image: IMG.hairSerum,
  bg: BG[2],
  featured: true,
  benefits: [
  { en: 'Smooths frizz instantly', ar: 'يقضي على التطاير فوراً' },
  { en: 'Adds salon-grade shine', ar: 'يضيف لمعاناً بمستوى الصالونات' },
  { en: 'Lightweight, non-greasy', ar: 'خفيف وغير دهني' }],

  ingredients: [
  { en: 'Cyclopentasiloxane', ar: 'سيكلوبنتاسيلوكسان' },
  { en: 'Dimethiconol', ar: 'ديميثيكونول' },
  { en: 'Sunflower Oil', ar: 'زيت عباد الشمس' },
  { en: 'Coconut Oil', ar: 'زيت جوز الهند' },
  { en: 'Almond Oil', ar: 'زيت اللوز' },
  { en: 'Vitamin E', ar: 'فيتامين هـ' }],

  directions: {
    en: 'Use after shampooing and conditioning on towel-dried hair. Can also be used on dry hair to add smoothness and shine. Use sparingly — a dime-sized amount is enough.',
    ar: 'استخدميه بعد الشامبو والبلسم على الشعر المجفف بالمنشفة. يمكن أيضاً استخدامه على الشعر الجاف للتنعيم واللمعان. استخدمي كمية صغيرة بحجم قطعة نقدية فقط.'
  },
  sizes: [{ en: '100ml', ar: '100 مل' }]
},
{
  id: 'hair-conditioner',
  name: { en: 'Leave-In Hair Conditioner', ar: 'بلسم الشعر يُترك دون شطف' },
  category: 'Hair Care',
  shortDescription: {
    en: 'Spray-on leave-in conditioner with aloe vera and silicones for silky, easy-to-style hair.',
    ar: 'بلسم بخّاخ يُترك على الشعر مع الصبار والسيليكون لشعر حريري وسهل التصفيف.'
  },
  fullDescription: {
    en: 'A weightless leave-in conditioner that detangles, hydrates, and shields hair from breakage. Powered by aloe vera and a smart silicone blend that smooths the cuticle without buildup.',
    ar: 'بلسم خفيف يُترك على الشعر يفك التشابك ويرطّب ويحمي من التكسر. مدعوم بالصبار ومزيج سيليكون ذكي يُنعّم الطبقة الخارجية للشعر دون تراكم.'
  },
  image: IMG.conditioner,
  bg: BG[3],
  benefits: [
  { en: 'Detangles hair effortlessly', ar: 'يفك تشابك الشعر بسهولة' },
  { en: 'Adds long-lasting moisture', ar: 'يضيف ترطيباً طويل الأمد' },
  {
    en: 'Reduces breakage during styling',
    ar: 'يقلل التكسر أثناء التصفيف'
  }],

  ingredients: [
  { en: 'Cyclopentasiloxane', ar: 'سيكلوبنتاسيلوكسان' },
  { en: 'Aloe Vera Extract', ar: 'خلاصة الصبار' },
  { en: 'Glycerin', ar: 'جلسرين' },
  { en: 'Bis-Aminopropyl Dimethicone', ar: 'ثنائي أمينو بروبيل ديميثيكون' }],

  directions: {
    en: 'Can be applied to freshly washed or dry hair. Spray over towel-dried tresses from ends to roots, avoiding the scalp. Blow dry or air-dry and style as usual.',
    ar: 'يمكن استخدامه على الشعر المغسول حديثاً أو الجاف. رشّيه على الشعر المجفف بالمنشفة من الأطراف نحو الجذور مع تجنب فروة الرأس. جفّفي بمجفف الشعر أو الهواء وصفّفي كالمعتاد.'
  },
  sizes: [{ en: '100ml', ar: '100 مل' }]
},

// ───────────────────────── SHAMPOOS ─────────────────────────
{
  id: 'anti-dandruff-shampoo',
  name: { en: 'Anti Dandruff Shampoo', ar: 'شامبو ضد القشرة' },
  category: 'Hair Care',
  shortDescription: {
    en: 'Zinc pyrithione shampoo with tea tree oil that fights flakes and soothes itchy scalp.',
    ar: 'شامبو بزنك بيريثيون مع زيت شجرة الشاي يحارب القشرة ويهدّئ حكة فروة الرأس.'
  },
  fullDescription: {
    en: 'A daily-use anti-dandruff shampoo combining clinical-grade zinc pyrithione with tea tree oil, fenugreek, wheat germ, and rosemary extracts to clear flakes, balance the scalp, and leave hair fresh and clean.',
    ar: 'شامبو يومي ضد القشرة يجمع زنك بيريثيون بمستوى طبي مع زيت شجرة الشاي وخلاصات الحلبة وجنين القمح وإكليل الجبل لإزالة القشرة وموازنة فروة الرأس وترك الشعر منعشاً ونظيفاً.'
  },
  image: IMG.anti_dandruff_shampoo,
  bg: BG[0],
  benefits: [
  { en: 'Reduces visible flakes', ar: 'يقلل القشرة الظاهرة' },
  { en: 'Soothes scalp itchiness', ar: 'يهدّئ حكة فروة الرأس' },
  { en: 'Suitable for daily use', ar: 'مناسب للاستخدام اليومي' }],

  ingredients: [
  { en: 'Zinc Pyrithione', ar: 'زنك بيريثيون' },
  { en: 'Tea Tree Oil', ar: 'زيت شجرة الشاي' },
  { en: 'Fenugreek Extract', ar: 'خلاصة الحلبة' },
  { en: 'Wheat Germ Extract', ar: 'خلاصة جنين القمح' },
  { en: 'Rosemary Extract', ar: 'خلاصة إكليل الجبل' }],

  directions: {
    en: 'Massage onto wet hair. Leave on for one minute. Rinse thoroughly. For best results, use daily. Avoid contact with eyes.',
    ar: 'دلّكيه على الشعر المبلل. اتركيه لمدة دقيقة. اشطفي جيداً. للحصول على أفضل النتائج، استخدميه يومياً. تجنّبي ملامسة العينين.'
  },
  sizes: [
  { en: '100ml', ar: '100 مل' },
  { en: '200ml', ar: '200 مل' }]

},
{
  id: 'hair-fall-control-shampoo',
  name: { en: 'Hair Fall Control Shampoo', ar: 'شامبو لمنع تساقط الشعر' },
  category: 'Hair Care',
  shortDescription: {
    en: 'Strengthening shampoo with castor oil, neem, and pumpkin seed to reduce hair fall.',
    ar: 'شامبو مقوٍّ بزيت الخروع والنيم وبذور اليقطين لتقليل تساقط الشعر.'
  },
  fullDescription: {
    en: 'A fortifying shampoo formulated with castor oil, neem, rosemary, pumpkin seed extract, and tea tree oil to strengthen weak strands at the root, minimize breakage, and support visibly fuller hair over time.',
    ar: 'شامبو مقوٍّ بتركيبة من زيت الخروع والنيم وإكليل الجبل وخلاصة بذور اليقطين وزيت شجرة الشاي لتقوية الخصلات الضعيفة من الجذور وتقليل التكسر ودعم شعر أكثر كثافة بشكل ملحوظ مع مرور الوقت.'
  },
  image: IMG.Hair_Fall_Control_Shampoo,
  bg: BG[1],
  benefits: [
  { en: 'Reduces hair fall over time', ar: 'يقلل تساقط الشعر مع الوقت' },
  { en: 'Strengthens roots', ar: 'يقوّي الجذور' },
  { en: 'Supports thicker-looking hair', ar: 'يدعم مظهر شعر أكثر كثافة' }],

  ingredients: [
  { en: 'Castor Oil', ar: 'زيت الخروع' },
  { en: 'Neem Extract', ar: 'خلاصة النيم' },
  { en: 'Pumpkin Seed Extract', ar: 'خلاصة بذور اليقطين' },
  { en: 'Rosemary Extract', ar: 'خلاصة إكليل الجبل' },
  { en: 'Tea Tree Oil', ar: 'زيت شجرة الشاي' }],

  directions: {
    en: 'Massage onto wet hair, leave for one minute, rinse thoroughly. Use daily for best results.',
    ar: 'دلّكيه على الشعر المبلل واتركيه لمدة دقيقة واشطفي جيداً. استخدميه يومياً للحصول على أفضل النتائج.'
  },
  sizes: [
  { en: '100ml', ar: '100 مل' },
  { en: '200ml', ar: '200 مل' }]

},
{
  id: 'anti-lice-shampoo',
  name: { en: 'Anti Lice Shampoo', ar: 'شامبو ضد القمل' },
  category: 'Hair Care',
  shortDescription: {
    en: 'Tea tree and fenugreek shampoo formulated to help eliminate lice and soothe the scalp.',
    ar: 'شامبو بزيت شجرة الشاي والحلبة مصمم للمساعدة في القضاء على القمل وتهدئة فروة الرأس.'
  },
  fullDescription: {
    en: 'An effective anti-lice shampoo with tea tree oil, fenugreek extract, and green tea extract that helps eliminate lice while caring for the scalp. Gentle enough for regular family use.',
    ar: 'شامبو فعّال ضد القمل بزيت شجرة الشاي وخلاصتي الحلبة والشاي الأخضر يساعد على القضاء على القمل مع العناية بفروة الرأس. لطيف بما يكفي للاستخدام العائلي المنتظم.'
  },
  image: IMG.Anti_Lice_Shampoo,
  bg: BG[2],
  benefits: [
  { en: 'Helps eliminate lice', ar: 'يساعد على القضاء على القمل' },
  { en: 'Soothes the scalp', ar: 'يهدّئ فروة الرأس' },
  { en: 'Family-safe formula', ar: 'تركيبة آمنة للعائلة' }],

  ingredients: [
  { en: 'Tea Tree Oil', ar: 'زيت شجرة الشاي' },
  { en: 'Fenugreek Extract', ar: 'خلاصة الحلبة' },
  { en: 'Rosemary Extract', ar: 'خلاصة إكليل الجبل' },
  { en: 'Green Tea Extract', ar: 'خلاصة الشاي الأخضر' }],

  directions: {
    en: 'Massage onto wet hair, leave for one minute, rinse thoroughly. Use daily until lice are eliminated. Avoid contact with eyes.',
    ar: 'دلّكيه على الشعر المبلل واتركيه لمدة دقيقة واشطفي جيداً. استخدميه يومياً حتى القضاء على القمل. تجنّبي ملامسة العينين.'
  },
  sizes: [
  { en: '100ml', ar: '100 مل' },
  { en: '200ml', ar: '200 مل' }]

},

// ───────────────────────── BODY CARE ─────────────────────────
{
  id: 'intimate-hygiene-wash',
  name: { en: 'Intimate Hygiene Wash', ar: 'غسول العناية الشخصية' },
  category: 'Body Care',
  shortDescription: {
    en: 'pH-balanced intimate wash with chamomile, sea buckthorn, and tea tree for daily freshness.',
    ar: 'غسول حميم متوازن الحموضة مع البابونج والنبق البحري وشجرة الشاي للنضارة اليومية.'
  },
  fullDescription: {
    en: 'A gentle, pH-balanced intimate wash formulated with lactic acid, chamomile, sea buckthorn, and tea tree oil to maintain healthy intimate flora, prevent unpleasant odors, and leave a fresh sensation throughout the day.',
    ar: 'غسول حميم لطيف ومتوازن الحموضة بتركيبة من حمض اللاكتيك والبابونج والنبق البحري وزيت شجرة الشاي للحفاظ على فلورا حميمة صحية ومنع الروائح غير المرغوبة وترك إحساس بالنضارة طوال اليوم.'
  },
  image: IMG.hygieneWash,
  bg: BG[3],
  benefits: [
  {
    en: 'Maintains healthy pH balance',
    ar: 'يحافظ على توازن الحموضة الصحي'
  },
  { en: 'Prevents unpleasant odors', ar: 'يمنع الروائح غير المرغوبة' },
  { en: 'Soothes irritation', ar: 'يهدّئ التهيّج' }],

  ingredients: [
  { en: 'Lactic Acid', ar: 'حمض اللاكتيك' },
  { en: 'Chamomile Extract', ar: 'خلاصة البابونج' },
  { en: 'Sea Buckthorn Extract', ar: 'خلاصة النبق البحري' },
  { en: 'Tea Tree Oil', ar: 'زيت شجرة الشاي' }],

  directions: {
    en: 'Use daily for a fresh sensation that maintains healthy intimate flora and helps prevent odors and irritation.',
    ar: 'استخدميه يومياً للحصول على إحساس بالنضارة يحافظ على الفلورا الحميمة الصحية ويساعد على منع الروائح والتهيّج.'
  },
  sizes: [{ en: '100ml', ar: '100 مل' }]
},
{
  id: 'calamine-lotion',
  name: { en: 'Calamine Lotion', ar: 'لوشن الكالامين' },
  category: 'Skin Care',
  shortDescription: {
    en: 'Light pink calamine lotion that calms sensitive, irritated, and sun-exposed skin instantly.',
    ar: 'لوشن كالامين زهري خفيف يهدّئ البشرة الحساسة والمتهيّجة والمعرّضة للشمس فوراً.'
  },
  fullDescription: {
    en: 'A classic calamine lotion enriched with aloe vera and zinc oxide to soothe redness, irritation, and post-sun sensitivity. Mattifies oily skin with a soft pink finish and works beautifully as a primer.',
    ar: 'لوشن كالامين كلاسيكي معزّز بالصبار وأكسيد الزنك لتهدئة الاحمرار والتهيّج وحساسية ما بعد الشمس. يعطي البشرة الدهنية لمسة مطفية وردية ويعمل بشكل رائع كأساس.'
  },
  image: IMG.calamineLotion,
  bg: BG[0],
  benefits: [
  { en: 'Soothes redness and irritation', ar: 'يهدّئ الاحمرار والتهيّج' },
  { en: 'Mattifies oily skin', ar: 'يمنح البشرة الدهنية لمسة مطفية' },
  { en: 'Lightweight, fast-drying', ar: 'خفيف وسريع الجفاف' }],

  ingredients: [
  { en: 'Calamine', ar: 'كالامين' },
  { en: 'Aloe Vera Extract', ar: 'خلاصة الصبار' },
  { en: 'Zinc Oxide', ar: 'أكسيد الزنك' },
  { en: 'Glycerin', ar: 'جلسرين' }],

  directions: {
    en: 'Apply to the affected skin with cotton wool three times a day. Shake well before use.',
    ar: 'ضعيه على البشرة المتأثرة باستخدام قطعة من القطن ثلاث مرات يومياً. رجّي العبوة جيداً قبل الاستخدام.'
  },
  sizes: [{ en: '100ml', ar: '100 مل' }]
},
{
  id: 'calamine-cream',
  name: { en: 'Calamine Cream', ar: 'كريم الكالامين' },
  category: 'Skin Care',
  shortDescription: {
    en: 'Soothing calamine cream with aloe vera for redness, irritation, and sensitive skin.',
    ar: 'كريم كالامين مهدّئ مع الصبار للاحمرار والتهيّج والبشرة الحساسة.'
  },
  fullDescription: {
    en: 'A richer cream version of our classic calamine treatment, blended with aloe vera, zinc oxide, and glycerin. Perfect for irritated or sun-stressed skin that needs both calming and hydration.',
    ar: 'نسخة كريمية أغنى من علاج الكالامين الكلاسيكي، ممزوج بالصبار وأكسيد الزنك والجلسرين. مثالي للبشرة المتهيّجة أو المتعبة من الشمس التي تحتاج إلى التهدئة والترطيب معاً.'
  },
  image: IMG.calamineCream,
  bg: BG[1],
  benefits: [
  { en: 'Calms irritation', ar: 'يهدّئ التهيّج' },
  { en: 'Hydrates while soothing', ar: 'يرطّب أثناء التهدئة' },
  { en: 'Suitable for sensitive skin', ar: 'مناسب للبشرة الحساسة' }],

  ingredients: [
  { en: 'Calamine', ar: 'كالامين' },
  { en: 'Aloe Vera Extract', ar: 'خلاصة الصبار' },
  { en: 'Zinc Oxide', ar: 'أكسيد الزنك' },
  { en: 'Glycerin', ar: 'جلسرين' }],

  directions: {
    en: 'Apply to the affected skin with cotton wool three times a day.',
    ar: 'ضعيه على البشرة المتأثرة باستخدام قطعة من القطن ثلاث مرات يومياً.'
  },
  sizes: [{ en: '100g', ar: '100 جم' }]
},

// ───────────────────────── SUN PROTECTION ─────────────────────────
{
  id: 'sunscreen-spf-30-lotion',
  name: { en: 'Sunscreen SPF 30+ Lotion', ar: 'لوشن واقي شمس SPF 30+' },
  category: 'Sun Protection',
  shortDescription: {
    en: 'Daily broad-spectrum SPF 30+ lotion with shea butter for face and body.',
    ar: 'لوشن SPF 30+ يومي واسع الطيف بزبدة الشيا للوجه والجسم.'
  },
  fullDescription: {
    en: 'A lightweight broad-spectrum sunscreen lotion with SPF 30+ that protects against UVA/UVB rays while hydrating with shea butter, allantoin, and glycerin. Suitable for daily use under makeup or on its own.',
    ar: 'لوشن واقي شمس خفيف واسع الطيف بمعامل SPF 30+ يحمي من أشعة UVA/UVB مع الترطيب بزبدة الشيا والألانتوين والجلسرين. مناسب للاستخدام اليومي تحت المكياج أو منفرداً.'
  },
  image: IMG.sunscreen30lotion,
  bg: BG[2],
  benefits: [
  { en: 'Broad-spectrum SPF 30+', ar: 'حماية واسعة SPF 30+' },
  { en: 'Hydrates with shea butter', ar: 'يرطّب بزبدة الشيا' },
  { en: 'Lightweight, daily-wear feel', ar: 'خفيف للاستخدام اليومي' }],

  ingredients: [
  { en: 'Octinoxate', ar: 'أوكتينوكسات' },
  { en: 'Octocrylene', ar: 'أوكتوكريلين' },
  { en: 'Avobenzone', ar: 'أفوبنزون' },
  { en: 'Zinc Oxide', ar: 'أكسيد الزنك' },
  { en: 'Shea Butter', ar: 'زبدة الشيا' },
  { en: 'Allantoin', ar: 'ألانتوين' }],

  directions: {
    en: 'Apply liberally before sun exposure. Reapply every 2 hours and after swimming or sweating for more than 80 minutes.',
    ar: 'ضعيه بسخاء قبل التعرض للشمس. أعيدي التطبيق كل ساعتين وبعد السباحة أو التعرّق لأكثر من 80 دقيقة.'
  },
  sizes: [{ en: '100ml', ar: '100 مل' }]
},
{
  id: 'sunscreen-spf-30-cream',
  name: { en: 'Sunscreen SPF 30+ Cream', ar: 'كريم واقي شمس SPF 30+' },
  category: 'Sun Protection',
  shortDescription: {
    en: 'Rich SPF 30+ cream with shea butter for face protection and daily hydration.',
    ar: 'كريم SPF 30+ غني بزبدة الشيا لحماية الوجه والترطيب اليومي.'
  },
  fullDescription: {
    en: 'A richer cream-textured SPF 30+ sunscreen ideal for face. Combines broad-spectrum UV filters with shea butter and allantoin for soft, protected, comfortable skin.',
    ar: 'كريم واقي شمس بقوام كريمي أغنى بمعامل SPF 30+ مثالي للوجه. يجمع فلاتر الأشعة فوق البنفسجية واسعة الطيف مع زبدة الشيا والألانتوين لبشرة ناعمة محمية ومريحة.'
  },
  image: IMG.sunscreen30cream,
  bg: BG[3],
  benefits: [
  { en: 'Rich, hydrating texture', ar: 'قوام غني مرطّب' },
  { en: 'SPF 30+ broad-spectrum', ar: 'SPF 30+ واسع الطيف' },
  { en: 'Ideal for face', ar: 'مثالي للوجه' }],

  ingredients: [
  { en: 'Octinoxate', ar: 'أوكتينوكسات' },
  { en: 'Avobenzone', ar: 'أفوبنزون' },
  { en: 'Zinc Oxide', ar: 'أكسيد الزنك' },
  { en: 'Shea Butter', ar: 'زبدة الشيا' }],

  directions: {
    en: 'Apply liberally before sun exposure. Reapply every 2 hours and after swimming or sweating.',
    ar: 'ضعيه بسخاء قبل التعرض للشمس. أعيدي التطبيق كل ساعتين وبعد السباحة أو التعرّق.'
  },
  sizes: [{ en: '50g', ar: '50 جم' }]
},
{
  id: 'sunscreen-spf-50-lotion',
  name: { en: 'Sunscreen SPF 50+ Lotion', ar: 'لوشن واقي شمس SPF 50+' },
  category: 'Sun Protection',
  shortDescription: {
    en: 'Maximum-protection SPF 50+ lotion for face and body — lightweight, no white cast.',
    ar: 'لوشن SPF 50+ بحماية قصوى للوجه والجسم — خفيف ولا يترك أثراً أبيض.'
  },
  fullDescription: {
    en: 'Our highest-strength sunscreen lotion with SPF 50+ broad-spectrum protection. Filters approximately 98% of UVB rays while hydrating with shea butter and allantoin. Perfect for hot, sunny climates.',
    ar: 'لوشن واقي الشمس الأقوى لدينا بحماية واسعة الطيف SPF 50+. يفلتر نحو 98% من أشعة UVB مع الترطيب بزبدة الشيا والألانتوين. مثالي للمناخات الحارة والمشمسة.'
  },
  image: IMG.sunscreen50lotion,
  bg: BG[0],
  featured: true,
  benefits: [
  { en: 'Maximum SPF 50+ protection', ar: 'حماية قصوى SPF 50+' },
  { en: 'No white cast', ar: 'لا يترك أثراً أبيض' },
  { en: 'Hydrating, non-greasy', ar: 'مرطّب وغير دهني' }],

  ingredients: [
  { en: 'Octinoxate', ar: 'أوكتينوكسات' },
  { en: 'Octocrylene', ar: 'أوكتوكريلين' },
  { en: 'Avobenzone', ar: 'أفوبنزون' },
  { en: 'Zinc Oxide', ar: 'أكسيد الزنك' },
  { en: 'Shea Butter', ar: 'زبدة الشيا' },
  { en: 'Glycerin', ar: 'جلسرين' }],

  directions: {
    en: 'Apply liberally 15 minutes before sun exposure. Reapply every 2 hours and after swimming or sweating.',
    ar: 'ضعيه بسخاء قبل التعرض للشمس بـ 15 دقيقة. أعيدي التطبيق كل ساعتين وبعد السباحة أو التعرّق.'
  },
  sizes: [{ en: '100ml', ar: '100 مل' }]
},
{
  id: 'sunscreen-spf-50-cream',
  name: { en: 'Sunscreen SPF 50+ Cream', ar: 'كريم واقي شمس SPF 50+' },
  category: 'Sun Protection',
  shortDescription: {
    en: 'High-protection SPF 50+ face cream with shea butter — daily wear under makeup.',
    ar: 'كريم وجه SPF 50+ بحماية عالية وزبدة الشيا — للاستخدام اليومي تحت المكياج.'
  },
  fullDescription: {
    en: 'A nourishing SPF 50+ face cream that delivers maximum daily UV protection in a soft, hydrating formula. Layers beautifully under makeup and helps prevent photo-aging.',
    ar: 'كريم وجه مغذٍّ بمعامل SPF 50+ يوفر أقصى حماية يومية من الأشعة فوق البنفسجية بتركيبة ناعمة ومرطّبة. يندمج بشكل رائع تحت المكياج ويساعد على منع شيخوخة الجلد الناتجة عن الشمس.'
  },
  image: IMG.sunscreen50cream,
  bg: BG[1],
  benefits: [
  { en: 'SPF 50+ broad-spectrum', ar: 'SPF 50+ واسع الطيف' },
  { en: 'Layers under makeup', ar: 'يندمج تحت المكياج' },
  { en: 'Helps prevent photo-aging', ar: 'يساعد على منع شيخوخة البشرة' }],

  ingredients: [
  { en: 'Octinoxate', ar: 'أوكتينوكسات' },
  { en: 'Avobenzone', ar: 'أفوبنزون' },
  { en: 'Zinc Oxide', ar: 'أكسيد الزنك' },
  { en: 'Shea Butter', ar: 'زبدة الشيا' },
  { en: 'Allantoin', ar: 'ألانتوين' }],

  directions: {
    en: 'Apply liberally before sun exposure. Reapply every 2 hours and after swimming or sweating.',
    ar: 'ضعيه بسخاء قبل التعرض للشمس. أعيدي التطبيق كل ساعتين وبعد السباحة أو التعرّق.'
  },
  sizes: [{ en: '50g', ar: '50 جم' }]
},

// ───────────────────────── ANTI ACNE ─────────────────────────
{
  id: 'anti-acne-gel',
  name: { en: 'Anti Acne Gel', ar: 'جل ضد حب الشباب' },
  category: 'Anti Acne',
  shortDescription: {
    en: 'Targeted spot gel with niacinamide and salicylic acid to fade acne and refine pores.',
    ar: 'جل موضعي للبقع بالنياسيناميد وحمض الساليسيليك لتلاشي حب الشباب وتصغير المسام.'
  },
  fullDescription: {
    en: 'A clear gel treatment with niacinamide, salicylic acid, aloe vera, calendula, and rosemary. Works on existing breakouts, helps minimize pore size, and improves overall skin clarity with consistent use.',
    ar: 'جل علاجي شفاف بالنياسيناميد وحمض الساليسيليك والصبار والآذريون وإكليل الجبل. يعمل على حب الشباب الموجود ويساعد على تصغير المسام وتحسين صفاء البشرة مع الاستخدام المنتظم.'
  },
  image: IMG.gel,
  bg: BG[2],
  benefits: [
  { en: 'Targets active breakouts', ar: 'يستهدف حب الشباب النشط' },
  { en: 'Minimizes visible pores', ar: 'يصغّر المسام الظاهرة' },
  {
    en: 'Smooths fine lines and texture',
    ar: 'ينعّم الخطوط الدقيقة وملمس البشرة'
  }],

  ingredients: [
  { en: 'Niacinamide', ar: 'نياسيناميد' },
  { en: 'Salicylic Acid', ar: 'حمض الساليسيليك' },
  { en: 'Aloe Vera Extract', ar: 'خلاصة الصبار' },
  { en: 'Calendula Extract', ar: 'خلاصة الآذريون' },
  { en: 'Rosemary Extract', ar: 'خلاصة إكليل الجبل' }],

  directions: {
    en: 'Apply to the affected part of the face two to three times a day. Daily use helps reduce pore size, fine lines, and acne.',
    ar: 'ضعيه على المنطقة المتأثرة من الوجه مرتين إلى ثلاث مرات يومياً. الاستخدام اليومي يساعد على تقليل حجم المسام والخطوط الدقيقة وحب الشباب.'
  },
  sizes: [{ en: '50ml', ar: '50 مل' }]
},
{
  id: 'anti-acne-face-wash',
  name: { en: 'Anti Acne Face Wash', ar: 'غسول الوجه لحب الشباب' },
  category: 'Anti Acne',
  shortDescription: {
    en: 'Deep-cleansing face wash with salicylic acid and niacinamide for clear, oil-free skin.',
    ar: 'غسول وجه عميق التنظيف بحمض الساليسيليك والنياسيناميد لبشرة صافية وخالية من الزيوت.'
  },
  fullDescription: {
    en: 'A gentle yet effective face wash designed for pimple-prone skin. Cleanses deep into pores using salicylic acid and niacinamide, with calming aloe vera, calendula, and vitamin E. Suitable for all skin types.',
    ar: 'غسول وجه لطيف وفعّال مصمم للبشرة المعرضة لحب الشباب. ينظّف عمق المسام بحمض الساليسيليك والنياسيناميد مع الصبار المهدّئ والآذريون وفيتامين هـ. مناسب لجميع أنواع البشرة.'
  },
  image: IMG.faceWash,
  bg: BG[3],
  featured: true,
  benefits: [
  { en: 'Cleanses deep into pores', ar: 'ينظّف عمق المسام' },
  { en: 'Controls excess oil', ar: 'يتحكم بالزيت الزائد' },
  { en: 'Suitable for all skin types', ar: 'مناسب لجميع أنواع البشرة' }],

  ingredients: [
  { en: 'Salicylic Acid', ar: 'حمض الساليسيليك' },
  { en: 'Niacinamide (Vitamin B3)', ar: 'نياسيناميد (فيتامين ب3)' },
  { en: 'Aloe Vera Extract', ar: 'خلاصة الصبار' },
  { en: 'Calendula Extract', ar: 'خلاصة الآذريون' },
  { en: 'Vitamin E', ar: 'فيتامين هـ' }],

  directions: {
    en: 'Apply to wet face, lather gently, and rinse thoroughly. Use morning and night. Avoid contact with eyes — flush with water if contact occurs.',
    ar: 'ضعيه على الوجه المبلل، أرغي بلطف، واشطفي جيداً. استخدميه صباحاً ومساءً. تجنّبي ملامسة العينين — اشطفي بالماء عند الملامسة.'
  },
  sizes: [
  { en: '100ml', ar: '100 مل' },
  { en: '200ml', ar: '200 مل' }]

},
{
  id: 'anti-acne-body-spray',
  name: { en: 'Anti Acne Body Spray', ar: 'بخاخ الجسم ضد حب الشباب' },
  category: 'Anti Acne',
  shortDescription: {
    en: 'Easy-to-use body spray with salicylic acid for back, chest, and shoulder breakouts.',
    ar: 'بخاخ جسم سهل الاستخدام بحمض الساليسيليك لحب الشباب على الظهر والصدر والكتفين.'
  },
  fullDescription: {
    en: 'A quick-drying anti-acne body spray with niacinamide, glycolic and salicylic acids, and tea tree oil. Reaches hard-to-cover areas like the back and shoulders to help clear body breakouts.',
    ar: 'بخاخ جسم سريع الجفاف ضد حب الشباب بالنياسيناميد وحمضي الجليكوليك والساليسيليك وزيت شجرة الشاي. يصل إلى المناطق التي يصعب الوصول إليها مثل الظهر والكتفين للمساعدة على تصفية حب شباب الجسم.'
  },
  image: IMG.Anti_Acne_Body_Spray,
  bg: BG[0],
  benefits: [
  {
    en: 'Reaches back and shoulders easily',
    ar: 'يصل بسهولة إلى الظهر والكتفين'
  },
  { en: 'Fast-drying, non-sticky', ar: 'سريع الجفاف وغير لزج' },
  { en: 'Targets body breakouts', ar: 'يستهدف حب شباب الجسم' }],

  ingredients: [
  { en: 'Niacinamide', ar: 'نياسيناميد' },
  { en: 'Glycolic Acid', ar: 'حمض الجليكوليك' },
  { en: 'Salicylic Acid', ar: 'حمض الساليسيليك' },
  { en: 'Tea Tree Oil', ar: 'زيت شجرة الشاي' },
  { en: 'Aloe Vera Extract', ar: 'خلاصة الصبار' }],

  directions: {
    en: 'Spray on clean, dry skin twice daily. Allow to absorb before dressing. Avoid contact with eyes.',
    ar: 'رشّيه على بشرة نظيفة وجافة مرتين يومياً. اتركيه ليمتص قبل ارتداء الملابس. تجنّبي ملامسة العينين.'
  },
  sizes: [{ en: '50ml', ar: '50 مل' }]
},
{
  id: 'anti-acne-soap',
  name: { en: 'Anti Acne Soap', ar: 'صابون ضد حب الشباب' },
  category: 'Anti Acne',
  shortDescription: {
    en: 'Tea tree and zinc oxide soap that helps control breakouts on face and body.',
    ar: 'صابون بزيت شجرة الشاي وأكسيد الزنك يساعد على التحكم بحب الشباب على الوجه والجسم.'
  },
  fullDescription: {
    en: 'A grade-1 (76% TFM) anti-acne soap formulated with tea tree oil, zinc oxide, wheat germ extract, and allantoin. A daily wash that helps clear blemishes and supports rash-free, glowing skin.',
    ar: 'صابون ضد حب الشباب من الدرجة الأولى (76% TFM) بتركيبة من زيت شجرة الشاي وأكسيد الزنك وخلاصة جنين القمح والألانتوين. غسول يومي يساعد على تصفية الشوائب ودعم بشرة مشرقة خالية من الطفح.'
  },
  image: IMG.soap,
  bg: BG[1],
  benefits: [
  { en: 'Daily anti-acne cleansing', ar: 'تنظيف يومي ضد حب الشباب' },
  { en: 'Soothes with allantoin', ar: 'يهدّئ بالألانتوين' },
  { en: 'For face and body', ar: 'للوجه والجسم' }],

  ingredients: [
  { en: 'Tea Tree Oil', ar: 'زيت شجرة الشاي' },
  { en: 'Zinc Oxide', ar: 'أكسيد الزنك' },
  { en: 'Wheat Germ Extract', ar: 'خلاصة جنين القمح' },
  { en: 'Allantoin', ar: 'ألانتوين' }],

  directions: {
    en: 'Apply to wet skin, rub gently to develop a rich lather, and after two minutes rinse off thoroughly.',
    ar: 'ضعيه على البشرة المبللة وافركيه بلطف لتكوين رغوة غنية، وبعد دقيقتين اشطفي جيداً.'
  },
  sizes: [{ en: '100g', ar: '100 جم' }]
},

// ───────────────────────── SKIN CARE — PANTHENOL ─────────────────────────
{
  id: 'panthenol-cream',
  name: { en: 'Panthenol Cream', ar: 'كريم البانثينول' },
  category: 'Skin Care',
  shortDescription: {
    en: 'Restorative panthenol cream with hyaluronic acid and shea butter for dry, stressed skin.',
    ar: 'كريم بانثينول ترميمي مع حمض الهيالورونيك وزبدة الشيا للبشرة الجافة والمتعبة.'
  },
  fullDescription: {
    en: 'A reparative cream rich in D-panthenol (provitamin B5), hyaluronic acid, vitamin E, shea butter, and aloe vera. Soothes irritation, deeply hydrates, and restores comfort to dry, sensitive, or post-sun skin.',
    ar: 'كريم ترميمي غنيٌّ بالبانثينول (بروفيتامين ب5) وحمض الهيالورونيك وفيتامين هـ وزبدة الشيا والصبار. يهدّئ التهيّج ويرطّب بعمق ويعيد الراحة للبشرة الجافة أو الحساسة أو بعد التعرض للشمس.'
  },
  image: IMG.panthenolcream,
  bg: BG[2],
  benefits: [
  { en: 'Repairs dry, stressed skin', ar: 'يصلح البشرة الجافة والمتعبة' },
  {
    en: 'Deep hydration with hyaluronic acid',
    ar: 'ترطيب عميق بحمض الهيالورونيك'
  },
  { en: 'Soothes irritation post-sun', ar: 'يهدّئ التهيّج بعد الشمس' }],

  ingredients: [
  { en: 'D-Panthenol', ar: 'دي-بانثينول' },
  { en: 'Hyaluronic Acid', ar: 'حمض الهيالورونيك' },
  { en: 'Vitamin E', ar: 'فيتامين هـ' },
  { en: 'Shea Butter', ar: 'زبدة الشيا' },
  { en: 'Aloe Vera Extract', ar: 'خلاصة الصبار' }],

  sizes: [{ en: '50g', ar: '50 جم' }]
},
{
  id: 'panthenol-lotion',
  name: { en: 'Panthenol Lotion', ar: 'لوشن البانثينول' },
  category: 'Skin Care',
  shortDescription: {
    en: 'Lightweight panthenol lotion that hydrates and soothes face and body skin.',
    ar: 'لوشن بانثينول خفيف يرطّب ويهدّئ بشرة الوجه والجسم.'
  },
  fullDescription: {
    en: 'A fast-absorbing lotion form of our panthenol treatment, ideal for face and body. Combines D-panthenol, hyaluronic acid, vitamin E, and aloe vera for everyday hydration and skin barrier support.',
    ar: 'لوشن سريع الامتصاص من علاج البانثينول لدينا، مثالي للوجه والجسم. يجمع البانثينول وحمض الهيالورونيك وفيتامين هـ والصبار للترطيب اليومي ودعم حاجز البشرة.'
  },
  image: IMG.panthenolLotion,
  bg: BG[3],
  benefits: [
  { en: 'Lightweight everyday hydration', ar: 'ترطيب يومي خفيف' },
  { en: 'Strengthens skin barrier', ar: 'يقوّي حاجز البشرة' },
  { en: 'For face and body', ar: 'للوجه والجسم' }],

  ingredients: [
  { en: 'D-Panthenol', ar: 'دي-بانثينول' },
  { en: 'Hyaluronic Acid', ar: 'حمض الهيالورونيك' },
  { en: 'Vitamin E', ar: 'فيتامين هـ' },
  { en: 'Shea Butter', ar: 'زبدة الشيا' },
  { en: 'Aloe Vera Extract', ar: 'خلاصة الصبار' }],

  sizes: [{ en: '100ml', ar: '100 مل' }]
},

// ───────────────────────── SKIN CARE — MELASMA ─────────────────────────
{
  id: 'melasma-face-wash',
  name: { en: 'Melasma Face Wash', ar: 'غسول الوجه للكلف والبقع' },
  category: 'Skin Care',
  shortDescription: {
    en: 'Brightening anti-melasma face wash with glycolic acid and niacinamide for an even tone.',
    ar: 'غسول وجه منير ضد الكلف بحمض الجليكوليك والنياسيناميد لتوحيد لون البشرة.'
  },
  fullDescription: {
    en: 'A targeted face wash for melasma and dark spots, formulated with glycolic acid, salicylic acid, niacinamide, and provitamin B5. Use as part of a daily routine that includes moisturizer and a minimum SPF 15 sunscreen.',
    ar: 'غسول وجه مستهدف للكلف والبقع الداكنة بتركيبة من حمض الجليكوليك وحمض الساليسيليك والنياسيناميد وبروفيتامين ب5. يُستخدم كجزء من روتين يومي يشمل مرطباً وواقياً للشمس بمعامل لا يقل عن SPF 15.'
  },
  image: IMG.melasmaLotion,
  bg: BG[0],
  benefits: [
  {
    en: 'Targets dark spots and melasma',
    ar: 'يستهدف البقع الداكنة والكلف'
  },
  {
    en: 'Gently exfoliates with glycolic acid',
    ar: 'يقشّر بلطف بحمض الجليكوليك'
  },
  { en: 'Brightens for even tone', ar: 'ينير لتوحيد اللون' }],

  ingredients: [
  { en: 'Glycolic Acid', ar: 'حمض الجليكوليك' },
  { en: 'Salicylic Acid', ar: 'حمض الساليسيليك' },
  { en: 'Niacinamide (Vitamin B3)', ar: 'نياسيناميد (فيتامين ب3)' },
  { en: 'Panthenol (Vitamin B5)', ar: 'بانثينول (فيتامين ب5)' }],

  directions: {
    en: 'Use preferably twice daily. Pair with a moisturizer and a daily sunscreen of SPF 15 or higher, and limit direct sun exposure for best results.',
    ar: 'يُفضّل استخدامه مرتين يومياً. أقرنيه بمرطّب وواقٍ شمسي يومي بمعامل SPF 15 أو أعلى، وقللي التعرض المباشر للشمس للحصول على أفضل النتائج.'
  },
  sizes: [{ en: '100ml', ar: '100 مل' }]
},
{
  id: 'melasma-cream',
  name: { en: 'Melasma Cream', ar: 'كريم الكلف والبقع' },
  category: 'Skin Care',
  shortDescription: {
    en: 'Treatment cream with arbutin, kojic acid, and niacinamide for melasma and dark spots.',
    ar: 'كريم علاجي بالأربوتين وحمض الكوجيك والنياسيناميد للكلف والبقع الداكنة.'
  },
  fullDescription: {
    en: 'An advanced anti-melasma cream combining arbutin, kojic acid dipalmitate, niacinamide, and bearberry and licorice extracts. Targets pigmentation and dark spots while protecting with built-in zinc oxide and SPF support.',
    ar: 'كريم متقدم ضد الكلف يجمع الأربوتين وثنائي بالميتات الكوجيك والنياسيناميد وخلاصتي عنب الدب وعرق السوس. يستهدف التصبّغ والبقع الداكنة مع توفير الحماية بأكسيد الزنك ودعم واقٍ من الشمس.'
  },
  image: IMG.melasmaCream,
  bg: BG[1],
  benefits: [
  { en: 'Targets pigmentation', ar: 'يستهدف التصبّغ' },
  {
    en: 'Brightens with kojic acid + arbutin',
    ar: 'ينير بحمض الكوجيك والأربوتين'
  },
  {
    en: 'Vitamin E antioxidant support',
    ar: 'دعم مضاد للأكسدة بفيتامين هـ'
  }],

  ingredients: [
  { en: 'Arbutin', ar: 'أربوتين' },
  { en: 'Kojic Acid Dipalmitate', ar: 'ثنائي بالميتات حمض الكوجيك' },
  { en: 'Niacinamide', ar: 'نياسيناميد' },
  { en: 'Bearberry Extract', ar: 'خلاصة عنب الدب' },
  { en: 'Licorice Extract', ar: 'خلاصة عرق السوس' },
  { en: 'Vitamin E', ar: 'فيتامين هـ' }],

  directions: {
    en: 'Apply preferably twice daily. Use alongside a moisturizer and daily sunscreen (SPF 15 minimum). Avoid direct sun exposure.',
    ar: 'يُفضّل استخدامه مرتين يومياً. استخدميه مع مرطّب وواقٍ شمسي يومي (SPF 15 على الأقل). تجنّبي التعرض المباشر للشمس.'
  },
  sizes: [{ en: '50g', ar: '50 جم' }]
}];