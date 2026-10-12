export type Language = 'ar' | 'en';

export interface Translations {
  nav: {
    home: string;
    recent: string;
    supported: string;
    reminders: string;
    extension: string;
    settings: string;
    newBadge: string;
    premiumPlan: string;
    vip: string;
    language: string;
    serverMap: string;
    googleChat: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
  };
  input: {
    placeholder: string;
    processing: string;
    downloadNow: string;
    alertEmpty: string;
    errorPrefix: string;
  };
  result: {
    ready: string;
    chosenFormat: string;
    copyLink: string;
    copied: string;
    share: string;
    scheduleReminder: string;
    downloadNow: string;
    downloading: string;
    previewTitle: string;
    enlargeThumbnail: string;
    closePreview: string;
    sourcePlatform: string;
    resolutionBadge: string;
    clickToEnlarge: string;
  };
  quickToolbar: {
    qualityAndFormat: string;
    autoHighest: string;
    fastMode: string;
    fastModeActive: string;
    fastModeDisabled: string;
    subtitles: string;
    preferences: string;
    scheduleAlert: string;
    extension: string;
  };
  recent: {
    title: string;
    fileCount: string;
    sortNewest: string;
    sortOldest: string;
    restoreNewest: string;
    thName: string;
    thSource: string;
    thFormat: string;
    thStatus: string;
    thSize: string;
    thTime: string;
    thAction: string;
    completed: string;
    reDownloadTooltip: string;
    scheduleTooltip: string;
    downloadAll: string;
    downloadQueue: string;
    downloadSelected: string;
    selectAll: string;
    deselectAll: string;
    selectedCount: string;
    deleteSelected: string;
    markCompleted: string;
    estRemaining: string;
    estTotal: string;
    speedEstimate: string;
    queuedBadge: string;
    filterAll: string;
    filterCompleted: string;
    filterProcessing: string;
    noFilteredItems: string;
    clearFilter: string;
    exportCsv: string;
    exportCsvTooltip: string;
    exportCsvSuccessTitle: string;
    exportCsvSuccessDesc: string;
    exportCsvEmpty: string;
    exportSelectedCsv: string;
  };
  history: {
    buttonTitle: string;
    title: string;
    countLabel: string;
    empty: string;
    emptyDesc: string;
    searchPlaceholder: string;
    clearAll: string;
    confirmClear: string;
    useUrl: string;
    quickDownload: string;
    copyUrl: string;
    remove: string;
    clearedToast: string;
    urlCopied: string;
  };
  stats: {
    title: string;
    live: string;
    storage: string;
    totalVideos: string;
    distribution: string;
    activePlatforms: string;
    platformsCenter: string;
    countLabel: string;
    supportedSites: string;
    thousandSites: string;
    fairUse: string;
  };
  footer: {
    engine: string;
    copyright: string;
    privacy: string;
    terms: string;
  };
  settings: {
    title: string;
    subtitle: string;
    tabGeneral: string;
    tabReminders: string;
    tabExtension: string;
    languageSectionTitle: string;
    languageSectionDesc: string;
    arabic: string;
    english: string;
    fastModeTitle: string;
    fastModeBadge: string;
    fastModeDesc: string;
    autoDownloadTitle: string;
    autoDownloadDesc: string;
    subtitlesTitle: string;
    subtitlesDesc: string;
    defaultQualityTitle: string;
    calloutRemindersTitle: string;
    calloutRemindersDesc: string;
    openReminders: string;
    calloutExtensionTitle: string;
    calloutExtensionDesc: string;
    openExtension: string;
    instantSaved: string;
    close: string;
  };
  reminders: {
    bannerTitle: string;
    bannerTag: string;
    bannerDesc: string;
    testInstant: string;
    permTitle: string;
    permDesc: string;
    enablePermBtn: string;
    activeTitle: string;
    activeCount: string;
    remainLabel: string;
    soundLabel: string;
    cancelTooltip: string;
    newTitle: string;
    newSubtitle: string;
    durationLabel: string;
    preset1min: string;
    preset5min: string;
    preset15min: string;
    preset30min: string;
    preset60min: string;
    customToggleActive: string;
    customToggleInactive: string;
    minutes: string;
    seconds: string;
    titleLabel: string;
    titlePlaceholder: string;
    attachLabel: string;
    soundTitle: string;
    soundDesc: string;
    browserNotifTitle: string;
    browserNotifDesc: string;
    submitBtn: string;
    autoLargeTitle: string;
    smartBadge: string;
    autoLargeDesc: string;
    thresholdLabel: string;
  };
  extension: {
    bannerTitle: string;
    bannerBadge: string;
    bannerDesc: string;
    statusActive: string;
    statusInactive: string;
    chooseBrowser: string;
    oneClick: string;
    popularBadge: string;
    readyToInstall: string;
    installingHeader: string;
    step1: string;
    step2: string;
    step3: string;
    installBtn: string;
    devPackageBtn: string;
    activeHeader: string;
    activeDesc: string;
    uninstallBtn: string;
    liveDemoTitle: string;
    liveDemoDesc: string;
    liveDemoBtn: string;
    behaviorTitle: string;
    floatingBtnTitle: string;
    floatingBtnDesc: string;
    fastIntegrationTitle: string;
    fastIntegrationDesc: string;
    auto4kTitle: string;
    auto4kDesc: string;
    previewTitle: string;
    previewBadge: string;
    previewFloatingBtn: string;
    previewCaption: string;
    bookmarkletTitle: string;
    bookmarkletBadge: string;
    bookmarkletDesc: string;
    bookmarkletDragText: string;
    copyCodeBtn: string;
    copiedCodeBtn: string;
  };
  toasts: {
    langChangedTitle: string;
    langChangedDesc: string;
    linkCopiedTitle: string;
    linkCopiedDesc: string;
    sortChangedTitle: string;
    sortNewestDesc: string;
    sortOldestDesc: string;
    fastModeOnTitle: string;
    fastModeOnDesc: string;
    fastModeOffTitle: string;
    fastModeOffDesc: string;
    autoDownloadOnTitle: string;
    autoDownloadOnDesc: string;
    autoDownloadOffTitle: string;
    autoDownloadOffDesc: string;
    defaultQualityUpdated: string;
    defaultQualityDesc: string;
    extractSuccessTitle: string;
    extractSuccessDesc: string;
    extractFastSuccessTitle: string;
    extractFastSuccessDesc: string;
    extractErrorTitle: string;
    downloadStartTitle: string;
    downloadStartDesc: string;
    downloadDoneTitle: string;
    downloadDoneDesc: string;
    bulkDownloadStartTitle: string;
    bulkDownloadStartDesc: string;
    bulkDownloadProgressDesc: string;
    bulkDownloadCompleteTitle: string;
    bulkDownloadCompleteDesc: string;
    itemsDeletedTitle: string;
    itemsDeletedDesc: string;
    itemsCompletedTitle: string;
    itemsCompletedDesc: string;
  };
  map: {
    title: string;
    subtitle: string;
    badge: string;
    selectServer: string;
    selectedServer: string;
    connected: string;
    ping: string;
    bandwidth: string;
    activeLoad: string;
    serverModalTitle: string;
    serverModalDesc: string;
    statusOnline: string;
    openMap: string;
    closeMap: string;
    viewInMap: string;
    pingTest: string;
    testingPing: string;
    optimalServer: string;
    googleMapsAttribution: string;
    regions: {
      all: string;
      middleEast: string;
      europe: string;
      northAmerica: string;
      asiaPacific: string;
    };
  };
  firebase: {
    cloudSync: string;
    cloudConnected: string;
    cloudConnecting: string;
    guestUser: string;
    signInGoogle: string;
    signOut: string;
    syncedJustNow: string;
    cloudSaved: string;
    autoBackup: string;
  };
  chat: {
    title: string;
    subtitle: string;
    badge: string;
    signInPrompt: string;
    signInButton: string;
    signOut: string;
    connectedAs: string;
    spacesTitle: string;
    noSpaces: string;
    noSpacesDesc: string;
    refreshSpaces: string;
    createSpaceTitle: string;
    spaceNamePlaceholder: string;
    createSpaceBtn: string;
    confirmCreateSpace: string;
    confirmCreateDesc: string;
    sendMessageTitle: string;
    shareVideoBtn: string;
    selectSpace: string;
    messagePlaceholder: string;
    sendBtn: string;
    sending: string;
    confirmSendTitle: string;
    confirmSendDesc: string;
    cancel: string;
    confirm: string;
    sentSuccessTitle: string;
    sentSuccessDesc: string;
    createSuccessTitle: string;
    createSuccessDesc: string;
    errorTitle: string;
    recentMessages: string;
    noMessages: string;
    spaceTypeRoom: string;
    spaceTypeDm: string;
    spaceTypeGroup: string;
  };
  presentation: {
    title: string;
    subtitle: string;
    generateBtn: string;
    generating: string;
    generatingDesc: string;
    promoBadge: string;
    readyTitle: string;
    shareBtn: string;
    downloadPromoBtn: string;
    regenerateBtn: string;
    aspectRatio: string;
    portraitStory: string;
    landscapeFeed: string;
    styleModern: string;
    styleCinematic: string;
    styleDynamic: string;
    shareModalTitle: string;
    shareText: string;
    shareCopied: string;
    veoPowered: string;
  };
  shortcuts: {
    modalTitle: string;
    modalSubtitle: string;
    navButton: string;
    badge: string;
    searchPlaceholder: string;
    categoryActions: string;
    categorySearch: string;
    categorySettings: string;
    categoryGeneral: string;
    downloadAction: string;
    downloadActionDesc: string;
    historyAction: string;
    historyActionDesc: string;
    settingsAction: string;
    settingsActionDesc: string;
    languageAction: string;
    languageActionDesc: string;
    fastModeAction: string;
    fastModeActionDesc: string;
    helpAction: string;
    helpActionDesc: string;
    closeAction: string;
    closeActionDesc: string;
    toastTriggered: string;
  };
}

