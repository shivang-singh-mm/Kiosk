import React, { useState, useEffect } from 'react';
import { useKioskStore } from '../store/useKioskStore';
import { bookUnit } from '../services/api';
import { Unit } from '../types';
import { X, User, Phone, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import Axios from 'axios';

interface BookingModalProps {
  unit: Unit;
  towerName: string;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ unit, towerName, onSuccess }) => {
  const {
    sessionId,
    setBookingModalUnitId,
    addToast,
    isOnline,
    addPendingBooking,
  } = useKioskStore();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setBookingModalUnitId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setBookingModalUnitId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (customerName.trim().length < 2) {
      setErrorMessage('Please enter a valid customer name (at least 2 characters).');
      return;
    }

    const digitsOnly = phone.replace(/[^\d]/g, '');
    if (digitsOnly.length < 7) {
      setErrorMessage('Please enter a valid phone number with at least 7 digits.');
      return;
    }

    setLoading(true);

    // If offline: save to pending bookings queue in IndexedDB
    if (!isOnline) {
      await addPendingBooking({
        unitId: unit.id,
        unitNumber: unit.number,
        towerName: towerName,
        customerName: customerName.trim(),
        phone: phone.trim(),
      });
      setBookingModalUnitId(null);
      onSuccess();
      setLoading(false);
      return;
    }

    try {
      await bookUnit({
        unitId: unit.id,
        customerName: customerName.trim(),
        phone: phone.trim(),
        sessionId: sessionId,
      });

      addToast({
        type: 'success',
        title: 'Booking Confirmed!',
        message: `Unit ${unit.number} successfully booked for ${customerName.trim()}.`,
      });

      setBookingModalUnitId(null);
      onSuccess();
    } catch (err: any) {
      if (Axios.isAxiosError(err) && err.response) {
        const detail = err.response.data?.detail;
        if (typeof detail === 'string') {
          setErrorMessage(detail);
        } else if (Array.isArray(detail)) {
          setErrorMessage(detail.map((d) => d.msg).join(', '));
        } else {
          setErrorMessage('This unit has already been booked.');
        }
      } else {
        // If connection fails during online request, offer to queue offline
        setErrorMessage('Failed to connect to server. Your booking will be saved locally when offline.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 glass-panel">
        {/* Close Button */}
        <button
          onClick={() => setBookingModalUnitId(null)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Reserve Unit #{unit.number}
            </h2>
            <p className="text-xs text-slate-400">
              {towerName} • {!isOnline ? 'Offline Local Queue' : 'Atomic Lock Protected'}
            </p>
          </div>
        </div>

        {/* Form Error Banner */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Customer Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                disabled={loading}
                placeholder="e.g. Eleanor Vance"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                disabled={loading}
                placeholder="e.g. +1 (555) 234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center space-x-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => setBookingModalUnitId(null)}
              className="w-1/3 py-3 px-4 rounded-xl text-xs font-bold text-slate-400 bg-slate-800/80 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Processing Lock...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{isOnline ? 'Confirm Reservation' : 'Queue Offline Booking'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
