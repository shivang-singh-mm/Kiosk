import React from 'react';
import { useKioskStore } from '../store/useKioskStore';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, Copy, Check, Smartphone, Monitor } from 'lucide-react';

export const QRModal: React.FC = () => {
  const { qrModalOpen, toggleQRModal, sessionId, addToast } = useKioskStore();
  const [copied, setCopied] = React.useState(false);

  if (!qrModalOpen) return null;

  const pairUrl = `${window.location.origin}${window.location.pathname}?session=${sessionId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pairUrl);
    setCopied(true);
    addToast({
      type: 'success',
      title: 'Copied Pair Link',
      message: 'Paste in mobile or client device browser to sync screens live.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl glass-panel text-center">
        
        <button
          onClick={toggleQRModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-white tracking-tight">
          Pair Client Device
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          Scan with tablet or mobile browser to mirror kiosk navigation live.
        </p>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl inline-block shadow-xl mb-6">
          <QRCodeSVG
            value={pairUrl}
            size={180}
            level="H"
            includeMargin={false}
          />
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-300 truncate max-w-[200px]">
              {pairUrl}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 ml-2"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-400 pt-2">
            <span className="flex items-center space-x-1">
              <Monitor className="w-3.5 h-3.5 text-indigo-400" />
              <span>Executive Kiosk</span>
            </span>
            <span>⇄</span>
            <span className="flex items-center space-x-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Client Display</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
