import { Brand, PhoneModel, ServiceCategory } from '../types';

export const DEFAULT_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat-iphone',
    name: 'iPhone Repair',
    slug: 'iphone-repair',
    description: 'Expert diagnostics and precision hardware repairs for all Apple iPhone models from iPhone 11 to iPhone 16 Pro Max.',
    longDescription: 'Equipped with Apple-grade calibration boxes, TrueTone EEPROM programmers, OEM display presses, and stereoscopic microscopes, MOBO SAVIOR handles everything from genuine display laminations and battery health restorations to delicate FaceID flex trace repairs.',
    imageUrl: '/assets/images/service_iphone_repair_1788169632215.jpg',
    icon: 'Smartphone',
    badge: 'Apple Specialist',
    displayOrder: 1,
    active: true,
    problemsCovered: [
      'Cracked Front Screen & Retina OLED Lines',
      'Degraded Battery Health & Rapid Battery Drain',
      'FaceID Dot Projector Failure & Camera Black Screen',
      'Broken Back Glass & Rear Housing Damage',
      'No Charging / Port Moisture Detected Error',
      'Stuck on Apple Logo Bootloop & Error 4013',
      'Water Immersion Corrosion & Board Shorts'
    ],
    serviceSlugs: [
      'iphone-repair',
      'oled-display',
      'battery-replacement',
      'charging-problem',
      'camera-problem',
      'water-damage-repair',
      'dead-no-power-repair',
      'software-programming'
    ]
  },
  {
    id: 'cat-android',
    name: 'Android Repair',
    slug: 'android-repair',
    description: 'Comprehensive hardware and motherboard solutions for Samsung, OnePlus, Xiaomi, Vivo, Oppo, Realme, and Pixel.',
    longDescription: 'Full-spectrum servicing for Android flagships and mid-range devices. From high-refresh-rate curved AMOLED replacements and fast SuperVOOC/Warp charging port repairs to RF baseband IC soldering and ultrasonic cleaning.',
    imageUrl: '/assets/images/slide_android_1788168049303.jpg',
    icon: 'TabletSmartphone',
    badge: 'Multi-Brand Flagships',
    displayOrder: 2,
    active: true,
    problemsCovered: [
      'Curved AMOLED & 120Hz Fluid Display Fractures',
      'Fast Charging Not Working / Sub-Board Damage',
      '4G/5G Network No Service & Baseband Unknown',
      'Overheating, Battery Swelling & Sudden Shutdowns',
      'Distorted Loudspeaker, Earpiece & Mic Failure',
      'Cracked Camera Glass & Autofocus Blur',
      'Liquid Damage Ultrasonic Board Recovery'
    ],
    serviceSlugs: [
      'android-repair',
      'curved-display',
      'charging-problem',
      'battery-replacement',
      'network-signal-repair',
      'camera-problem',
      'water-damage-repair',
      'dead-no-power-repair'
    ]
  },
  {
    id: 'cat-motherboard',
    name: 'Motherboard & Chip-Level Repair',
    slug: 'motherboard-repair',
    description: 'Advanced micro-soldering, CPU reballing, eMMC/UFS memory programming, and dead phone recovery.',
    longDescription: 'Purulia\'s advanced workstation equipped with a 7X-45X trinocular microscope, ShortCam II infrared thermal imaging, computerized BGA hot air rework station, and QianLi CNC stencils. We specialize in reviving dead phones rejected by other service centers.',
    imageUrl: '/assets/images/differ_micro_soldering_1788169185732.jpg',
    icon: 'Cpu',
    badge: 'Level 4 Micro-Soldering',
    displayOrder: 3,
    active: true,
    problemsCovered: [
      'Poco X3 / X3 Pro / Redmi Note CPU & RAM Reboot Loops',
      'Completely Dead Phone / 0.00A Power Supply Draw',
      'VCC Main & VDD Boost Short Circuits Traced with Thermal Cam',
      'eMMC / UFS Storage 90% Consumed Health Recovery',
      'Baseband Unknown / No IMEI / RF Transceiver IC Failure',
      'Audio IC Loop / No Mic & Sound During Calls',
      'Charging IC / PMIC Power Management Replacement'
    ],
    serviceSlugs: [
      'motherboard-repair',
      'cpu-reballing',
      'dead-no-power-repair',
      'emmc-ufs-programming',
      'network-signal-repair',
      'charging-problem'
    ]
  },
  {
    id: 'cat-flip-fold',
    name: 'Flip & Fold Repair',
    slug: 'flip-fold-repair',
    description: 'Specialist flexible OLED replacement, precision hinge alignment, and dual battery service for foldables.',
    longDescription: 'Folding devices require specialized mechanical and thermal procedures. We repair Samsung Galaxy Z Fold, Z Flip, Motorola Razr, and OnePlus Open with millimeter-precision hinge dust clearance, UTG ultra-thin glass lamination, and folding flex ribbon restoration.',
    imageUrl: '/assets/images/service_foldable_repair_1788169709156.jpg',
    icon: 'Layers',
    badge: 'Foldable Engineering',
    displayOrder: 4,
    active: true,
    problemsCovered: [
      'Galaxy Z Fold Inner Flexible Screen Blackout or Crease Tear',
      'Z Flip Hinge Won\'t Open Fully 180° / Stuck Gear Mechanism',
      'Loss of Audio / WiFi / Bluetooth When Folding Device',
      'Outer Cover AMOLED Display Glass Fracture',
      'Dual Battery Out-of-Sync Drainage',
      'Ultra-Thin Glass (UTG) Delamination & Crease Bubbles'
    ],
    serviceSlugs: [
      'flip-fold-repair',
      'samsung-fold-repair',
      'samsung-flip-repair',
      'foldable-display-repair',
      'hinge-repair',
      'inner-display-repair',
      'outer-display-repair'
    ]
  },
  {
    id: 'cat-display',
    name: 'Display Replacement',
    slug: 'display-replacement',
    description: 'Quality-certified screen replacements: TFT, Premium OLED, 100% Original OEM, and Curved AMOLED.',
    longDescription: 'Choose from multiple verified screen tiers tailored to your budget and performance needs. Every replacement includes precision dust seal framing, TrueTone transfer where supported, touch responsiveness validation, and warranty protection.',
    imageUrl: '/assets/images/service_display_replace_1788169648346.jpg',
    icon: 'ShieldCheck',
    badge: 'Multi-Grade Certified',
    displayOrder: 5,
    active: true,
    problemsCovered: [
      'Cracked Outer Glass with Working Touch & Display',
      'Green Line / Pink Line / White Screen After Software Updates',
      'Complete Black Screen / Bleeding Ink Blotches',
      'Ghost Touch / Unresponsive Touch Digitizer',
      'Flickering Display & Backlight Failure',
      'Color Inversion / Low Brightness Issues'
    ],
    serviceSlugs: [
      'display-replacement',
      'original-display',
      'oled-display',
      'curved-display',
      'green-line-white-display'
    ]
  },
  {
    id: 'cat-software',
    name: 'Software & Programming',
    slug: 'software-programming',
    description: 'Dead boot unbricking, fastboot loops, official firmware flashing, and security lock recovery.',
    longDescription: 'Authorized software recovery using EDL test points, official server authorization boxes, and fastboot protocols. We safely resolve bricked handsets, system bootloops after botched updates, and memory partition errors.',
    imageUrl: '/assets/images/service_software_edl_1788169726207.jpg',
    icon: 'Terminal',
    badge: 'Firmware & EDL',
    displayOrder: 6,
    active: true,
    problemsCovered: [
      'Device Stuck on Manufacturer Logo (Bootloop)',
      'Qualcomm EDL 9008 Mode / MTK Preloader Port Brick',
      'Corrupted Recovery / Fastboot Loop After Update',
      'eMMC / UFS Firmware Re-flashing & Partition Recovery',
      'System UI Has Stopped / Application Crash Loops',
      'Device Locked / Forgotten Screen Passcode Assistance'
    ],
    serviceSlugs: [
      'software-programming',
      'emmc-ufs-programming',
      'dead-no-power-repair'
    ]
  }
];

