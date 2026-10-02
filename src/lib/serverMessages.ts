/**
 * Arabic translations for the messages the API returns (it only speaks
 * English). Unknown messages are shown as they are.
 */
const exact: Record<string, string> = {
  // auth
  'Incorrect email or password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'You are not login, Please login to get access this route': 'يجب تسجيل الدخول للمتابعة',
  'the user that belong to this token does no longer exist': 'هذا الحساب لم يعد موجودًا، سجّل الدخول مرة أخرى',
  'User recently changed his password. please login again..': 'تم تغيير كلمة المرور مؤخرًا، سجّل الدخول مرة أخرى',
  'Invalid token, please login again..': 'انتهت الجلسة، سجّل الدخول مرة أخرى',
  'Expired token, please login again..': 'انتهت الجلسة، سجّل الدخول مرة أخرى',
  'This account is deactivated, please login again to activate it': 'هذا الحساب معطّل، سجّل الدخول مرة أخرى لتفعيله',
  'are you not allowed to access this route ': 'غير مسموح لك بالوصول إلى هذه الصفحة',
  'Your are not allowed to perform this action': 'غير مسموح لك بتنفيذ هذا الإجراء',
  'Reset code invalid or expired': 'كود إعادة التعيين غير صحيح أو منتهي الصلاحية',
  'Reset code not verified': 'لم يتم التحقق من كود إعادة التعيين',
  'Reset code sent to email': 'تم إرسال كود إعادة التعيين إلى بريدك الإلكتروني',
  'There is an error in sending email': 'حدث خطأ أثناء إرسال البريد الإلكتروني',
  'There is no user for this id': 'المستخدم غير موجود',
  'Incorrect current password': 'كلمة المرور الحالية غير صحيحة',
  // user fields
  'E-mail already in use': 'البريد الإلكتروني مستخدم بالفعل',
  'E-mail already in user': 'البريد الإلكتروني مستخدم بالفعل',
  'Email required': 'البريد الإلكتروني مطلوب',
  'Invalid email address': 'البريد الإلكتروني غير صحيح',
  'Password required': 'كلمة المرور مطلوبة',
  'Password must be at least 6 characters': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
  'Password Confirmation incorrect': 'تأكيد كلمة المرور غير مطابق',
  'Password confirmation required': 'تأكيد كلمة المرور مطلوب',
  'You must enter new password': 'أدخل كلمة المرور الجديدة',
  'You must enter the password confirm': 'أدخل تأكيد كلمة المرور',
  'You must enter your current password': 'أدخل كلمة المرور الحالية',
  'Invalid phone number only accepted UAE, Egy and SA Phone numbers': 'رقم الهاتف غير صحيح — يُقبل فقط الأرقام الإماراتية والمصرية والسعودية',
  'Invalid phone number only accepted Egy and SA Phone numbers': 'رقم الهاتف غير صحيح — يُقبل فقط الأرقام الإماراتية والمصرية والسعودية',
  'Invalid phone number': 'رقم الهاتف غير صحيح',
  'User required': 'الاسم مطلوب',
  'Too short User name': 'الاسم قصير جدًا',
  'Invalid role': 'الدور غير صحيح',
  // cart / orders / coupons
  'Coupon is invalid or expired': 'الكوبون غير صالح أو منتهي الصلاحية',
  'Your cart is empty': 'سلتك فارغة',
  'This product is out of stock': 'هذا المنتج غير متوفر حاليًا',
  'Quantity must be a whole number greater than 0': 'الكمية يجب أن تكون رقمًا صحيحًا أكبر من 0',
  'Some items in your cart are no longer available in this quantity': 'بعض المنتجات في سلتك لم تعد متوفرة بهذه الكمية',
  'Shipping address (details, phone, city) is required': 'عنوان الشحن (العنوان، الهاتف، المدينة) مطلوب',
  'Card payments are not configured': 'الدفع بالبطاقة غير متاح حاليًا',
  'Coupon name required': 'كود الكوبون مطلوب',
  'Coupon expire time required': 'تاريخ انتهاء الكوبون مطلوب',
  'Coupon discount value required': 'قيمة الخصم مطلوبة',
  'Discount must be between 1 and 100': 'الخصم يجب أن يكون بين 1 و100',
  'Invalid expire date': 'تاريخ الانتهاء غير صحيح',
  // reviews
  'You already created a review before': 'لقد قمت بتقييم هذا المنتج من قبل',
  'ratings value required': 'التقييم مطلوب',
  'Ratings value must be between 1 to 5': 'التقييم يجب أن يكون من 1 إلى 5',
  // catalog
  'Category required': 'اسم القسم مطلوب',
  'Too short category name': 'اسم القسم قصير جدًا',
  'Too long category name': 'اسم القسم طويل جدًا',
  'Brand required': 'اسم العلامة التجارية مطلوب',
  'Too short brand name': 'اسم العلامة التجارية قصير جدًا',
  'Too long brand name': 'اسم العلامة التجارية طويل جدًا',
  'SubCategory required': 'اسم القسم الفرعي مطلوب',
  'Too short SubCategory name': 'اسم القسم الفرعي قصير جدًا',
  'Too long SubCategory name': 'اسم القسم الفرعي طويل جدًا',
  'subCategory must be belong to category': 'يجب أن يتبع القسم الفرعي قسمًا رئيسيًا',
  'Product required': 'اسم المنتج مطلوب',
  'must be at least 3 chars': 'يجب أن يكون 3 أحرف على الأقل',
  'Product description is required': 'وصف المنتج مطلوب',
  'Too short product description': 'وصف المنتج قصير جدًا',
  'Too long description': 'الوصف طويل جدًا',
  'Product quantity is required': 'الكمية مطلوبة',
  'Product quantity must be a positive number': 'الكمية يجب أن تكون رقمًا موجبًا',
  'Product price is required': 'السعر مطلوب',
  'Product price must be a number': 'السعر يجب أن يكون رقمًا',
  'Product priceAfterDiscount must be a number': 'سعر الخصم يجب أن يكون رقمًا',
  'priceAfterDiscount must be lower than price': 'سعر الخصم يجب أن يكون أقل من السعر',
  'Product imageCover is required': 'صورة الغلاف مطلوبة',
  'Product must be belong to a category': 'اختر قسمًا للمنتج',
  'Invalid subcategories Ids': 'أقسام فرعية غير صحيحة',
  'subcategories not belong to category': 'الأقسام الفرعية لا تتبع القسم المختار',
  'only images allowed': 'يُسمح بالصور فقط',
  // branches
  'Branch name required': 'اسم الفرع مطلوب',
  'Branch city required': 'المدينة مطلوبة',
  'Branch address required': 'العنوان مطلوب',
  'Too long branch name': 'اسم الفرع طويل جدًا',
  'Latitude must be between -90 and 90': 'خط العرض يجب أن يكون بين -90 و90',
  'Longitude must be between -180 and 180': 'خط الطول يجب أن يكون بين -180 و180',
  // generic
  'no document for this id': 'العنصر غير موجود'
};

