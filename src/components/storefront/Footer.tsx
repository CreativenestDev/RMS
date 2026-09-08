import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Shield } from 'lucide-react';
import { RestaurantBranding } from '@/types';

interface FooterProps {
  restaurant: RestaurantBranding;
}

export function Footer({ restaurant }: FooterProps) {
  return (
    <footer id="about" className="bg-slate-950 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tight text-white">
                {restaurant.name}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Serving handcrafted gourmet culinary creations made with fresh, locally sourced premium ingredients.
            </p>
            <div className="flex items-center space-x-2 text-xs text-primary font-medium">
              <Shield className="w-4 h-4" />
              <span>Certified Fresh & Authentic</span>
            </div>
          </div>

          {/* Col 2: Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Contact Us</h3>
            {restaurant.address && (
              <div className="flex items-start space-x-2.5 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{restaurant.address}</span>
              </div>
            )}
            {restaurant.phone && (
              <div className="flex items-center space-x-2.5 text-sm text-slate-400">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href={`tel:${restaurant.phone}`} className="hover:text-white transition-colors">
                  {restaurant.phone}
                </a>
              </div>
            )}
            {restaurant.email && (
              <div className="flex items-center space-x-2.5 text-sm text-slate-400">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href={`mailto:${restaurant.email}`} className="hover:text-white transition-colors">
                  {restaurant.email}
                </a>
              </div>
            )}
          </div>

          {/* Col 3: Hours & Service */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Hours & Info</h3>
            <div className="flex items-start space-x-2.5 text-sm text-slate-400">
              <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-300 font-medium">Mon - Thu: 10:00 AM - 11:00 PM</p>
                <p className="text-slate-300 font-medium">Fri - Sat: 10:00 AM - 12:00 AM</p>
                <p className="text-slate-300 font-medium">Sunday: 11:00 AM - 11:00 PM</p>
              </div>
            </div>
            <div className="pt-2 text-xs text-slate-400">
              Avg. Delivery Time: <span className="text-white font-semibold">{restaurant.settings?.estimatedPrepTimeMinutes ?? 25} - {(restaurant.settings?.estimatedPrepTimeMinutes ?? 25) + 15} mins</span>
            </div>
          </div>

          {/* Col 4: Quick Links & Management */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/menu" className="hover:text-white transition-colors">
                  Browse Menu
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-white transition-colors flex items-center space-x-1.5">
                  <span>Manager Portal</span>
                </Link>
              </li>
              <li>
                <Link href="/kitchen" className="hover:text-white transition-colors">
                  Kitchen Display (KDS)
                </Link>
              </li>
              <li>
                <Link href="/super-admin/login" className="hover:text-white transition-colors text-slate-500">
                  Platform Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} {restaurant.name}. All rights reserved.</p>
          <p className="text-slate-400">
            Powered by <span className="font-semibold text-white">RMS White-Label Platform</span>
          </p>
        </div>
      </div>
    </footer>
  );
}