export const DEFAULT_BRANDS: Brand[] = [
  { id: 'brand-apple', name: 'Apple', slug: 'apple', popular: true, active: true, displayOrder: 1 },
  { id: 'brand-samsung', name: 'Samsung', slug: 'samsung', popular: true, active: true, displayOrder: 2 },
  { id: 'brand-oneplus', name: 'OnePlus', slug: 'oneplus', popular: true, active: true, displayOrder: 3 },
  { id: 'brand-xiaomi', name: 'Xiaomi / Redmi / POCO', slug: 'xiaomi', popular: true, active: true, displayOrder: 4 },
  { id: 'brand-vivo', name: 'Vivo', slug: 'vivo', popular: true, active: true, displayOrder: 5 },
  { id: 'brand-oppo', name: 'Oppo', slug: 'oppo', popular: true, active: true, displayOrder: 6 },
  { id: 'brand-realme', name: 'Realme', slug: 'realme', popular: true, active: true, displayOrder: 7 },
  { id: 'brand-motorola', name: 'Motorola', slug: 'motorola', popular: true, active: true, displayOrder: 8 },
  { id: 'brand-iqoo', name: 'iQOO', slug: 'iqoo', popular: true, active: true, displayOrder: 9 },
  { id: 'brand-google', name: 'Google Pixel', slug: 'google-pixel', popular: true, active: true, displayOrder: 10 }
];

