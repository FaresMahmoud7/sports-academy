import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAcademyContent extends Document {
  key: string;
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    mediaUrl: string;
  };
  about: {
    introduction: string;
    vision: string;
    mission: string;
    story: string;
    imageUrl?: string;
    imageFit?: 'cover' | 'contain';
  };
  whyChooseUs: {
    icon: string;
    title: string;
    description: string;
  }[];
  statistics: {
    championsCount: number;
    tournamentsCount: number;
    yearsOfExperience: number;
    traineesCount: number;
  };
  contact: {
    address: string;
    phone: string;
    email: string;
    googleMapUrl: string;
  };
  kickboxing?: {
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    coachNameAr: string;
    coachNameEn: string;
    coachBioAr: string;
    coachBioEn: string;
    imageUrl: string;
    imageUrl2?: string;
    imageUrl3?: string;
  };
}

const AcademyContentSchema = new Schema<IAcademyContent>(
  {
    key: { type: String, default: 'academy_data', unique: true },
    hero: {
      title: { type: String, default: 'أكاديمية الأبطال للكاراتيه' },
      subtitle: { type: String, default: 'مصنع الأبطال' },
      ctaText: { type: String, default: 'انضم إلينا الآن' },
      ctaLink: { type: String, default: '#contact' },
      mediaUrl: { type: String, default: '/logo.jpg' },
    },
    about: {
      introduction: { type: String, default: 'نحن أكاديمية متخصصة في تدريب رياضة الكاراتيه والدفاع عن النفس، نهدف لتطوير المهارات البدنية والعقلية للأبطال.' },
      vision: { type: String, default: 'رؤيتنا هي بناء جيل رياضي متميز خلقاً وبدناً، قادر على المنافسة في المحافل الدولية وتمثيل الوطن بأفضل صورة.' },
      mission: { type: String, default: 'مهمتنا هي توفير بيئة تدريبية احترافية وآمنة باستخدام أفضل الأساليب العلمية الحديثة تحت إشراف نخبة من المدربين الدوليين.' },
      story: { type: String, default: 'تأسست الأكاديمية لتكون منارة رياضية متكاملة تخرج الأبطال والمنافسين على الألقاب المحلية والدولية، مع التركيز على الانضباط والروح الرياضية.' },
      imageUrl: { type: String, default: '/about_us_image.jpg' },
      imageFit: { type: String, enum: ['cover', 'contain'], default: 'cover' },
    },
    whyChooseUs: [
      {
        icon: { type: String, default: 'Award' },
        title: { type: String, default: 'مدربين محترفين' },
        description: { type: String, default: 'طاقم تدريبي معتمد وحاصل على بطولات دولية ومحلية وخبرة واسعة.' },
      },
      {
        icon: { type: String, default: 'Shield' },
        title: { type: String, default: 'برامج تدريبية معتمدة' },
        description: { type: String, default: 'مناهج تدريبية معتمدة تناسب جميع الفئات العمرية والدرجات والأحزمة.' },
      },
      {
        icon: { type: String, default: 'MapPin' },
        title: { type: String, default: 'مرافق حديثة' },
        description: { type: String, default: 'صالات تدريب مجهزة بالكامل بأحدث الأدوات الرياضية ومعايير السلامة العالمية.' },
      },
      {
        icon: { type: String, default: 'Trophy' },
        title: { type: String, default: 'إنجازات تنافسية' },
        description: { type: String, default: 'تاريخ حافل بالبطولات والميداليات الذهبية في شتى المستويات والمنافسات.' },
      },
    ],
    statistics: {
      championsCount: { type: Number, default: 50 },
      tournamentsCount: { type: Number, default: 120 },
      yearsOfExperience: { type: Number, default: 10 },
      traineesCount: { type: Number, default: 350 },
    },
    contact: {
      address: { type: String, default: 'أكاديمية الأبطال، صالة الكاراتيه الرئيسية' },
      phone: { type: String, default: '+20 123 456 7890' },
      email: { type: String, default: 'info@championsacademy.com' },
      googleMapUrl: { type: String, default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3451.17112002341!2d31.336495!3d30.089274!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583e18a8b1cb37%3A0xe54d8fb8dd8df42e!2sHeliopolis%20Club!5e0!3m2!1sen!2seg!4v1700000000000!5m2!1sen!2seg' },
    },
    kickboxing: {
      titleAr: { type: String, default: 'الكيك بوكسينج الاحترافي' },
      titleEn: { type: String, default: 'Professional Kickboxing Division' },
      descriptionAr: { type: String, default: 'انضم إلى أحد أقوى البرامج التدريبية في الكيك بوكسينج المصمم خصيصًا لتطوير القوة البدنية، والسرعة، والتركيز الذهني العالي. ندمج بين أحدث أساليب التدريب الرياضي والممارسات القتالية لضمان تحقيق أعلى درجات اللياقة والدفاع عن النفس في بيئة حماسية وآمنة تماماً.' },
      descriptionEn: { type: String, default: 'Join one of the most powerful Kickboxing training programs designed to enhance physical strength, agility, and deep mental focus. We blend modern athletic training with actual combat drills to guarantee top-tier fitness and self-defense capabilities in an exciting, safe environment.' },
      coachNameAr: { type: String, default: 'الكابتن مينا ناجي' },
      coachNameEn: { type: String, default: 'Coach Mina Nagi' },
      coachBioAr: { type: String, default: 'الكابتن مينا ناجي هو رمز التفاني والاحترافية، ويُعتبر أحد أفضل مدربي الكيك بوكسينج والرياضات القتالية. يتميز بأسلوبه التدريبي الفريد الذي يجمع بين الدعم المعنوي والتركيز البدني المكثف، مما يُمكّن المتدربين من تخطي حدود قدراتهم وتحقيق تحول حقيقي في اللياقة البدنية والمهارات الدفاعية. بفضل شغفه ورؤيته، استطاع كابتن مينا بناء مجتمع رياضي حماسي يلهم الجميع للوصول إلى منصات التتويج والتميز.' },
      coachBioEn: { type: String, default: 'Coach Mina Nagi is the epitome of dedication and professionalism, widely recognized as one of the premier instructors in Kickboxing and combat sports. He stands out with his unique teaching methodology that merges absolute motivational support with intense physical training, empowering trainees to exceed their limits and achieve remarkable fitness and self-defense transformations. Through his passion and vision, Captain Mina has built an inspiring community where everyone thrives to achieve championship levels.' },
      imageUrl: { type: String, default: '/logo.jpg' },
      imageUrl2: { type: String, default: '' },
      imageUrl3: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

const AcademyContent: Model<IAcademyContent> =
  mongoose.models.AcademyContent || mongoose.model<IAcademyContent>('AcademyContent', AcademyContentSchema);

export default AcademyContent;
