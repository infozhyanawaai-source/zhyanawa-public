'use strict';

// Shared copy for the patient code dialog and clinician portal.
window.zhyanawaDoctorCopy = (() => {
  const copy = {
    en: {
      nav: 'Doctor code', eyebrow: 'CONSENT-BASED SHARING', title: 'Share a summary with your doctor',
      intro: 'Create a private code from your saved chats. Your doctor can use it to create a concise clinical handoff.',
      warning: 'Create a code only when you want a doctor to review your saved conversations. The AI summary may contain mistakes and is not a diagnosis.',
      choose: 'Choose access', one: 'One-time code', oneDesc: 'Works for one successful view.',
      lifetime: 'Reusable code', lifetimeDesc: 'Works until you revoke it.', create: 'Generate private code',
      newCode: 'Your new code', copy: 'Copy code',
      shown: 'The full code is shown only now. Share it privately with your doctor.', codes: 'Your codes',
      refresh: 'Refresh', signIn: 'Sign in to create and manage doctor codes.', noCodes: 'No codes yet.',
      revoke: 'Revoke', revokeConfirm: 'Revoke this doctor access code? It will stop working immediately.',
      oneShort: 'One-time', lifetimeShort: 'Reusable', active: 'Active', used: 'Used', revoked: 'Revoked',
      created: 'Created', viewed: 'Viewed', times: 'times', copied: 'Doctor code copied', copyFailed: 'Could not copy the code',
      revokedToast: 'Doctor access code revoked', loadFailed: 'Could not load doctor access codes.', createFailed: 'Could not create a doctor access code.', revokeFailed: 'Could not revoke the code.',
      brand: 'Doctor summary portal', directory: 'Doctor directory', portalEyebrow: 'PATIENT-CONSENTED CLINICAL HANDOFF',
      portalTitle: 'View a patient-shared summary', portalIntro: 'Enter the private code provided by the patient. A valid code generates a clinical handoff from saved Zhyanawa conversations.',
      accessLabel: 'Patient access code', languageLabel: 'Summary language', generate: 'Generate secure summary', generating: 'Generating summary…',
      privacy: 'One-time codes are consumed after a successful view. Reusable codes work until revoked. Confirm patient consent before retaining or sharing this report.',
      summaryEyebrow: 'AI-GENERATED CLINICAL AID', summaryTitle: 'Patient conversation summary', print: 'Print', another: 'Use another code',
      patient: 'Patient', access: 'Access', scope: 'Source scope', generated: 'Generated',
      footer: 'This report summarizes self-reported chat material. It does not replace direct history-taking, risk assessment, examination, diagnosis, or treatment planning by a qualified professional.',
      consumed: 'One-time code (now consumed)', reusable: 'Reusable code', conversations: 'conversations', messages: 'messages', justNow: 'Just now',
      summaryFailed: 'The summary could not be generated.', invalid: 'This access code is invalid or no longer active.',
      notice: 'AI-generated from self-reported chat history. This is not a diagnosis and must be verified directly with the patient.'
    },
    ckb: {
      nav: 'کۆدی پزیشک', eyebrow: 'هاوبەشکردن بە ڕەزامەندی', title: 'پوختەیەک لەگەڵ پزیشکەکەت هاوبەش بکە',
      intro: 'لە گفتوگۆ پاشەکەوتکراوەکانت کۆدێکی تایبەت دروست بکە. پزیشکەکەت دەتوانێت بەو کۆدە پوختەیەکی کلینیکی ئامادە بکات.',
      warning: 'تەنها ئەگەر دەتەوێت پزیشک گفتوگۆ پاشەکەوتکراوەکانت بخوێنێتەوە کۆد دروست بکە. پوختەی ژیری دەستکرد دەکرێت هەڵەی تێدا بێت و دەستنیشانکردنی نەخۆشی نییە.',
      choose: 'جۆری دەستڕاگەیشتن هەڵبژێرە', one: 'کۆدی یەکجارە', oneDesc: 'تەنها بۆ یەک بینینی سەرکەوتوو کار دەکات.',
      lifetime: 'کۆدی دووبارە بەکارهێنراو', lifetimeDesc: 'هەتا هەڵیدەوەشێنیتەوە کار دەکات.', create: 'دروستکردنی کۆدی تایبەت',
      newCode: 'کۆدە نوێیەکەت', copy: 'لەبەرگرتنەوەی کۆد',
      shown: 'کۆدی تەواو تەنها ئێستا پیشان دەدرێت. بە نهێنی لەگەڵ پزیشکەکەت هاوبەشی بکە.', codes: 'کۆدەکانت',
      refresh: 'نوێکردنەوە', signIn: 'بۆ دروستکردن و بەڕێوەبردنی کۆدەکان بچۆ ژوورەوە.', noCodes: 'هێشتا کۆدێک نییە.',
      revoke: 'هەڵوەشاندنەوە', revokeConfirm: 'ئەم کۆدە هەڵبوەشێنیتەوە؟ دەستبەجێ کار ناکات.',
      oneShort: 'یەکجارە', lifetimeShort: 'دووبارە بەکارهێنراو', active: 'چالاک', used: 'بەکارهاتوو', revoked: 'هەڵوەشاوە',
      created: 'دروستکراوە', viewed: 'بینراوە', times: 'جار', copied: 'کۆدەکە لەبەرگیراوە', copyFailed: 'لەبەرگرتنەوەی کۆد سەرکەوتوو نەبوو',
      revokedToast: 'کۆدەکە هەڵوەشایەوە', loadFailed: 'بارکردنی کۆدەکان سەرکەوتوو نەبوو.', createFailed: 'دروستکردنی کۆد سەرکەوتوو نەبوو.', revokeFailed: 'هەڵوەشاندنەوەی کۆد سەرکەوتوو نەبوو.',
      brand: 'دەروازەی پوختەی پزیشک', directory: 'لیستی پزیشکان', portalEyebrow: 'گواستنەوەی کلینیکی بە ڕەزامەندی نەخۆش',
      portalTitle: 'بینینی پوختەی هاوبەشکراوی نەخۆش', portalIntro: 'کۆدە تایبەتەکەی نەخۆش بنووسە. کۆدی دروست پوختەیەکی کلینیکی لە گفتوگۆ پاشەکەوتکراوەکان دروست دەکات.',
      accessLabel: 'کۆدی دەستڕاگەیشتنی نەخۆش', languageLabel: 'زمانی پوختە', generate: 'دروستکردنی پوختەی پارێزراو', generating: 'پوختەکە ئامادە دەکرێت…',
      privacy: 'کۆدی یەکجارە دوای یەک بینینی سەرکەوتوو بەکاردەهێنرێت. کۆدی دووبارە بەکارهێنراو هەتا هەڵوەشاندنەوە کار دەکات. پێش هەڵگرتن یان هاوبەشکردنی ڕاپۆرتەکە ڕەزامەندی نەخۆش پشتڕاست بکەرەوە.',
      summaryEyebrow: 'یارمەتیی کلینیکیی دروستکراو بە ژیری دەستکرد', summaryTitle: 'پوختەی گفتوگۆکانی نەخۆش', print: 'چاپکردن', another: 'کۆدێکی تر بەکاربهێنە',
      patient: 'نەخۆش', access: 'دەستڕاگەیشتن', scope: 'سەرچاوە', generated: 'دروستکراوە',
      footer: 'ئەم ڕاپۆرتە پوختەی زانیارییە خۆڕاگەیەنراوەکانی گفتوگۆیە. جێگرەوەی مێژووی ڕاستەوخۆ، هەڵسەنگاندنی مەترسی، پشکنین، دەستنیشانکردن یان پلانی چارەسەریی پزیشکی شارەزا نییە.',
      consumed: 'کۆدی یەکجارە (ئێستا بەکارهاتووە)', reusable: 'کۆدی دووبارە بەکارهێنراو', conversations: 'گفتوگۆ', messages: 'نامە', justNow: 'ئێستا',
      summaryFailed: 'دروستکردنی پوختە سەرکەوتوو نەبوو.', invalid: 'ئەم کۆدە نادروستە یان چیتر چالاک نییە.',
      notice: 'لە گفتوگۆی خۆڕاگەیەنراو بە ژیری دەستکرد دروستکراوە. دەستنیشانکردنی نەخۆشی نییە و دەبێت ڕاستەوخۆ لەگەڵ نەخۆش پشتڕاست بکرێتەوە.'
    },
    ar: {
      nav: 'رمز الطبيب', eyebrow: 'مشاركة بموافقة المريض', title: 'شارك ملخصاً مع طبيبك',
      intro: 'أنشئ رمزاً خاصاً من محادثاتك المحفوظة. يستطيع طبيبك استخدامه لإنشاء ملخص سريري موجز.',
      warning: 'أنشئ الرمز فقط إذا أردت أن يراجع الطبيب محادثاتك المحفوظة. قد يتضمن ملخص الذكاء الاصطناعي أخطاءً وليس تشخيصاً.',
      choose: 'اختر نوع الوصول', one: 'رمز لمرة واحدة', oneDesc: 'يعمل لمشاهدة واحدة ناجحة.',
      lifetime: 'رمز قابل لإعادة الاستخدام', lifetimeDesc: 'يعمل حتى تلغيه.', create: 'إنشاء رمز خاص',
      newCode: 'رمزك الجديد', copy: 'نسخ الرمز',
      shown: 'يظهر الرمز كاملاً الآن فقط. شاركه مع طبيبك بطريقة خاصة.', codes: 'رموزك',
      refresh: 'تحديث', signIn: 'سجّل الدخول لإنشاء رموز الطبيب وإدارتها.', noCodes: 'لا توجد رموز بعد.',
      revoke: 'إلغاء', revokeConfirm: 'هل تريد إلغاء رمز وصول الطبيب؟ سيتوقف عن العمل فوراً.',
      oneShort: 'مرة واحدة', lifetimeShort: 'قابل لإعادة الاستخدام', active: 'نشط', used: 'مستخدم', revoked: 'ملغى',
      created: 'أُنشئ', viewed: 'شوهد', times: 'مرات', copied: 'تم نسخ رمز الطبيب', copyFailed: 'تعذر نسخ الرمز',
      revokedToast: 'تم إلغاء رمز وصول الطبيب', loadFailed: 'تعذر تحميل رموز الطبيب.', createFailed: 'تعذر إنشاء رمز وصول الطبيب.', revokeFailed: 'تعذر إلغاء الرمز.',
      brand: 'بوابة ملخص الطبيب', directory: 'دليل الأطباء', portalEyebrow: 'إحالة سريرية بموافقة المريض',
      portalTitle: 'عرض ملخص شاركه المريض', portalIntro: 'أدخل الرمز الخاص الذي قدمه المريض. ينشئ الرمز الصحيح ملخصاً سريرياً من محادثات ذيانەوە المحفوظة.',
      accessLabel: 'رمز وصول المريض', languageLabel: 'لغة الملخص', generate: 'إنشاء ملخص آمن', generating: 'جارٍ إنشاء الملخص…',
      privacy: 'تُستهلك رموز المرة الواحدة بعد أول عرض ناجح. تبقى الرموز القابلة لإعادة الاستخدام سارية حتى إلغائها. تأكد من موافقة المريض قبل الاحتفاظ بهذا التقرير أو مشاركته.',
      summaryEyebrow: 'أداة سريرية بمساعدة الذكاء الاصطناعي', summaryTitle: 'ملخص محادثات المريض', print: 'طباعة', another: 'استخدام رمز آخر',
      patient: 'المريض', access: 'الوصول', scope: 'نطاق المصدر', generated: 'تاريخ الإنشاء',
      footer: 'يلخص هذا التقرير معلومات ذكرها المريض في المحادثات. ولا يحل محل أخذ التاريخ المرضي مباشرةً أو تقييم المخاطر أو الفحص أو التشخيص أو وضع خطة العلاج بواسطة مختص مؤهل.',
      consumed: 'رمز لمرة واحدة (استُخدم الآن)', reusable: 'رمز قابل لإعادة الاستخدام', conversations: 'محادثات', messages: 'رسائل', justNow: 'الآن',
      summaryFailed: 'تعذر إنشاء الملخص.', invalid: 'رمز الوصول غير صحيح أو لم يعد نشطاً.',
      notice: 'أُنشئ بالذكاء الاصطناعي من محادثات أبلغ بها المريض. ليس تشخيصاً ويجب التحقق منه مباشرةً مع المريض.'
    }
  };
  const t = (key, language = 'en') => (copy[language] || copy.en)[key] || copy.en[key] || key;
  const apply = (root, language) => root?.querySelectorAll('[data-doctor-copy]').forEach(node => { node.textContent = t(node.dataset.doctorCopy, language); });
  return { t, apply };
})();
