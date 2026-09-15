mkdir -p src/pages

cat << 'INNER_EOF' > src/pages/IPhoneRepair.tsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Smartphone, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { ContactSettings } from '../types';
import SEOHead from '../components/SEOHead';

export default function IPhoneRepair({ onNavigate, contact }: { onNavigate: (route: string) => void, contact: ContactSettings }) {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const q = query(collection(db, 'models'), where('brand', '==', 'Apple'), orderBy('displayOrder'));
        const snapshot = await getDocs(q);
        setModels(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching models:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <SEOHead title="iPhone Repair in Purulia | MOBO SAVIOR" description="Expert diagnostics and repairs for all iPhone models. Display, Battery, Motherboard, and more." />
      
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Smartphone className="w-16 h-16 mx-auto mb-4 text-[#0284C7]" />
          <h1 className="text-4xl md:text-5xl font-black mb-4">iPhone Repair Specialists</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            From iPhone 11 to the latest iPhone 16 Pro Max, we provide premium, fast, and reliable repair services. We use original spec parts to ensure your iPhone functions perfectly.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button onClick={() => onNavigate('book-repair')} className="bg-[#0284C7] hover:bg-sky-500 text-white px-6 py-3 rounded-xl font-bold transition-all">
              Book a Repair
            </button>
            <a href={`https://wa.me/91${contact.whatsapp.replace(/\D/g, '')}?text=Hi, I need help with my iPhone`} target="_blank" rel="noreferrer" className="bg-green-500 hover:bg-green-400 text-white px-6 py-3 rounded-xl font-bold transition-all">
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">Our iPhone Services</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {['Display Replacement', 'OLED Display Upgrade', 'Battery Replacement', 'Motherboard Repair', 'Water Damage Recovery', 'Face ID Repair', 'Charging Port Repair', 'Camera Glass Replacement', 'Software Issues'].map((service, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-[#0284C7] shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{service}</h3>
                <p className="text-sm text-slate-500">Expert repair using high-quality precision tools and parts.</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Models Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 bg-white rounded-3xl shadow-sm border border-slate-100 mb-16">
         <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">Supported Models</h2>
         {loading ? (
            <div className="text-center py-8 text-slate-500">Loading models...</div>
         ) : models.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {models.map(model => (
                <div key={model.id} className="text-center p-4 border border-slate-100 rounded-xl hover:border-sky-300 transition-colors">
                  <span className="font-bold text-slate-700">{model.name}</span>
                </div>
              ))}
            </div>
         ) : (
            <div className="text-center py-8 text-slate-500">
               <p>We repair all Apple iPhone models. Contact us for pricing details.</p>
            </div>
         )}
      </section>
    </div>
  );
}
INNER_EOF

# Ensure script executes
chmod +x generate_pages.sh
./generate_pages.sh
