import { CreditCard, RefreshCcw, FileSignature, HandCoins, WalletCards, FileBarChart, Wallet, Target, Apple } from "lucide-react";
import Image from "next/image";

export default function Features() {
  const features = [
    {
      icon: <CreditCard className="w-8 h-8 text-brand-green stroke-2" />,
      title: "Transactions",
      description: "Track income &\nexpenses easily",
    },
    {
      icon: <RefreshCcw className="w-8 h-8 text-brand-green stroke-2" />,
      title: "Subscriptions",
      description: "Manage & never\nmiss a renewal",
    },
    {
      icon: <FileSignature className="w-8 h-8 text-brand-green stroke-2" />,
      title: "Payables",
      description: "Track what you\nowe to you",
    },
    {
      icon: <HandCoins className="w-8 h-8 text-brand-green stroke-2" />,
      title: "Receivables",
      description: "Track what others\nowe to you",
    },
    {
      icon: <WalletCards className="w-8 h-8 text-brand-green stroke-2" />,
      title: "P&L/Balance",
      description: "Daily profit & loss\nand balance",
    },
    {
      icon: <FileBarChart className="w-8 h-8 text-brand-green stroke-2" />,
      title: "Reports",
      description: "Beautiful reports\n& insights",
    },
    {
      icon: <Wallet className="w-8 h-8 text-brand-green stroke-2" />,
      title: "Budgets",
      description: "Set budgets &\nstay on track",
    },
    {
      icon: <Target className="w-8 h-8 text-brand-green stroke-2" />,
      title: "Goals",
      description: "Plan your goals &\nachieve more",
    },
  ];

  return (
    <section id="features" className="py-16 px-8 w-full max-w-7xl mx-auto flex flex-col gap-16">
      {/* 1. Features Grid */}
      <div className="bg-blue-50/60 border border-blue-50/80 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px]">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-10 bg-white hover:bg-gray-50/50 transition-colors"
            >
              <div className="mb-5">
                {feature.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2.5 text-[15px]">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Mobile Promo */}
      <div className="w-full flex flex-col md:flex-row items-center gap-16 overflow-hidden">
        {/* Left Content */}
        <div className="w-full md:w-5/12 lg:w-2/5 flex flex-col items-start space-y-6 z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight text-gray-900 tracking-tight">
            Mobile First.<br />
            Finance Anywhere.
          </h2>
          <p className="text-gray-600 font-medium text-lg pb-4">
            Powerful Features on the go.
          </p>
          <div className="flex flex-col gap-4 w-full sm:w-auto p-1">
            {/* App Store Badge (CSS recreation) */}
            <a href="#" className="flex items-center justify-start px-8 py-3.5 bg-black text-white rounded-xl transition-transform hover:scale-105 origin-left border border-black w-[240px]">
              <Apple className="w-9 h-9 mr-4 fill-white shrink-0" />
              <div className="flex flex-col items-start">
                <span className="text-[9px] uppercase font-semibold leading-none mb-1 text-gray-200">Available on the</span>
                <span className="text-[19px] font-semibold leading-none">App Store</span>
              </div>
            </a>
            {/* Google Play Badge (CSS recreation) */}
            <a href="#" className="flex items-center justify-start px-8 py-3.5 bg-black text-white rounded-xl transition-transform hover:scale-105 origin-left border border-black w-[240px]">
              <svg viewBox="0 0 512 512" className="w-8 h-8 mr-4 shrink-0 translate-x-0.5" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4caf50" d="M36.1 27.6l284.1 164-58.8 58.8-225.3-222.8z"/>
                <path fill="#2196f3" d="M36.1 27.6v456.8l225.3-222.8z"/>
                <path fill="#ffc107" d="M466 276.1l-145.8 84.1-58.8-58.8 58.8-58.8 145.8 84.1c11.9 6.8 11.9 22.6 0 29.4z"/>
                <path fill="#f44336" d="M36.1 484.4l284.1-164-58.8-58.8-225.3 222.8z"/>
              </svg>
              <div className="flex flex-col items-start">
                <span className="text-[9px] uppercase font-semibold leading-none mb-1 text-gray-200">GET IT ON</span>
                <span className="text-[18px] font-semibold leading-none">Google Play</span>
              </div>
            </a>
          </div>
        </div>

        {/* Right Image (Perfectly cropped to show both phones) */}
        <div className="w-full md:w-7/12 lg:w-3/5 overflow-hidden rounded-2xl drop-shadow-sm flex justify-end items-center">
          {/* 
            By using justify-end and a width larger than 100% (e.g. 180%), 
            the right edge of the image is pinned to the right of the container, 
            and the left side of the image (the text) gracefully overflows out of view to the left.
            This ensures both phones are visible without clipping the top or bottom!
          */}
          <Image
            src="/mobile_image.png"
            alt="Mobile App Promos"
            width={1536}
            height={1024}
            className="w-[220%] lg:w-[210%] h-auto max-w-none transform origin-right hover:scale-[1.02] transition-transform duration-500"
            sizes="(max-width: 768px) 220vw, 125vw"
            priority
          />
        </div>
      </div>
    </section>
  );
}
