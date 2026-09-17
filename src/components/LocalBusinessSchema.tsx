import { useEffect } from 'react';
import { ContactSettings, Service } from '../types';

interface SchemaProps {
  contact: ContactSettings;
  service?: Service;
}

export default function LocalBusinessSchema({ contact, service }: SchemaProps) {
  useEffect(() => {
    const origin = window.location.origin;

    const schema = {
      '@context': 'https://schema.org',
      '@type': ['LocalBusiness', 'ElectronicsRepairStore'],
      '@id': `${origin}/#organization`,
      'name': contact.name || 'MOBO SAVIOR',
      'alternateName': 'MOBO SAVIOR Purulia Mobile Repair Shop',
      'description': 'MOBO SAVIOR is a professional mobile repairing shop in Purulia specializing in iPhone & Android repair, motherboard repair, CPU reballing, IC repair, display replacement and advanced diagnostics.',
      'image': `${origin}/logo.png`,
      'telephone': contact.phone || '+91 70018 36802',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': contact.address || 'Room No B4, Super Market, Hattola More',
        'addressLocality': 'Purulia',
        'addressRegion': 'West Bengal',
        'postalCode': '723101',
        'addressCountry': 'IN'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': '23.332194',
        'longitude': '86.365167'
      },
      'url': origin,
      'sameAs': [
        contact.instagram,
        contact.facebook,
        contact.googleMapsUrl
      ].filter(Boolean),
      'priceRange': '₹₹',
      'openingHoursSpecification': {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday'
        ],
        'opens': '10:00',
        'closes': '20:00'
      },
      'areaServed': {
        '@type': 'AdministrativeArea',
        'name': 'Purulia, West Bengal, India'
      }
    };

    const existingScript = document.getElementById('local-business-schema');
    if (existingScript) {
      existingScript.innerHTML = JSON.stringify(schema);
    } else {
      const script = document.createElement('script');
      script.id = 'local-business-schema';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    // Dynamic Service Schema if present
    if (service) {
      const serviceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': service.name,
        'description': service.description,
        'provider': {
          '@type': 'LocalBusiness',
          'name': contact.name || 'MOBO SAVIOR',
          'telephone': contact.phone
        },
        'areaServed': {
          '@type': 'City',
          'name': 'Purulia'
        },
        'offers': {
          '@type': 'Offer',
          'price': service.price || '0',
          'priceCurrency': 'INR',
          'availability': 'https://schema.org/InStock'
        }
      };

      const existingServiceScript = document.getElementById('service-schema');
      if (existingServiceScript) {
        existingServiceScript.innerHTML = JSON.stringify(serviceSchema);
      } else {
        const script = document.createElement('script');
        script.id = 'service-schema';
        script.type = 'application/ld+json';
        script.innerHTML = JSON.stringify(serviceSchema);
        document.head.appendChild(script);
      }
    } else {
      const existingServiceScript = document.getElementById('service-schema');
      if (existingServiceScript) {
        existingServiceScript.remove();
      }
    }
  }, [contact, service]);

  return null;
}
