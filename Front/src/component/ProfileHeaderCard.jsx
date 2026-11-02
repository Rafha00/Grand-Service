import React from 'react';

export default function ProfileHeaderCard({ user }) {
  return (
    <div className="relative overflow-hidden w-full max-w-3xl mx-auto p-4 flex flex-col md:flex-row items-center gap-6 text-white">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-neutral-200/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl border border-neutral-600/40 flex-shrink-0">
        <span className="text-neutral-200 font-serif">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
      </div>

      <div className="text-center md:text-left flex-1 w-full">
        <h3 className="text-3xl font-bold tracking-wide text-white font-serif">
          {user?.name || 'User Profile'}
        </h3>
        <p className="text-neutral-400 text-sm mt-1.5 flex items-center justify-center md:justify-start gap-2">
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
          {user?.email || '-'}
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs font-semibold rounded-full tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse"></span>
          {user?.role || 'CUSTOMER'}
        </div>
      </div>
    </div>
  );
}