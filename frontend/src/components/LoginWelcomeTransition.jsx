import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export const LoginWelcomeTransition = ({ user, onComplete }) => {
  const [phase, setPhase] = useState('start'); // 'start' -> 'driving' -> 'fadeout'

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setPhase('driving');
    }, 80);

    // Tăng nhẹ 0.5 giây (1.9s bắt đầu mờ dần, 2.35s hoàn tất)
    const fadeTimer = setTimeout(() => {
      setPhase('fadeout');
    }, 1900);

    const doneTimer = setTimeout(() => {
      onComplete?.();
    }, 2350);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (!user) return null;

  const getRolePortalName = (role) => {
    switch (role) {
      case 'QUAN_LY':
        return 'Trung Tâm Chỉ Huy & Điều Hành Vận Tải';
      case 'TAI_XE':
        return 'Không Gian Tài Xế Giao Nhận Hiện Trường';
      case 'KHACH_HANG':
        return 'Cổng Quản Lý Đơn & Tra Cứu Khách Hàng';
      default:
        return 'Hệ Thống Quản Trị Vận Tải SmartLogistics';
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center px-4 sm:px-8 bg-slate-100/95 dark:bg-slate-950/95 backdrop-blur-xl transition-all duration-500 overflow-hidden ${
        phase === 'fadeout' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Keyframes cho chuyển động mặt đường 3D, độ nhún giảm xóc thân xe và vòng quay bánh xe */}
      <style>{`
        @keyframes roadDashMove {
          0% { background-position: 0px center; }
          100% { background-position: -160px center; }
        }
        @keyframes chassisSuspension {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-1.8px) rotate(-0.3deg); }
          50% { transform: translateY(0.4px) rotate(0.15deg); }
          75% { transform: translateY(-1.2px) rotate(-0.15deg); }
        }
        @keyframes wheelSpin3D {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes exhaustPuff {
          0% { transform: translate(0, 0) scale(0.5); opacity: 0.7; }
          100% { transform: translate(-36px, -8px) scale(1.9); opacity: 0; }
        }
      `}</style>

      <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-6">
        {/* Welcome Text Block */}
        <div
          className={`space-y-3 transition-all duration-700 transform ${
            phase === 'start' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}
        >
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Chào mừng,{' '}
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              {user.ho_ten}
            </span>
            !
          </h1>

          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Đang khởi tạo {getRolePortalName(user.vai_tro)}...</span>
          </p>
        </div>

        {/* 3D HIGHWAY STAGE (Chiều dài tuyến đường: 30rem = 480px) */}
        <div
          className="w-full max-w-[30rem] mx-auto relative pt-16 pb-6 select-none"
          style={{ perspective: '900px' }}
        >
          {/* 3D Road Deck */}
          <div
            className="w-full h-28 sm:h-32 relative rounded-2xl overflow-hidden"
            style={{
              transform: 'rotateX(52deg)',
              background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 55%, #1e293b 100%)',
              boxShadow: '0 20px 35px -10px rgba(15, 23, 42, 0.55)',
              borderTop: '2px solid #475569',
              borderBottom: '3px solid #334155',
            }}
          >
            {/* Top Highway Guardrail / Curb Stripe */}
            <div className="absolute top-2.5 left-0 right-0 h-1 bg-amber-400/80" />

            {/* Bottom Highway Guardrail / Curb Stripe */}
            <div className="absolute bottom-2.5 left-0 right-0 h-1 bg-amber-400/80" />

            {/* Moving 3D Center Dashed Lane Markings */}
            <div
              className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, #f8fafc 0px, #f8fafc 40px, transparent 40px, transparent 80px)',
                animation: 'roadDashMove 0.85s linear infinite',
                opacity: 0.85,
              }}
            />

            {/* Dynamic Glowing 3D Tire Track / Energy Trail Behind Truck */}
            <div
              className="absolute inset-y-3.5 left-0 bg-gradient-to-r from-orange-600/15 via-orange-500/40 to-amber-400/75 rounded-r-full transition-all duration-[1750ms] ease-in-out"
              style={{
                width: phase === 'start' ? '8%' : '96%',
                boxShadow: '0 0 24px rgba(249, 115, 22, 0.5)',
              }}
            />
          </div>

          {/* 3D Animated Delivery Truck Driving Smoothly Across the Road */}
          <div
            className="absolute top-4 sm:top-2 z-20 transition-all duration-[1750ms] ease-in-out"
            style={{
              left: phase === 'start' ? '0%' : 'calc(100% - 12.5rem)',
            }}
          >
            <div className="relative w-48 sm:w-52 h-32 flex items-end">
              {/* 3D Ground Shadow Under Truck */}
              <div
                className="absolute bottom-1.5 left-4 right-5 h-5 rounded-full bg-black/65 blur-md"
                style={{ transform: 'scaleY(0.55)' }}
              />

              {/* Volumetric 3D Headlight Cone Projected onto the Road */}
              <div
                className="absolute bottom-3 -right-16 w-24 h-12 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(253, 224, 71, 0.75) 0%, rgba(251, 146, 60, 0.3) 55%, transparent 100%)',
                  clipPath: 'polygon(0% 35%, 100% 0%, 100% 100%, 0% 70%)',
                  filter: 'blur(3px)',
                }}
              />

              {/* Exhaust Smoke Particles Behind Rear Bumper */}
              <div
                className="absolute bottom-6 left-1 w-3.5 h-3.5 rounded-full bg-slate-300/70 dark:bg-slate-400/50 blur-[1px]"
                style={{ animation: 'exhaustPuff 0.75s ease-out infinite' }}
              />
              <div
                className="absolute bottom-7 -left-2 w-4 h-4 rounded-full bg-orange-400/40 blur-[1px]"
                style={{ animation: 'exhaustPuff 0.75s ease-out 0.35s infinite' }}
              />

              {/* 3D Truck Body + Suspension Bounce + Spinning Wheels */}
              <svg
                viewBox="0 0 260 135"
                className="w-full h-full overflow-visible drop-shadow-[0_12px_16px_rgba(0,0,0,0.45)]"
              >
                <defs>
                  {/* 3D Cargo Side Gradient */}
                  <linearGradient id="cargoSideGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6b00" />
                    <stop offset="55%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  {/* 3D Cargo Roof Gradient (Top Face for 3D Depth) */}
                  <linearGradient id="cargoRoofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="100%" stopColor="#fb923c" />
                  </linearGradient>
                  {/* 3D Cargo Left/Rear Depth Wall */}
                  <linearGradient id="cargoRearGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#9a3412" />
                    <stop offset="100%" stopColor="#c2410c" />
                  </linearGradient>
                  {/* 3D Cab Body Gradient */}
                  <linearGradient id="cabSideGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="70%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#94a3b8" />
                  </linearGradient>
                  {/* 3D Windshield Reflection */}
                  <linearGradient id="windshieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="40%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                </defs>

                {/* CHASSIS & CABIN GROUP WITH GENTLE SUSPENSION BOUNCE */}
                <g style={{ animation: 'chassisSuspension 0.58s ease-in-out infinite' }}>
                  {/* 1. 3D Cargo Box - Top Roof Face (Isometric 3D perspective) */}
                  <polygon
                    points="28,16 158,16 146,28 16,28"
                    fill="url(#cargoRoofGrad)"
                  />

                  {/* 2. 3D Cargo Box - Left/Rear Depth Face */}
                  <polygon
                    points="16,28 28,16 28,82 16,94"
                    fill="url(#cargoRearGrad)"
                  />

                  {/* 3. 3D Cargo Box - Main Side Face */}
                  <rect
                    x="28"
                    y="24"
                    width="130"
                    height="68"
                    rx="6"
                    fill="url(#cargoSideGrad)"
                    stroke="#fed7aa"
                    strokeWidth="1.2"
                  />

                  {/* Cargo Box 3D Ribbed Corrugation Lines */}
                  <line x1="56" y1="26" x2="56" y2="90" stroke="#ea580c" strokeWidth="1.5" opacity="0.55" />
                  <line x1="88" y1="26" x2="88" y2="90" stroke="#ea580c" strokeWidth="1.5" opacity="0.55" />
                  <line x1="120" y1="26" x2="120" y2="90" stroke="#ea580c" strokeWidth="1.5" opacity="0.55" />

                  {/* Brand Strip & Logo Text on 3D Cargo Container */}
                  <rect x="36" y="42" width="114" height="28" rx="6" fill="#0f172a" opacity="0.9" />
                  <text
                    x="93"
                    y="59"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11.5"
                    fontWeight="900"
                    fontFamily="sans-serif"
                    letterSpacing="0.6"
                  >
                    SMARTLOGISTICS
                  </text>
                  <rect x="36" y="67" width="114" height="3" rx="1.5" fill="#fbbf24" />

                  {/* 4. 3D Truck Cab - Top Roof Bevel */}
                  <polygon
                    points="158,34 198,34 190,43 158,43"
                    fill="#cbd5e1"
                  />

                  {/* 5. 3D Truck Cab - Main Aerodynamic Cabin */}
                  <path
                    d="M 158,40 L 198,40 C 206,40 212,45 217,55 L 228,74 C 231,79 232,84 232,92 L 158,92 Z"
                    fill="url(#cabSideGrad)"
                    stroke="#64748b"
                    strokeWidth="1"
                  />

                  {/* Cab Orange Racing Stripe */}
                  <path
                    d="M 158,74 L 228,74 L 231,82 L 158,82 Z"
                    fill="#f97316"
                  />

                  {/* 3D Angled Windshield + Side Window */}
                  <polygon
                    points="168,46 202,46 218,68 168,68"
                    fill="url(#windshieldGrad)"
                    stroke="#334155"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {/* Windshield Gloss Reflection */}
                  <polygon
                    points="174,48 186,48 178,66 170,66"
                    fill="#ffffff"
                    opacity="0.35"
                  />
                  {/* Side Mirror */}
                  <rect x="206" y="54" width="5" height="12" rx="2" fill="#1e293b" />

                  {/* Heavy-Duty Undercarriage & 3D Steel Chassis Frame */}
                  <rect x="20" y="90" width="215" height="9" rx="3" fill="#1e293b" />
                  <rect x="110" y="92" width="42" height="8" rx="2" fill="#475569" />

                  {/* Front Chrome Bumper & Glowing LED Headlight */}
                  <rect x="226" y="84" width="11" height="12" rx="3" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
                  <rect x="229" y="76" width="6" height="7" rx="2" fill="#fef08a" />
                  {/* Rear Taillight */}
                  <rect x="15" y="88" width="5" height="7" rx="1.5" fill="#ef4444" />
                </g>

                {/* 6. SPINNING 3D WHEELS (Rear Dual Axle #1, Rear Dual Axle #2, Front Steer Axle) */}
                {[52, 86, 198].map((cx, idx) => (
                  <g key={idx} transform={`translate(${cx}, 100)`}>
                    {/* 3D Tire Depth Shadow (Back Tire Layer) */}
                    <circle cx="-3" cy="0" r="16" fill="#090d16" />
                    {/* Outer Rubber Tire */}
                    <circle cx="0" cy="0" r="16" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
                    <circle cx="0" cy="0" r="12.5" fill="#0f172a" />

                    {/* Rotating Rim & Spokes */}
                    <g
                      style={{
                        transformOrigin: '0px 0px',
                        animation: 'wheelSpin3D 0.52s linear infinite',
                      }}
                    >
                      <circle cx="0" cy="0" r="9.5" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="-9" y1="0" x2="9" y2="0" stroke="#1e293b" strokeWidth="2.2" />
                      <line x1="0" y1="-9" x2="0" y2="9" stroke="#1e293b" strokeWidth="2.2" />
                      <line x1="-6.5" y1="-6.5" x2="6.5" y2="6.5" stroke="#1e293b" strokeWidth="1.8" />
                      <line x1="-6.5" y1="6.5" x2="6.5" y2="-6.5" stroke="#1e293b" strokeWidth="1.8" />
                      <circle cx="0" cy="0" r="3.8" fill="#f97316" />
                    </g>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Dòng chữ vàng dưới chân tuyến đường */}
          <div className="text-center mt-3">
            <span className="text-orange-500 dark:text-amber-400 font-mono font-bold tracking-wider text-xs">
              SmartLogistics Express
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