const patterns: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
  [/^Only (\d+) items available in stock$/, (m) => `متوفر ${m[1]} قطع فقط في المخزون`],
  [/^There is no product with id/, () => 'المنتج غير موجود'],
  [/^There is no (user with (that )?email)/, () => 'لا يوجد حساب بهذا البريد الإلكتروني'],
  [/^There is no such a order/, () => 'الطلب غير موجود'],
  [/^There is no such cart/, () => 'السلة غير موجودة'],
  [/^there is no cart for user/, () => 'السلة غير موجودة'],
  [/^there is no item for this id/, () => 'المنتج غير موجود في السلة'],
  [/^There is no review with id/, () => 'التقييم غير موجود'],
  [/^No category for this id/, () => 'القسم غير موجود'],
  [/^No brand for this id/, () => 'العلامة التجارية غير موجودة'],
  [/^no document for this/, () => 'العنصر غير موجود'],
  [/^This (\w+) already exists$/, () => 'هذه القيمة موجودة بالفعل'],
  [/^Invalid \w+ id format$|^invalied \w+ id$|^Invalid ID formate$|^Invalid \w+: /i, () => 'معرّف غير صحيح'],
  [/^can't find this route/, () => 'الصفحة المطلوبة غير موجودة']
];

const isArabic = () => typeof document !== 'undefined' && document.documentElement.lang === 'ar';

/** Translates an API message when the UI is in Arabic. */
export function localizeServerMessage(message: string): string {
  if (!message || !isArabic()) return message;
  const hit = exact[message] ?? exact[message.trim()];
  if (hit) return hit;
  for (const [re, fn] of patterns) {
    const m = message.match(re);
    if (m) return fn(m);
  }
  return message;
}

/** Client-side fallback messages (no response from the server, etc.). */
export function clientMessage(key: 'network' | 'generic' | 400 | 401 | 403 | 404 | 500): string {
  const ar = isArabic();
  const table = {
    network: ['Unable to reach the server. Check your connection and try again.', 'تعذر الاتصال بالخادم. تحقق من اتصالك وحاول مرة أخرى.'],
    generic: ['Something went wrong. Please try again.', 'حدث خطأ ما. حاول مرة أخرى.'],
    400: ['The request was invalid.', 'الطلب غير صحيح.'],
    401: ['Please log in to continue.', 'سجّل الدخول للمتابعة.'],
    403: ['You are not allowed to perform this action.', 'غير مسموح لك بتنفيذ هذا الإجراء.'],
    404: ['The requested resource was not found.', 'العنصر المطلوب غير موجود.'],
    500: ['The server encountered an error. Please try again later.', 'حدث خطأ في الخادم. حاول لاحقًا.']
  } as const;
  return table[key][ar ? 1 : 0];
}
