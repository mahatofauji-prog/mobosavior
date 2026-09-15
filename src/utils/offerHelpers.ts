import React from 'react';
import { 
  Wrench, Cpu, ShieldCheck, Shield, DollarSign, Smile, Layers, Smartphone, 
  Award, CheckCircle2, HeartHandshake, Zap, Clock, Lock, Target, Hammer, 
  CircuitBoard, Microscope, Receipt, Sparkles
} from 'lucide-react';
import { Offer, TrustPoint } from '../types';

export type OfferStatus = 'Upcoming' | 'Active' | 'Expired';

export function getOfferStatus(offer: Partial<Offer>): OfferStatus {
  if (offer.isActive === false) {
    return 'Expired';
  }
  const today = new Date().toISOString().split('T')[0];
  if (offer.startDate && offer.startDate > today) {
    return 'Upcoming';
  }
  if (offer.endDate && offer.endDate < today) {
    return 'Expired';
  }
  return 'Active';
}

export const POPULAR_TRUST_ICONS = [
  { key: 'Wrench', label: 'Wrench / Repair', icon: Wrench },
  { key: 'Cpu', label: 'CPU / Circuit', icon: Cpu },
  { key: 'ShieldCheck', label: 'Shield Check / Certified', icon: ShieldCheck },
  { key: 'Shield', label: 'Shield / Warranty', icon: Shield },
  { key: 'DollarSign', label: 'Dollar / Transparent Price', icon: DollarSign },
  { key: 'Smile', label: 'Smile / Satisfaction', icon: Smile },
  { key: 'Layers', label: 'Layers / Advanced', icon: Layers },
  { key: 'Smartphone', label: 'Smartphone / Specialist', icon: Smartphone },
  { key: 'Award', label: 'Award / Excellence', icon: Award },
  { key: 'CheckCircle2', label: 'Check Circle / Quality', icon: CheckCircle2 },
  { key: 'HeartHandshake', label: 'Heart Handshake / Trust', icon: HeartHandshake },
  { key: 'Zap', label: 'Zap / Express', icon: Zap },
  { key: 'Clock', label: 'Clock / Quick Turnaround', icon: Clock },
  { key: 'Receipt', label: 'Receipt / Upfront Estimate', icon: Receipt },
  { key: 'CircuitBoard', label: 'Circuit Board / Micro-soldering', icon: CircuitBoard },
  { key: 'Microscope', label: 'Microscope / Precision', icon: Microscope },
  { key: 'Hammer', label: 'Hammer / Pro Tools', icon: Hammer }
];

export function renderTrustIcon(iconKey: string, className = "w-6 h-6 text-[#0284C7]") {
  const match = POPULAR_TRUST_ICONS.find(i => i.key.toLowerCase() === iconKey.toLowerCase());
  if (match) {
    return React.createElement(match.icon, { className });
  }
  switch (iconKey.toLowerCase()) {
    case 'wrench': return React.createElement(Wrench, { className });
    case 'cpu': return React.createElement(Cpu, { className });
    case 'shieldcheck': return React.createElement(ShieldCheck, { className });
    case 'shield': return React.createElement(Shield, { className });
    case 'dollarsign': return React.createElement(DollarSign, { className });
    case 'smile': return React.createElement(Smile, { className });
    case 'layers': return React.createElement(Layers, { className });
    case 'smartphone': return React.createElement(Smartphone, { className });
    case 'receipt': return React.createElement(Receipt, { className });
    default: return React.createElement(Wrench, { className });
  }
}
