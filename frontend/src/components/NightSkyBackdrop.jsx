export default function NightSkyBackdrop() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none">
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sky Night Gradient */}
          <linearGradient id="nightSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10052C" />
            <stop offset="28%" stopColor="#250742" />
            <stop offset="52%" stopColor="#4D0B58" />
            <stop offset="72%" stopColor="#7E116B" />
            <stop offset="88%" stopColor="#B81A77" />
            <stop offset="100%" stopColor="#D9247A" />
          </linearGradient>

          {/* Back Mountain Ridge Gradient */}
          <linearGradient id="backRidge" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7A126A" />
            <stop offset="60%" stopColor="#550A4E" />
            <stop offset="100%" stopColor="#3A0639" />
          </linearGradient>

          {/* Main Peak Gradient */}
          <linearGradient id="mainPeak" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8A1371" />
            <stop offset="45%" stopColor="#5D0C54" />
            <stop offset="100%" stopColor="#380637" />
          </linearGradient>

          {/* Mid Mountain Gradient */}
          <linearGradient id="midHill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5F0C52" />
            <stop offset="100%" stopColor="#2D042C" />
          </linearGradient>

          {/* Foreground Hills Gradient */}
          <linearGradient id="foreHill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#380536" />
            <stop offset="100%" stopColor="#19021B" />
          </linearGradient>

          {/* Shooting Star Gradient */}
          <linearGradient id="shootingStar" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Moon Glow Filter */}
          <filter id="moonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Sky Rect */}
        <rect width="1440" height="900" fill="url(#nightSky)" />

        {/* Crescent Moon */}
        <g transform="translate(100, 110)" filter="url(#moonGlow)">
          <path
            d="M 45 10 A 35 35 0 1 0 80 58 A 38 38 0 1 1 45 10 Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />
        </g>

        {/* Twinkling Stars */}
        <circle cx="280" cy="120" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
        <circle cx="340" cy="70" r="1.2" fill="#FFFFFF" fillOpacity="0.6" />
        <circle cx="490" cy="160" r="2" fill="#FFFFFF" fillOpacity="0.85" />
        <circle cx="580" cy="95" r="1.5" fill="#FFFFFF" fillOpacity="0.75" />
        <circle cx="680" cy="140" r="1.2" fill="#FFFFFF" fillOpacity="0.6" />
        <circle cx="820" cy="110" r="2.2" fill="#FFFFFF" fillOpacity="0.9" />
        <circle cx="940" cy="80" r="1.5" fill="#FFFFFF" fillOpacity="0.75" />
        <circle cx="1060" cy="170" r="1.8" fill="#FFFFFF" fillOpacity="0.85" />
        <circle cx="1160" cy="130" r="1.2" fill="#FFFFFF" fillOpacity="0.6" />
        <circle cx="1380" cy="220" r="1.6" fill="#FFFFFF" fillOpacity="0.75" />
        <circle cx="210" cy="240" r="1.2" fill="#FFFFFF" fillOpacity="0.5" />
        <circle cx="420" cy="260" r="1.8" fill="#FFFFFF" fillOpacity="0.7" />

        {/* Shooting Star Streak in Top Right */}
        <g transform="translate(1260, 90) rotate(28)">
          <line
            x1="0"
            y1="0"
            x2="90"
            y2="0"
            stroke="url(#shootingStar)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="90" cy="0" r="2" fill="#FFFFFF" />
        </g>

        {/* Layer 1: Distant Warm Glow Mountains (Right Side) */}
        <path
          d="M 600 900 L 600 620 C 720 540, 880 500, 1020 520 C 1180 540, 1320 480, 1440 450 L 1440 900 Z"
          fill="url(#backRidge)"
          opacity="0.9"
        />

        {/* Layer 2: Main Majestic Left Peak */}
        <path
          d="M 0 900 L 0 540 C 60 510, 140 460, 220 380 C 270 330, 310 340, 350 420 C 400 520, 520 600, 680 640 C 780 665, 840 650, 920 670 L 920 900 Z"
          fill="url(#mainPeak)"
        />

        {/* Distinct Highlight Rib on the Left Peak */}
        <path
          d="M 270 330 C 285 365, 290 410, 260 480 C 220 570, 140 640, 0 690 L 0 540 C 60 510, 140 460, 220 380 Z"
          fill="#B11B78"
          opacity="0.32"
        />

        {/* Layer 3: Sweeping Midground Ridges (Right to Center) */}
        <path
          d="M 450 900 C 580 720, 780 640, 980 650 C 1180 660, 1340 580, 1440 550 L 1440 900 Z"
          fill="url(#midHill)"
        />

        {/* Right Slope Layer */}
        <path
          d="M 820 900 C 950 780, 1140 700, 1300 710 C 1380 715, 1420 700, 1440 690 L 1440 900 Z"
          fill="#470845"
          opacity="0.75"
        />

        {/* Layer 4: Foreground Hills (Left Shore with Trees) */}
        <path
          d="M 0 900 L 0 680 C 80 650, 140 680, 220 740 C 300 800, 420 840, 540 860 L 540 900 Z"
          fill="url(#foreHill)"
        />

        {/* Stylized Pine Trees Silhouette on the Left Fore-Hill */}
        <g fill="#17021E">
          {/* Tree 1 */}
          <polygon points="12,680 6,695 18,695" />
          <polygon points="12,690 4,710 20,710" />
          <polygon points="12,705 2,728 22,728" />
          <rect x="10.5" y="728" width="3" height="8" />

          {/* Tree 2 (Taller) */}
          <polygon points="30,660 22,682 38,682" />
          <polygon points="30,676 18,704 42,704" />
          <polygon points="30,698 14,730 46,730" />
          <rect x="28" y="730" width="4" height="12" />

          {/* Tree 3 */}
          <polygon points="52,675 45,694 59,694" />
          <polygon points="52,689 42,712 62,712" />
          <polygon points="52,708 38,736 66,736" />
          <rect x="50" y="736" width="4" height="10" />

          {/* Tree 4 (Small) */}
          <polygon points="72,695 67,710 77,710" />
          <polygon points="72,707 64,724 80,724" />
          <rect x="70.5" y="724" width="3" height="7" />
        </g>

        {/* Layer 5: Rolling Bottom Waves */}
        <path
          d="M 0 900 C 320 840, 720 830, 1100 850 C 1260 860, 1380 870, 1440 880 L 1440 900 Z"
          fill="#120117"
        />
      </svg>
    </div>
  );
}

