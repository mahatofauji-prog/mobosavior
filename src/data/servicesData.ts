import { Service } from '../types';

export const ALL_COMPREHENSIVE_SERVICES: Service[] = [
  // 1. iPhone Repair
  {
    id: 'srv-iphone-repair',
    name: 'iPhone Repair',
    slug: 'iphone-repair',
    category: 'Apple',
    imageUrl: '/assets/images/service_iphone_repair_1788169632215.jpg',
    description: 'Expert diagnostics, original spec parts, and micro-soldering for all iPhone models.',
    overview: 'MOBO SAVIOR provides certified diagnostic and precision repair services for the complete Apple iPhone lineup, from iPhone 11 to the latest iPhone 16 Pro Max. Every repair uses high-grade original spec components, anti-static workstations, and microscopic alignment tools to restore full factory functionality.',
    priceType: 'estimate',
    price: '999',
    estimatedTime: '30 - 60 Mins',
    warranty: 'Up to 6 Months Warranty',
    problemsCovered: [
      'Cracked or Broken Retina / OLED Screen',
      'Battery Health Degraded or Rapid Draining',
      'Logic Board Micro-Shorts & Panic Full Errors',
      'Face ID TrueDepth Sensor Failure',
      'Charging Port & Tristar IC Failure',
      'Camera Shake / Blurry Lens Glass'
    ],
    symptoms: [
      'iPhone showing Apple logo boot loop or restart cycle',
      'Battery percentage drops rapidly or powers off at 20%',
      'Screen lines, black screen with sound, or ghost touch',
      'Face ID is not available or TrueDepth camera issue',
      'Not charging or requiring cable angling to connect'
    ],
    diagnosisProcess: 'Multimeter resistance check on VDD_MAIN line, thermal imaging for hot spots, battery health cycle analysis via computer diagnostics, and camera module optical test.',
    repairProcessSteps: [
      'Physical inspection & serial number verification under ESD mat',
      'Laser-guided heating and precision screen frame separation',
      'Battery disconnection and component-level testing',
      'OEM replacement part installation with genuine water-resistant seal',
      'TrueTone data transfer and ambient light sensor programming',
      'Final 24-point hardware and thermal stability verification'
    ],
    toolsAndTech: [
      'Trinocular Stereo Microscope (7X-45X)',
      'JCID V1SE Programmer for TrueTone and Battery Health',
      'ShortCam II Infrared Thermal Imager',
      'QianLi Precision ESD Tweezers & Screwdrivers',
      'Digital DC Power Supply (30V / 5A)'
    ],
    supportedBrands: ['Apple'],
    supportedModels: ['iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16', 'iPhone 15 Pro Max', 'iPhone 15', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 12', 'iPhone 11'],
    modelPrices: [
      { model: 'iPhone 11', price: '₹1,999' },
      { model: 'iPhone 12', price: '₹2,499' },
      { model: 'iPhone 13', price: '₹2,999' },
      { model: 'iPhone 14', price: '₹3,499' },
      { model: 'iPhone 15', price: '₹3,999' },
      { model: 'iPhone 16 Pro Max', price: '₹5,999' }
    ],
    importantNotes: 'We recommend taking an iCloud backup before major board-level repairs. Face ID repairs preserve biometric security using microscopic wire jumping.',
    faqs: [
      {
        question: 'Will my TrueTone and Face ID work after screen replacement?',
        answer: 'Yes! We use specialized JCID programmers to transfer your original screen display ROM data and serialize Face ID sensors so TrueTone and biometric sensors remain 100% functional.'
      },
      {
        question: 'How long does an iPhone battery or screen swap take?',
        answer: 'Standard screen and battery replacements are typically completed in front of you within 30 to 45 minutes.'
      }
    ],
    seoTitle: 'iPhone Repair in Purulia | Expert Apple Service | MOBO SAVIOR',
    metaDescription: 'Trusted iPhone repair lab in Purulia by Saddam Bhai. Screen, battery, logic board, and Face ID repairs for iPhone 11 to iPhone 16 Pro Max.',
    active: true,
    featured: true,
    displayOrder: 1
  },

  // 2. Android Repair
  {
    id: 'srv-android-repair',
    name: 'Android Repair',
    slug: 'android-repair',
    category: 'Android',
    imageUrl: '/assets/images/slide_android_1788168049303.jpg',
    description: 'Complete hardware and software repair solutions for Samsung, Xiaomi, Vivo, Oppo, OnePlus, and Realme.',
    overview: 'At MOBO SAVIOR, our Android repair facility is equipped with state-of-the-art diagnostic benches and chip-level tools. Whether you have a cracked AMOLED display on a OnePlus, a dead boot on a Samsung Galaxy, or a camera lens issue on a Xiaomi, we provide fast, high-quality turnaround.',
    priceType: 'estimate',
    price: '499',
    estimatedTime: '45 - 90 Mins',
    warranty: 'Up to 6 Months Warranty',
    problemsCovered: [
      'Cracked AMOLED / LCD Screen & Touch digitizer',
      'Rapid Battery Drain & Swollen Back Panel',
      'Dead Boot / Stuck on Fastboot & Recovery',
      'Charging Port Damage (Type-C / Micro-USB)',
      'Low Ear Speaker & Mic Volume during calls',
      'No Network / Emergency Calls Only'
    ],
    symptoms: [
      'Phone stuck on brand logo during boot',
      'Touch screen unresponsive in specific zones',
      'Phone gets excessively hot near the processor or battery',
      'No sound from loudspeaker or headphone jack',
      'Battery discharges in under 3 hours of moderate use'
    ],
    diagnosisProcess: 'DC power supply boot signature curve testing, port current draw measurement via USB doctor, and thermal camera scanning for parasitic battery drains.',
    repairProcessSteps: [
      'Intake diagnostic and customer symptom mapping',
      'Clean thermal heat separation of back cover without frame damage',
      'Modular disconnect and motherboard insulation',
      'Installation of OEM grade replacement modules',
      'Network frequency and speaker decibel testing',
      'Full device reassembly with OEM adhesive tape'
    ],
    toolsAndTech: [
      'Sugon T26 Precision Soldering Station',
      'Yihua 853D Hot Air Rework Station',
      'Sunshine Multimeter & USB Power Meter',
      'Vacuum Screen Separator Hot Plate'
    ],
    supportedBrands: ['Samsung', 'Xiaomi / Redmi / POCO', 'OnePlus', 'Vivo', 'Oppo', 'Realme', 'Motorola', 'iQOO', 'Google Pixel'],
    supportedModels: ['Galaxy S23', 'OnePlus 11', 'Redmi Note 13', 'Vivo V29', 'Realme 12 Pro', 'POCO X3 Pro', 'iQOO 12'],
    modelPrices: [
      { model: 'Redmi / POCO Series', price: '₹1,299' },
      { model: 'Realme / Oppo Series', price: '₹1,499' },
      { model: 'Vivo Series', price: '₹1,599' },
      { model: 'OnePlus Series', price: '₹2,499' },
      { model: 'Samsung Galaxy Series', price: '₹2,999' }
    ],
    importantNotes: 'Data is strictly preserved during screen and hardware replacements. For software flashing, backups are recommended.',
    faqs: [
      {
        question: 'Do you fix curved screen Android phones?',
        answer: 'Yes! We specialize in edge-to-edge curved OLED displays for Samsung Galaxy S series, Vivo V series, OnePlus, and Motorola.'
      }
    ],
    seoTitle: 'Android Mobile Repair in Purulia | Samsung, OnePlus, Xiaomi | MOBO SAVIOR',
    metaDescription: 'Top-rated Android repair center in Purulia. Hardware, screen, battery, and chip-level fixes for all Android brands with warranty.',
    active: true,
    featured: true,
    displayOrder: 2
  },

  // 3. Motherboard & Chip-Level Repair
  {
    id: 'srv-motherboard-repair',
    name: 'Motherboard Repair',
    slug: 'motherboard-repair',
    category: 'Chip-Level',
    imageUrl: '/assets/images/differ_micro_soldering_1788169185732.jpg',
    description: 'Microscopic logic board recovery, short-circuit removal, and trace jumpering.',
    overview: 'When service centers declare your phone "motherboard dead - non repairable", MOBO SAVIOR brings it back to life. Saddam Bhai uses microscopic micro-soldering, ZXW schematic blueprints, and infrared thermal imaging to trace micron-thin circuit traces and replace blown SMD capacitors, coils, and diodes.',
    priceType: 'upon_inspection',
    price: '1499',
    estimatedTime: '2 - 6 Hours',
    warranty: '90 Days Testing Warranty',
    problemsCovered: [
      'Dead Phone / Zero Power Draw',
      'VCC_MAIN / VBAT Short Circuits',
      'Restart Loop due to board flexing or drops',
      'Water Damage Corroded Resistor Networks',
      'Missing Voltages on PMIC output rails'
    ],
    symptoms: [
      'Phone will not power on and draws 0.00A on charger',
      'Charger indicator blinks or charger turns off when plugged in',
      'Device gets burning hot near the processor immediately after connecting power',
      'Phone vibrates once but no display or boot'
    ],
    diagnosisProcess: 'Impedance testing on all primary power rails using 4-digit multimeter, followed by thermal leak injection at 1.2V to identify glowing shorted capacitors under thermal imaging.',
    repairProcessSteps: [
      'Motherboard deshelving and shield can removal using low-melt alloy',
      'Microscopic inspection for cracked solder balls and oxidation',
      'Removal of damaged SMD components using precision curved micro-tweezers',
      'Replacement with matching tolerance capacitance and inductance components',
      '0.02mm insulated jumper wire routing for broken traces',
      'Post-repair DC boot curve validation'
    ],
    toolsAndTech: [
      'Relife Trinocular HD Microscope',
      'ShortCam Thermal Imaging System',
      'JBC Nano Soldering Station with C210 cartridge tips',
      'ZXW Dongle Board Schematics Software',
      'Quick 861DW 1000W Hot Air Rework System'
    ],
    supportedBrands: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Vivo', 'Oppo', 'Realme', 'Google Pixel'],
    modelPrices: [
      { model: 'Basic Android Motherboard', price: '₹1,499' },
      { model: 'Flagship Android (Snapdragon 8 Gen)', price: '₹2,999' },
      { model: 'iPhone 11 - 13 Series', price: '₹3,499' },
      { model: 'iPhone 14 - 16 Series', price: '₹4,999' }
    ],
    importantNotes: 'We maintain a 92%+ success rate on dead logic boards. Your precious data (photos, contacts, chats) is preserved whenever possible.',
    faqs: [
      {
        question: 'Can my dead phone data be recovered?',
        answer: 'In the vast majority of cases, yes! As long as the central CPU and encrypted storage chip (UFS/eMMC/NAND) are physically intact, repairing the power circuits restores the device and recovers all your data.'
      }
    ],
    seoTitle: 'Motherboard Repair in Purulia | Chip-Level Micro-Soldering | MOBO SAVIOR',
    metaDescription: 'Expert mobile motherboard repair in Purulia. Short circuit removal, trace jumpering, and dead phone recovery using thermal camera and microscope.',
    active: true,
    featured: true,
    displayOrder: 3
  },

  // 4. CPU Reballing
  {
    id: 'srv-cpu-reballing',
    name: 'CPU Reballing',
    slug: 'cpu-reballing',
    category: 'Chip-Level',
    imageUrl: '/assets/images/service_cpu_soldering_1788169676958.jpg',
    description: 'Precision desoldering, re-balling with leaded solder spheres, and re-mounting of BGA processors.',
    overview: 'Modern smartphones with high-heat processors (like POCO X3 Pro, OnePlus 9/10, Samsung S20/S21) frequently suffer from fractured solder joints beneath the double-decker CPU and RAM sandwich. MOBO SAVIOR specializes in precision CNC layer separation, microscopic stencil reballing with 0.25mm solder spheres, and infrared reflow.',
    priceType: 'upon_inspection',
    price: '2499',
    estimatedTime: '3 - 5 Hours',
    warranty: '90 Days Warranty',
    problemsCovered: [
      'POCO X3 Pro / Redmi Note 10 Dead / Restart problem',
      'CPU + RAM Double Decker Disconnection',
      'Sudden White Screen / Grey Lines then Dead',
      'Camera App Freezing / Crashing due to APU desolder',
      'Audio IC and Baseband CPU solder degradation'
    ],
    symptoms: [
      'Phone suddenly rebooted and never turned back on',
      'Display shows snowy grey or white static screen before freezing',
      'Phone heats up excessively but draws erratic 0.15A - 0.25A current',
      'Device recognized only as Qualcomm HS-USB QDLoader 9008 on PC'
    ],
    diagnosisProcess: 'Computer device manager connection test to inspect Qualcomm EDL 9008 handshake, combined with DC power supply current waveform matching.',
    repairProcessSteps: [
      'Board thermal pre-heating to prevent layer delamination',
      'Precision thermal air lift of RAM top layer at 340°C',
      'Removal of main CPU BGA base without pulling copper pads',
      'Ultrasonic PCB pad cleaning and green oil solder mask curing under UV light',
      'Laser-cut Amaoe BGA stencil alignment with Mechanic 183°C solder paste',
      'Accurate placement and optical realignment under 45X magnification',
      'Thermal stress test running Antutu Benchmark'
    ],
    toolsAndTech: [
      'Amaoe High-Precision Dedicated CPU Stencils',
      'Quick 861DW Cyclone Hot Air Station',
      'Mechanic Leaded Solder Paste (183°C / 158°C)',
      'UV Optical Green Solder Mask Curing Lamp',
      'Amtech NC-559-V2 Flux'
    ],
    supportedBrands: ['Xiaomi / POCO', 'OnePlus', 'Samsung', 'Vivo', 'Realme'],
    supportedModels: ['POCO X3 Pro', 'POCO F3 / F4', 'Redmi Note 10 Pro', 'OnePlus 9 Pro', 'OnePlus 10 Pro', 'Galaxy S21 Ultra'],
    modelPrices: [
      { model: 'POCO X3 / X3 Pro CPU', price: '₹2,499' },
      { model: 'Redmi Note 10 / 11 Pro CPU', price: '₹2,799' },
      { model: 'OnePlus 8 / 9 / 10 Series CPU', price: '₹3,999' },
      { model: 'Samsung Exynos / Snapdragon CPU', price: '₹4,499' }
    ],
    importantNotes: 'CPU reballing is a 100% permanent fix when performed with leaded solder spheres, preventing future thermal fatigue cracking.',
    faqs: [
      {
        question: 'Why does POCO X3 Pro get dead suddenly?',
        answer: 'The factory lead-free solder underneath the Qualcomm Snapdragon CPU becomes brittle from thermal expansion cycles during gaming and video recording, causing broken connections. Reballing with flexible leaded solder completely fixes this issue.'
      }
    ],
    seoTitle: 'CPU Reballing Service in Purulia | POCO, OnePlus, Samsung | MOBO SAVIOR',
    metaDescription: 'Specialized mobile CPU reballing and RAM double-decker repair in Purulia. Fix POCO X3 Pro dead boot loop, 9008 port, and motherboard crashes.',
    active: true,
    featured: true,
    displayOrder: 4
  },

  // 5. eMMC/UFS Programming
  {
    id: 'srv-emmc-ufs-programming',
    name: 'eMMC/UFS Programming',
    slug: 'emmc-ufs-programming',
    category: 'Software',
    imageUrl: '/assets/images/differ_diagnostic_bench_1788169232321.jpg',
    description: 'Hardware memory chip replacement, JTAG ISP pinout programming, and health recovery.',
    overview: 'When internal storage reaches end-of-life (eMMC health >90% consumed) or suffers partition corruption, smartphones get permanently stuck in bootloops. Using EasyJTAG Plus, UFI Box, and MiPI Tester, we extract dumps, replace worn BGA memory chips, and program boot partitions with original RPMB keys.',
    priceType: 'upon_inspection',
    price: '1999',
    estimatedTime: '2 - 4 Hours',
    warranty: '90 Days Warranty',
    problemsCovered: [
      'eMMC 90% Life Consumed (Worn Memory)',
      'Bricked / Dead Boot after failed flash update',
      'Internal Storage Encrypted / Not Mounting',
      'RPMB Partition mismatch and IMEI repair'
    ],
    symptoms: [
      'Phone boots straight to Recovery saying "Data Partition Corrupt"',
      'Device boots to fastboot mode and cannot flash official ROM',
      'Storage full warning even after factory reset',
      'Total sudden brick with no charging animation'
    ],
    diagnosisProcess: 'Direct JTAG / ISP pinout connection to read CID, CSD, and SMART health report registers from the memory controller.',
    repairProcessSteps: [
      'Microscopic solder mask scraping to reach CLK, CMD, and DAT0 test points',
      'Full memory health reading and EXT_CSD dump backup',
      'Chip desoldering and replacement with genuine Micron / Samsung UFS 3.1 chip',
      'Partition configuration and RPMB provision write',
      'Device reassembly and official software installation'
    ],
    toolsAndTech: [
      'EasyJTAG Plus Box',
      'UFI Box 2024 Hardware Adapter',
      'MiPI Tester High-Speed UFS Programmer',
      'BGA 254 / 153 Sockets'
    ],
    supportedBrands: ['Xiaomi', 'Samsung', 'Vivo', 'Oppo', 'Realme'],
    modelPrices: [
      { model: 'eMMC 64GB Replacement', price: '₹1,999' },
      { model: 'eMMC 128GB Upgrade', price: '₹2,799' },
      { model: 'UFS 2.1 / 3.1 Replacement', price: '₹3,499' }
    ],
    importantNotes: 'We maintain backups of unique radio calibration partitions (NVRAM/EFS) to guarantee network connectivity after chip swapping.',
    faqs: [
      {
        question: 'Can you upgrade my phone storage from 64GB to 128GB?',
        answer: 'Yes! On supported Android and iPhone models, we can upgrade your physical memory chip to higher capacity while programming the official firmware.'
      }
    ],
    seoTitle: 'eMMC & UFS Programming in Purulia | Storage Chip Repair | MOBO SAVIOR',
    metaDescription: 'eMMC & UFS flash memory replacement and ISP programming in Purulia. Fix dead boot, 90% consumed health, and bricked phones with UFI & EasyJTAG.',
    active: true,
    featured: true,
    displayOrder: 5
  },

  // 6. IC Replacement
  {
    id: 'srv-ic-replacement',
    name: 'IC Replacement',
    slug: 'ic-replacement',
    category: 'Chip-Level',
    imageUrl: '/assets/images/slide_cpuic_1788168157704.jpg',
    description: 'Replacement of Power IC (PMIC), Audio Codec IC, Network WTR, and Light IC.',
    overview: 'From Qualcomm PM8150 and MediaTek MT6357 Power ICs to Cirrus Logic Audio Codecs and Skyworks Network Amplifiers, MOBO SAVIOR stocks genuine brand-new BGA chips. We replace damaged ICs using temperature-controlled soldering, curing UV adhesives, and verifying all output LDO voltages.',
    priceType: 'upon_inspection',
    price: '1199',
    estimatedTime: '1 - 3 Hours',
    warranty: '90 Days Warranty',
    problemsCovered: [
      'Main Power Management IC (PMIC) burnout',
      'Charging Controller / OVP / Tristar IC failure',
      'Audio Codec IC (iPhone 7/8 audio loop problem)',
      'Display Light / Backlight Boost IC failure',
      'WTR Transceiver / Network PA IC damage'
    ],
    symptoms: [
      'Phone does not charge or shows red battery symbol continuously',
      'Speaker and microphone both disabled during voice calls',
      'Display has faint image visible under bright flashlight but no backlight',
      'SIM card recognized but phone stays on "Searching..." or "No Service"'
    ],
    diagnosisProcess: 'Oscilloscope bus probing for I2C communication lines and coil voltage check across all buck converters.',
    repairProcessSteps: [
      'Isolation of malfunctioning IC using multimeter diode mode readings',
      'Surrounding component shield taping with Kapton heat-reflective film',
      'Micro-thermal lift of damaged IC',
      'Copper wick desoldering and flux neutralization',
      'Placement and reflow of genuine new IC',
      'Current draw and function testing'
    ],
    toolsAndTech: ['JBC Precision Soldering', 'Kapton Heat Shield Film', 'Thermal Imaging Microscope', 'Digital Storage Oscilloscope'],
    supportedBrands: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Vivo', 'Oppo'],
    modelPrices: [
      { model: 'Charging / OVP IC', price: '₹1,199' },
      { model: 'Light / Graphic IC', price: '₹1,499' },
      { model: 'Audio Codec IC', price: '₹1,899' },
      { model: 'Primary Power IC (PMIC)', price: '₹2,199' },
      { model: 'Network Transceiver WTR', price: '₹2,499' }
    ],
    importantNotes: 'We use brand new, factory-tested ICs with high quality balls rather than pulled scrap components.',
    faqs: [
      {
        question: 'How do you know which IC is bad?',
        answer: 'We measure voltage drops and diode values on surrounding test points according to OEM schematic board blueprints, locating the exact micro-chip causing the short or missing output.'
      }
    ],
    seoTitle: 'Mobile IC Replacement in Purulia | Power IC, Audio, Network | MOBO SAVIOR',
    metaDescription: 'Expert mobile IC replacement in Purulia. Power Management IC, Charging IC, Audio Codec, and Network WTR micro-soldering.',
    active: true,
    featured: true,
    displayOrder: 6
  },

  // 7. Dead Phone / No Power Repair
  {
    id: 'srv-dead-no-power-repair',
    name: 'Dead / No Power Repair',
    slug: 'dead-no-power-repair',
    category: 'Chip-Level',
    imageUrl: '/assets/images/service_dead_phone_1788169662887.jpg',
    description: 'Full recovery for completely dead, dropped, or non-charging smartphones.',
    overview: 'If your smartphone has suddenly died, suffered a sudden drop, or gone dark after an overnight charge, do not lose hope. MOBO SAVIOR is Purulia’s dedicated dead device recovery center. We diagnose power management, battery cutoff circuits, processor handshakes, and shorted components.',
    priceType: 'upon_inspection',
    price: '1299',
    estimatedTime: '2 - 5 Hours',
    warranty: '90 Days Warranty',
    problemsCovered: [
      'Complete dead device with no LED or vibration',
      'Device drawing 0.00A on high-speed USB multimeter',
      'Overnight charge dead (blown VBUS / PMIC)',
      'Drop damage causing broken solder joints under chips'
    ],
    symptoms: [
      'No reaction to power button or hard reset combinations',
      'PC recognizes phone for 2 seconds then disconnects',
      'Battery voltage measured at 0V due to BMS trip',
      'Phone gets hot near the back camera when connected to charger'
    ],
    diagnosisProcess: 'DC bench power supply 4.2V injection to observe initial leakage and current waveform signature upon pressing power button.',
    repairProcessSteps: [
      'Comprehensive external and internal visual audit',
      'Battery wake-up and BMS safety check',
      'Motherboard isolation and short circuit removal',
      'Clock crystal oscillator frequency verification',
      'Operating system kernel boot test and burn-in run'
    ],
    toolsAndTech: ['ShortCam Thermal Camera', 'Uni-T Digital Multimeter', 'DC Regulated Power Supply', 'Stereo Microscope'],
    supportedBrands: ['All Brands Supported'],
    modelPrices: [
      { model: 'Basic Android Dead Phone', price: '₹1,299' },
      { model: 'Mid-Range Phone Dead Recovery', price: '₹1,999' },
      { model: 'Flagship Phone Dead Recovery', price: '₹2,999' }
    ],
    importantNotes: 'No diagnosis fee if the device is found to be unrepairable due to cracked silicon core.',
    faqs: [
      {
        question: 'Will you charge if the dead phone cannot be fixed?',
        answer: 'No! We maintain a strict "No Fix, No Fee" policy on all diagnostic checks.'
      }
    ],
    seoTitle: 'Dead Phone Repair in Purulia | No Power Recovery | MOBO SAVIOR',
    metaDescription: 'Specialized dead mobile repair in Purulia. Fix phones that will not turn on or charge. Micro-soldering and short circuit repair with warranty.',
    active: true,
    featured: true,
    displayOrder: 7
  },

  // 8. Network & Signal Repair
  {
    id: 'srv-network-signal-repair',
    name: 'Network / Signal Problem',
    slug: 'network-signal-repair',
    category: 'Chip-Level',
    imageUrl: '/assets/images/slide_network_1788168142613.jpg',
    description: 'Fixing No Service, Searching, Baseband Unknown, and Wi-Fi / Bluetooth grayed out.',
    overview: 'No service, frequent call dropping, or "Baseband Unknown" after software updates are hardware RF transceiver failures. We replace baseband power management chips, RF switches, and high-band power amplifiers to restore full 4G and 5G signal reception.',
    priceType: 'upon_inspection',
    price: '1499',
    estimatedTime: '2 - 4 Hours',
    warranty: '90 Days Warranty',
    problemsCovered: [
      'No Service / Searching for Network',
      'Emergency Calls Only with active SIM',
      'Baseband Version Unknown in Settings',
      'Wi-Fi / Bluetooth Toggle Greyed Out',
      '5G Signal Dropping to 2G / Edge'
    ],
    symptoms: [
      'SIM card detected but network signal bars stay empty',
      'Dialing *#06# does not display IMEI number',
      'Wi-Fi switch cannot be turned on in settings',
      'Frequent call disconnects every 30 seconds'
    ],
    diagnosisProcess: 'Spectrum analyzer check, baseband LDO rail voltage validation, and antenna coax trace continuity testing.',
    repairProcessSteps: [
      'Antenna sub-board and coax cable verification',
      'Baseband PMIC voltage measurement under microscope',
      'WTR transceiver or Baseband CPU rework/reballing',
      'RF filter and power amplifier tuning',
      'Live SIM card call and high-speed data test'
    ],
    toolsAndTech: ['Spectrum Analyzer Probe', 'JBC Micro-Soldering', 'RF Test SIM Cards', 'Board Schematics'],
    supportedBrands: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Vivo', 'Oppo'],
    modelPrices: [
      { model: 'Android RF / WTR Repair', price: '₹1,499' },
      { model: 'iPhone Baseband Repair', price: '₹2,999' },
      { model: 'Wi-Fi / Bluetooth IC Repair', price: '₹1,999' }
    ],
    importantNotes: 'We ensure both primary and diversity antennas are balanced for superior rural network coverage.',
    faqs: [
      {
        question: 'Why does iPhone show Searching... or No Service?',
        answer: 'This is commonly caused by a fractured solder joint under the Qualcomm baseband processor or faulty baseband power controller, which we fix with precision micro-soldering.'
      }
    ],
    seoTitle: 'Mobile Network & Signal Repair in Purulia | MOBO SAVIOR',
    metaDescription: 'Fix No Service, Searching, Baseband Unknown, and Wi-Fi issues in Purulia. Hardware RF and baseband IC repairs for iPhone and Android.',
    active: true,
    featured: true,
    displayOrder: 8
  },

  // 9. Advanced Chip-Level Repair
  {
    id: 'srv-advanced-chip-level-repair',
    name: 'Advanced Chip-Level Repair',
    slug: 'advanced-chip-level-repair',
    category: 'Chip-Level',
    imageUrl: '/assets/images/differ_micro_soldering_1788169185732.jpg',
    description: 'Complex multi-layer sandwich board separation, pad restoration, and custom jumpers.',
    overview: 'For modern high-end phones with layered sandwich logic boards (iPhone X to 16, Galaxy S22 to S24), standard repair shops are completely unable to assist. MOBO SAVIOR uses CNC heating separation platforms, interlayer reballing stencils, and microscopic copper trace jumping under 45X stereo magnification.',
    priceType: 'upon_inspection',
    price: '2999',
    estimatedTime: '3 - 6 Hours',
    warranty: '90 Days Warranty',
    problemsCovered: [
      'Sandwich Motherboard Layer Separation & Re-joining',
      'Torn / Missing PCB Copper Solder Pads',
      'Inter-layer Via Trace Fractures from drops',
      'Processor Core Re-routing'
    ],
    symptoms: [
      'Phone had heavy impact and half functions stopped working',
      'Touch not working even with new display due to sandwich joint separation',
      'Previous repair shop pulled off solder pads from board'
    ],
    diagnosisProcess: 'Layered thermal split with digital temperature control followed by microscopic pad continuity mapping against schematic blueprints.',
    repairProcessSteps: [
      'CNC separation of upper logic and lower RF boards',
      'Microscopic pad repair using 0.01mm enamelled copper wire',
      'UV curable green mask insulation',
      'Middle frame stencil reballing with 138°C low-melt alloy',
      'Precision thermal alignment and reflow',
      'Comprehensive functional testing'
    ],
    toolsAndTech: ['Mijing Layer Separation Heating Station', '0.01mm Micro-Jumper Wire', 'UV Curing Mask', 'Trinocular Microscope'],
    supportedBrands: ['Apple iPhone', 'Samsung Galaxy Flagships', 'OnePlus'],
    modelPrices: [
      { model: 'iPhone Sandwich Layer Split & Reball', price: '₹3,499' },
      { model: 'Pad Restoration & Jumpering', price: '₹2,999' },
      { model: 'Dual Board Rebuild', price: '₹4,499' }
    ],
    importantNotes: 'We specialize in saving motherboards that other repair shops have rejected as damaged or unrepairable.',
    faqs: [
      {
        question: 'What is a sandwich motherboard?',
        answer: 'Modern iPhones and flagship Androids use two logic boards stacked on top of each other with hundreds of solder balls in between. Drops can crack these middle connections, which we separate, repair, and re-fuse perfectly.'
      }
    ],
    seoTitle: 'Advanced Chip-Level Mobile Repair in Purulia | MOBO SAVIOR',
    metaDescription: 'Purulia’s top chip-level lab for layered sandwich board repair, pad rebuilding, and micro-soldering. Highest success rate in West Bengal.',
    active: true,
    featured: true,
    displayOrder: 9
  },

  // 10. Display Replacement (Main)
  {
    id: 'srv-display-replacement',
    name: 'Display Replacement',
    slug: 'display-replacement',
    category: 'Display',
    imageUrl: '/assets/images/service_display_replace_1788169648346.jpg',
    description: 'High quality screen replacements with perfect touch response, vibrant colors, and true fit.',
    overview: 'Cracked glass, black ink spots, touch lag, or green lines? MOBO SAVIOR offers certified display replacements tailored to your budget and device specifications. We provide multiple transparent quality options: Budget TFT/LCD, Premium OLED, 100% Genuine Original, and Curved AMOLED panels with warranty.',
    priceType: 'estimate',
    price: '1199',
    estimatedTime: '30 - 60 Mins',
    warranty: 'Up to 6 Months Warranty',
    problemsCovered: [
      'Cracked Front Glass / Shattered Outer Lens',
      'Black Spots / Ink Bleeding on OLED',
      'Unresponsive Touch or Ghost Touching',
      'Flickering Display or Blank Screen with sound',
      'Green Line / Pink Line after software updates'
    ],
    symptoms: [
      'Glass is broken but touch works partially',
      'Phone rings on incoming calls but display stays completely dark',
      'Vertical lines of color running across the screen',
      'Screen lifts away from frame due to swollen battery'
    ],
    diagnosisProcess: 'Display frame inspection, connector pin continuity check, and touch digitizer grid testing across 100% of the screen area.',
    repairProcessSteps: [
      'Safe heating and separation of broken display',
      'Old glue and glass particle cleaning from metal housing',
      'Test fit of new display panel for color, brightness, and refresh rate',
      'TrueTone / biometric calibration data transfer',
      'Precision frame bonding with waterproof B-7000 / OEM tape',
      'Clamp curing and final quality assurance'
    ],
    toolsAndTech: ['Vacuum Screen Separator', 'TrueTone Calibration Tool', 'Laser Alignment Molds', 'Industrial Frame Clamps'],
    supportedBrands: ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Vivo', 'Oppo', 'Realme', 'Motorola', 'iQOO', 'Google Pixel'],
    supportedModels: ['iPhone 11 - 16', 'Samsung Galaxy A / S Series', 'OnePlus Series', 'Redmi Note Series', 'Vivo V Series'],
    modelPrices: [
      { model: 'Entry Budget Phone Screen', price: '₹1,199' },
      { model: 'Mid-Range FHD+ Display', price: '₹1,999' },
      { model: 'AMOLED Screen (OnePlus, Vivo, Samsung)', price: '₹3,499' },
      { model: 'Curved AMOLED Display', price: '₹5,499' }
    ],
    qualityOptions: [
      { name: 'TFT / LCD', description: 'Budget-friendly aftermarket display with sharp resolution.', price: '₹1,199', slug: 'tft-display' },
      { name: 'Premium OLED', description: 'High contrast, deep blacks, excellent battery efficiency.', price: '₹2,499', slug: 'oled-display' },
      { name: 'Original Display', description: '100% genuine factory grade display with OEM refresh rate.', price: '₹4,499', slug: 'original-display' }
    ],
    importantNotes: 'We clean all metal frame edges thoroughly to prevent future pressure cracks on the new display.',
    faqs: [
      {
        question: 'How fast can my screen be replaced?',
        answer: 'Standard screen replacements are completed in approximately 30 to 45 minutes while you wait in our comfortable shop.'
      },
      {
        question: 'Will fingerprint and Face ID work?',
        answer: 'Yes! On in-display fingerprint phones and iPhone Face ID models, all biometric sensors remain fully functional.'
      }
    ],
    seoTitle: 'Display Replacement in Purulia | Mobile Screen Repair | MOBO SAVIOR',
    metaDescription: 'Fast, affordable mobile screen replacement in Purulia. TFT, OLED, and Original screen options with warranty for all phone brands.',
    active: true,
    featured: true,
    displayOrder: 10
  },

  // 11. TFT Display
  {
    id: 'srv-tft-display',
    name: 'TFT / LCD Display Replacement',
    slug: 'tft-display',
    category: 'Display',
    imageUrl: '/assets/images/service_display_replace_1788169648346.jpg',
    description: 'Cost-effective aftermarket screen replacement ideal for budget devices.',
    overview: 'If you want to restore your phone affordably without spending the high price of an OEM display, our tested TFT/LCD screens are the perfect choice. Selected from top manufacturers with responsive touch digitizers and reliable backlighting.',
    priceType: 'estimate',
    price: '999',
    estimatedTime: '30 - 45 Mins',
    warranty: '3 Months Testing Warranty',
    problemsCovered: ['Cracked Glass', 'Broken LCD', 'Touch Failure', 'Budget Replacement'],
    symptoms: ['Screen physically cracked', 'Touch lagging', 'Dark or blank display'],
    diagnosisProcess: 'Connector impedance check and housing alignment audit.',
    repairProcessSteps: [
      'Screen frame heating and safe removal',
      'Housing cleaning and straightening',
      'Dry testing touch responsiveness',
      'Cold glue application and frame curing'
    ],
    toolsAndTech: ['Hot Plate Separator', 'Micro-Tweezers', 'Frame Glue'],
    supportedBrands: ['Xiaomi', 'Samsung', 'Realme', 'Oppo', 'Vivo', 'Motorola'],
    modelPrices: [
      { model: 'Redmi 9 / 10 / 11 Series', price: '₹999' },
      { model: 'Realme C Series / Narzo', price: '₹1,099' },
      { model: 'Samsung M / F Series', price: '₹1,299' }
    ],
    importantNotes: 'TFT displays consume slightly more battery than OLED panels but offer excellent everyday value.',
    faqs: [{ question: 'Is TFT display good for gaming?', answer: 'It is great for regular usage, social media, and casual gaming.' }],
    seoTitle: 'TFT Display Replacement in Purulia | Low Cost Mobile Screen | MOBO SAVIOR',
    metaDescription: 'Low cost TFT mobile screen replacement in Purulia. Affordable glass and LCD fixes for Redmi, Realme, Samsung, and Vivo.',
    active: true,
    featured: false,
    displayOrder: 11
  },

  // 12. OLED Display
  {
    id: 'srv-oled-display',
    name: 'OLED Display Replacement',
    slug: 'oled-display',
    category: 'Display',
    imageUrl: '/assets/images/slide_display_1788168074454.jpg',
    description: 'Premium OLED panels with rich color saturation, true deep blacks, and 120Hz support.',
    overview: 'Enjoy factory-grade vivid colors, battery-saving true blacks, and smooth high refresh rate (90Hz/120Hz). Our Premium OLED replacements feature ultra-thin glass and support in-display optical and ultrasonic fingerprint sensors.',
    priceType: 'estimate',
    price: '2499',
    estimatedTime: '45 Mins',
    warranty: '6 Months Warranty',
    problemsCovered: ['OLED Panel Bleed', 'Touch Dead Zones', 'Purple Ink Stain', 'Green Screen'],
    symptoms: ['Display has purple or black bleeding ink', 'Display flickers at low brightness'],
    diagnosisProcess: 'Brightness gradation test, 120Hz smooth scrolling validation, and optical fingerprint registration test.',
    repairProcessSteps: [
      'Disassembly with temperature regulation',
      'TrueTone / color profile cloning',
      'OLED panel seating with dust-free chamber',
      'High-precision bezel bonding'
    ],
    toolsAndTech: ['Optical Alignment Jig', 'TrueTone Programmer', 'Thermal Bonding Tool'],
    supportedBrands: ['Samsung', 'Apple', 'OnePlus', 'Xiaomi', 'Vivo', 'iQOO', 'Pixel'],
    modelPrices: [
      { model: 'iPhone 12 / 13 OLED', price: '₹5,499' },
      { model: 'OnePlus 9 / 10 / 11 OLED', price: '₹6,499' },
      { model: 'Samsung A54 / S21 FE OLED', price: '₹4,499' }
    ],
    importantNotes: 'Supports Always-On Display (AOD) with zero light bleed.',
    faqs: [{ question: 'Does in-display fingerprint work on this OLED?', answer: 'Yes! Our OLED panels are manufactured with high optical transparency for fast fingerprint unlocking.' }],
    seoTitle: 'OLED Display Replacement in Purulia | 120Hz AMOLED Screen | MOBO SAVIOR',
    metaDescription: 'Premium OLED display replacement in Purulia. High refresh rate, perfect colors, and in-display fingerprint support for AMOLED smartphones.',
    active: true,
    featured: true,
    displayOrder: 12
  },

  // 13. Premium Quality Display
  {
    id: 'srv-premium-display',
    name: 'Premium Quality Display',
    slug: 'premium-display',
    category: 'Display',
    imageUrl: '/assets/images/slide_display_1788168074454.jpg',
    description: 'High-grade aftermarket display with hardened Gorilla-equivalent glass and vibrant color tone.',
    overview: 'Our Premium Quality displays are manufactured to tight OEM tolerances. They feature Oleophobic anti-fingerprint coating, hardened front glass that resists scratches, and low battery consumption.',
    priceType: 'estimate',
    price: '1899',
    estimatedTime: '30 - 45 Mins',
    warranty: '6 Months Warranty',
    problemsCovered: ['Cracked Screen', 'Scratched Display', 'Touch Lag', 'Flickering'],
    symptoms: ['Shattered glass', 'Glitchy touch', 'Dark screen'],
    diagnosisProcess: 'Multi-touch point grid test and color reproduction analysis.',
    repairProcessSteps: ['Frame cleanout', 'Pre-installation touch check', 'Laser alignment', 'Protective glass installation'],
    toolsAndTech: ['UV Curing Lamp', 'ESD Clean Bench'],
    supportedBrands: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Vivo', 'Oppo'],
    modelPrices: [
      { model: 'iPhone 11 Premium Display', price: '₹2,499' },
      { model: 'Redmi Note Series Premium', price: '₹1,899' },
      { model: 'OnePlus Nord Series Premium', price: '₹2,999' }
    ],
    importantNotes: 'Includes a complimentary 9H tempered glass screen protector.',
    faqs: [{ question: 'How durable is the premium glass?', answer: 'It is reinforced with double-tempered glass to withstand everyday drops and impacts.' }],
    seoTitle: 'Premium Mobile Screen Replacement in Purulia | MOBO SAVIOR',
    metaDescription: 'Upgrade to high-grade mobile display replacement in Purulia. Scratch-resistant glass, vibrant colors, and 6 months warranty.',
    active: true,
    featured: false,
    displayOrder: 13
  },

  // 14. Original Display Replacement
  {
    id: 'srv-original-display',
    name: 'Original Display Replacement',
    slug: 'original-display',
    category: 'Display',
    imageUrl: '/assets/images/service_display_replace_1788169648346.jpg',
    description: '100% Genuine OEM service pack screen with authentic factory calibration.',
    overview: 'For customers who want 100% factory authenticity. These genuine OEM displays come directly with authentic frame housing, original touch digitizer, factory brightness, and official color profiles.',
    priceType: 'estimate',
    price: '3999',
    estimatedTime: '45 - 60 Mins',
    warranty: '6 Months Full Warranty',
    problemsCovered: ['Shattered OEM Display', 'Original Quality Restoration'],
    symptoms: ['Broken screen on flagship phone', 'Requires 100% factory original quality'],
    diagnosisProcess: 'Official service pack verification and factory hardware diagnostics.',
    repairProcessSteps: ['Complete frame swap', 'Component migration (earpiece, vibration motor)', 'Factory seal bonding', 'Full hardware pass'],
    toolsAndTech: ['OEM Torque Screwdrivers', 'Anti-Static Vacuum Station'],
    supportedBrands: ['Apple', 'Samsung', 'OnePlus', 'Google Pixel'],
    modelPrices: [
      { model: 'iPhone 13 Original Display', price: '₹9,999' },
      { model: 'iPhone 14 / 15 Original Display', price: '₹13,999' },
      { model: 'Galaxy S23 Original Service Pack', price: '₹15,999' }
    ],
    importantNotes: 'Identical to an authorized service center screen replacement at a fraction of the cost.',
    faqs: [{ question: 'Is this 100% genuine original?', answer: 'Yes! It is a 100% genuine OEM service pack screen with identical specifications.' }],
    seoTitle: '100% Original Screen Replacement in Purulia | OEM Display | MOBO SAVIOR',
    metaDescription: 'Get 100% Genuine OEM mobile screen replacement in Purulia. Original displays for iPhone, Samsung, and OnePlus with full warranty.',
    active: true,
    featured: true,
    displayOrder: 14
  },

  // 15. Curved Display Repair
  {
    id: 'srv-curved-display',
    name: 'Curved Display Repair',
    slug: 'curved-display',
    category: 'Display',
    imageUrl: '/assets/images/slide_display_1788168074454.jpg',
    description: 'Specialist edge-to-edge curved screen glass separation and AMOLED display replacement.',
    overview: 'Curved screen devices (Samsung Galaxy S22/S23 Ultra, Vivo V27/V29, OnePlus 11/12, Motorola Edge) have complex rounded edges that most repair centers ruin during opening. We utilize cryogenic freezing (-180°C) and hot wire separation to change only the broken outer glass or install new curved AMOLED panels seamlessly.',
    priceType: 'estimate',
    price: '3499',
    estimatedTime: '1 - 2 Hours',
    warranty: '6 Months Warranty',
    problemsCovered: ['Cracked Curved Glass', 'Edge Touch Failure', 'Curved Bezel Separation'],
    symptoms: ['Front glass cracked along the curved side bevel', 'Touch failing near the curved screen edge'],
    diagnosisProcess: 'Edge curvature angle measurement and micro-crack assessment under UV light.',
    repairProcessSteps: [
      'Cryogenic frame separation or precision 0.03mm wire slicing',
      'OCA optical adhesive cleaning from flexible AMOLED panel',
      'High-pressure autoclave bubble remover treatment',
      'Curved laser mold lamination'
    ],
    toolsAndTech: ['OCA Curved Laminating Machine', 'Autoclave De-Bubbler', '0.028mm Tungsten Wire'],
    supportedBrands: ['Samsung', 'OnePlus', 'Vivo', 'Motorola', 'Realme', 'Oppo'],
    modelPrices: [
      { model: 'Vivo V27 / V29 Curved Glass', price: '₹2,499' },
      { model: 'OnePlus 11 / 11R Curved Screen', price: '₹7,999' },
      { model: 'Samsung Galaxy S22 / S23 Ultra Curved', price: '₹14,999' }
    ],
    importantNotes: 'If your inner screen displays picture clearly without lines or spots, we can replace JUST the curved front glass to save you up to 60% of the cost!',
    faqs: [{ question: 'Can you replace only the broken curved glass?', answer: 'Yes! If your AMOLED is turning on with no black spots or lines, our OCA lamination restores the glass while preserving your original factory screen.' }],
    seoTitle: 'Curved Display Repair in Purulia | Edge Screen Glass Replacement | MOBO SAVIOR',
    metaDescription: 'Specialist curved screen repair in Purulia. Edge-to-edge curved glass replacement for Samsung Ultra, Vivo, and OnePlus with OCA lamination.',
    active: true,
    featured: true,
    displayOrder: 15
  },

  // 16. Green Line / White Display Problem
  {
    id: 'srv-green-line-fix',
    name: 'Green Line / White Display Fix',
    slug: 'green-line-fix',
    category: 'Display',
    imageUrl: '/assets/images/service_display_replace_1788169648346.jpg',
    description: 'Laser repair and flex cable bonding for green vertical lines and white screen issues.',
    overview: 'Vertical green lines, pink lines, or white screens after software updates on Samsung, OnePlus, or iPhone models are caused by fractured microscopic flex bonding traces. Rather than forcing you into an expensive screen replacement, MOBO SAVIOR uses advanced laser ITO circuit repair and ACF flex bonding machines to restore your display.',
    priceType: 'estimate',
    price: '1999',
    estimatedTime: '2 - 4 Hours',
    warranty: '90 Days Warranty',
    problemsCovered: [
      'Vertical Green Lines after software update',
      'Pink / White vertical line across OLED',
      'White Screen of Death on iPhone 13 Pro',
      'Flickering line when brightness adjusted'
    ],
    symptoms: [
      'One or multiple thin green or pink lines appear vertically on screen',
      'Entire screen flashes bright white or green while phone is on',
      'Line appears after phone warms up or updates'
    ],
    diagnosisProcess: 'Flex COF microscope examination to trace broken ITO conductive leads.',
    repairProcessSteps: [
      'Precision frame de-mounting to expose screen flex circuit',
      'Microscope alignment of ITO conductive gold leads',
      'Laser firing to vaporize internal micro-shorts in display gate lines',
      'COF flex bonding with ACF conductive adhesive film',
      '24-hour thermal stability test'
    ],
    toolsAndTech: ['OLED Laser Repair Machine', 'ACF Pulse Heating Bonding Machine', 'COF Inspection Microscope'],
    supportedBrands: ['OnePlus', 'Samsung', 'Apple iPhone', 'Realme', 'Vivo'],
    modelPrices: [
      { model: 'OnePlus 8 / 9 / 11 Green Line Fix', price: '₹1,999' },
      { model: 'Samsung S20 / S21 / S22 Line Fix', price: '₹2,499' },
      { model: 'iPhone 13 Pro White Screen Laser Fix', price: '₹3,499' }
    ],
    importantNotes: 'Saves up to 70% compared to buying a full replacement display assembly.',
    faqs: [{ question: 'Is the green line fix permanent?', answer: 'Yes! Our laser and flex bonding repairs restore the physical electrical connection to factory strength.' }],
    seoTitle: 'Green Line Display Repair in Purulia | Laser Screen Fix | MOBO SAVIOR',
    metaDescription: 'Fix vertical green line, pink line, and white screen on OnePlus, Samsung, and iPhone in Purulia using laser repair and flex bonding.',
    active: true,
    featured: true,
    displayOrder: 16
  },

  // 17. Touch Problem
  {
    id: 'srv-touch-problem',
    name: 'Touch Problem Repair',
    slug: 'touch-problem',
    category: 'Display',
    imageUrl: '/assets/images/service_display_replace_1788169648346.jpg',
    description: 'Fixing unresponsive touch, ghost touch, erratic typing, and dead zones.',
    overview: 'When your phone starts opening apps on its own (ghost touch) or certain keyboard letters do not register, the issue stems from digitizer grid failure or a damaged Touch Controller IC (like the notorious iPhone touch disease). We diagnose whether it is an optical digitizer issue or a motherboard circuit fault.',
    priceType: 'estimate',
    price: '899',
    estimatedTime: '30 - 60 Mins',
    warranty: '90 Days Warranty',
    problemsCovered: ['Ghost Touching', 'Dead Zones on Screen', 'Touch Disease / Gray Bar', 'Unresponsive Keyboard'],
    symptoms: ['Screen activates by itself', 'Top or bottom row of screen does not respond to touch', 'Screen stops touching when phone gets warm'],
    diagnosisProcess: 'Developer options touch pointer location tracing to map exact non-responsive coordinates.',
    repairProcessSteps: ['Digitizer digit mapping', 'Touch flex cable continuity check', 'Motherboard Touch IC re-balling or digitizer replacement', 'Final calibration'],
    toolsAndTech: ['Touch Test Grid Software', 'JBC Soldering Station', 'Touch IC Stencil'],
    supportedBrands: ['All Smartphone Brands'],
    modelPrices: [
      { model: 'Touch Digitizer Replacement', price: '₹899' },
      { model: 'Touch IC Chip Repair', price: '₹1,499' }
    ],
    importantNotes: 'No data loss occurs during touch repairs.',
    faqs: [{ question: 'What causes ghost touch?', answer: 'It is typically caused by micro-fractures in the capacitive touch layer or electromagnetic interference from damaged charging components.' }],
    seoTitle: 'Touch Screen Problem Repair in Purulia | Ghost Touch Fix | MOBO SAVIOR',
    metaDescription: 'Fix ghost touch, dead zones, and unresponsive mobile screens in Purulia. Fast hardware digitizer and Touch IC repair.',
    active: true,
    featured: false,
    displayOrder: 17
  },

  // 18. Flip & Fold Mobile Repair (Main)
  {
    id: 'srv-flip-fold-repair',
    name: 'Flip & Fold Mobile Repair',
    slug: 'flip-fold-repair',
    category: 'Special Device',
    imageUrl: '/assets/images/service_foldable_repair_1788169709156.jpg',
    description: 'Delicate repairs for Samsung Galaxy Z Fold, Z Flip, Pixel Fold, and foldable hinges.',
    overview: 'Foldable devices require aerospace-grade precision. MOBO SAVIOR is one of the few certified labs in West Bengal equipped with specialized cleanrooms and alignment tools for ultra-thin glass (UTG), flexible OLED assemblies, geared hinge cleaning, and dual battery balancing on Samsung Galaxy Z Fold and Z Flip series.',
    priceType: 'upon_inspection',
    price: '3499',
    estimatedTime: '2 - 6 Hours',
    warranty: '90 Days Warranty',
    problemsCovered: [
      'Inner Flexible OLED Black Screen / Crease Crack',
      'Hinge Stuck / Not Opening to 180° Flat',
      'Outer Cover Display Broken',
      'Phone Turns Off When Folded Shut',
      'Flexible Cable Fracture between Top and Bottom halves'
    ],
    symptoms: [
      'Inner screen has black bleeding blob at the center hinge fold',
      'Phone refuses to open completely flat to 180 degrees',
      'Sound cuts out or phone powers off whenever closed',
      'Touch unresponsive on the inner folding screen'
    ],
    diagnosisProcess: 'Hinge gear alignment test, flexible FPC ribbon continuity measurement, and UTG stress analysis.',
    repairProcessSteps: [
      'Cleanroom de-assembly of ultra-thin bezel guards',
      'Ultrasonic hinge debris removal and gear re-lubrication with PTFE synthetic grease',
      'Replacement of internal inter-board flex cables',
      'Precision mounting of new flexible AMOLED panel with factory tension alignment',
      '1,000-cycle robotic folding stress test'
    ],
    toolsAndTech: ['Foldable Screen Alignment Jig', 'Cleanroom Dust-Free Flow Bench', 'Hinge Gear Torque Gauge', 'Flexible FPC Soldering Tip'],
    supportedBrands: ['Samsung', 'Google Pixel', 'Motorola Razr', 'Oppo Find N', 'OnePlus Open'],
    supportedModels: ['Galaxy Z Fold 5', 'Galaxy Z Fold 4', 'Galaxy Z Fold 3', 'Galaxy Z Flip 5', 'Galaxy Z Flip 4', 'Pixel Fold', 'Razr 40 Ultra'],
    modelPrices: [
      { model: 'Hinge Cleaning & 180° Realignment', price: '₹3,499' },
      { model: 'Z Flip Inter-Flex Cable Repair', price: '₹4,999' },
      { model: 'Z Fold Inter-Flex Cable Repair', price: '₹6,999' },
      { model: 'Outer Cover Display Replacement', price: '₹4,999' }
    ],
    importantNotes: 'We use genuine Samsung factory lubricants and flexible ribbons to restore the original smooth folding resistance.',
    faqs: [
      {
        question: 'Why does my Z Fold / Flip turn off when folded?',
        answer: 'There is a flexible ribbon cable that routes through the hinge mechanism between the upper and lower batteries. Over tens of thousands of folds, this cable fractures. We replace this flex cable, completely solving the issue without requiring a new screen!'
      }
    ],
    seoTitle: 'Flip & Fold Mobile Repair in Purulia | Samsung Z Fold & Flip | MOBO SAVIOR',
    metaDescription: 'Purulia’s leading lab for Samsung Galaxy Z Fold and Z Flip repair. Flexible screen replacement, hinge repair, and dual battery service.',
    active: true,
    featured: true,
    displayOrder: 18
  },

  // 19. Samsung Fold Repair
  {
    id: 'srv-samsung-fold-repair',
    name: 'Samsung Fold Repair',
    slug: 'samsung-fold-repair',
    category: 'Special Device',
    imageUrl: '/assets/images/service_foldable_repair_1788169709156.jpg',
    description: 'Complete repair solutions for Samsung Galaxy Z Fold 2, 3, 4, and 5.',
    overview: 'Specialized lab solutions for the full Galaxy Z Fold series. We repair inner display black screens, cover glass breaks, sound cut-outs, and hinge jamming.',
    priceType: 'upon_inspection',
    price: '4999',
    estimatedTime: '3 - 6 Hours',
    warranty: '90 Days Warranty',
    problemsCovered: ['Fold 3/4/5 Hinge Jamming', 'Inner 7.6" AMOLED Display', 'Flex Cable Breakdown'],
    symptoms: ['Fold does not open flat', 'Sound shuts off when closing phone', 'Crease line black bleed'],
    diagnosisProcess: 'Tension torque check and dual battery voltage differential verification.',
    repairProcessSteps: ['Disassembly', 'Hinge servicing', 'Flex ribbon swap', 'Re-assembly and test'],
    toolsAndTech: ['Samsung Fold Jig', 'Torque Gauge', 'ESD Flow Bench'],
    supportedBrands: ['Samsung'],
    modelPrices: [
      { model: 'Galaxy Z Fold 3 Hinge / Flex Fix', price: '₹4,999' },
      { model: 'Galaxy Z Fold 4 Hinge / Flex Fix', price: '₹5,999' },
      { model: 'Galaxy Z Fold 5 Hinge / Flex Fix', price: '₹6,999' }
    ],
    importantNotes: 'Fixing the hinge cable saves over ₹35,000 compared to official service center screen replacement.',
    faqs: [{ question: 'Will my Fold open 180 degrees again?', answer: 'Yes! We remove accumulated pocket lint and micro-debris from the internal gear tracks to restore the 180° opening.' }],
    seoTitle: 'Samsung Galaxy Z Fold Repair in Purulia | Hinge & Screen | MOBO SAVIOR',
    metaDescription: 'Expert Samsung Galaxy Z Fold 3, 4, 5 repair in Purulia. Hinge alignment, flexible screen repair, and audio flex cable fixes.',
    active: true,
    featured: true,
    displayOrder: 19
  },

  // 20. Samsung Flip Repair
  {
    id: 'srv-samsung-flip-repair',
    name: 'Samsung Flip Repair',
    slug: 'samsung-flip-repair',
    category: 'Special Device',
    imageUrl: '/assets/images/slide_foldable_1788168190438.jpg',
    description: 'Expert repair services for Samsung Galaxy Z Flip 3, 4, and 5.',
    overview: 'Compact, fashionable, but fragile. We fix broken Z Flip clamshell mechanisms, outer cover screens, and internal flexible displays with precision OEM components.',
    priceType: 'upon_inspection',
    price: '3499',
    estimatedTime: '2 - 5 Hours',
    warranty: '90 Days Warranty',
    problemsCovered: ['Z Flip Display Blackout', 'Hinge Looseness', 'Phone Powers Off When Closed'],
    symptoms: ['Device turns off the instant you close the clamshell', 'Inner screen cracked along the middle fold'],
    diagnosisProcess: 'Clamshell flex sensor test and hall effect magnetic sensor calibration.',
    repairProcessSteps: ['Bezel removal', 'Hinge gear audit', 'FPC cable replacement', 'UV frame curing'],
    toolsAndTech: ['Flip Clamshell Jigs', 'Hall Sensor Calibrator'],
    supportedBrands: ['Samsung'],
    modelPrices: [
      { model: 'Galaxy Z Flip 3 Flex Cable', price: '₹3,499' },
      { model: 'Galaxy Z Flip 4 Flex Cable', price: '₹4,499' },
      { model: 'Galaxy Z Flip 5 Flex Cable', price: '₹5,499' }
    ],
    importantNotes: 'We maintain dedicated stock of Z Flip flex cables and outer glass.',
    faqs: [{ question: 'Why does Flip turn off when closing?', answer: 'The inter-battery power communication cable has fractured inside the hinge. Replacing it solves the problem 100%.' }],
    seoTitle: 'Samsung Galaxy Z Flip Repair in Purulia | Clamshell Screen Fix | MOBO SAVIOR',
    metaDescription: 'Samsung Galaxy Z Flip 3, 4, 5 repair in Purulia. Fix hinge, screen crease, and power off when folded issue with warranty.',
    active: true,
    featured: true,
    displayOrder: 20
  },

  // 21. Foldable Display Repair
  {
    id: 'srv-foldable-display-repair',
    name: 'Foldable Display Repair',
    slug: 'foldable-display-repair',
    category: 'Special Device',
    imageUrl: '/assets/images/service_foldable_repair_1788169709156.jpg',
    description: 'Replacement and restoration of flexible OLED and ultra-thin glass panels.',
    overview: 'We service inner and outer foldable screens for Samsung, Pixel, Motorola, and OnePlus foldables using dust-free laminar flow workstations.',
    priceType: 'upon_inspection',
    price: '8999',
    estimatedTime: '3 - 5 Hours',
    warranty: '90 Days Warranty',
    problemsCovered: ['Cracked UTG Glass', 'Dead Foldable Pixels', 'Crease Screen Lift'],
    symptoms: ['Inner screen has colored horizontal lines', 'Crease protector lifting away and cracking display'],
    diagnosisProcess: 'Ultra-thin glass thickness measurement and digitizer response testing.',
    repairProcessSteps: ['Protector lift', 'Flexible display de-framing', 'Factory module seating', 'Laser calibration'],
    toolsAndTech: ['Laminar Flow Workstation', 'Foldable Panel Press'],
    supportedBrands: ['Samsung', 'Google Pixel', 'Motorola', 'OnePlus'],
    modelPrices: [
      { model: 'Foldable Outer Display', price: '₹4,999' },
      { model: 'Foldable Inner Screen Assembly', price: '₹18,999' }
    ],
    importantNotes: 'Never peel off factory screen protectors forcefully as it can rip the flexible OLED substrate.',
    faqs: [{ question: 'Can bubble under crease be fixed?', answer: 'Yes! We apply specialized flexible hydrogel and TPU protectors using vacuum laminators.' }],
    seoTitle: 'Foldable Display Repair in Purulia | Flexible OLED Service | MOBO SAVIOR',
    metaDescription: 'High-end foldable screen replacement in Purulia. Flexible AMOLED and Ultra-Thin Glass repairs for Samsung Fold, Flip, and Pixel Fold.',
    active: true,
    featured: false,
    displayOrder: 21
  },

  // 22. Hinge Repair
  {
    id: 'srv-hinge-repair',
    name: 'Hinge Mechanics Alignment & Repair',
    slug: 'hinge-repair',
    category: 'Special Device',
    imageUrl: '/assets/images/slide_foldable_1788168190438.jpg',
    description: 'Gear cleaning, realignment, and spine repair for smooth 180° unfolding.',
    overview: 'Pocket lint, dust particles, and minor drops jam the microscopic gears inside foldable phone hinges. We dismantle the hinge mechanism, clean every gear tooth ultrasonically, and re-grease for factory resistance.',
    priceType: 'upon_inspection',
    price: '2499',
    estimatedTime: '2 - 4 Hours',
    warranty: '90 Days Warranty',
    problemsCovered: ['Stuck Hinge', 'Clicking Noise during Fold', 'Uneven Gap when Closed'],
    symptoms: ['Phone stops at 150 or 160 degrees and will not open flat', 'Loud grinding sound when folding'],
    diagnosisProcess: 'Gear track alignment inspection and hinge symmetry check.',
    repairProcessSteps: ['Chassis separation', 'Ultrasonic gear wash', 'Gear tooth deburring', 'PTFE synthetic lubrication', 'Re-alignment'],
    toolsAndTech: ['Ultrasonic Cleaner', 'Torque Gauge', 'PTFE Synthetic Lubricant'],
    supportedBrands: ['Samsung Galaxy Z Series', 'Motorola Razr', 'Pixel Fold'],
    modelPrices: [
      { model: 'Z Flip Hinge Service', price: '₹2,499' },
      { model: 'Z Fold Hinge Service', price: '₹3,499' }
    ],
    importantNotes: 'Do not force open a stuck hinge as the pressure can instantly puncture the flexible OLED display from underneath.',
    faqs: [{ question: 'What causes hinge to jam?', answer: 'Micro-fibers from pockets and dust collect inside the bristles and gear tracks over 6-12 months of use.' }],
    seoTitle: 'Foldable Phone Hinge Repair in Purulia | MOBO SAVIOR',
    metaDescription: 'Fix stuck, jammed, or clicking hinges on Samsung Fold and Flip in Purulia. Ultrasonic gear cleaning and 180-degree realignment.',
    active: true,
    featured: false,
    displayOrder: 22
  },

  // 23. Battery Replacement
  {
    id: 'srv-battery-replacement',
    name: 'Battery Replacement',
    slug: 'battery-replacement',
    category: 'General',
    imageUrl: '/assets/images/service_battery_replace_1788169692807.jpg',
    description: 'Certified high-capacity, safety-tested battery replacement with zero health popups.',
    overview: 'Battery draining in 2 hours? Phone swelling and pushing the back glass open? MOBO SAVIOR installs certified high-density Li-ion and Li-Po batteries with built-in thermal overcharge protection. For iPhones, we transfer the original BMS board so that Battery Health % displays properly in iOS settings.',
    priceType: 'exact',
    price: '999',
    estimatedTime: '30 Mins',
    warranty: '6 Months Replacement Warranty',
    problemsCovered: [
      'Rapid Battery Drain / Low Screen-on Time',
      'Swollen Battery / Back Panel Lifting',
      'Random Shutdowns at 20% - 30%',
      'Phone Only Works When Plugged In',
      'iPhone "Important Battery Message" Warning'
    ],
    symptoms: [
      'Battery health below 80% in settings',
      'Back panel has noticeable bulge or gap',
      'Phone gets hot during normal standby',
      'Battery jumps from 50% to 15% in minutes'
    ],
    diagnosisProcess: 'Computerized battery cycle count reading, internal resistance (mΩ) measurement, and current leakage check.',
    repairProcessSteps: [
      'Safe discharge and back cover removal',
      'Original BMS spot-welding for iPhone battery health support',
      'New battery installation using OEM stretch-release pull tabs',
      'Battery cycle reset via calibration software',
      'Charging speed and thermal monitoring'
    ],
    toolsAndTech: ['Spot Welder for Battery BMS', 'JCID Battery Programmer', 'Battery Internal Resistance Meter'],
    supportedBrands: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Vivo', 'Oppo', 'Realme', 'Motorola'],
    modelPrices: [
      { model: 'Standard Android Battery (Redmi, Realme)', price: '₹999' },
      { model: 'High Capacity 5000mAh+ (Samsung, Vivo)', price: '₹1,299' },
      { model: 'OnePlus Warp Charge Dual Battery', price: '₹1,699' },
      { model: 'iPhone 11 / 12 Battery + 100% Health', price: '₹1,999' },
      { model: 'iPhone 13 / 14 / 15 Battery + 100% Health', price: '₹2,999' }
    ],
    importantNotes: 'A swollen battery is a severe fire hazard. Bring it to our lab immediately for safe disposal and swap.',
    faqs: [
      {
        question: 'Will my iPhone show battery health percentage after change?',
        answer: 'Yes! We spot-weld your original Apple BMS board and reprogram the battery cycle so that iOS displays 100% Health without any warning popups.'
      }
    ],
    seoTitle: 'Mobile Battery Replacement in Purulia | 100% Health | MOBO SAVIOR',
    metaDescription: 'Original mobile battery replacement in Purulia. High capacity batteries for iPhone, Samsung, OnePlus, Xiaomi with 6 months warranty.',
    active: true,
    featured: true,
    displayOrder: 23
  },

  // 24. Charging Problem
  {
    id: 'srv-charging-problem',
    name: 'Charging Problem Repair',
    slug: 'charging-problem',
    category: 'General',
    imageUrl: '/assets/images/slide_chargeport_1788168121909.jpg',
    description: 'Fast charging port repair, Type-C CC pin soldering, and Tristar IC fixes.',
    overview: 'Loose cable, slow charging, "moisture detected" alerts, or complete refusal to take charge. We replace worn USB Type-C and Lightning ports, fix moisture sensor corroded resistors, and replace damaged fast-charging controllers.',
    priceType: 'estimate',
    price: '499',
    estimatedTime: '30 Mins',
    warranty: '90 Days Warranty',
    problemsCovered: [
      'Loose Charging Cable / Cable Falls Out',
      'Slow Charging (Only 0.5A instead of Fast Charge)',
      'Moisture Detected Warning Won\'t Go Away',
      'Broken Pin inside USB-C Port',
      'iPhone Fake Charging (Shows bolt but % does not rise)'
    ],
    symptoms: [
      'Have to wiggle or push cable hard to make it charge',
      'Phone takes 6+ hours for full battery',
      'USB-C port is full of hard-packed lint and debris',
      'Charger adapter gets extremely hot'
    ],
    diagnosisProcess: 'USB Doctor digital current draw test (5V / 9V / 12V PD handshake verification).',
    repairProcessSteps: [
      'Microscopic port debris cleaning and pin alignment',
      'Port desoldering and replacement with high-durability gold-plated pins',
      'Fast charge handshake and USB data transfer verification',
      'Moisture detection circuitry test'
    ],
    toolsAndTech: ['Hot Air Soldering Station', 'USB-C Power Meter (PD/QC3.0)', 'Microscope'],
    supportedBrands: ['All Smartphone Brands'],
    modelPrices: [
      { model: 'Port Cleaning & Pin Realignment', price: '₹299' },
      { model: 'USB Type-C Sub-Board Replacement', price: '₹499' },
      { model: 'Fast Charge 67W / 120W Port Soldering', price: '₹799' },
      { model: 'Tristar / Hydra IC Repair (iPhone)', price: '₹1,499' }
    ],
    importantNotes: 'We test that your phone supports fast charging (VOOC, Warp Charge, Turbo Power, PD) before returning it.',
    faqs: [{ question: 'Will fast charging continue to work?', answer: 'Yes! We install genuine ports with full CC1 and CC2 data pins so your 33W, 67W, or 120W fast charging operates at full speed.' }],
    seoTitle: 'Mobile Charging Port Repair in Purulia | Type-C Solder | MOBO SAVIOR',
    metaDescription: 'Fast mobile charging port repair in Purulia. Fix loose USB-C, slow charging, and moisture detected error in 30 minutes.',
    active: true,
    featured: true,
    displayOrder: 24
  },

  // 25. Water Damage Repair
  {
    id: 'srv-water-damage-repair',
    name: 'Water Damage Repair',
    slug: 'water-damage-repair',
    category: 'General',
    imageUrl: '/assets/images/service_dead_phone_1788169662887.jpg',
    description: 'Ultrasonic chemical de-oxidation, corrosion removal, and short circuit repair.',
    overview: 'Dropped your phone in water, the sink, or caught in heavy rain? Rice will NOT save your phone; it accelerates internal copper corrosion. Turn off the device and bring it to MOBO SAVIOR immediately for ultrasonic board de-oxidation and short elimination.',
    priceType: 'upon_inspection',
    price: '999',
    estimatedTime: '2 - 4 Hours',
    warranty: '90 Days Warranty',
    problemsCovered: [
      'Liquid Ingress / Submersion Damage',
      'Corroded Logic Board Resistors & Vias',
      'Blown Backlight Filter Coils',
      'Short Circuit preventing power on'
    ],
    symptoms: [
      'Phone was exposed to water or rain',
      'Fog or moisture droplets inside camera lenses',
      'Phone worked for 10 minutes then died completely',
      'Screen has bright white patches or blotches'
    ],
    diagnosisProcess: 'Complete disassembly and microscopic corrosion scan under 45X stereo magnification.',
    repairProcessSteps: [
      'Immediate battery disconnect to prevent electrolysis',
      'Ultrasonic chemical bath in high-purity PCB cleaner',
      'De-soldering and replacement of corroded components under shield cans',
      'Microscopic wire jumpering for severed traces',
      'Full reassembly and multi-point moisture test'
    ],
    toolsAndTech: ['Multi-Frequency Ultrasonic Cleaner', 'Industrial PCB Chemical De-oxidizer', 'Hot Air Dryer', 'Thermal Camera'],
    supportedBrands: ['All Brands Supported'],
    modelPrices: [
      { model: 'Ultrasonic Cleaning & Short Removal', price: '₹999' },
      { model: 'Major Water Damage + Component Repair', price: '₹1,999' }
    ],
    importantNotes: 'DO NOT plug in your phone or attempt to charge it if it has been exposed to water. Charging causes instant short circuiting of main power chips.',
    faqs: [{ question: 'Does putting the phone in rice help?', answer: 'No! Rice does not absorb mineral salts that cause corrosion. It actually delays proper chemical cleaning and causes permanent circuit rot.' }],
    seoTitle: 'Water Damage Mobile Repair in Purulia | Ultrasonic Cleaning | MOBO SAVIOR',
    metaDescription: 'Emergency water damage repair for smartphones in Purulia. Ultrasonic PCB cleaning, corrosion removal, and dead phone recovery.',
    active: true,
    featured: true,
    displayOrder: 25
  },

  // 26. Camera Problem
  {
    id: 'srv-camera-problem',
    name: 'Camera Problem Repair',
    slug: 'camera-problem',
    category: 'General',
    imageUrl: '/assets/images/differ_thermal_inspection_1788169210295.jpg',
    description: 'Camera sensor replacement, sapphire lens glass swap, and OIS stabilization repair.',
    overview: 'Blurry photos, clicking or buzzing camera lens (OIS motor failure), black screen in camera app, or cracked camera glass. We replace OEM sensor modules, repair 0.5x ultra-wide / telephoto sensors, and install scratch-resistant sapphire lens glass.',
    priceType: 'estimate',
    price: '599',
    estimatedTime: '30 - 60 Mins',
    warranty: '90 Days Warranty',
    problemsCovered: [
      'Cracked / Scratched Camera Glass Ring',
      'Shaking / Vibrate Camera (OIS Motor Broken)',
      'Black Screen when switching to 1X or 0.5X',
      'Spots or Dust specks on photos',
      'Laser Autofocus Failure'
    ],
    symptoms: [
      'Camera buzzes or vibrates loudly when opening camera app',
      'Photos are blurry and will not focus on objects',
      'Camera lens has visible crack allowing dust inside'
    ],
    diagnosisProcess: 'Optical bench focus calibration and camera sensor circuit voltage check.',
    repairProcessSteps: [
      'Laser lens glass removal without opening phone frame',
      'Sensor dust evacuation in clean air box',
      'Installation of OEM camera module or sapphire lens glass',
      'Autofocus and night mode test'
    ],
    toolsAndTech: ['Sapphire Glass Alignment Jig', 'Clean air box', 'Laser Glass Removal Pen'],
    supportedBrands: ['Apple iPhone', 'Samsung', 'OnePlus', 'Xiaomi', 'Vivo'],
    modelPrices: [
      { model: 'Camera Glass Lens Replacement', price: '₹599' },
      { model: 'Rear Camera Sensor Module', price: '₹1,899' },
      { model: 'iPhone Multi-Lens Camera Replacement', price: '₹3,499' }
    ],
    importantNotes: 'Cracked camera glass should be replaced immediately before dust scratches the expensive underlying optical sensor.',
    faqs: [{ question: 'Why is my camera shaking and buzzing?', answer: 'The Optical Image Stabilization (OIS) gyro electromagnets are damaged, usually caused by motorbike handlebar vibrations. Replacing the camera module restores smooth, steady video.' }],
    seoTitle: 'Mobile Camera Repair in Purulia | Lens Glass & Sensor | MOBO SAVIOR',
    metaDescription: 'Fix blurry, shaking, or cracked mobile camera in Purulia. Original sensor modules and sapphire camera glass for iPhone, Samsung, and OnePlus.',
    active: true,
    featured: false,
    displayOrder: 26
  },

  // 27. Software / Programming
  {
    id: 'srv-software-programming',
    name: 'Software / Programming',
    slug: 'software-programming',
    category: 'Software',
    imageUrl: '/assets/images/differ_diagnostic_bench_1788169232321.jpg',
    description: 'Dead boot unbricking, fastboot loops, official firmware flashing, and password recovery.',
    overview: 'Stuck on manufacturer logo, infinite restart loop after software update, forgot screen lock, or locked FRP account. We use official firmware flashtools, EDL authorization boxes, and authorized servers to revive bricked devices securely.',
    priceType: 'estimate',
    price: '499',
    estimatedTime: '30 - 60 Mins',
    warranty: '30 Days Software Warranty',
    problemsCovered: [
      'Boot Loop / Stuck on Logo',
      'EDL 9008 Port Dead Boot Recovery',
      'Forgot Pattern / Pin / Password (with bill verification)',
      'Google Account / FRP Lock Removal',
      'Corrupted IMEI / NVRAM / Baseband restoration'
    ],
    symptoms: [
      'Phone continuously reboots to brand logo',
      'Phone screen displays "The system has been destroyed"',
      'Stuck in Fastboot or Download Mode'
    ],
    diagnosisProcess: 'Firmware hash match, fastboot status check, and EDL port handshake query.',
    repairProcessSteps: [
      'EDL / Download mode handshake initiation',
      'Flashing official signed global firmware',
      'Cache and partition wipe',
      'Initial OS setup and safety verification'
    ],
    toolsAndTech: ['UnlockTool', 'Hydra Dongle', 'Mi Flash Tool', 'Odin Flash Tool'],
    supportedBrands: ['All Smartphone Brands'],
    modelPrices: [
      { model: 'Basic Software Flash / Unbrick', price: '₹499' },
      { model: 'EDL Server Authorized Flashing', price: '₹999' },
      { model: 'Dead Boot Repair via ISP', price: '₹1,499' }
    ],
    importantNotes: 'Proof of device ownership (bill or box) is strictly required for security lock removals.',
    faqs: [{ question: 'Will software flashing delete my data?', answer: 'If your phone is stuck in a bootloop, official unbricking tools may require a partition wipe. We check if data-safe recovery is possible first.' }],
    seoTitle: 'Mobile Software Flashing in Purulia | Boot Loop Fix | MOBO SAVIOR',
    metaDescription: 'Fix mobile boot loops, stuck on logo, dead boot, and software crashes in Purulia. Fast, safe firmware flashing with official tools.',
    active: true,
    featured: false,
    displayOrder: 27
  }
];