export const DEFAULT_MODELS: PhoneModel[] = [
  // Apple iPhone Models
  {
    id: 'mod-ip-16pm',
    brand: 'Apple',
    name: 'iPhone 16 Pro Max',
    category: 'iPhone',
    active: true,
    displayOrder: 1,
    availableServices: ['display-replacement', 'original-display', 'battery-replacement', 'motherboard-repair', 'charging-problem', 'camera-problem', 'water-damage-repair'],
    servicePrices: {
      'display-replacement': '24999',
      'original-display': '29999',
      'battery-replacement': '5999',
      'motherboard-repair': '7999',
      'charging-problem': '3499',
      'camera-problem': '6999'
    },
    displayTypes: [
      { type: 'Premium OLED', price: '21999' },
      { type: 'Original Display', price: '29999' }
    ]
  },
  {
    id: 'mod-ip-15p',
    brand: 'Apple',
    name: 'iPhone 15 Pro / 15 Pro Max',
    category: 'iPhone',
    active: true,
    displayOrder: 2,
    availableServices: ['display-replacement', 'original-display', 'battery-replacement', 'motherboard-repair', 'charging-problem', 'camera-problem'],
    servicePrices: {
      'display-replacement': '18999',
      'original-display': '24999',
      'battery-replacement': '4999',
      'motherboard-repair': '6499',
      'charging-problem': '2999',
      'camera-problem': '5499'
    },
    displayTypes: [
      { type: 'Premium OLED', price: '16999' },
      { type: 'Original Display', price: '24999' }
    ]
  },
  {
    id: 'mod-ip-15',
    brand: 'Apple',
    name: 'iPhone 15 / 15 Plus',
    category: 'iPhone',
    active: true,
    displayOrder: 3,
    availableServices: ['display-replacement', 'original-display', 'battery-replacement', 'motherboard-repair', 'charging-problem', 'camera-problem'],
    servicePrices: {
      'display-replacement': '13999',
      'original-display': '17999',
      'battery-replacement': '3999',
      'motherboard-repair': '4999',
      'charging-problem': '2499',
      'camera-problem': '4299'
    },
    displayTypes: [
      { type: 'Premium OLED', price: '11999' },
      { type: 'Original Display', price: '17999' }
    ]
  },
  {
    id: 'mod-ip-14p',
    brand: 'Apple',
    name: 'iPhone 14 Pro / 14 Pro Max',
    category: 'iPhone',
    active: true,
    displayOrder: 4,
    availableServices: ['display-replacement', 'original-display', 'battery-replacement', 'motherboard-repair', 'charging-problem', 'camera-problem'],
    servicePrices: {
      'display-replacement': '15999',
      'original-display': '21999',
      'battery-replacement': '3999',
      'motherboard-repair': '5499',
      'charging-problem': '2499',
      'camera-problem': '4999'
    },
    displayTypes: [
      { type: 'Premium OLED', price: '13999' },
      { type: 'Original Display', price: '21999' }
    ]
  },
  {
    id: 'mod-ip-14',
    brand: 'Apple',
    name: 'iPhone 14 / 14 Plus',
    category: 'iPhone',
    active: true,
    displayOrder: 5,
    availableServices: ['display-replacement', 'original-display', 'battery-replacement', 'motherboard-repair', 'charging-problem', 'camera-problem'],
    servicePrices: {
      'display-replacement': '9999',
      'original-display': '14499',
      'battery-replacement': '3499',
      'motherboard-repair': '4499',
      'charging-problem': '1999',
      'camera-problem': '3499'
    },
    displayTypes: [
      { type: 'Premium OLED', price: '8499' },
      { type: 'Original Display', price: '14499' }
    ]
  },
  {
    id: 'mod-ip-13',
    brand: 'Apple',
    name: 'iPhone 13 / 13 Pro',
    category: 'iPhone',
    active: true,
    displayOrder: 6,
    availableServices: ['display-replacement', 'original-display', 'oled-display', 'battery-replacement', 'motherboard-repair', 'charging-problem', 'camera-problem', 'green-line-white-display'],
    servicePrices: {
      'display-replacement': '7999',
      'original-display': '12999',
      'oled-display': '7999',
      'battery-replacement': '2999',
      'motherboard-repair': '3999',
      'charging-problem': '1799',
      'camera-problem': '2999',
      'green-line-white-display': '3499'
    },
    displayTypes: [
      { type: 'TFT / LCD', price: '4499' },
      { type: 'Premium OLED', price: '7999' },
      { type: 'Original Display', price: '12999' }
    ]
  },
  {
    id: 'mod-ip-12',
    brand: 'Apple',
    name: 'iPhone 12 / 12 Pro',
    category: 'iPhone',
    active: true,
    displayOrder: 7,
    availableServices: ['display-replacement', 'original-display', 'oled-display', 'battery-replacement', 'motherboard-repair', 'charging-problem', 'camera-problem'],
    servicePrices: {
      'display-replacement': '6499',
      'original-display': '10999',
      'oled-display': '6499',
      'battery-replacement': '2499',
      'motherboard-repair': '3499',
      'charging-problem': '1499',
      'camera-problem': '2499'
    },
    displayTypes: [
      { type: 'TFT / LCD', price: '3499' },
      { type: 'Premium OLED', price: '6499' },
      { type: 'Original Display', price: '10999' }
    ]
  },
  {
    id: 'mod-ip-11',
    brand: 'Apple',
    name: 'iPhone 11 / 11 Pro',
    category: 'iPhone',
    active: true,
    displayOrder: 8,
    availableServices: ['display-replacement', 'original-display', 'battery-replacement', 'motherboard-repair', 'charging-problem', 'camera-problem'],
    servicePrices: {
      'display-replacement': '3999',
      'original-display': '6499',
      'battery-replacement': '1999',
      'motherboard-repair': '2999',
      'charging-problem': '1299',
      'camera-problem': '1999'
    },
    displayTypes: [
      { type: 'TFT / LCD', price: '2499' },
      { type: 'Premium Quality', price: '3999' },
      { type: 'Original Display', price: '6499' }
    ]
  },

  // Samsung Galaxy Models
  {
    id: 'mod-sam-s24u',
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra',
    category: 'Android',
    active: true,
    displayOrder: 9,
    availableServices: ['display-replacement', 'original-display', 'curved-display', 'battery-replacement', 'motherboard-repair', 'cpu-reballing', 'charging-problem', 'camera-problem'],
    servicePrices: {
      'display-replacement': '18999',
      'original-display': '23999',
      'curved-display': '18999',
      'battery-replacement': '3499',
      'motherboard-repair': '5999',
      'cpu-reballing': '6499',
      'charging-problem': '2499',
      'camera-problem': '4999'
    },
    displayTypes: [
      { type: 'Premium OLED', price: '16999' },
      { type: 'Original Display', price: '23999' }
    ]
  },
  {
    id: 'mod-sam-s23',
    brand: 'Samsung',
    name: 'Galaxy S23 / S23 Ultra',
    category: 'Android',
    active: true,
    displayOrder: 10,
    availableServices: ['display-replacement', 'original-display', 'oled-display', 'battery-replacement', 'motherboard-repair', 'cpu-reballing', 'charging-problem', 'camera-problem'],
    servicePrices: {
      'display-replacement': '14999',
      'original-display': '19999',
      'oled-display': '14999',
      'battery-replacement': '2999',
      'motherboard-repair': '4999',
      'cpu-reballing': '5499',
      'charging-problem': '1999',
      'camera-problem': '3999'
    },
    displayTypes: [
      { type: 'Premium OLED', price: '12999' },
      { type: 'Original Display', price: '19999' }
    ]
  },
  {
    id: 'mod-sam-s22',
    brand: 'Samsung',
    name: 'Galaxy S22 / S22 Plus',
    category: 'Android',
    active: true,
    displayOrder: 11,
    availableServices: ['display-replacement', 'original-display', 'oled-display', 'battery-replacement', 'motherboard-repair', 'cpu-reballing', 'charging-problem'],
    servicePrices: {
      'display-replacement': '10999',
      'original-display': '15999',
      'battery-replacement': '2499',
      'motherboard-repair': '4499',
      'cpu-reballing': '4999',
      'charging-problem': '1799'
    },
    displayTypes: [
      { type: 'Premium OLED', price: '9499' },
      { type: 'Original Display', price: '15999' }
    ]
  },
  {
    id: 'mod-sam-zfold5',
    brand: 'Samsung',
    name: 'Galaxy Z Fold 5 / Z Fold 4',
    category: 'FlipFold',
    active: true,
    displayOrder: 12,
    availableServices: ['samsung-fold-repair', 'foldable-display-repair', 'hinge-repair', 'inner-display-repair', 'outer-display-repair', 'fold-flip-touch-problem', 'fold-flip-battery-problem', 'motherboard-repair'],
    servicePrices: {
      'samsung-fold-repair': '14999',
      'foldable-display-repair': '28999',
      'hinge-repair': '6999',
      'inner-display-repair': '28999',
      'outer-display-repair': '8999',
      'fold-flip-touch-problem': '5999',
      'fold-flip-battery-problem': '4499',
      'motherboard-repair': '7999'
    },
    displayTypes: [
      { type: 'Outer Cover Display', price: '8999' },
      { type: 'Inner Foldable AMOLED', price: '28999' }
    ]
  },
  {
    id: 'mod-sam-zflip5',
    brand: 'Samsung',
    name: 'Galaxy Z Flip 5 / Z Flip 4',
    category: 'FlipFold',
    active: true,
    displayOrder: 13,
    availableServices: ['samsung-flip-repair', 'foldable-display-repair', 'hinge-repair', 'inner-display-repair', 'outer-display-repair', 'fold-flip-touch-problem', 'fold-flip-battery-problem', 'motherboard-repair'],
    servicePrices: {
      'samsung-flip-repair': '9999',
      'foldable-display-repair': '18999',
      'hinge-repair': '4999',
      'inner-display-repair': '18999',
      'outer-display-repair': '4999',
      'fold-flip-touch-problem': '4499',
      'fold-flip-battery-problem': '3499',
      'motherboard-repair': '5999'
    },
    displayTypes: [
      { type: 'Outer Cover Screen', price: '4999' },
      { type: 'Inner Flip AMOLED', price: '18999' }
    ]
  },
  {
    id: 'mod-sam-a54',
    brand: 'Samsung',
    name: 'Galaxy A54 5G / A34',
    category: 'Android',
    active: true,
    displayOrder: 14,
    availableServices: ['display-replacement', 'oled-display', 'battery-replacement', 'motherboard-repair', 'charging-problem'],
    servicePrices: {
      'display-replacement': '4499',
      'oled-display': '5999',
      'battery-replacement': '1599',
      'motherboard-repair': '2999',
      'charging-problem': '999'
    },
    displayTypes: [
      { type: 'TFT / LCD', price: '2299' },
      { type: 'Premium OLED', price: '4499' },
      { type: 'Original Display', price: '5999' }
    ]
  },

  // OnePlus Models
  {
    id: 'mod-op-12',
    brand: 'OnePlus',
    name: 'OnePlus 12 / 12R',
    category: 'Android',
    active: true,
    displayOrder: 15,
    availableServices: ['display-replacement', 'curved-display', 'battery-replacement', 'motherboard-repair', 'cpu-reballing', 'green-line-white-display', 'charging-problem'],
    servicePrices: {
      'display-replacement': '12999',
      'curved-display': '12999',
      'battery-replacement': '2499',
      'motherboard-repair': '4999',
      'cpu-reballing': '5499',
      'green-line-white-display': '3499',
      'charging-problem': '1699'
    },
    displayTypes: [
      { type: 'Premium Curved OLED', price: '10999' },
      { type: 'Original Curved AMOLED', price: '14999' }
    ]
  },
  {
    id: 'mod-op-11',
    brand: 'OnePlus',
    name: 'OnePlus 11 / 11R',
    category: 'Android',
    active: true,
    displayOrder: 16,
    availableServices: ['display-replacement', 'curved-display', 'battery-replacement', 'motherboard-repair', 'cpu-reballing', 'green-line-white-display', 'charging-problem'],
    servicePrices: {
      'display-replacement': '9999',
      'curved-display': '9999',
      'battery-replacement': '2199',
      'motherboard-repair': '3999',
      'cpu-reballing': '4499',
      'green-line-white-display': '2999',
      'charging-problem': '1499'
    },
    displayTypes: [
      { type: 'Premium OLED', price: '7999' },
      { type: 'Original Display', price: '11999' }
    ]
  },
  {
    id: 'mod-op-9',
    brand: 'OnePlus',
    name: 'OnePlus 9 / 9 Pro / 8T',
    category: 'Android',
    active: true,
    displayOrder: 17,
    availableServices: ['display-replacement', 'curved-display', 'battery-replacement', 'motherboard-repair', 'cpu-reballing', 'green-line-white-display'],
    servicePrices: {
      'display-replacement': '7499',
      'curved-display': '7499',
      'battery-replacement': '1899',
      'motherboard-repair': '3499',
      'cpu-reballing': '3999',
      'green-line-white-display': '2499'
    },
    displayTypes: [
      { type: 'TFT / LCD', price: '3499' },
      { type: 'Premium OLED', price: '6499' },
      { type: 'Original Display', price: '8999' }
    ]
  },

  // Xiaomi / Redmi / POCO
  {
    id: 'mod-xi-note13',
    brand: 'Xiaomi / Redmi / POCO',
    name: 'Redmi Note 13 Pro+ / 13 Pro',
    category: 'Android',
    active: true,
    displayOrder: 18,
    availableServices: ['display-replacement', 'curved-display', 'battery-replacement', 'motherboard-repair', 'cpu-reballing', 'charging-problem'],
    servicePrices: {
      'display-replacement': '5499',
      'curved-display': '6999',
      'battery-replacement': '1499',
      'motherboard-repair': '2899',
      'cpu-reballing': '3499',
      'charging-problem': '899'
    },
    displayTypes: [
      { type: 'TFT / LCD', price: '2199' },
      { type: 'Premium OLED', price: '4999' },
      { type: 'Original Curved Display', price: '6999' }
    ]
  },
  {
    id: 'mod-xi-pocox3',
    brand: 'Xiaomi / Redmi / POCO',
    name: 'POCO X3 Pro / POCO X3',
    category: 'Android',
    active: true,
    displayOrder: 19,
    availableServices: ['cpu-reballing', 'motherboard-repair', 'display-replacement', 'battery-replacement', 'charging-problem', 'dead-no-power-repair'],
    servicePrices: {
      'cpu-reballing': '2499',
      'motherboard-repair': '2499',
      'dead-no-power-repair': '2499',
      'display-replacement': '1999',
      'battery-replacement': '1299',
      'charging-problem': '799'
    },
    displayTypes: [
      { type: 'TFT / LCD 120Hz', price: '1999' },
      { type: 'Original Display', price: '3199' }
    ]
  },

  // Vivo / iQOO
  {
    id: 'mod-vivo-x100',
    brand: 'Vivo',
    name: 'Vivo X100 Pro / X90 Pro',
    category: 'Android',
    active: true,
    displayOrder: 20,
    availableServices: ['display-replacement', 'curved-display', 'battery-replacement', 'motherboard-repair', 'camera-problem'],
    servicePrices: {
      'display-replacement': '11999',
      'curved-display': '11999',
      'battery-replacement': '2499',
      'motherboard-repair': '4499',
      'camera-problem': '4999'
    },
    displayTypes: [
      { type: 'Premium Curved OLED', price: '9999' },
      { type: 'Original Display', price: '13999' }
    ]
  },
  {
    id: 'mod-vivo-v29',
    brand: 'Vivo',
    name: 'Vivo V29 / V27 Curved',
    category: 'Android',
    active: true,
    displayOrder: 21,
    availableServices: ['display-replacement', 'curved-display', 'battery-replacement', 'motherboard-repair', 'charging-problem'],
    servicePrices: {
      'display-replacement': '6499',
      'curved-display': '6499',
      'battery-replacement': '1599',
      'motherboard-repair': '2999',
      'charging-problem': '999'
    },
    displayTypes: [
      { type: 'Premium Curved AMOLED', price: '5499' },
      { type: 'Original Curved Display', price: '7999' }
    ]
  },
  {
    id: 'mod-iqoo-12',
    brand: 'iQOO',
    name: 'iQOO 12 / Neo 7 Pro',
    category: 'Android',
    active: true,
    displayOrder: 22,
    availableServices: ['display-replacement', 'battery-replacement', 'motherboard-repair', 'cpu-reballing', 'charging-problem'],
    servicePrices: {
      'display-replacement': '6999',
      'battery-replacement': '1899',
      'motherboard-repair': '3499',
      'cpu-reballing': '3999',
      'charging-problem': '1199'
    },
    displayTypes: [
      { type: 'TFT / LCD', price: '2499' },
      { type: 'Premium OLED', price: '5999' },
      { type: 'Original Display', price: '7999' }
    ]
  },

  // Oppo / Realme
  {
    id: 'mod-oppo-reno11',
    brand: 'Oppo',
    name: 'Oppo Reno 11 Pro / Reno 10',
    category: 'Android',
    active: true,
    displayOrder: 23,
    availableServices: ['display-replacement', 'curved-display', 'battery-replacement', 'motherboard-repair', 'charging-problem'],
    servicePrices: {
      'display-replacement': '6499',
      'curved-display': '6499',
      'battery-replacement': '1699',
      'motherboard-repair': '2999',
      'charging-problem': '999'
    },
    displayTypes: [
      { type: 'Premium Curved AMOLED', price: '5499' },
      { type: 'Original Display', price: '7499' }
    ]
  },
  {
    id: 'mod-realme-12p',
    brand: 'Realme',
    name: 'Realme 12 Pro+ / 11 Pro',
    category: 'Android',
    active: true,
    displayOrder: 24,
    availableServices: ['display-replacement', 'curved-display', 'battery-replacement', 'motherboard-repair', 'charging-problem'],
    servicePrices: {
      'display-replacement': '5999',
      'curved-display': '5999',
      'battery-replacement': '1499',
      'motherboard-repair': '2799',
      'charging-problem': '899'
    },
    displayTypes: [
      { type: 'TFT / LCD', price: '2199' },
      { type: 'Premium Curved AMOLED', price: '5299' },
      { type: 'Original Display', price: '6999' }
    ]
  },

  // Google Pixel
  {
    id: 'mod-pixel-8p',
    brand: 'Google Pixel',
    name: 'Google Pixel 8 Pro / Pixel 7',
    category: 'Android',
    active: true,
    displayOrder: 25,
    availableServices: ['display-replacement', 'original-display', 'battery-replacement', 'motherboard-repair', 'charging-problem'],
    servicePrices: {
      'display-replacement': '12999',
      'original-display': '17999',
      'battery-replacement': '2499',
      'motherboard-repair': '4499',
      'charging-problem': '1699'
    },
    displayTypes: [
      { type: 'Premium OLED', price: '10999' },
      { type: 'Original Display', price: '17999' }
    ]
  },
  {
    id: 'mod-pixel-fold',
    brand: 'Google Pixel',
    name: 'Google Pixel Fold',
    category: 'FlipFold',
    active: true,
    displayOrder: 26,
    availableServices: ['foldable-display-repair', 'hinge-repair', 'inner-display-repair', 'outer-display-repair', 'motherboard-repair'],
    servicePrices: {
      'foldable-display-repair': '27999',
      'hinge-repair': '6499',
      'inner-display-repair': '27999',
      'outer-display-repair': '8499',
      'motherboard-repair': '7499'
    },
    displayTypes: [
      { type: 'Outer Cover Screen', price: '8499' },
      { type: 'Inner Flexible AMOLED', price: '27999' }
    ]
  }
];
