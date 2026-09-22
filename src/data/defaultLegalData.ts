import { LegalPage, LegalSection } from '../types';

export const DEFAULT_TERMS_PAGE: LegalPage = {
  id: 'legal_terms-conditions',
  pageType: 'terms-conditions',
  title: 'Terms & Conditions',
  slug: 'terms-conditions',
  seoTitle: 'Terms & Conditions | MOBO SAVIOR Mobile Repair Purulia',
  metaDescription: 'Official Terms & Conditions for MOBO SAVIOR mobile repair services, device handover, repair diagnosis, warranty terms, motherboard repair, and customer privacy.',
  isPublished: true,
  updatedAt: new Date().toISOString()
};

export const DEFAULT_TERMS_SECTIONS: LegalSection[] = [
  {
    id: 'sec_terms_intro',
    pageId: 'legal_terms-conditions',
    heading: 'General Service Agreement',
    content: 'Welcome to MOBO SAVIOR. By submitting your mobile device for repair, requesting an estimate, or using our services at our service center in Hattola More, Purulia or through our online platform, you agree to comply with and be bound by the following Terms & Conditions. Please read these terms carefully before handing over your device.',
    isActive: true,
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec_terms_1',
    pageId: 'legal_terms-conditions',
    heading: '1. Device Handover',
    content: 'Customers should check the device condition, accessories, and any existing physical damage before submitting the device for repair.\n\nCustomers are advised to take a complete backup of important data before handing over the device. MOBO SAVIOR will not be responsible for data loss during the repair process.',
    isActive: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec_terms_2',
    pageId: 'legal_terms-conditions',
    heading: '2. Password / Passcode',
    content: 'A device password or passcode may be required for proper testing and quality checks.\n\nCustomer privacy will be respected, and customer information will be kept confidential.',
    isActive: true,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec_terms_3',
    pageId: 'legal_terms-conditions',
    heading: '3. Repair & Diagnosis',
    content: 'The repair cost will be informed to the customer after diagnosing the device.\n\nIf any additional fault is found during the repair, additional charges may apply. Customer approval will be taken before starting any additional work.\n\nFor water-damaged, physically damaged, or previously repaired devices, the repair result may not be guaranteed.',
    isActive: true,
    displayOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec_terms_4',
    pageId: 'legal_terms-conditions',
    heading: '4. Motherboard Repair',
    content: 'The result of motherboard repair depends on the existing condition of the motherboard and any previous repair work.\n\nIf the promised repair solution cannot be achieved, the amount may be refunded according to the applicable Money Return Policy.\n\nThe Money Return Policy is applicable only to eligible motherboard repair cases and according to the terms communicated at the time of repair.',
    isActive: true,
    displayOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec_terms_5',
    pageId: 'legal_terms-conditions',
    heading: '5. Display / Part Replacement',
    content: 'The quality, warranty, and price of display or replacement parts will be clearly explained to the customer before repair.\n\nWarranty coverage will apply only to eligible defects mentioned in the repair invoice/receipt.\n\nPhysical damage, liquid damage, broken glass, pressure damage, accidental damage, or misuse will not be covered under warranty.',
    isActive: true,
    displayOrder: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec_terms_6',
    pageId: 'legal_terms-conditions',
    heading: '6. Warranty',
    content: 'The applicable warranty period will be clearly mentioned on the repair bill/receipt.\n\nThe original repair bill/receipt may be required for a warranty claim.\n\nEligible warranty issues will be repaired or replaced according to the applicable warranty terms.\n\nWarranty periods and conditions may vary depending on the device, part, and type of repair.',
    isActive: true,
    displayOrder: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec_terms_7',
    pageId: 'legal_terms-conditions',
    heading: '7. No-Warranty Cases',
    content: 'Warranty may become void in cases of physical damage, liquid/water damage, broken parts, unauthorized repair or tampering, misuse, accidental damage, or improper handling.',
    isActive: true,
    displayOrder: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec_terms_8',
    pageId: 'legal_terms-conditions',
    heading: '8. Delivery',
    content: 'The expected delivery date/time will be communicated to the customer.\n\nDelivery may be delayed due to complex repairs, parts availability, or unforeseen technical issues. The customer will be informed whenever possible.',
    isActive: true,
    displayOrder: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec_terms_9',
    pageId: 'legal_terms-conditions',
    heading: '9. Uncollected Devices',
    content: 'Customers are requested to collect their repaired devices within a reasonable time after being notified that the repair is complete.\n\nA separate storage or handling policy may apply to devices that remain uncollected for an extended period.',
    isActive: true,
    displayOrder: 9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec_terms_10',
    pageId: 'legal_terms-conditions',
    heading: '10. Payment',
    content: 'Repair charges must be cleared before final delivery unless otherwise agreed.\n\nCharges for additional work or parts approved by the customer may be added to the final bill.',
    isActive: true,
    displayOrder: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec_terms_11',
    pageId: 'legal_terms-conditions',
    heading: '11. Customer Data & Privacy',
    content: "Customer's personal data, photos, videos, contacts, and other private information will not be accessed unnecessarily.\n\nCustomers are strongly advised to maintain a backup of important or private data before submitting the device for repair.",
    isActive: true,
    displayOrder: 11,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec_terms_12',
    pageId: 'legal_terms-conditions',
    heading: '12. Customer Satisfaction',
    content: 'MOBO SAVIOR aims to provide professional service, quality parts, reasonable pricing, and customer satisfaction.\n\nFor any issue or complaint regarding a repair, customers can directly contact MOBO SAVIOR for assistance.',
    isActive: true,
    displayOrder: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec_terms_13',
    pageId: 'legal_terms-conditions',
    heading: '13. Staff Conduct & Customer Complaints',
    content: "We take staff behaviour and customer satisfaction seriously.\n\nIf any MOBO SAVIOR staff member misbehaves, behaves disrespectfully, or causes any inconvenience to a customer, the customer can directly submit a complaint to the owner/management via WhatsApp.\n\nCustomers are encouraged to mention the staff member's name and provide relevant details so that the matter can be properly investigated and appropriate action can be taken.",
    isActive: true,
    displayOrder: 13,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec_terms_14',
    pageId: 'legal_terms-conditions',
    heading: 'IMPORTANT NOTE',
    content: 'Warranty, replacement policy, money-back policy, and repair charges may vary depending on the device and type of repair.\n\nThe final terms applicable to each repair will be mentioned on the customer\'s repair bill/receipt.',
    isActive: true,
    displayOrder: 14,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const DEFAULT_PRIVACY_PAGE: LegalPage = {
  id: 'legal_privacy-policy',
  pageType: 'privacy-policy',
  title: 'Privacy Policy',
  slug: 'privacy-policy',
  seoTitle: 'Privacy Policy | MOBO SAVIOR Mobile Repair Purulia',
  metaDescription: 'Read how MOBO SAVIOR protects your personal privacy and customer data during mobile repair services.',
  isPublished: true,
  updatedAt: new Date().toISOString()
};

export const DEFAULT_PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: 'sec_privacy_1',
    pageId: 'legal_privacy-policy',
    heading: '1. Information We Collect',
    content: 'When you book a mobile repair with MOBO SAVIOR, we collect essential customer details such as your name, contact phone number, email address, device brand/model, and issue details required to process your repair order.',
    isActive: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec_privacy_2',
    pageId: 'legal_privacy-policy',
    heading: '2. Device Passcode & Data Privacy',
    content: 'Passcodes or lock codes provided by customers are strictly used by authorized technicians for pre and post-repair quality testing (e.g. touch response, microphone, speaker, camera check). We never access, copy, or share private personal files, photos, or messages.',
    isActive: true,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec_privacy_3',
    pageId: 'legal_privacy-policy',
    heading: '3. Data Security',
    content: 'We employ strict operational standards and encryption measures to protect your personal information against unauthorized access, alteration, or disclosure.',
    isActive: true,
    displayOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec_privacy_4',
    pageId: 'legal_privacy-policy',
    heading: '4. Contact & Support',
    content: 'If you have any questions regarding our Privacy Policy or data handling practices, please contact us at our Purulia branch or via phone/WhatsApp at 081675 49092.',
    isActive: true,
    displayOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