export const translations: Record<Language, Translations> = {
  ar: {
    nav: {
      home: 'الرئيسية',
      recent: 'قائمة التحميل',
      supported: 'المواقع المدعومة',
      reminders: 'جدولة التنبيهات',
      extension: 'إضافة المتصفح',
      settings: 'الإعدادات',
      newBadge: 'جديد',
      premiumPlan: 'خطة احترافية VIP',
      vip: 'VIP',
      language: 'English',
      serverMap: 'خريطة السيرفرات',
      googleChat: 'مساحات Google Chat',
    },
    hero: {
      badge: 'نظام التحميل فائق السرعة والموثوقية',
      title: 'أسرع أداة لتحميل الفيديوهات',
      subtitle: 'استخرج وحمل الفيديوهات بدقة 4K وصوت عالي النقاء من أكثر من 1000 موقع بضغطة زر واحدة.',
    },
    input: {
      placeholder: 'الصق رابط الفيديو هنا (YouTube, TikTok, Instagram, LinkedIn, Dailymotion, Twitch...)',
      processing: 'جاري المعالجة...',
      downloadNow: 'تحميل الآن',
      alertEmpty: 'يرجى إدخال رابط الفيديو أولاً',
      errorPrefix: 'فشل في استخراج الرابط',
    },
    result: {
      ready: 'جاهز للتحميل',
      chosenFormat: 'الصيغة المختارة',
      copyLink: 'نسخ الرابط',
      copied: 'تم النسخ',
      share: 'مشاركة',
      scheduleReminder: 'جدولة تنبيه',
      downloadNow: 'تنزيل الملف الآن',
      downloading: 'جاري التحميل...',
      previewTitle: 'معاينة الفيديو المستخرج',
      enlargeThumbnail: 'تكبير الصورة المصغرة',
      closePreview: 'إغلاق المعاينة',
      sourcePlatform: 'المنصة',
      resolutionBadge: 'دقة عالية HD',
      clickToEnlarge: 'انقر لتكبير المعاينة بالكامل',
    },
    quickToolbar: {
      qualityAndFormat: 'الجودة والصيغة:',
      autoHighest: 'تلقائي بأعلى دقة متوفرة (تخطي الاختيار اليدوي للسرعة القصوى)',
      fastMode: 'وضع التحميل السريع',
      fastModeActive: 'أعلى دقة تلقائياً ⚡',
      fastModeDisabled: 'معطل',
      subtitles: 'دمج الترجمة',
      preferences: 'تفضيلات',
      scheduleAlert: 'جدولة تنبيه',
      extension: 'إضافة المتصفح',
    },
    recent: {
      title: 'التحميلات الأخيرة',
      fileCount: 'ملف',
      sortNewest: 'الترتيب: الأحدث أولاً ⬇',
      sortOldest: 'الترتيب: الأقدم أولاً ⬆',
      restoreNewest: 'إعادة للأحدث',
      thName: 'اسم الفيديو',
      thSource: 'المصدر',
      thFormat: 'الصيغة',
      thStatus: 'الحالة',
      thSize: 'الحجم',
      thTime: 'وقت التحميل',
      thAction: 'إجراء',
      completed: 'مكتمل',
      reDownloadTooltip: 'إعادة تحميل هذا الملف',
      scheduleTooltip: 'جدولة تنبيه بعد فترة زمنية لهذا الملف',
      downloadAll: 'تحميل الكل',
      downloadQueue: 'تحميل قائمة الانتظار ({count})',
      downloadSelected: 'تحميل المحدد ({count})',
      selectAll: 'تحديد الكل',
      deselectAll: 'إلغاء التحديد',
      selectedCount: 'تم تحديد {count}',
      deleteSelected: 'حذف المحدد',
      markCompleted: 'تعيين كمكتمل',
      estRemaining: 'الوقت المتبقي:',
      estTotal: 'إجمالي التقدير:',
      speedEstimate: 'سرعة التحميل:',
      queuedBadge: 'في الانتظار',
      filterAll: 'الكل',
      filterCompleted: 'المكتملة',
      filterProcessing: 'قيد المعالجة',
      noFilteredItems: 'لا توجد عناصر مطابقة لهذا التصنيف',
      clearFilter: 'عرض الكل',
      exportCsv: 'تصدير CSV',
      exportCsvTooltip: 'تصدير سجل التحميلات بالكامل إلى ملف CSV متوافق مع Excel وجداول البيانات',
      exportCsvSuccessTitle: 'تم التصدير بنجاح! 📄',
      exportCsvSuccessDesc: 'تم حفظ وتنزيل سجل التحميلات في ملف CSV بصيغة UTF-8 تدعم اللغة العربية.',
      exportCsvEmpty: 'لا توجد تحميلات لتصديرها حالياً',
      exportSelectedCsv: 'تصدير المحدد (CSV)',
    },
    history: {
      buttonTitle: 'سجل الروابط والبحث',
      title: 'سجل الروابط السابقة',
      countLabel: 'روابط محفوظة',
      empty: 'لا يوجد روابط سابقة في السجل',
      emptyDesc: 'الروابط التي تقوم بمعالجتها أو تنزيلها ستُحفظ هنا لسرعة الوصول إليها.',
      searchPlaceholder: 'بحث في سجل الروابط...',
      clearAll: 'مسح السجل',
      confirmClear: 'هل أنت متأكد من مسح جميع الروابط المحفوظة؟',
      useUrl: 'استخدام الرابط',
      quickDownload: 'تحميل سريع ⚡',
      copyUrl: 'نسخ الرابط',
      remove: 'حذف من السجل',
      clearedToast: 'تم مسح سجل الروابط بنجاح',
      urlCopied: 'تم نسخ الرابط إلى الحافظة',
    },
    stats: {
      title: 'إحصائيات التحميل وتوزيع المنصات',
      live: 'مباشر',
      storage: 'مساحة التحميل',
      totalVideos: 'إجمالي الفيديوهات',
      distribution: 'نسب التنزيل حسب المنصة',
      activePlatforms: 'منصات نشطة',
      platformsCenter: 'المنصات',
      countLabel: 'العدد:',
      supportedSites: 'المواقع المدعومة',
      thousandSites: '+1000 موقع',
      fairUse: 'تنبيه الاستخدام العادل: التحميل مخصص للمحتوى المصرح به وحفظ النسخ الشخصية. يرجى مراعاة حقوق النشر.',
    },
    footer: {
      engine: 'VideoBot Pro Engine v2.4.1',
      copyright: '© 2024 VideoBot Global Infrastructure',
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الاستخدام',
    },
    settings: {
      title: 'إعدادات وتفضيلات التحميل',
      subtitle: 'تخصيص سلوك محرك الاستخراج وتفضيلات التطبيق',
      tabGeneral: 'تفضيلات التحميل',
      tabReminders: 'جدولة التنبيهات (Reminders)',
      tabExtension: 'تثبيت الإضافة (Extension)',
      languageSectionTitle: 'لغة واجهة المستخدم (Interface Language)',
      languageSectionDesc: 'اختر اللغة المفضلة لعرض التطبيق واتجاه الواجهة',
      arabic: 'العربية (Arabic) ✓',
      english: 'English (الإنجليزية)',
      fastModeTitle: 'وضع التحميل السريع (Fast Download Mode)',
      fastModeBadge: 'سرعة قصوى',
      fastModeDesc: 'تخطي شاشة اختيار الصيغ وبدء التحميل التلقائي فوراً بأعلى دقة متوفرة (1080p / 4K) بمجرد إدخال الرابط، دون الحاجة لأي نقرة إضافية.',
      autoDownloadTitle: 'تحميل الملف تلقائياً فور المعالجة',
      autoDownloadDesc: 'يبدأ حفظ ملف الفيديو مباشرة على جهازك بمجرد استخراج الرابط الناجح.',
      subtitlesTitle: 'دمج ملفات الترجمة (Subtitles)',
      subtitlesDesc: 'دمج مسارات الترجمة النصية التلقائية المتوفرة داخل حاوية الفيديو.',
      defaultQualityTitle: 'الدقة الافتراضية المفضلة',
      calloutRemindersTitle: 'جدولة تنبيهات التحميلات الكبيرة',
      calloutRemindersDesc: 'أرسل تنبيهاً في المتصفح بعد مرور مدة محددة أو عند اكتمال تنزيل مقاطع الفيديو الكبيرة',
      openReminders: 'فتح الجدولة ←',
      calloutExtensionTitle: 'إضافة المتصفح (VideoBot Extension)',
      calloutExtensionDesc: 'استخرج الفيديوهات مباشرة من صفحات الويب بنقرة واحدة دون الحاجة لنسخ الروابط يدوياً!',
      openExtension: 'تثبيت الآن ←',
      instantSaved: 'يتم حفظ التغييرات وتطبيقها فورياً',
      close: 'إغلاق',
    },
    reminders: {
      bannerTitle: 'جدولة التنبيهات والإشعارات الذكية',
      bannerTag: 'Scheduled Reminders',
      bannerDesc: 'اضبط تنبيهاً في المتصفح بعد مرور فترة زمنية محددة أو عند اكتمال تنزيل مقاطع الفيديو كبيرة الحجم دون الحاجة للانتظار أمام الشاشة!',
      testInstant: 'تجربة تنبيه فوري',
      permTitle: 'إذن إشعارات المتصفح (Desktop Notifications) غير مفعّل حالياً',
      permDesc: 'فعّل إذن المتصفح لتلقي الإشعارات المنبثقة حتى لو كان التبويب مصغراً أو المتصفح في الخلفية.',
      enablePermBtn: 'تفعيل إذن الإشعارات',
      activeTitle: 'التنبيهات المجدولة النشطة حالياً',
      activeCount: 'تنبيه قيد العد',
      remainLabel: 'متبقي:',
      soundLabel: 'صوت',
      cancelTooltip: 'إلغاء هذا التنبيه',
      newTitle: 'إضافة وجدولة تنبيه جديد',
      newSubtitle: 'حدد وقت التنبيه المطلوب',
      durationLabel: 'المدة الزمنية للتنبيه:',
      preset1min: 'دقيقة واحدة (تجربة سريعة)',
      preset5min: '5 دقائق',
      preset15min: '15 دقيقة',
      preset30min: '30 دقيقة',
      preset60min: 'ساعة كاملة',
      customToggleActive: '✓ تحديد مدة مخصصة (دقائق / ثواني)',
      customToggleInactive: '+ تحديد مدة مخصصة بالدقائق والثواني',
      minutes: 'دقيقة',
      seconds: 'ثانية',
      titleLabel: 'نص التنبيه أو اسم الفيديو:',
      titlePlaceholder: 'مثال: التحقق من اكتمال تحميل فيديو بدقة 4K...',
      attachLabel: 'ربط التنبيه بأحد الملفات الكبيرة في قائمة التحميل:',
      soundTitle: 'تشغيل نغمة صوتية (Audio Chime)',
      soundDesc: 'صوت رنين كريستالي هادئ عند انتهاء الوقت',
      browserNotifTitle: 'إشعار سطح المكتب (Browser Notif)',
      browserNotifDesc: 'تنبيه النظام حتى لو كان المتصفح في الخلفية',
      submitBtn: 'بدء جدولة التنبيه والعد التنازلي الآن ⏰',
      autoLargeTitle: 'تنبيه تلقائي عند اكتمال تنزيل الملفات كبيرة الحجم',
      smartBadge: 'ذكي',
      autoLargeDesc: 'يقوم النظام بإرسال إشعار فوري مصحوباً بنغمة صوتية تلقائياً بمجرد انتهاء تحميل أي ملف فيديو يتجاوز الحجم المحدد، دون الحاجة لجدولة يدوية.',
      thresholdLabel: 'حد اعتبار الملف كبيراً (Threshold):',
    },
    extension: {
      bannerTitle: 'إضافة المتصفح الرسمية (VideoBot Extension)',
      bannerBadge: 'v2.4.0 جديد',
      bannerDesc: 'استخرج وحمّل مقاطع الفيديو مباشرة من صفحات يوتيوب وتيك توك وانستغرام وغيرها بضغطة زر واحدة دون الحاجة لنسخ الروابط ولصقها يدوياً!',
      statusActive: 'الإضافة مثبتة ونشطة',
      statusInactive: 'غير مثبتة',
      chooseBrowser: 'اختر متصفحك للتثبيت الفوري',
      oneClick: 'تثبيت بنقرة واحدة',
      popularBadge: 'الأكثر استخداماً',
      readyToInstall: 'جاهزة للتثبيت',
      installingHeader: 'جاري تثبيت إضافة VideoBot لـ',
      step1: '1. فحص توافق المتصفح (WebExtensions API V3)',
      step2: '2. حقن زر الاستخراج الذكي والمشغلات المدعومة',
      step3: '3. تفعيل الربط المباشر مع لوحة تحكم VideoBot Pro',
      installBtn: 'تثبيت الإضافة بضغطة واحدة لـ',
      devPackageBtn: 'حزمة المطورين (.JSON)',
      activeHeader: 'إضافة المتصفح جاهزة وتعمل في الخلفية!',
      activeDesc: 'عند زيارة أي صفحة يوتيوب، تيك توك، أو فيسبوك، سيظهر زر VideoBot العائم فوق الفيديو للاستخراج الفوري.',
      uninstallBtn: 'إلغاء التثبيت',
      liveDemoTitle: 'تجربة الاستخراج المباشر من صفحة ويب',
      liveDemoDesc: 'جرب محاكاة النقر على زر الإضافة من صفحة فيديو حية لمشاهدة الاستخراج الفوري التلقائي.',
      liveDemoBtn: 'اختبار استخراج فيديو الآن ⚡',
      behaviorTitle: 'تفضيلات وسلوك الإضافة',
      floatingBtnTitle: 'إظهار زر التحميل العائم فوق الفيديوهات',
      floatingBtnDesc: 'عرض أيقونة VideoBot العائمة في زاوية مشغل الفيديو في المواقع المدعومة.',
      fastIntegrationTitle: 'التكامل المباشر مع وضع التحميل السريع',
      fastIntegrationDesc: 'بدء تنزيل الفيديو بأعلى جودة فور نقر الإضافة دون إظهار نافذة التأكيد.',
      auto4kTitle: 'كشف وتفضيل دقة 4K / 1080p تلقائياً',
      auto4kDesc: 'التقاط أعلى تدفق فيديو متاح بالمصدر بأعلى معدل بت وجودة صوتية.',
      previewTitle: 'معاينة حية: كيف تعمل الإضافة على صفحات الويب',
      previewBadge: 'مشهد توضيحي',
      previewFloatingBtn: 'تحميل عبر VideoBot',
      previewCaption: '⚡ يظهر هذا الزر التفاعلي تلقائياً عند فتح أي فيديو في المتصفح لاستخراجه وتحميله مباشرة دون نسخ الرابط.',
      bookmarkletTitle: 'بديل سريع: زر الإشارات المرجعية (Bookmarklet)',
      bookmarkletBadge: 'يعمل على كافة الأجهزة',
      bookmarkletDesc: 'إذا كنت تفضل عدم تثبيت إضافة، اسحب هذا الزر مباشرة إلى شريط إشارات متصفحك (Bookmarks Bar)، ثم انقر عليه في أي صفحة ويب لفتح الفيديو وتحميله فورياً:',
      bookmarkletDragText: '⚡ اسحبني لشريط الإشارات: [ VideoBot Extract ]',
      copyCodeBtn: 'نسخ كود الاختصار',
      copiedCodeBtn: 'تم النسخ!',
    },
    toasts: {
      langChangedTitle: 'تم تغيير اللغة',
      langChangedDesc: 'تم تبديل لغة الواجهة إلى العربية بنجاح.',
      linkCopiedTitle: 'تم نسخ الرابط',
      linkCopiedDesc: 'تم نسخ الرابط المباشر إلى الحافظة بنجاح.',
      sortChangedTitle: 'ترتيب القائمة',
      sortNewestDesc: 'تم الترتيب حسب الأحدث أولاً ⬇',
      sortOldestDesc: 'تم الترتيب حسب الأقدم أولاً ⬆',
      fastModeOnTitle: '⚡ تم تفعيل وضع التحميل السريع',
      fastModeOnDesc: 'تم تخطي اختيار الصيغة! سيتم التحميل بأعلى دقة متوفرة (1080p / 4K) تلقائياً لكل فيديو.',
      fastModeOffTitle: 'تم إيقاف وضع التحميل السريع',
      fastModeOffDesc: 'يمكنك الآن اختيار الصيغة والجودة المناسبة لكل فيديو يدوياً.',
      autoDownloadOnTitle: 'تم تفعيل التحميل التلقائي',
      autoDownloadOnDesc: 'سيتم تنزيل الفيديو تلقائياً فور تجهيز الرابط.',
      autoDownloadOffTitle: 'تم تعطيل التحميل التلقائي',
      autoDownloadOffDesc: 'تم إيقاف التحميل التلقائي.',
      defaultQualityUpdated: 'تم تحديث الصيغة الافتراضية',
      defaultQualityDesc: 'تم تعيين الصيغة كافتراضية بنجاح.',
      extractSuccessTitle: 'تم استخراج الرابط بنجاح! ✨',
      extractSuccessDesc: 'تم تجهيز رابط الفيديو وهو جاهز للتحميل المباشر.',
      extractFastSuccessTitle: '⚡ وضع التحميل السريع: جاهز للتنزيل!',
      extractFastSuccessDesc: 'تم استخراج الفيديو بأعلى دقة متوفرة وجاري بدء التنزيل التلقائي فوراً...',
      extractErrorTitle: 'تعذر استخراج الرابط',
      downloadStartTitle: 'بدء تحميل الملف',
      downloadStartDesc: 'جاري تجهيز وتنزيل الملف...',
      downloadDoneTitle: 'اكتمل التحميل بنجاح! 🎉',
      downloadDoneDesc: 'تم حفظ الملف في جهازك بنجاح.',
      bulkDownloadStartTitle: 'بدء التحميل المتعدد',
      bulkDownloadStartDesc: 'جاري بدء تحميل {count} من الملفات...',
      bulkDownloadProgressDesc: 'جاري تحميل ({current}/{total}): {name}',
      bulkDownloadCompleteTitle: 'اكتمل التحميل المتعدد! 🎉',
      bulkDownloadCompleteDesc: 'تم إرسال جميع الملفات ({count}) إلى التحميل بنجاح.',
      itemsDeletedTitle: 'تم حذف العناصر',
      itemsDeletedDesc: 'تمت إزالة {count} عناصر من قائمة التحميلات الأخيرة.',
      itemsCompletedTitle: 'تم التحديث',
      itemsCompletedDesc: 'تم تعيين {count} عناصر كمكتملة.',
    },
    map: {
      title: 'شبكة خوادم التحميل ومراكز التوزيع العالمية (CDN)',
      subtitle: 'خريطة تفاعلية مدعومة بواسطة خرائط Google (Google Maps Platform) تعرض عقد التوزيع ومراكز استخراج وتنزيل الوسائط.',
      badge: 'خرائط Google التفاعلية',
      selectServer: 'اختيار هذا السيرفر كنقطة اتصال أساسية',
      selectedServer: 'السيرفر المتصل حالياً',
      connected: 'متصل بنجاح',
      ping: 'زمن الاستجابة (Ping)',
      bandwidth: 'عرض النطاق الترددي',
      activeLoad: 'الحمولة الحالية',
      serverModalTitle: 'عقدة سيرفر التحميل',
      serverModalDesc: 'سيرفر معالجة وفحص الروابط فائق السرعة',
      statusOnline: 'يعمل بكفاءة فائقة (99.99%)',
      openMap: 'فتح الخريطة التفاعلية',
      closeMap: 'إغلاق الخريطة',
      viewInMap: 'عرض في الخريطة',
      pingTest: 'اختبار الاتصال ⚡',
      testingPing: 'جاري القياس...',
      optimalServer: 'السيرفر الأقرب والأسرع لموقعك',
      googleMapsAttribution: 'خرائط تفاعلية مبنية بتقنيات Google Maps الحديثة و Advanced Markers',
      regions: {
        all: 'جميع السيرفرات (عالمي)',
        middleEast: 'الشرق الأوسط (دبي)',
        europe: 'أوروبا (فرانكفورت / لندن)',
        northAmerica: 'أمريكا الشمالية (فرجينيا)',
        asiaPacific: 'آسيا والمحيط الهادئ (طوكيو / سنغافورة)',
      },
    },
    firebase: {
      cloudSync: 'المزامنة السحابية (Firebase)',
      cloudConnected: 'سحابة Firebase متصلة',
      cloudConnecting: 'جاري الاتصال بالسحابة...',
      guestUser: 'حساب زائر محمي',
      signInGoogle: 'تسجيل الدخول باستخدام Google',
      signOut: 'تسجيل الخروج',
      syncedJustNow: 'تم حفظ البيانات سحابياً فوراً',
      cloudSaved: 'محفوظ في Firebase Firestore',
      autoBackup: 'مزامنة السجل والتنبيهات تلقائياً',
    },
    chat: {
      title: 'مساحات ومحادثات Google Chat',
      subtitle: 'مشاركة الفيديوهات المستخرجة مباشرة مع زملائك ومجموعات العمل عبر مساحات Google Chat.',
      badge: 'Google Workspace',
      signInPrompt: 'قم بتسجيل الدخول باستخدام Google لربط مساحات Google Chat الخاصة بك.',
      signInButton: 'تسجيل الدخول باستخدام Google',
      signOut: 'قطع الاتصال',
      connectedAs: 'متصل كـ',
      spacesTitle: 'المساحات والمحادثات المتاحة',
      noSpaces: 'لا توجد مساحات متاحة',
      noSpacesDesc: 'لم يتم العثور على أي مساحات Google Chat. يمكنك إنشاء مساحة جديدة الآن!',
      refreshSpaces: 'تحديث المساحات',
      createSpaceTitle: 'إنشاء مساحة جديدة في Google Chat',
      spaceNamePlaceholder: 'اسم المساحة الجديدة (مثال: تنزيلات الفريق)',
      createSpaceBtn: 'إنشاء مساحة',
      confirmCreateSpace: 'تأكيد إنشاء مساحة عمل جديدة',
      confirmCreateDesc: 'هل أنت متأكد من رغبتك في إنشاء مساحة جديدة باسم "{name}" في حسابك على Google Chat؟',
      sendMessageTitle: 'إرسال رابط الفيديو إلى المساحة',
      shareVideoBtn: 'مشاركة في Google Chat',
      selectSpace: 'اختر مساحة العمل المستهدفة',
      messagePlaceholder: 'اكتب ملاحظة أو تعليقاً مرافقاً (اختياري)...',
      sendBtn: 'إرسال الرسالة إلى Google Chat',
      sending: 'جاري الإرسال...',
      confirmSendTitle: 'تأكيد إرسال رسالة إلى Google Chat',
      confirmSendDesc: 'هل تريد إرسال بطاقة الفيديو هذه إلى مساحة "{spaceName}"؟ سيتم نشر الرسالة نيابة عنك.',
      cancel: 'إلغاء',
      confirm: 'تأكيد وإرسال',
      sentSuccessTitle: 'تم الإرسال بنجاح! 🚀',
      sentSuccessDesc: 'تم إرسال بطاقة الفيديو إلى مساحة Google Chat المحددة.',
      createSuccessTitle: 'تم إنشاء المساحة بنجاح! ✨',
      createSuccessDesc: 'أصبحت مساحة العمل الجديدة جاهزة للمحادثة ومشاركة الوسائط.',
      errorTitle: 'فشلت العملية',
      recentMessages: 'آخر الرسائل في هذه المساحة',
      noMessages: 'لا توجد رسائل سابقة في هذه المساحة',
      spaceTypeRoom: 'مساحة عمل جماعية',
      spaceTypeDm: 'محادثة مباشرة',
      spaceTypeGroup: 'محادثة جماعية',
    },
    presentation: {
      title: 'عرض الفيديو الترويجي (Video Presentation)',
      subtitle: 'توليد فيديو قصير ترويجي للمحتوى المستخرج بنمط Veo لمشاركته مباشرة عبر المنصات',
      generateBtn: 'توليد عرض الفيديو الترويجي',
      generating: 'جاري توليد فيديو العرض الترويجي...',
      generatingDesc: 'يتم الآن محاكاة وتجميع لقطات العرض والمؤثرات البصرية وتنسيق الفيديو الترويجي بدقة عالية',
      promoBadge: 'عرض ترويجي Veo Showcase',
      readyTitle: 'فيديو العرض الترويجي جاهز!',
      shareBtn: 'مشاركة العرض مباشرة',
      downloadPromoBtn: 'تحميل فيديو العرض',
      regenerateBtn: 'إعادة التوليد',
      aspectRatio: 'أبعاد الفيديو:',
      portraitStory: 'عمودي 9:16 (Stories/Reels/TikTok)',
      landscapeFeed: 'أفقي 16:9 (YouTube/X/Web)',
      styleModern: 'عصري وسريع',
      styleCinematic: 'سينمائي أنيق',
      styleDynamic: 'حماسي وحركي',
      shareModalTitle: 'مشاركة العرض الترويجي عبر منصات التواصل',
      shareText: 'شاهد هذا العرض الترويجي المميز للفيديو الذي قمت بتحميله!',
      shareCopied: 'تم نسخ رابط ورسالة العرض الترويجي بنجاح!',
      veoPowered: 'مدعوم بتقنية Veo Video Generation',
    },
    shortcuts: {
      modalTitle: 'اختصارات لوحة المفاتيح',
      modalSubtitle: 'تحكم في التطبيق بسرعة فائقة باستخدام مفاتيح الاختصار المباشرة',
      navButton: 'الاختصارات',
      badge: 'سريع وسهل',
      searchPlaceholder: 'ابحث عن اختصار...',
      categoryActions: 'التحميل والعمليات الأساسية',
      categorySearch: 'البحث والتنقل في السجل',
      categorySettings: 'التفضيلات والإعدادات',
      categoryGeneral: 'النوافذ والمساعدة',
      downloadAction: 'بدء الاستخراج والتحميل فوراً',
      downloadActionDesc: 'يقوم بتشغيل التحميل للرابط الموجود في الحقل فوراً دون الحاجة للنقر بالماوس',
      historyAction: 'البحث في سجل الروابط',
      historyActionDesc: 'يفتح قائمة السجل مع التركيز الفوري على حقل البحث',
      settingsAction: 'فتح نافذة الإعدادات',
      settingsActionDesc: 'الوصول المباشر إلى خيارات الجودة، التنبيهات، وإضافة المتصفح',
      languageAction: 'تبديل لغة الواجهة',
      languageActionDesc: 'التبديل الفوري بين اللغتين العربية والإنجليزية',
      fastModeAction: 'تبديل وضع التحميل السريع ⚡',
      fastModeActionDesc: 'تفعيل أو تعطيل التنزيل التلقائي بأعلى دقة متوفرة',
      helpAction: 'فتح دليل الاختصارات',
      helpActionDesc: 'عرض هذه النافذة للتعرف على جميع مفاتيح التحكم السريعة',
      closeAction: 'إغلاق النوافذ المنبثقة',
      closeActionDesc: 'إغلاق أي نافذة منبثقة أو إلغاء القوائم المفتوحة',
      toastTriggered: 'تم تفعيل الاختصار:',
    },
  },
  en: {
    nav: {
      home: 'Home',
      recent: 'Recent Activity',
      supported: 'Supported Sites',
      reminders: 'Scheduled Reminders',
      extension: 'Browser Extension',
      settings: 'Settings',
      newBadge: 'NEW',
      premiumPlan: 'PREMIUM VIP PLAN',
      vip: 'VIP',
      language: 'العربية',
      serverMap: 'Server Map',
      googleChat: 'Google Chat Spaces',
    },
    hero: {
      badge: 'Superfast & Ultra-Reliable Engine',
      title: 'Fastest Universal Video Downloader',
      subtitle: 'Extract and download videos in 4K quality with crystal-clear audio from 1000+ platforms in a single click.',
    },
    input: {
      placeholder: 'Paste video link here (YouTube, TikTok, Instagram, LinkedIn, Dailymotion, Twitch...)',
      processing: 'Processing...',
      downloadNow: 'Download Now',
      alertEmpty: 'Please enter a video link first',
      errorPrefix: 'Failed to extract video link',
    },
    result: {
      ready: 'Ready to Download',
      chosenFormat: 'Selected Format',
      copyLink: 'Copy Link',
      copied: 'Copied',
      share: 'Share',
      scheduleReminder: 'Schedule Alert',
      downloadNow: 'Download File Now',
      downloading: 'Downloading...',
      previewTitle: 'Extracted Video Preview',
      enlargeThumbnail: 'Enlarge Thumbnail',
      closePreview: 'Close Preview',
      sourcePlatform: 'Platform',
      resolutionBadge: 'High Definition HD',
      clickToEnlarge: 'Click to expand full preview',
    },
    quickToolbar: {
      qualityAndFormat: 'Quality & Format:',
      autoHighest: 'Auto highest available resolution (Quick Mode Active)',
      fastMode: 'Fast Download Mode',
      fastModeActive: 'Auto Max Quality ⚡',
      fastModeDisabled: 'Disabled',
      subtitles: 'Embed Subtitles',
      preferences: 'Preferences',
      scheduleAlert: 'Schedule Alert',
      extension: 'Browser Extension',
    },
    recent: {
      title: 'Recent Downloads',
      fileCount: 'files',
      sortNewest: 'Sort: Newest First ⬇',
      sortOldest: 'Sort: Oldest First ⬆',
      restoreNewest: 'Reset to Newest',
      thName: 'Video Name',
      thSource: 'Source',
      thFormat: 'Format',
      thStatus: 'Status',
      thSize: 'Size',
      thTime: 'Download Time',
      thAction: 'Action',
      completed: 'Completed',
      reDownloadTooltip: 'Re-download this file',
      scheduleTooltip: 'Schedule a reminder for this file',
      downloadAll: 'Download All',
      downloadQueue: 'Download Queue ({count})',
      downloadSelected: 'Download Selected ({count})',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      selectedCount: '{count} selected',
      deleteSelected: 'Delete Selected',
      markCompleted: 'Mark as Completed',
      estRemaining: 'Est. Remaining:',
      estTotal: 'Est. Total:',
      speedEstimate: 'Est. Speed:',
      queuedBadge: 'Queued',
      filterAll: 'All',
      filterCompleted: 'Completed',
      filterProcessing: 'Processing',
      noFilteredItems: 'No items found matching this filter',
      clearFilter: 'Show All',
      exportCsv: 'Export CSV',
      exportCsvTooltip: 'Export your entire download history to a CSV spreadsheet file',
      exportCsvSuccessTitle: 'Export Successful! 📄',
      exportCsvSuccessDesc: 'Your download history has been exported and downloaded as a UTF-8 CSV file.',
      exportCsvEmpty: 'No downloads available to export yet',
      exportSelectedCsv: 'Export Selected (CSV)',
    },
    history: {
      buttonTitle: 'Search & Download History',
      title: 'Recent URL History',
      countLabel: 'saved links',
      empty: 'No search history yet',
      emptyDesc: 'Links you process or download will be saved here for instant re-access.',
      searchPlaceholder: 'Search past links...',
      clearAll: 'Clear History',
      confirmClear: 'Are you sure you want to clear your saved links history?',
      useUrl: 'Use Link',
      quickDownload: 'Quick Download ⚡',
      copyUrl: 'Copy Link',
      remove: 'Remove from history',
      clearedToast: 'Search history cleared successfully',
      urlCopied: 'Link copied to clipboard',
    },
    stats: {
      title: 'Download Stats & Platform Share',
      live: 'LIVE',
      storage: 'Storage Used',
      totalVideos: 'Total Videos',
      distribution: 'Downloads by Platform',
      activePlatforms: 'active platforms',
      platformsCenter: 'Platforms',
      countLabel: 'Count:',
      supportedSites: 'Supported Sites',
      thousandSites: '+1000 Sites',
      fairUse: 'Fair Use Notice: Downloading is intended for authorized content and personal archival. Please respect copyrights.',
    },
    footer: {
      engine: 'VideoBot Pro Engine v2.4.1',
      copyright: '© 2024 VideoBot Global Infrastructure',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
    },
    settings: {
      title: 'Settings & Download Preferences',
      subtitle: 'Customize extraction engine behavior and application preferences',
      tabGeneral: 'Preferences',
      tabReminders: 'Scheduled Reminders',
      tabExtension: 'Browser Extension',
      languageSectionTitle: 'Interface Language (لغة واجهة المستخدم)',
      languageSectionDesc: 'Choose your preferred interface language and text direction',
      arabic: 'العربية (Arabic)',
      english: 'English (الإنجليزية) ✓',
      fastModeTitle: 'Fast Download Mode',
      fastModeBadge: 'Ultra Speed',
      fastModeDesc: 'Bypass format selection and immediately auto-download at the highest resolution (1080p / 4K) when a link is submitted.',
      autoDownloadTitle: 'Auto-Download Upon Processing',
      autoDownloadDesc: 'Directly saves the video file to your device as soon as link extraction completes.',
      subtitlesTitle: 'Embed Subtitles',
      subtitlesDesc: 'Merge available auto-generated subtitle tracks into the video container.',
      defaultQualityTitle: 'Default Preferred Resolution',
      calloutRemindersTitle: 'Scheduled Large Download Reminders',
      calloutRemindersDesc: 'Get browser notifications after a preset duration or when big files (> 40 MB) finish downloading.',
      openReminders: 'Open Reminders →',
      calloutExtensionTitle: 'VideoBot Browser Extension',
      calloutExtensionDesc: 'Extract and download videos directly on web pages with 1 click without copying URLs!',
      openExtension: 'Install Now →',
      instantSaved: 'Changes are saved and applied automatically',
      close: 'Close',
    },
    reminders: {
      bannerTitle: 'Scheduled Reminders & Smart Alerts',
      bannerTag: 'Scheduled Reminders',
      bannerDesc: 'Set a browser reminder after a specific duration or when downloading large video files (4K/1080p) without waiting at the screen!',
      testInstant: 'Test Alert Now',
      permTitle: 'Desktop Notification Permission is not enabled',
      permDesc: 'Enable browser permission to receive desktop popup notifications even when the tab is backgrounded or minimized.',
      enablePermBtn: 'Enable Notifications',
      activeTitle: 'Currently Active Reminders',
      activeCount: 'reminders running',
      remainLabel: 'Remaining:',
      soundLabel: 'Sound',
      cancelTooltip: 'Cancel this reminder',
      newTitle: 'Schedule a New Reminder',
      newSubtitle: 'Set your desired reminder duration',
      durationLabel: 'Reminder Duration:',
      preset1min: '1 Minute (Quick Test)',
      preset5min: '5 Minutes',
      preset15min: '15 Minutes',
      preset30min: '30 Minutes',
      preset60min: '1 Hour',
      customToggleActive: '✓ Custom Duration (Minutes / Seconds)',
      customToggleInactive: '+ Set Custom Duration in Minutes and Seconds',
      minutes: 'min',
      seconds: 'sec',
      titleLabel: 'Reminder Note or Video Title:',
      titlePlaceholder: 'e.g. Check on 4K Keynote download completion...',
      attachLabel: 'Attach to a recent large download in list:',
      soundTitle: 'Audio Chime Sound',
      soundDesc: 'Pleasant crystalline chime sound when timer expires',
      browserNotifTitle: 'Desktop Notification',
      browserNotifDesc: 'System popup alert even if browser is backgrounded',
      submitBtn: 'Start Reminder Countdown ⏰',
      autoLargeTitle: 'Automatic Alert for Large File Downloads',
      smartBadge: 'Smart',
      autoLargeDesc: 'Automatically triggers a desktop notification and audio chime when any video exceeding the threshold finishes downloading.',
      thresholdLabel: 'Large File Threshold:',
    },
    extension: {
      bannerTitle: 'Official Browser Extension (VideoBot)',
      bannerBadge: 'v2.4.0 NEW',
      bannerDesc: 'Extract and download videos directly on YouTube, TikTok, Instagram, and more with one click without manually copying URLs!',
      statusActive: 'Extension Installed & Active',
      statusInactive: 'Not Installed',
      chooseBrowser: 'Choose Your Browser for 1-Click Install',
      oneClick: 'One-Click Install',
      popularBadge: 'Most Popular',
      readyToInstall: 'Ready to Install',
      installingHeader: 'Installing VideoBot Extension for',
      step1: '1. Checking browser compatibility (WebExtensions MV3)',
      step2: '2. Injecting smart detection scripts and supported players',
      step3: '3. Connecting with VideoBot Pro Control Center',
      installBtn: '1-Click Install for',
      devPackageBtn: 'Developer Package (.JSON)',
      activeHeader: 'Browser Extension Ready & Active!',
      activeDesc: 'When visiting YouTube, TikTok, or Facebook, the floating VideoBot download button appears over videos for instant extraction.',
      uninstallBtn: 'Uninstall',
      liveDemoTitle: 'Test Live Webpage Extraction',
      liveDemoDesc: 'Simulate clicking the extension button from a live video page to watch automatic instant extraction.',
      liveDemoBtn: 'Test Video Extract Now ⚡',
      behaviorTitle: 'Extension Preferences & Behavior',
      floatingBtnTitle: 'Show Floating Download Button',
      floatingBtnDesc: 'Display the floating VideoBot button over video players on supported sites.',
      fastIntegrationTitle: 'Direct Integration with Fast Download Mode',
      fastIntegrationDesc: 'Begin downloading at highest quality immediately when clicking extension button without dialogs.',
      auto4kTitle: 'Auto-Detect & Prefer 4K / 1080p',
      auto4kDesc: 'Capture the highest video stream available with maximum bitrate and audio quality.',
      previewTitle: 'Live Preview: How Extension Works on Webpages',
      previewBadge: 'Interactive Demo',
      previewFloatingBtn: 'Download via VideoBot',
      previewCaption: '⚡ This interactive floating button appears automatically over videos for one-click downloading without copying links.',
      bookmarkletTitle: 'Quick Alternative: Bookmarklet',
      bookmarkletBadge: 'Works on All Devices',
      bookmarkletDesc: 'If you prefer not to install an extension, drag this button to your Bookmarks Bar, then click it on any page to extract:',
      bookmarkletDragText: '⚡ Drag to Bookmarks Bar: [ VideoBot Extract ]',
      copyCodeBtn: 'Copy Bookmarklet Code',
      copiedCodeBtn: 'Copied!',
    },
    toasts: {
      langChangedTitle: 'Language Changed',
      langChangedDesc: 'Interface language successfully switched to English.',
      linkCopiedTitle: 'Link Copied',
      linkCopiedDesc: 'Direct video link copied to clipboard successfully.',
      sortChangedTitle: 'List Sorting',
      sortNewestDesc: 'Sorted by newest first ⬇',
      sortOldestDesc: 'Sorted by oldest first ⬆',
      fastModeOnTitle: '⚡ Fast Download Mode Activated',
      fastModeOnDesc: 'Format selection skipped! Highest resolution (1080p/4K) will be auto-downloaded for every video.',
      fastModeOffTitle: 'Fast Download Mode Deactivated',
      fastModeOffDesc: 'You can now manually choose format and quality for each video.',
      autoDownloadOnTitle: 'Auto-Download Enabled',
      autoDownloadOnDesc: 'Videos will start downloading immediately upon link processing.',
      autoDownloadOffTitle: 'Auto-Download Disabled',
      autoDownloadOffDesc: 'Auto-download has been turned off.',
      defaultQualityUpdated: 'Default Format Updated',
      defaultQualityDesc: 'Preferred default format updated successfully.',
      extractSuccessTitle: 'Link Extracted Successfully! ✨',
      extractSuccessDesc: 'Video link is prepared and ready for direct download.',
      extractFastSuccessTitle: '⚡ Fast Mode: Download Ready!',
      extractFastSuccessDesc: 'Extracted at highest resolution and starting download immediately...',
      extractErrorTitle: 'Failed to Extract Link',
      downloadStartTitle: 'Download Started',
      downloadStartDesc: 'Preparing and downloading video file...',
      downloadDoneTitle: 'Download Completed! 🎉',
      downloadDoneDesc: 'File has been saved to your device successfully.',
      bulkDownloadStartTitle: 'Bulk Download Started',
      bulkDownloadStartDesc: 'Starting bulk download for {count} selected files...',
      bulkDownloadProgressDesc: 'Downloading ({current}/{total}): {name}',
      bulkDownloadCompleteTitle: 'Bulk Download Finished! 🎉',
      bulkDownloadCompleteDesc: 'All {count} files have been queued for download successfully.',
      itemsDeletedTitle: 'Items Removed',
      itemsDeletedDesc: 'Removed {count} items from recent activity.',
      itemsCompletedTitle: 'Updated',
      itemsCompletedDesc: 'Marked {count} items as completed.',
    },
    map: {
      title: 'Global Download Server Network & CDN Nodes',
      subtitle: 'Interactive map powered by Google Maps Platform displaying media extraction and CDN distribution mirror nodes.',
      badge: 'Google Maps Platform',
      selectServer: 'Connect to this CDN Server',
      selectedServer: 'Currently Connected Node',
      connected: 'Connected',
      ping: 'Latency (Ping)',
      bandwidth: 'Bandwidth',
      activeLoad: 'Current Load',
      serverModalTitle: 'Download Server Node',
      serverModalDesc: 'Ultra-fast media extraction & proxy server',
      statusOnline: 'Operational & Optimal (99.99%)',
      openMap: 'Open Interactive Map',
      closeMap: 'Close Map',
      viewInMap: 'View on Map',
      pingTest: 'Ping Test ⚡',
      testingPing: 'Pinging...',
      optimalServer: 'Fastest & nearest node for your region',
      googleMapsAttribution: 'Interactive map built with Google Maps Platform & Advanced Markers',
      regions: {
        all: 'All Servers (Global)',
        middleEast: 'Middle East (Dubai)',
        europe: 'Europe (Frankfurt / London)',
        northAmerica: 'North America (Virginia)',
        asiaPacific: 'Asia-Pacific (Tokyo / Singapore)',
      },
    },
    firebase: {
      cloudSync: 'Cloud Sync (Firebase)',
      cloudConnected: 'Firebase Cloud Connected',
      cloudConnecting: 'Connecting to Cloud...',
      guestUser: 'Protected Guest Session',
      signInGoogle: 'Sign in with Google',
      signOut: 'Sign Out',
      syncedJustNow: 'Synchronized with Firebase Firestore',
      cloudSaved: 'Backed up to Cloud Firestore',
      autoBackup: 'Auto-sync downloads, reminders & preferences',
    },
    chat: {
      title: 'Google Chat Spaces & Direct Messages',
      subtitle: 'Share extracted videos and download links directly with teammates and channels across Google Chat.',
      badge: 'Google Workspace',
      signInPrompt: 'Sign in with your Google account to access your Google Chat spaces and rooms.',
      signInButton: 'Sign in with Google',
      signOut: 'Disconnect',
      connectedAs: 'Connected as',
      spacesTitle: 'Available Spaces & Rooms',
      noSpaces: 'No Spaces Found',
      noSpacesDesc: 'No Google Chat spaces found for your account. You can create a new space right here!',
      refreshSpaces: 'Refresh Spaces',
      createSpaceTitle: 'Create New Google Chat Space',
      spaceNamePlaceholder: 'New space name (e.g., Team Video Archive)',
      createSpaceBtn: 'Create Space',
      confirmCreateSpace: 'Confirm Space Creation',
      confirmCreateDesc: 'Are you sure you want to create a new space named "{name}" in your Google Chat account?',
      sendMessageTitle: 'Post Video Card to Space',
      shareVideoBtn: 'Share to Google Chat',
      selectSpace: 'Select destination space',
      messagePlaceholder: 'Add an optional note or comment...',
      sendBtn: 'Send Message to Google Chat',
      sending: 'Sending...',
      confirmSendTitle: 'Confirm Google Chat Message',
      confirmSendDesc: 'Are you sure you want to send this video card to space "{spaceName}" on your behalf?',
      cancel: 'Cancel',
      confirm: 'Confirm & Send',
      sentSuccessTitle: 'Message Sent! 🚀',
      sentSuccessDesc: 'Video card has been posted to your Google Chat space.',
      createSuccessTitle: 'Space Created! ✨',
      createSuccessDesc: 'Your new Google Chat space is ready for messages and video links.',
      errorTitle: 'Operation Failed',
      recentMessages: 'Recent Messages in Space',
      noMessages: 'No messages yet in this space.',
      spaceTypeRoom: 'Group Space',
      spaceTypeDm: 'Direct Message',
      spaceTypeGroup: 'Group Chat',
    },
    presentation: {
      title: 'Video Presentation Reel',
      subtitle: 'Generate a short promotional video teaser of your content with Veo styling to share across social platforms',
      generateBtn: 'Generate Video Presentation',
      generating: 'Generating Presentation Video...',
      generatingDesc: 'Rendering visual teaser frames, cinematic typography, and promotional effects in high definition',
      promoBadge: 'Veo Promo Showcase',
      readyTitle: 'Promo Presentation Ready!',
      shareBtn: 'Share Presentation Directly',
      downloadPromoBtn: 'Download Promo Video',
      regenerateBtn: 'Regenerate',
      aspectRatio: 'Aspect Ratio:',
      portraitStory: 'Portrait 9:16 (Stories/Reels/TikTok)',
      landscapeFeed: 'Landscape 16:9 (YouTube/X/Web)',
      styleModern: 'Modern & Clean',
      styleCinematic: 'Cinematic Elegance',
      styleDynamic: 'High Energy & Bold',
      shareModalTitle: 'Share Promo Presentation to Social Media',
      shareText: 'Check out this awesome promotional presentation clip!',
      shareCopied: 'Presentation promo link copied to clipboard!',
      veoPowered: 'Powered by Veo Video Technology',
    },
    shortcuts: {
      modalTitle: 'Keyboard Shortcuts',
      modalSubtitle: 'Navigate and operate the downloader at lightning speed with handy hotkeys',
      navButton: 'Shortcuts',
      badge: 'Fast & Efficient',
      searchPlaceholder: 'Search shortcut...',
      categoryActions: 'Actions & Download',
      categorySearch: 'Search & History',
      categorySettings: 'Preferences & Settings',
      categoryGeneral: 'Windows & General',
      downloadAction: 'Extract & Download Now',
      downloadActionDesc: 'Instantly begins downloading the entered link without clicking',
      historyAction: 'Search URL History',
      historyActionDesc: 'Opens the history dropdown with auto-focused search filter',
      settingsAction: 'Open Settings Panel',
      settingsActionDesc: 'Quick access to quality preferences, reminders, and extension',
      languageAction: 'Toggle Interface Language',
      languageActionDesc: 'Instantly toggle between Arabic and English languages',
      fastModeAction: 'Toggle Fast Download Mode ⚡',
      fastModeActionDesc: 'Enable or disable automatic max quality download mode',
      helpAction: 'Show Shortcuts Cheat Sheet',
      helpActionDesc: 'Display this hotkey guide from anywhere in the app',
      closeAction: 'Close Active Modals',
      closeActionDesc: 'Dismiss any open dialog, modal, or dropdown',
      toastTriggered: 'Shortcut triggered:',
    },
  },
};
