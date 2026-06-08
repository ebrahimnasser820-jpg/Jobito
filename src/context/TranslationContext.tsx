import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { API_BASE_URL, getCommonHeaders } from '../services/api';

// --- TYPES & INTERFACES ---
export interface TranslationContextType {
  t: (
    key: string,
    fallbackOrOptions?: string | Record<string, string | number>,
    options?: Record<string, string | number>
  ) => string;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  isLoading: boolean;
  isRTL: boolean;
}

// --- CONTEXT ---
export const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State from LocalStorage
  const [language, setLanguageState] = useState<'ar' | 'en'>(() => {
    return (localStorage.getItem('jobito_language') as 'ar' | 'en') || 'en';
  });

  const [staticTranslations, setStaticTranslations] = useState<Record<string, string>>({});
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, string>>({});
  const [pendingQueue] = useState<Set<string>>(new Set());
  
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queueToFetchRef = useRef<Set<string>>(new Set());

  // 1.5 Sync Language preference to backend (fire-and-forget)
  const syncLanguageToBackend = useCallback((newLang: 'ar' | 'en') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('[TranslationContext.tsx] Syncing language to backend:', newLang);
      fetch(`${API_BASE_URL}/users/me/language`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420',
        },
        body: JSON.stringify({ language: newLang }),
      }).catch((err) => {
        console.warn('[TranslationContext.tsx] Async backend sync warning:', err);
      });
    } catch (e) {
      console.warn('[TranslationContext.tsx] Backend sync failed synchronously:', e);
    }
  }, []);

  // On mount, try to get the language from the backend profile
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'ngrok-skip-browser-warning': '69420',
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.languagePreference && ['ar', 'en'].includes(data.languagePreference)) {
          setLanguageState(data.languagePreference);
        }
      })
      .catch(() => {
        // Use localStorage value as fallback
      });
  }, []);

  // 2. Language Switch Side Effects
  const applyLanguageProps = useCallback((lang: 'ar' | 'en') => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-lang', lang);
    localStorage.setItem('jobito_language', lang);
  }, []);

  useEffect(() => {
    applyLanguageProps(language);
  }, [language, applyLanguageProps]);

  // 3. Fetch Static Data from API
  useEffect(() => {
    const fetchStaticTranslations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/translations?lang=${language}`, {
          headers: getCommonHeaders(),
        });
        if (response.ok) {
          const data = await response.json();
        
        // Add hardcoded fallbacks for stubborn strings
        const fallbacks: Record<string, string> = {
          'Company Review': 'مراجعة الشركة',
          'Verification & Approvals': 'طلبات التوثيق والاعتماد',
          'Operations Revenue': 'إيرادات العمليات',
          'Operations Monitor': 'مراقب العمليات',
          'Technical Support': 'الدعم الفني',
          'Total Revenue': 'إجمالي الإيرادات',
          'Operations Manager Activity': 'نشاط مدير العمليات',
          'Criminal Records Review': 'مراجعة السجلات الجنائية',
          'One-time': 'خدمة سريعة',
          'One Time': 'خدمة سريعة',
          'Full Time': 'دوام كامل',
          'Part Time': 'دوام جزئي',
          'Freelance': 'عمل حر',
          'Internship': 'تدريب',
          'Remote': 'عن بعد',
          'Tradesman': 'صنايعي',
          'Technical': 'تقني',
          'Non-Technical': 'غير تقني',
          'Activity Breakdown': 'تحليل النشاط',
          'Hourly Activity (Last 24h)': 'معدل النشاط (آخر 24 ساعة)',
          'No chart data available yet': 'لا توجد بيانات للرسم البياني بعد',
          'Login Activity': 'نشاط تسجيل الدخول',
          'User Actions': 'إجراءات المستخدمين',
          'Company Actions': 'إجراءات الشركات',
          'Admin Actions': 'إجراءات المشرفين',
          'Content Actions': 'إجراءات المحتوى',
          'System Events': 'أحداث النظام',
          'Live': 'مباشر',
          'Login Sessions': 'جلسات الدخول',
          'From current activity log': 'من سجل النشاط الحالي',
          'User Events': 'أحداث المستخدمين',
          'Warn, suspend, ban actions': 'عمليات التحذير، الإيقاف، والحظر',
          'Company Events': 'أحداث الشركات',
          'Review & approval actions': 'عمليات المراجعة والموافقات',
          'Registration, verification, resets': 'التسجيل، التفعيل، وإعادة التعيين',
          'Security Alerts': 'التنبيهات الأمنية',
          'Bans, suspensions, failed logins': 'الحظر، الإيقاف، والدخول الفاشل',
          'System Activity Log': 'سجل نشاط النظام',
          'All Entities': 'جميع الكيانات',
          'Users': 'المستخدمين',
          'Companies': 'الشركات',
          'Admins': 'المشرفين',
          'Content': 'المحتوى',
          'System': 'النظام',
          'Search activity...': 'بحث في الأنشطة...',
          'Admin': 'المشرف',
          'Description': 'الوصف',
          'Target': 'الهدف',
          'Action': 'الإجراء',
          'Time': 'الوقت',
          'Loading activity data...': 'جاري تحميل سجل النشاط...',
          'No activity records found': 'لم يتم العثور على سجلات نشاط',
          'Page': 'صفحة',
          'total': 'إجمالي',
          'Just now': 'الآن',
          'm ago': ' دقيقة',
          'h ago': ' ساعة',
          'd ago': ' يوم',
          'Company Registration Requests': 'طلبات تسجيل الشركات',
          'Criminal Record Reviews': 'مراجعات السجل الجنائي',
          'Tradesmen': 'الحرفيين',
          'Applicant': 'المتقدم',
          'Submission Date': 'تاريخ التقديم',
          'Commercial Registration Review': 'مراجعة السجل التجاري',
          'Commercial Register': 'السجل التجاري',
          'Tax Register': 'البطاقة الضريبية',
          'Criminal Record Document': 'مستند الفيش والتشبيه',
          'View Document': 'عرض المستند',
          'No document uploaded': 'لم يتم رفع مستند',
          'Tax ID': 'الرقم الضريبي',
          'License Number': 'رقم الترخيص',
          'National ID': 'الرقم القومي',
          'Address': 'العنوان',
          'Classification': 'التصنيف',
          'Pending review': 'قيد الانتظار',
          'Reviewed by Super Admin': 'تمت المراجعة بواسطة المسؤول',
          'System Requests': 'طلبات النظام',
          'Review and manage assistant addition requests from Operations Managers': 'مراجعة وإدارة طلبات إضافة المساعدين من مدراء العمليات',
          'Requested by': 'مقدم الطلب',
          'No requests yet': 'لا توجد طلبات بعد',
          'No system requests have been submitted by Operations Managers': 'لم يتم تقديم أي طلبات نظام بواسطة مدراء العمليات بعد',
          'Request approved successfully': 'تمت الموافقة على الطلب بنجاح',
          'Request rejected': 'تم رفض الطلب',
          'Add Assistant': 'إضافة مساعد',
          'Read more': 'اقرأ المزيد',
          'Read more →': 'اقرأ المزيد →'
        };

        const enFallbacks: Record<string, string> = {
          'جد وظيفة أحلامك': 'Find your dream job',
          'جد وظيفة أحلامك في': 'Find your dream job in',
          'Jobito': 'Jobito',
          'نربط المحترفين الموهوبين بأفضل الفرص في الشرق الأوسط.': 'We connect talented professionals with the best opportunities in the Middle East.',
          'سوق لمهاراتك وتواصل مع العملاء الذين يبحثون عن خبراتك.': 'Market your skills and connect with clients looking for your expertise.',
          'احصل عليه من Google Play': 'Get it from Google Play',
          'مسمى الوظيفة أو الكلمة الرئيسية...': 'Job title or keyword...',
          'ما هي الخدمة التي تستطيع تقديمها؟ (سباكة، نجارة...)': 'What service can you provide? (Plumbing, carpentry...)',
          'المؤسسة التعليمية': 'Educational Institution',
          'طلبات التقديم': 'My Applications',
          'حذف الحساب': 'Delete Account',
          'حسابك مجدول للحذف. يمكنك إلغاء هذا الإجراء قبل انتهاء المدة.': 'Your account is scheduled for deletion. You can cancel this action before the period ends.',
          'بمجرد طلب الحذف، سيتم حذف حسابك نهائياً بعد يومين.': 'Once deletion is requested, your account will be permanently deleted after 2 days.',
          'جاري حذف الحساب': 'Account deletion in progress',
          'يوم متبقي': 'days remaining',
          'جاري الإلغاء...': 'Cancelling...',
          'إلغاء حذف الحساب': 'Cancel Account Deletion',
          'حذف حسابي': 'Delete My Account',
          'هل أنت متأكد؟ سيتم حذف حسابك نهائياً بعد يومين.': 'Are you sure? Your account will be permanently deleted after 2 days.',
          'مرحباً بك في Jobito': 'Welcome to Jobito',
          'مرحباً بك في Jobito - تمكين رحلتك المهنية': 'Welcome to Jobito - Empowering your career journey',
          'Jobito هي منصة عالمية مصممة لربط المواهب الاستثنائية بالمنظمات الرائدة في جميع أنحاء العالم. مسارك نحو مسيرة مهنية أفضل يبدأ هنا، مدعوماً بتجربة بحث عن عمل ذكية وفعالة.': 'Jobito is a global platform designed to connect exceptional talent with leading organizations worldwide. Your path to a better career starts here, supported by a smart and efficient job search experience.',
          'البحث والفلترة عن الوظائف': 'Job Search and Filtering',
          'اكتشف دورك القادم باستخدام فلاتر قوية للموقع ونطاقات الرواتب والتقنيات المحددة.': 'Discover your next role using powerful filters for location, salary ranges, and specific technologies.',
          'الاستشارات المهنية': 'Professional consulting',
          'توجيهات خبيرة حول مفاوضات الرواتب، وتخطيط المسار المهني، والنجاح في الانتقالات الوظيفية.': 'Expert guidance on salary negotiations, career planning, and successful career transitions.',
          'رؤى سوق الشركات': 'Corporate market insights',
          'وصول إلى بيانات حول ثقافة الشركات، ومعايير الرواتب، واتجاهات التوظيف في قطاعك المستهدف.': 'Access data about corporate culture, salary standards, and hiring trends in your target industry.',
          'شارات مهارات معتمدة': 'Certified skills badges',
          'قم بإجراء تقييمات للتحقق من مهاراتك التقنية والتميز أمام مسؤولي التوظيف بشارات معتمدة.': 'Perform assessments to verify your technical skills and stand out to recruiters with certified badges.',
          'ماذا نقدم': 'What we offer',
          'الخدمات': 'Services',
          'التي نوفرها': 'We provide',
          'اقرأ المزيد': 'Read more',
          'في Jobito، نؤمن بأن العثور على وظيفة يجب أن يكون ممتعاً بقدر البدء فيها. لقد بنينا منصة تزيل العقبات من عملية التوظيف، مما يسهل على المرشحين التألق وعلى الشركات العثور على نجومهم القادمين.': 'At Jobito, we believe that finding a job should be as enjoyable as starting it. We built a platform that removes the hurdles from the hiring process, making it easier for candidates to shine and for companies to find their next stars.',
          'فريق Jobito': 'Team Jobito',
          'خبراء الابتكار': 'Innovation experts',
          'سواء كنت تبحث عن وظيفتك الأولى أو منصب تنفيذي رفيع، يوفر Jobito التوجيه والدعم اللازمين للتنقل في سوق العمل التنافسي بنجاح.': 'Whether you are looking for your first job or a high executive position, Jobito provides the guidance and support needed to successfully navigate the competitive job market.',
          'انضم لآلاف المحترفين الذين يجدون وظائف أحلامهم يومياً على Jobito.': 'Join thousands of professionals who find their dream jobs daily on Jobito.',
          'نحن نجمع بين الخبرة والتكنولوجيا والاهتمام الحقيقي لتقديم حلول توظيف تحدث فرقاً ملموساً.': 'We combine expertise, technology, and genuine care to deliver hiring solutions that make a tangible difference.',
          'من بناء السيرة الذاتية بالذكاء الاصطناعي إلى التحضير للمقابلات، يوفر Jobito الأدوات التي تحتاجها للتميز في مسيرتك المهنية.': 'From AI-powered resume building to interview preparation, Jobito provides the tools you need to excel in your career.',
          'Jobito هي منصتك المتكاملة لاكتشاف أفضل فرص العمل والتواصل مع كبرى الشركات الرائدة. نحن هنا لتمكين طموحك المهني ومساعدتك في بناء المستقبل الذي تستحقه.': 'Jobito is your all-in-one platform to discover the best job opportunities and connect with top leading companies. We are here to empower your professional ambition and help you build the future you deserve.',
          'ابحث عن وظائف الآن': 'Search for jobs now',
          'لأصحاب العمل': 'For Employers',
          'عن المنصة والمساعدة': 'About Platform & Help',
          'تصفح الوظائف': 'Browse Jobs',
          'البحث عن مرشحين': 'Search for Candidates',
          'إدارة المتقدمين': 'Manage Applicants',
          'تواصل معنا': 'Contact Us',
          'جميع الحقوق محفوظة.': 'All rights reserved.',
          'إنشاء حساب جديد': 'Create a new account',
          'ابدأ رحلتك المهنية مع Jobito': 'Start your professional journey with Jobito',
          'إنشاء حساب': 'Create Account',
          'أضف روابط حسابات الشركة على منصات التواصل.': 'Add your company\'s social media account links.',
          'إعدادات الشركة': 'Company Settings',
          'إعدادات الملف الشخصي': 'Profile Settings',
          'نظرة عامة': 'Overview',
          'نظرة عامة على الأداء': 'Performance Overview',
          'نظرة عامة على المراحل': 'Stages Overview',
          'اسم الشركة': 'Company Name',
          'الموظفين': 'Employees',
          'تاريخ التأسيس': 'Founded',
          'الموقع (العنوان)': 'Location (Address)',
          'أضف المزايا التي توفرها شركتك للموظفين.': 'Add the benefits your company provides to employees.',
          'تعديل الملف الشخصي': 'Edit Profile',
          'الملف الشخصي': 'Profile',
          'بيانات الدخول': 'Login Details',
          'الإشعارات': 'Notifications',
          'المعلومات الأساسية': 'Basic Information',
          'هذه معلوماتك الشخصية التي يمكنك تحديثها في أي وقت.': 'These are your personal details that you can update at any time.',
          'صورة الغلاف': 'Cover Photo',
          'تُعرض هذه الصورة في خلفية ملفك الشخصي.': 'This image is displayed in the background of your profile.',
          'انقر لرفع صورة غلاف': 'Click to upload cover photo',
          'تغيير الصورة': 'Change Photo',
          'صورة الملف الشخصي': 'Profile Picture',
          'تُعرض هذه الصورة للعامة وتساعد أصحاب العمل في التعرف عليك.': 'This photo is displayed publicly and helps employers identify you.',
          'انقر للاستبدال': 'Click to replace',
          'أو سحب وإفلات': 'or drag and drop',
          'التفاصيل الشخصية': 'Personal Details',
          'الاسم الكامل': 'Full Name',
          'رقم الهاتف': 'Phone Number',
          'البريد الإلكتروني': 'Email',
          'تاريخ الميلاد': 'Date of Birth',
          'النوع': 'Gender',
          'اختر...': 'Select...',
          'ذكر': 'Male',
          'أنثى': 'Female',
          'المحافظة': 'Governorate',
          'اختر المحافظة...': 'Select Governorate...',
          'نبذة عني': 'About Me',
          'صف مهاراتك وخبراتك باختصار.': 'Describe your skills and experience briefly.',
          'أضف نبذة عن نفسك...': 'Add a bio...',
          'الخبرات': 'Experience',
          'أضف خبراتك العملية السابقة.': 'Add your previous work experience.',
          'خبرة': 'Experience',
          'حذف': 'Delete',
          'المسمى الوظيفي': 'Job Title',
          'المدة': 'Duration',
          'مثل: يناير 2020 - مارس 2023': 'e.g., January 2020 - March 2023',
          'الموقع': 'Location',
          'الوصف': 'Description',
          'إضافة خبرة جديدة': 'Add new experience',
          'التعليم': 'Education',
          'أضف المؤسسات التعليمية التي درست بها والدرجات العلمية التي حصلت عليها.': 'Add the educational institutions you attended and degrees earned.',
          'تعليم': 'Education',
          'المدرسة / الجامعة': 'School / University',
          'الدرجة العلمية': 'Degree',
          'الفترة': 'Period',
          'أمان الحساب': 'Account Security',
          'قم بتحديث كلمة المرور الخاصة بك بانتظام للحفاظ على أمان حسابك.': 'Update your password regularly to keep your account secure.',
          'كلمة المرور الحالية': 'Current Password',
          'إخفاء': 'Hide',
          'إظهار': 'Show',
          'كلمة المرور الجديدة': 'New Password',
          'تأكيد كلمة المرور': 'Confirm Password',
          'إعدادات الإشعارات': 'Notification Settings',
          'اختر كيف ومتى تود استلام الإشعارات منا.': 'Choose how and when you want to receive notifications from us.',
          'إشعارات البريد الإلكتروني': 'Email Notifications',
          'استلم ملخصاً أسبوعياً للوظائف والمقالات': 'Receive a weekly summary of jobs and articles',
          'تنبيهات الوظائف': 'Job Alerts',
          'عند نشر وظيفة جديدة تناسب مهاراتك': 'When a new job matching your skills is posted',
          'تحديثات الطلبات': 'Application Updates',
          'عند تغيير حالة طلبات التوظيف الخاصة بك': 'When the status of your job applications changes',
          'جاري الحفظ...': 'Saving...',
          'حفظ الملف الشخصي': 'Save Profile',
        };

        if (language === 'ar') {
          setStaticTranslations({ ...data, ...fallbacks });
        } else {
          setStaticTranslations({ ...data, ...enFallbacks });
        }
        }
      } catch (err) {
        console.warn('[Translation API]: Using fallback values.', err);
      }
    };
    fetchStaticTranslations();
  }, [language]);

  const setLanguage = useCallback((lang: 'ar' | 'en') => {
    console.log('[TranslationContext.tsx] setLanguage called with:', lang);
    setLanguageState(lang);
    try {
      syncLanguageToBackend(lang);
    } catch (e) {
      console.error('[TranslationContext.tsx] Failed to sync language to backend:', e);
    }
  }, [syncLanguageToBackend]);

  // 4. Batch Processing for on-demand translations
  const processBatch = useCallback(async () => {
    if (queueToFetchRef.current.size === 0) return;

    const textsToTranslate = Array.from(queueToFetchRef.current);
    queueToFetchRef.current.clear();

    try {
      const response = await fetch(`${API_BASE_URL}/translations/batch`, {
        method: 'POST',
        headers: getCommonHeaders({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
          texts: textsToTranslate,
          target_lang: language,
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        console.error('[Translation Batch API Error]:', data);
        textsToTranslate.forEach(text => pendingQueue.delete(`${language}:${text}`));
        return;
      }
      
      if (data.translated_texts) {
        setDynamicTranslations(prev => {
          const newMap = { ...prev };
          textsToTranslate.forEach((text, index) => {
            const cacheKey = `${language}:${text}`;
            newMap[cacheKey] = data.translated_texts[index];
            pendingQueue.delete(cacheKey);
          });
          console.log("[DEBUG processBatch] new dynamicTranslations map:", newMap);
          return newMap;
        });
      }
    } catch (err) {
      console.error('[Translation Batch Network Error]:', err);
      textsToTranslate.forEach(text => pendingQueue.delete(`${language}:${text}`));
    }
  }, [language, pendingQueue]);

  const queueTranslation = useCallback((text: string) => {
    const cacheKey = `${language}:${text}`;
    if (pendingQueue.has(cacheKey) || dynamicTranslations[cacheKey]) return;

    pendingQueue.add(cacheKey);
    queueToFetchRef.current.add(text);

    if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);
    batchTimeoutRef.current = setTimeout(() => {
      processBatch();
    }, 100); 
  }, [language, dynamicTranslations, pendingQueue, processBatch]);

  // 5. Main 't' function
  const t = useCallback(
    (
      key: string,
      fallbackOrOptions?: string | Record<string, string | number>,
      options?: Record<string, string | number>
    ): string => {
      if (typeof key !== 'string') {
        if (Array.isArray(key)) {
          key = key[0] || '';
        } else if (key && typeof key === 'object') {
          key = (key as any).name || (key as any).title || String(key);
        } else {
          key = String(key || '');
        }
      }
      if (!key) return '';

      // Hardcoded high-priority overrides for stubborn strings in both Arabic and English
      if (language === 'en') {
        const englishOverrides: Record<string, string> = {
          'الحرفي': 'Tradesman',
          'التبديل إلى الوضع الحرفي': 'Switch to tradesman mode',
          'العودة إلى باحث عن عمل': 'Return to job seeker',
          'باحث عن عمل': 'Job Seeker',
          'الوضع الحالي:': 'Current Mode:',
          'جاري التبديل...': 'Switching...',
          'تم تفعيل الوضع الحرفي بنجاح!': 'Tradesman mode activated successfully!',
          'المعلومات الأساسية': 'Basic Information',
          'تعديل الملف الشخصي': 'Edit Profile',
          'صورة الغلاف': 'Cover Photo',
          'صورة الملف الشخصي': 'Profile Picture',
          'تُعرض هذه الصورة للعامة وتساعد أصحاب العمل في التعرف عليك.': 'This picture is displayed publicly and helps employers identify you.',
          'تاريخ الميلاد': 'Date of Birth',
          'أضف خبراتك العملية السابقة.': 'Add your previous work experiences.',
          'أضف المؤسسات التعليمية التي درست بها والدرجات العلمية التي حصلت عليها.': 'Add the educational institutions you studied at and the degrees you obtained.',
          'المدرسة / الجامعة': 'School / University',
          'الموقع': 'Location',
          'الدرجة العلمية': 'Degree',
          'المهارات واللغات': 'Skills and Languages',
          'أضف روابط حساباتك على منصات التواصل الاجتماعي.': 'Add links to your social media accounts.',
          'الخدمات': 'Services',
          'اختر الخدمات التي تقدمها للعملاء.': 'Choose the services you provide to clients.',
          'أضف خدمة واضغط Enter أو زر الـ +': 'Add a service and press Enter or the + button.',
          'أضف خدمة / وظيفة': 'Add a Service / Job',
          'المعرض': 'Portfolio / Exhibition',
          'أضف صور أعمالك ومشاريعك السابقة لعرضها في ملفك الشخصي.': 'Add photos of your previous work and projects to display in your profile.',
          'إضافة صورة': 'Add Photo',
          'تغيير الصورة': 'Change Photo',
          'انقر لرفع صورة غلاف': 'Click to upload a cover photo',
          'انقر للاستبدال': 'Click to replace',
          'أو سحب وإفلات': 'or drag and drop',
          'نبذة عني': 'About Me',
          'أضف نبذة عن نفسك...': 'Add a bio about yourself...',
          'المهارات': 'Skills',
          'أضف مهارة واضغط Enter أو زر الـ +': 'Add a skill and press Enter or the + button.',
          'روابط التواصل الاجتماعي': 'Social Links',
          'أضف رابط واضغط Enter أو زر الـ +': 'Add a link and press Enter or the + button.',
          'حذف': 'Delete',
          'بحث': 'Search',
          'أي مكان': 'Anywhere',
          'القاهرة، مصر': 'Cairo, Egypt',
          'الإسكندرية، مصر': 'Alexandria, Egypt',
          'جد وظيفة': 'Find a job',
          'أحلامك': 'Your dreams',
          'اليوم': 'Today',
          'اعرض خدماتك': 'Offer your services',
          'لعملائك': 'To your clients',
          'بسهولة': 'Easily',
          'جد وظيفة أحلامك': 'Find your dream job',
          'جد وظيفة أحلامك في': 'Find your dream job in',
          'Jobito': 'Jobito',
          'نربط المحترفين الموهوبين بأفضل الفرص في الشرق الأوسط.': 'We connect talented professionals with the best opportunities in the Middle East.',
          'سوق لمهاراتك وتواصل مع العملاء الذين يبحثون عن خبراتك.': 'Market your skills and connect with clients looking for your expertise.',
          'احصل عليه من Google Play': 'Get it from Google Play',
          'مسمى الوظيفة أو الكلمة الرئيسية...': 'Job title or keyword...',
          'ما هي الخدمة التي تستطيع تقديمها؟ (سباكة، نجارة...)': 'What service can you provide? (Plumbing, carpentry...)',
          'المؤسسة التعليمية': 'Educational Institution',
          'طلبات التقديم': 'My Applications',
          'حذف الحساب': 'Delete Account',
          'حسابك مجدول للحذف. يمكنك إلغاء هذا الإجراء قبل انتهاء المدة.': 'Your account is scheduled for deletion. You can cancel this action before the period ends.',
          'بمجرد طلب الحذف، سيتم حذف حسابك نهائياً بعد يومين.': 'Once deletion is requested, your account will be permanently deleted after 2 days.',
          'جاري حذف الحساب': 'Account deletion in progress',
          'يوم متبقي': 'days remaining',
          'جاري الإلغاء...': 'Cancelling...',
          'إلغاء حذف الحساب': 'Cancel Account Deletion',
          'حذف حسابي': 'Delete My Account',
          'هل أنت متأكد؟ سيتم حذف حسابك نهائياً بعد يومين.': 'Are you sure? Your account will be permanently deleted after 2 days.',
          'جاري المعالجة...': 'Processing...',
          'نعم، احذف حسابي': 'Yes, delete my account',
          'إلغاء': 'Cancel',
          'البحث والفلترة عن الوظائف': 'Job Search and Filtering',
          'اكتشف دورك القادم باستخدام فلاتر قوية للموقع ونطاقات الرواتب والتقنيات المحددة.': 'Discover your next role using powerful filters for location, salary ranges, and specific technologies.',
          'الاستشارات المهنية': 'Professional consulting',
          'توجيهات خبيرة حول مفاوضات الرواتب، وتخطيط المسار المهني، والنجاح في الانتقالات الوظيفية.': 'Expert guidance on salary negotiations, career planning, and successful career transitions.',
          'رؤى سوق الشركات': 'Corporate market insights',
          'وصول إلى بيانات حول ثقافة الشركات، ومعايير الرواتب، واتجاهات التوظيف في قطاعك المستهدف.': 'Access data about corporate culture, salary standards, and hiring trends in your target industry.',
          'شارات مهارات معتمدة': 'Certified skills badges',
          'قم بإجراء تقييمات للتحقق من مهاراتك التقنية والتميز أمام مسؤولي التوظيف بشارات معتمدة.': 'Perform assessments to verify your technical skills and stand out to recruiters with certified badges.',
          'ماذا نقدم': 'What we offer',
          'الخدمات': 'Services',
          'التي نوفرها': 'We provide',
          'مرحباً بك في Jobito': 'Welcome to Jobito',
          'تمكين رحلتك المهنية': 'Empowering Your Professional Journey',
          'Jobito هي منصة عالمية مصممة لربط المواهب الاستثنائية بالمنظمات الرائدة في جميع أنحاء العالم. مسارك نحو مسيرة مهنية أفضل يبدأ هنا، مدعوماً بتجربة بحث عن عمل ذكية وفعالة.': 'Jobito is a global platform designed to connect exceptional talent with leading organizations worldwide. Your path to a better career begins here, supported by an intelligent and efficient job search experience.',
          'في Jobito، نؤمن بأن العثور على وظيفة يجب أن يكون ممتعاً بقدر البدء فيها. لقد بنينا منصة تزيل العقبات من عملية التوظيف، مما يسهل على المرشحين التألق وعلى الشركات العثور على نجومهم القادمين.': 'At Jobito, we believe that finding a job should be as enjoyable as starting it. We built a platform that removes the hurdles from the hiring process, making it easier for candidates to shine and for companies to find their next stars.',
          'فريق Jobito': 'Team Jobito',
          'خبراء الابتكار': 'Innovation experts',
          'سواء كنت تبحث عن وظيفتك الأولى أو منصب تنفيذي رفيع، يوفر Jobito التوجيه والدعم اللازمين للتنقل في سوق العمل التنافسي بنجاح.': 'Whether you are looking for your first job or a high executive position, Jobito provides the guidance and support needed to successfully navigate the competitive job market.',
          'انضم لآلاف المحترفين الذين يجدون وظائف أحلامهم يومياً على Jobito.': 'Join thousands of professionals who find their dream jobs daily on Jobito.',
          'نحن نجمع بين الخبرة والتكنولوجيا والاهتمام الحقيقي لتقديم حلول توظيف تحدث فرقاً ملموساً.': 'We combine expertise, technology, and genuine care to deliver hiring solutions that make a tangible difference.',
          'من بناء السيرة الذاتية بالذكاء الاصطناعي إلى التحضير للمقابلات، يوفر Jobito الأدوات التي تحتاجها للتميز في مسيرتك المهنية.': 'From AI-powered resume building to interview preparation, Jobito provides the tools you need to excel in your career.',
          'Jobito هي منصتك المتكاملة لاكتشاف أفضل فرص العمل والتواصل مع كبرى الشركات الرائدة. نحن هنا لتمكين طموحك المهني ومساعدتك في بناء المستقبل الذي تستحقه.': 'Jobito is your all-in-one platform to discover the best job opportunities and connect with top leading companies. We are here to empower your professional ambition and help you build the future you deserve.',
          'ابحث عن وظائف الآن': 'Search for jobs now',
          'لأصحاب العمل': 'For Employers',
          'عن المنصة والمساعدة': 'About Platform & Help',
          'تصفح الوظائف': 'Browse Jobs',
          'البحث عن مرشحين': 'Search for Candidates',
          'إدارة المتقدمين': 'Manage Applicants',
          'تواصل معنا': 'Contact Us',
          'جميع الحقوق محفوظة.': 'All rights reserved.',
          'USER_REGISTERED': 'User Registered',
          'USER_VERIFIED': 'User Verified',
          'FAILED_LOGIN': 'Failed Login',
          'LOGIN': 'Successful Login',
          'USER_LOGIN': 'User Login',
          'PASSWORD_RESET': 'Password Reset',
          'GOOGLE_LOGIN': 'Google Login',
          'MAINTENANCE_ENABLED': 'Maintenance Mode Enabled',
          'MAINTENANCE_DISABLED': 'Maintenance Mode Disabled',
          'MAINTENANCE_ENABLED_SYSTEM': 'Maintenance Mode Enabled',
          'MAINTENANCE_DISABLED_SYSTEM': 'Maintenance Mode Disabled',
          'WARN_USER': 'User Warned',
          'SUSPEND_USER': 'User Suspended',
          'BAN_USER': 'User Banned',
          'UNBAN_USER': 'User Unbanned',
          'UNSUSPEND_USER': 'User Unsuspended',
          'APPROVE_COMPANY': 'Company Approved',
          'REJECT_COMPANY': 'Company Rejected',
          'INVITE_ADMIN': 'Admin Invited',
          'MAINTENANCE': 'System Maintenance',
          'SYSTEM': 'System Event',
          'actions': 'actions',
          // Header additions
          'الرئيسية': 'Home',
          'التقييمات': 'Ratings',
          'الرسائل': 'Messages',
          'الملف الشخصي': 'Profile',
          'قائمة الوظائف': 'Job Listings',
          'تصفح الشركات': 'Browse Companies',
          'بحث عن وظائف': 'Find Jobs',
          'عن المنصة': 'About Us',
          'اتصل بنا': 'Contact Us',
          'لوحة التحكم': 'Dashboard',
          'البحث عن عمل': 'Find Jobs',
          'الدردشة': 'Chat',
          'الوظائف': 'Jobs',
          'لوحة الإدارة': 'Admin Panel',
          // Gender additions
          'النوع': 'Gender',
          'ذكر': 'Male',
          'أنثى': 'Female',
          'اختر...': 'Select...',
          // Company Ratings additions
          'التقييمات المستلمة': 'Received Ratings',
          'تقييم المقبولين': 'Rate Hired Applicants',
          'إدارة التقييمات التي تلقيتها وتقييم الأشخاص الذين وظفتهم': 'Manage received ratings and rate hired applicants',
          'تم التوظيف': 'Hired on',
          'أضف تعليقاً...': 'Add a comment...',
          'أضف تعليقاً': 'Add a comment',
          'الرجاء اختيار عدد النجوم أولاً': 'Please select a star rating first',
          'تم إرسال التقييم بنجاح': 'Rating submitted successfully',
          'حدث خطأ أثناء إرسال التقييم': 'Failed to submit rating',
          'حفظ التقييم': 'Submit Rating',
          'لا يوجد متقدمين مقبولين حالياً': 'No hired applicants currently',
          'لا توجد تقييمات مستلمة حتى الآن': 'No received ratings yet',
          'الوضع الفاتح': 'Light Mode',
          'الوضع الداكن': 'Dark Mode',
          'الوضع الحالي': 'Current Mode',
          'الوضع الحالي:': 'Current Mode:',
          'الوظائف المتاحة': 'Available Jobs',
          '1. ابحث عن تخصص': '1. Find a specialty',
          '2. قارن واختر': '2. Compare and choose',
          '3. تواصل فوراً': '3. Connect instantly',
          '4. قيّم تجربتك': '4. Rate your experience',
          '1. أنشئ حسابك المهني': '1. Create your professional account',
          '2. اعرض مهاراتك': '2. Showcase your skills',
          '3. تواصل مباشر': '3. Communicate directly',
          '4. ابنِ سمعتك وضاعف أرباحك': '4. Build your reputation and multiply your profits',
          'كيف تنجز أعمالك مع Jobito؟': 'How to get your work done with Jobito?',
          'خطوات بسيطة للوصول إلى أفضل المحترفين والشركات لإنجاز أعمالك بأعلى جودة': 'Simple steps to reach the best professionals and companies to get your work done with the highest quality',
          'تصفح آلاف الحرفيين والشركات في مختلف التخصصات والمجالات.': 'Browse thousands of tradesmen and companies in various specialties and fields.',
          'شاهد التقييمات والأعمال السابقة واختر الأنسب لاحتياجاتك وميزانيتك.': 'View ratings and previous work to choose the best fit for your needs and budget.',
          'تواصل مباشرة مع الحرفي أو الشركة عبر الهاتف أو الرسائل للاتفاق.': 'Communicate directly with the tradesman or company via phone or messages to agree.',
          'شارك تقييمك بعد انتهاء العمل لمساعدة الآخرين في اختيار الأفضل.': 'Share your review after the work is done to help others choose the best.',
          'كيف تنمي عملك مع Jobito؟': 'How to grow your business with Jobito?',
          'خطوات بسيطة وسريعة لتصل إلى آلاف العملاء وتبدأ في استقبال الطلبات مباشرة': 'Simple and fast steps to reach thousands of clients and start receiving requests directly',
          'سجل بياناتك، حدد مهنتك، واكتب خبراتك ليراك آلاف العملاء يومياً في منطقتك.': 'Register your details, specify your profession, and write your experience to be seen by thousands of clients daily in your area.',
          'ارفع صوراً لأعمالك السابقة وحدد مناطق خدمتك وأسعارك التقديرية لجذب العملاء.': 'Upload photos of your previous work and specify your service areas and estimated prices to attract clients.',
          'استقبل اتصالات ورسائل مباشرة من العملاء المهتمين بخدماتك دون أي وسيط أو عمولة.': 'Receive direct calls and messages from clients interested in your services without any broker or commission.',
          'احصل على تقييمات ممتازة من عملائك لتتصدر نتائج البحث وتضمن زيادة أرباحك وعملك باستمرار.': 'Get excellent ratings from your clients to top the search results and ensure your profits and business continuously increase.',
          'حرفي': 'Tradesman',
          'كحرفي': 'As a Tradesman'
        };
        if (englishOverrides[key]) return englishOverrides[key];
        const normalizedKey = key.toUpperCase().replace(/\s+/g, '_');
        if (englishOverrides[normalizedKey]) return englishOverrides[normalizedKey];
      } else if (language === 'ar') {
        const arabicOverrides: Record<string, string> = {
          'Search': 'بحث',
          'Anywhere': 'أي مكان',
          'USER_REGISTERED': 'تسجيل مستخدم جديد',
          'USER_VERIFIED': 'تفعيل حساب مستخدم',
          'FAILED_LOGIN': 'محاولة دخول فاشلة',
          'LOGIN': 'تسجيل دخول ناجح',
          'USER_LOGIN': 'تسجيل دخول مستخدم',
          'PASSWORD_RESET': 'إعادة تعيين كلمة المرور',
          'GOOGLE_LOGIN': 'دخول بواسطة جوجل',
          'MAINTENANCE_ENABLED': 'تفعيل وضع الصيانة',
          'MAINTENANCE_DISABLED': 'إيقاف وضع الصيانة',
          'MAINTENANCE_ENABLED_SYSTEM': 'تفعيل وضع الصيانة',
          'MAINTENANCE_DISABLED_SYSTEM': 'إيقاف وضع الصيانة',
          'WARN_USER': 'إرسال تحذير لمستخدم',
          'SUSPEND_USER': 'إيقاف حساب مستخدم',
          'BAN_USER': 'حظر مستخدم نهائياً',
          'UNBAN_USER': 'إلغاء حظر مستخدم',
          'UNSUSPEND_USER': 'إلغاء إيقاف مستخدم',
          'APPROVE_COMPANY': 'الموافقة على شركة',
          'REJECT_COMPANY': 'رفض تسجيل شركة',
          'INVITE_ADMIN': 'دعوة مشرف جديد',
          'MAINTENANCE': 'صيانة النظام',
          'SYSTEM': 'حدث نظام',
          'actions': 'إجراءات',
          'اليوم': 'اليوم',
          'Show all jobs': 'عرض كل الوظائف',
          '1. ابحث عن تخصص': '1. ابحث عن تخصص',
          '2. قارن واختر': '2. قارن واختر',
          '3. تواصل فوراً': '3. تواصل فوراً',
          '4. قيّم تجربتك': '4. قيّم تجربتك',
          '1. أنشئ حسابك المهني': '1. أنشئ حسابك المهني',
          '2. اعرض مهاراتك': '2. اعرض مهاراتك',
          '3. تواصل مباشر': '3. تواصل مباشر',
          '4. ابنِ سمعتك وضاعف أرباحك': '4. ابنِ سمعتك وضاعف أرباحك',
          'كيف تنجز أعمالك مع Jobito؟': 'كيف تنجز أعمالك مع Jobito؟',
          'خطوات بسيطة للوصول إلى أفضل المحترفين والشركات لإنجاز أعمالك بأعلى جودة': 'خطوات بسيطة للوصول إلى أفضل المحترفين والشركات لإنجاز أعمالك بأعلى جودة',
          'تصفح آلاف الحرفيين والشركات في مختلف التخصصات والمجالات.': 'تصفح آلاف الحرفيين والشركات في مختلف التخصصات والمجالات.',
          'شاهد التقييمات والأعمال السابقة واختر الأنسب لاحتياجاتك وميزانيتك.': 'شاهد التقييمات والأعمال السابقة واختر الأنسب لاحتياجاتك وميزانيتك.',
          'تواصل مباشرة مع الحرفي أو الشركة عبر الهاتف أو الرسائل للاتفاق.': 'تواصل مباشرة مع الحرفي أو الشركة عبر الهاتف أو الرسائل للاتفاق.',
          'شارك تقييمك بعد انتهاء العمل لمساعدة الآخرين في اختيار الأفضل.': 'شارك تقييمك بعد انتهاء العمل لمساعدة الآخرين في اختيار الأفضل.',
          'كيف تنمي عملك مع Jobito؟': 'كيف تنمي عملك مع Jobito؟',
          'خطوات بسيطة وسريعة لتصل إلى آلاف العملاء وتبدأ في استقبال الطلبات مباشرة': 'خطوات بسيطة وسريعة لتصل إلى آلاف العملاء وتبدأ في استقبال الطلبات مباشرة',
          'سجل بياناتك، حدد مهنتك، واكتب خبراتك ليراك آلاف العملاء يومياً في منطقتك.': 'سجل بياناتك، حدد مهنتك، واكتب خبراتك ليراك آلاف العملاء يومياً في منطقتك.',
          'ارفع صوراً لأعمالك السابقة وحدد مناطق خدمتك وأسعارك التقديرية لجذب العملاء.': 'ارفع صوراً لأعمالك السابقة وحدد مناطق خدمتك وأسعارك التقديرية لجذب العملاء.',
          'استقبل اتصالات ورسائل مباشرة من العملاء المهتمين بخدماتك دون أي وسيط أو عمولة.': 'استقبل اتصالات ورسائل مباشرة من العملاء المهتمين بخدماتك دون أي وسيط أو عمولة.',
          'احصل على تقييمات ممتازة من عملائك لتتصدر نتائج البحث وتضمن زيادة أرباحك وعملك باستمرار.': 'احصل على تقييمات ممتازة من عملائك لتتصدر نتائج البحث وتضمن زيادة أرباحك وعملك باستمرار.',
          'حرفي': 'حرفي',
          'كحرفي': 'كحرفي'
        };
        if (arabicOverrides[key]) return arabicOverrides[key];
        const normalizedKey = key.toUpperCase().replace(/\s+/g, '_');
        if (arabicOverrides[normalizedKey]) return arabicOverrides[normalizedKey];
      }

      // Determine fallback and options
      let fallbackText: string | undefined;
      let actualOptions: Record<string, string | number> | undefined;

      if (typeof fallbackOrOptions === 'string') {
        fallbackText = fallbackOrOptions;
        actualOptions = options;
      } else if (typeof fallbackOrOptions === 'object') {
        actualOptions = fallbackOrOptions;
      }

      // Priority 1: Static API translations (Postgres)
      let text = staticTranslations[key];

      // Priority 2: Dynamic translations cache (Redis/Python results)
      if (!text && dynamicTranslations[`${language}:${key}`]) {
        text = dynamicTranslations[`${language}:${key}`];
      }

      // Priority 3: Explicit Fallback (if provided and translation is missing)
      // Only use fallback if we are NOT in Arabic mode or if the key is NOT already Arabic
      if (!text && fallbackText) {
        const arabicCharCount = (key.match(/[\u0600-\u06FF]/g) || []).length;
        const englishCharCount = (key.match(/[a-zA-Z]/g) || []).length;
        const isMostlyArabicKey = arabicCharCount >= englishCharCount;

        if (language === 'ar') {
          text = isMostlyArabicKey ? key : fallbackText;
        } else {
          text = isMostlyArabicKey ? fallbackText : key;
        }
      }

      // If still no translation, use key itself
      if (!text) {
        text = key;
      }

      // Priority 4: Dynamic on-demand translation logic (only if not found in static/cache)
      if (typeof key === 'string' && !staticTranslations[key] && !dynamicTranslations[`${language}:${key}`]) {
        const isTranslationKey = /^[a-zA-Z0-9_\-]+(\.[a-zA-Z0-9_\-]+)+$/.test(key);
        if (!isTranslationKey) {
          const arabicCharCount = (key.match(/[\u0600-\u06FF]/g) || []).length;
          const englishCharCount = (key.match(/[a-zA-Z]/g) || []).length;
          
          const isMostlyArabic = arabicCharCount >= englishCharCount;
          
          const needsTranslation = (language === 'en' && isMostlyArabic) || (language === 'ar' && !isMostlyArabic);
          
          if (needsTranslation) {
            queueTranslation(key);
          }
        }
      }

      // Variable Replacement
      if (actualOptions && typeof text === 'string') {
        Object.entries(actualOptions).forEach(([k, v]) => {
          text = text?.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
        });
      }
      return text;
    },
    [language, staticTranslations, dynamicTranslations, queueTranslation]
  );

  const contextValue = React.useMemo(() => ({
    t,
    language,
    setLanguage,
    isLoading: false,
    isRTL: language === 'ar',
  }), [t, language, setLanguage]);

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
};

// --- HOOK ---
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
