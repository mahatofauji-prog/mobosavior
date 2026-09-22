import { Brand, PhoneModel, ServiceCategory } from '../types';

export const DEFAULT_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat-motherboard',
    name: 'Motherboard & Chip-Level Repair',
    h1Name: 'Mobile Motherboard Repair in Purulia',
    seoTitle: 'Mobile Motherboard Repair in Purulia | MOBO SAVIOR',
    metaDescription: 'Best mobile motherboard repair in Purulia. Specialized in iPhone motherboard repair, Android motherboard repair, CPU reballing, mobile IC repair, and short circuit repair.',
    imageAltText: 'Mobile motherboard repair and microsoldering in Purulia',
    slug: 'motherboard-repair',
    description: 'Advanced motherboard diagnostics, micro-soldering, IC replacement, short-circuit repair and chip-level board restoration.',
    longDescription: 'Purulia\'s advanced workstation equipped with a 7X-45X trinocular microscope, ShortCam II infrared thermal imaging, computerized BGA hot air rework station, and QianLi CNC stencils. We specialize in mobile motherboard repair, IC replacements, and reviving dead phones.',
    imageUrl: '/assets/images/motherboard_repair_1790050660908.jpg',
    icon: 'Cpu',
    badge: 'Level 4 Micro-Soldering',
    displayOrder: 1,
    active: true,
    problemsCovered: [
      'Micro-soldering & IC replacement',
      'Short-circuit & dead board recovery',
      'Trace jumpering & component restoration'
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
    id: 'cat-android',
    name: 'Android Phone Repair',
    h1Name: 'Android Mobile Repair in Purulia',
    seoTitle: 'Android Mobile Repair in Purulia | MOBO SAVIOR',
    metaDescription: 'Expert Android mobile repair shop in Purulia for Samsung, OnePlus, Xiaomi, Vivo, Oppo, Realme, and Pixel. Screen, battery, and Android motherboard repair.',
    imageAltText: 'Android motherboard repair in Purulia',
    slug: 'android-repair',
    description: 'Professional Android smartphone hardware diagnostics, motherboard repair, display, charging and component-level solutions.',
    longDescription: 'Full-spectrum servicing for Android flagships and mid-range devices in Purulia. From high-refresh-rate curved AMOLED replacements and fast SuperVOOC/Warp charging port repairs to RF baseband IC soldering and Android motherboard repair.',
    imageUrl: '/assets/images/android_repair_1790050677195.jpg',
    icon: 'TabletSmartphone',
    badge: 'Multi-Brand Android',
    displayOrder: 2,
    active: true,
    problemsCovered: [
      'Samsung, OnePlus, Xiaomi & Vivo',
      'AMOLED & charging sub-board fixes',
      'Component-level hardware solutions'
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
    id: 'cat-flip-fold',
    name: 'Samsung Flip & Fold Repair',
    h1Name: 'Flip & Fold Mobile Repair in Purulia',
    seoTitle: 'Flip & Fold Mobile Repair in Purulia | MOBO SAVIOR',
    metaDescription: 'Specialist Flip and Fold mobile repair in Purulia for Samsung Galaxy Z Fold, Z Flip, Motorola Razr, and OnePlus. Hinge restoration and flexible display repair.',
    imageAltText: 'Flip and Fold mobile repair in Purulia',
    slug: 'flip-fold-repair',
    description: 'Specialized repair solutions for Samsung Flip and Fold smartphones including display, hinge, flex, motherboard and hardware-related problems.',
    longDescription: 'Folding devices require specialized mechanical and thermal procedures. We repair Samsung Galaxy Z Fold, Z Flip, Motorola Razr, and OnePlus Open in Purulia with millimeter-precision hinge dust clearance, UTG ultra-thin glass lamination, and folding flex ribbon restoration.',
    imageUrl: '/assets/images/flip_fold_repair_1790050690123.jpg',
    icon: 'Layers',
    badge: 'Foldable Engineering',
    displayOrder: 3,
    active: true,
    problemsCovered: [
      'Flexible display & UTG lamination',
      'Hinge dust clearance & realignment',
      'Flex ribbon & motherboard repairs'
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
    name: 'Display & Touch Replacement',
    h1Name: 'Mobile Display Repair in Purulia',
    seoTitle: 'iPhone & Mobile Display Repair in Purulia | MOBO SAVIOR',
    metaDescription: 'iPhone display repair and mobile screen replacement in Purulia. Premium OLED, AMOLED, and original display repairs with TrueTone support.',
    imageAltText: 'iPhone display repair service in Purulia',
    slug: 'display-replacement',
    description: 'Professional display, AMOLED/OLED, touch and screen replacement for iPhone and Android smartphones.',
    longDescription: 'Choose from multiple verified screen tiers tailored to your budget and performance needs. Every display repair in Purulia includes precision dust seal framing, TrueTone transfer where supported, touch responsiveness validation, and warranty protection.',
    imageUrl: '/assets/images/display_replacement_1790050710979.jpg',
    icon: 'ShieldCheck',
    badge: 'Display Center',
    displayOrder: 4,
    active: true,
    problemsCovered: [
      '100% Genuine OEM & OLED panels',
      'Touch digitizer & ghost touch fix',
      'Precision frame alignment'
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
    id: 'cat-battery-charging',
    name: 'Battery & Charging Port Solutions',
    h1Name: 'Battery & Charging Port Solutions in Purulia',
    seoTitle: 'Battery & Charging Port Solutions in Purulia | MOBO SAVIOR',
    metaDescription: 'Battery replacement, charging port repair, and charging IC diagnostics in Purulia.',
    imageAltText: 'Battery and charging port repair in Purulia',
    slug: 'battery-charging-solutions',
    description: 'Battery replacement, charging port repair, charging IC diagnostics and charging-related hardware solutions.',
    longDescription: 'Expert battery diagnostics and OEM replacement batteries for all flagship and mid-range devices, paired with precision Type-C/Lightning charging port solder repairs and charging PMIC troubleshooting.',
    imageUrl: '/assets/images/battery_charging_1790050730031.jpg',
    icon: 'ShieldCheck',
    badge: 'Power & Port Hub',
    displayOrder: 5,
    active: true,
    problemsCovered: [
      'High-capacity battery swap',
      'Type-C & sub-board port repair',
      'Charging IC & OVP diagnostics'
    ],
    serviceSlugs: [
      'battery-replacement',
      'charging-problem'
    ]
  },
  {
    id: 'cat-software',
    name: 'Software & Programming',
    h1Name: 'Software & Programming in Purulia',
    seoTitle: 'Software & Programming in Purulia | MOBO SAVIOR',
    metaDescription: 'Software troubleshooting, flashing, programming, firmware-related solutions and supported unlocking services in Purulia.',
    imageAltText: 'Mobile software and programming station in Purulia',
    slug: 'software-programming',
    description: 'Software troubleshooting, flashing, programming, firmware-related solutions and supported unlocking services.',
    longDescription: 'Authorized software recovery using EDL test points, official server authorization boxes, and fastboot protocols in Purulia. We safely resolve bricked handsets, system bootloops after botched updates, eMMC/UFS memory partition errors, and security lock assistance.',
    imageUrl: '/assets/images/software_programming_1790050745198.jpg',
    icon: 'Terminal',
    badge: 'EDL & Firmware Lab',
    displayOrder: 6,
    active: true,
    problemsCovered: [
      'System crash & bootloop unbrick',
      'Authorized firmware flashing',
      'Diagnostic firmware & programming'
    ],
    serviceSlugs: [
      'software-programming',
      'emmc-ufs-programming',
      'dead-no-power-repair'
    ]
  },
  {
    id: 'cat-cpu-reballing',
    name: 'CPU Reballing & Restart Solution',
    h1Name: 'CPU Reballing & Restart Solution in Purulia',
    seoTitle: 'CPU Reballing & Restart Solution in Purulia | MOBO SAVIOR',
    metaDescription: 'Specialized CPU reballing, double-decker RAM sandwich reballing, and automatic restart loop fix for Poco, Redmi, Samsung, and OnePlus in Purulia.',
    imageAltText: 'CPU Reballing and micro soldering workstation in Purulia',
    slug: 'cpu-reballing',
    description: 'CPU Reballing • Restart/Boot Loop Problem • CPU-related Motherboard Repair',
    longDescription: 'Precision double-decker CPU & RAM desoldering using CNC laser stencils, low-temperature SAC305 alloy paste, and stereoscopic microscope alignment. Solves Poco X3/X3 Pro, Redmi Note series, OnePlus 9/10/11 series reboot issues, camera dead, and audio dead symptoms permanently.',
    imageUrl: '/assets/images/cpu_reballing_1790050758447.jpg',
    icon: 'Cpu',
    badge: 'CPU & APU Specialist',
    displayOrder: 7,
    active: true,
    problemsCovered: [
      'Poco, Redmi & OnePlus CPU reballing',
      'Double-decker RAM sandwich repair',
      'Auto restart & boot loop fix'
    ],
    serviceSlugs: [
      'cpu-reballing',
      'motherboard-repair',
      'dead-no-power-repair'
    ]
  },
  {
    id: 'cat-emmc-ufs',
    name: 'eMMC/UFS Reballing & Replacement',
    h1Name: 'eMMC & UFS Reballing & Replacement in Purulia',
    seoTitle: 'eMMC & UFS Reballing & Replacement in Purulia | MOBO SAVIOR',
    metaDescription: 'Storage IC reballing, eMMC and UFS memory chip replacement, health 90% consumed repair, and RPMB provisioning in Purulia.',
    imageAltText: 'eMMC and UFS memory chip replacement in Purulia',
    slug: 'emmc-ufs-reballing',
    description: 'eMMC Reballing • UFS Reballing • eMMC/UFS Replacement • Storage-related Problems',
    longDescription: 'Equipped with EasyJTAG Plus, UFI Box, and MiPI Tester for read/write partition repair, eMMC health 90% exhausted revival, UFS 2.1 / 3.1 / 4.0 IC reballing, and clean hardware storage swap with RPMB data preservation.',
    imageUrl: '/assets/images/emmc_ufs_reballing_1790050773698.jpg',
    icon: 'HardDrive',
    badge: 'Storage & Memory Hub',
    displayOrder: 8,
    active: true,
    problemsCovered: [
      'eMMC & UFS 2.1/3.1 reballing',
      '90% consumed storage health fix',
      'Memory IC hardware swap & ISP'
    ],
    serviceSlugs: [
      'emmc-ufs-programming',
      'motherboard-repair',
      'software-programming'
    ]
  },
  {
    id: 'cat-software-unlocking',
    name: 'Software & Unlocking Solutions',
    h1Name: 'Software & Unlocking Solutions in Purulia',
    seoTitle: 'Software & Mobile Unlocking Solutions in Purulia | MOBO SAVIOR',
    metaDescription: 'Fastboot unbricking, EDL flashing, system bootloop repairs, official firmware flashing, and forgotten lock assistance in Purulia.',
    imageAltText: 'Software flashing and EDL recovery bench in Purulia',
    slug: 'software-unlocking',
    description: 'Software Issues • Flashing • Programming • Unlocking • Software-related Problems',
    longDescription: 'Official server authorization tools and deep-flash protocols to revive hard-bricked devices, recover corrupted OS partitions, solve fastboot loop errors, and provide legitimate screen lock/FRP recovery assistance with verification.',
    imageUrl: '/assets/images/software_unlocking_1790050786705.jpg',
    icon: 'Terminal',
    badge: 'Unlocking & Firmware',
    displayOrder: 9,
    active: true,
    problemsCovered: [
      'System flashing & ROM recovery',
      'EDL mode & preloader unbricking',
      'Legitimate security unlock support'
    ],
    serviceSlugs: [
      'software-programming',
      'emmc-ufs-programming'
    ]
  },
  {
    id: 'cat-motherboard-swapping',
    name: 'Motherboard Swapping & Pairing Solutions',
    h1Name: 'Motherboard Swapping & Board Pairing in Purulia',
    seoTitle: 'Motherboard Swapping & Board Pairing in Purulia | MOBO SAVIOR',
    metaDescription: 'Complete logic board swapping, iPhone serialized component pairing, FaceID transfer, and motherboard replacement in Purulia.',
    imageAltText: 'Motherboard swapping and component pairing in Purulia',
    slug: 'motherboard-swapping',
    description: 'Motherboard Replacement/Swapping • Board Pairing • Device Pairing-related Solutions',
    longDescription: 'When logic boards suffer catastrophic PCB layer fractures or heavy acid immersion, we perform board-to-board transplant, EEPROM security chip transfer, CPU+NAND+Baseband pairing, and full board replacement with genuine diagnostics.',
    imageUrl: '/assets/images/board_swapping_1790050811341.jpg',
    icon: 'Cpu',
    badge: 'Board Swap & Pairing',
    displayOrder: 10,
    active: true,
    problemsCovered: [
      'Clean board swap & transplant',
      'CPU+NAND+Baseband trio pairing',
      'Serialized component calibration'
    ],
    serviceSlugs: [
      'motherboard-repair',
      'cpu-reballing',
      'dead-no-power-repair'
    ]
  },
  {
    id: 'cat-network-solutions',
    name: 'Network & No Service Solutions',
    h1Name: 'Mobile Network & No Service Solutions in Purulia',
    seoTitle: 'Mobile Network & No Service Solutions in Purulia | MOBO SAVIOR',
    metaDescription: 'RF transceiver IC repair, Baseband unknown fix, No SIM / No Service / Weak signal repair for 4G and 5G smartphones in Purulia.',
    imageAltText: 'Mobile network IC repair and RF testing in Purulia',
    slug: 'network-solutions',
    description: 'No Network • No Service • Weak Signal • Network IC/Hardware-related Problems',
    longDescription: 'Comprehensive RF circuit probing with spectrum analyzer and digital multimeter. We repair Baseband PMIC, SDR/WTR transceiver ICs, antenna switch modules, and 5G RF front-end filters to restore full voice and data connectivity.',
    imageUrl: '/assets/images/network_solutions_1790050826784.jpg',
    icon: 'Radio',
    badge: 'RF & Baseband Lab',
    displayOrder: 11,
    active: true,
    problemsCovered: [
      'WTR & SDR transceiver IC replacement',
      'Baseband Unknown & Null IMEI fix',
      '5G / 4G RF power amplifier repair'
    ],
    serviceSlugs: [
      'network-signal-repair',
      'motherboard-repair'
    ]
  },
  {
    id: 'cat-curved-display',
    name: 'Curved Display Repair & Replacement',
    h1Name: 'Curved AMOLED Display Repair in Purulia',
    seoTitle: 'Curved AMOLED Display Repair in Purulia | MOBO SAVIOR',
    metaDescription: 'Curved OLED and AMOLED screen replacement, green line / white screen repair, and edge touch digitizer restoration in Purulia.',
    imageAltText: 'Curved AMOLED screen repair in Purulia',
    slug: 'curved-display-repair',
    description: 'Curved AMOLED/OLED Display Repair • Display Replacement • Touch/Display Problems',
    longDescription: 'Specialized in Samsung Edge/Ultra, OnePlus Curved, Motorola Edge, and Vivo X-Series displays. We provide original curved AMOLED panels with 120Hz LTPO smoothness, in-display optical/ultrasonic fingerprint support, and flex bonding repair.',
    imageUrl: '/assets/images/curved_display_repair_1790050840795.jpg',
    icon: 'Smartphone',
    badge: 'Curved AMOLED Hub',
    displayOrder: 12,
    active: true,
    problemsCovered: [
      'Edge-to-edge curved AMOLED screens',
      'Green line & pink line OLED fix',
      'Edge ghost touch calibration'
    ],
    serviceSlugs: [
      'curved-display',
      'display-replacement',
      'green-line-white-display'
    ]
  },
  {
    id: 'cat-curved-glass-cutting',
    name: 'Curved Display Glass Cutting & Replacement',
    h1Name: 'Curved Glass Cutting & OCA Replacement in Purulia',
    seoTitle: 'Curved Glass Cutting & OCA Replacement in Purulia | MOBO SAVIOR',
    metaDescription: 'Diamond molybdenum wire curved glass cutting, OCA vacuum lamination, and original display glass restoration in Purulia.',
    imageAltText: 'Curved glass cutting and OCA lamination machine in Purulia',
    slug: 'curved-glass-cutting',
    description: 'Curved Glass Cutting • Glass Replacement • OCA/Lamination Work',
    longDescription: 'Keep your 100% original factory display intact while saving up to 70% of replacement cost. We safely cut fractured outer curved glass on a heating vacuum separator and laminate OEM grade scratch-resistant glass with high-pressure autoclave chambers.',
    imageUrl: '/assets/images/curved_glass_cutting_1790050858654.jpg',
    icon: 'Layers',
    badge: 'OCA Vacuum Lamination',
    displayOrder: 13,
    active: true,
    problemsCovered: [
      'Molybdenum wire curved glass separation',
      'Retain 100% original AMOLED panel',
      'OCA bubble-free vacuum lamination'
    ],
    serviceSlugs: [
      'curved-display',
      'display-replacement'
    ]
  },
  {
    id: 'cat-iphone-back-glass',
    name: 'iPhone Back Glass / Back Panel Replacement',
    h1Name: 'iPhone Back Glass & Rear Panel Replacement in Purulia',
    seoTitle: 'iPhone Back Glass & Rear Panel Replacement in Purulia | MOBO SAVIOR',
    metaDescription: 'Laser machine iPhone back glass removal, seamless back panel replacement, and middle frame housing restoration in Purulia.',
    imageAltText: 'Laser back glass removal machine in Purulia',
    slug: 'iphone-back-glass',
    description: 'iPhone Back Glass Replacement • Back Panel Replacement • Housing-related Work',
    longDescription: 'Using computerized optical laser machines to vaporize rear adhesive without dismantling internal motherboard or battery. Restores shattered iPhone 11 to iPhone 16 Pro Max back glass to original factory finish with MagSafe alignment and water-resistant perimeter bonding.',
    imageUrl: '/assets/images/back_glass_repair_1790050876115.jpg',
    icon: 'Smartphone',
    badge: 'Laser Rear Glass Lab',
    displayOrder: 14,
    active: true,
    problemsCovered: [
      'Laser machine adhesive vaporizing',
      'MagSafe & wireless charging protection',
      'Full rear chassis housing renewal'
    ],
    serviceSlugs: [
      'iphone-repair',
      'battery-replacement'
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
