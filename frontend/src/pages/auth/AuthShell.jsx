import { Link } from 'react-router-dom';
import NightSkyBackdrop from '../../components/NightSkyBackdrop';

export default function AuthShell({ title, sub, children, footer }) {
  return (
    <div className="relative min-h-screen w-screen overflow-hidden flex items-center justify-center p-4 select-none py-10">
      {/* 1. VECTOR LANDSCAPE BACKDROP */}
      <NightSkyBackdrop />

      {/* 2. FROSTED GLASSMORPHISM CARD */}
      <div className="relative z-10 w-full max-w-[420px] rounded-[32px] border border-white/25 bg-white/[0.08] backdrop-blur-2xl p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition-all">
        <h1 className="text-3xl font-bold text-white text-center tracking-tight mb-2 lowercase">
          {title}
        </h1>
        {sub && (
          <p className="text-xs text-white/75 text-center mb-6 leading-relaxed">
            {sub}
          </p>
        )}

        <div className="space-y-4 text-white [&_.input]:bg-white/10 [&_.input]:border-white/30 [&_.input]:text-white [&_.input]:placeholder-white/50 [&_.input]:rounded-xl [&_label_span]:text-white/85 [&_.btn-primary]:bg-white [&_.btn-primary]:text-[#1E0738] [&_.btn-primary]:rounded-full [&_.btn-primary]:font-bold [&_.btn-primary]:hover:bg-white/95 [&_.btn-primary]:shadow-lg">
          {children}
        </div>

        {footer && (
          <div className="mt-6 text-center text-xs text-white/80 [&_a]:text-white [&_a]:font-bold [&_a]:hover:underline">
            {footer}
          </div>
        )}

        <div className="mt-4 text-center">
          <Link to="/" className="text-[11px] font-medium text-white/60 hover:text-white transition">
            &larr; Return to JerBite Home
          </Link>
        </div>
      </div>
    </div>
  );
}
