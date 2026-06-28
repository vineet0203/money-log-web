import Image from "next/image";

export default function BudgetTracking() {
  return (
    <section className="py-24 bg-gradient-to-r from-[#def2f7] to-[#e4f6f8] overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Side: Mockup Image */}
        <div className="flex-1 relative w-full flex justify-center">
          <div className="relative w-full max-w-2xl aspect-[4/3] drop-shadow-lg">
             <Image
              src="/budget_img.png"
              alt="Budget Tracking UI"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain object-center scale-150 md:scale-[1.6]"
              priority
            />
          </div>
        </div>

        {/* Right Side: Text & Pills */}
        <div className="flex-1 space-y-6 lg:pl-10">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Budget Tracking
          </h2>
          <p className="text-gray-600 text-base leading-relaxed max-w-lg">
            With the Budget Tracking feature, you can create<br className="hidden md:block"/>
            budgets for different spending categories, such as food,<br className="hidden md:block"/>
            transportation, entertainment, and more.
          </p>
          <ul className="space-y-4 pt-2">
            <li className="flex items-center text-[15px] font-medium text-gray-700 bg-white border border-[#b2e2f3] px-6 py-2.5 rounded-full shadow-sm w-fit">
              Set realistic budgets based on your income
            </li>
            <li className="flex items-center text-[15px] font-medium text-gray-700 bg-white border border-[#b2e2f3] px-6 py-2.5 rounded-full shadow-sm w-fit">
              Track daily expenses to ensure you stay within your set budget
            </li>
            <li className="flex items-center text-[15px] font-medium text-gray-700 bg-white border border-[#b2e2f3] px-6 py-2.5 rounded-full shadow-sm w-fit">
              Alerts when approaching the budget limit
            </li>
          </ul>
        </div>

      </div>
    </section>
  );
}
