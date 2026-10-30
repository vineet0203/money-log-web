import {
  LayoutDashboard,
  Receipt,
  FileText,
  CreditCard,
  Target,
  Bell,
  RefreshCcw,
  PiggyBank,
  LineChart,
  FolderOpen,
  FileBarChart,
  Bot,
  LayoutGrid,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export default function Features() {
  const features = [
    {
      icon: <LayoutDashboard className="w-5 h-5 text-white" />,
      color: "bg-green-500",
      glow: "group-hover:shadow-green-500/40",
      title: "Personal Finance Dashboard",
      description: "Get a complete view of your financial life.",
    },
    {
      icon: <Receipt className="w-5 h-5 text-white" />,
      color: "bg-blue-600",
      glow: "group-hover:shadow-blue-600/40",
      title: "Income & Expense Tracking",
      description: "Track all your income and expenses easily.",
    },
    {
      icon: <FileText className="w-5 h-5 text-white" />,
      color: "bg-green-500",
      glow: "group-hover:shadow-green-500/40",
      title: "Billing & Invoice Management",
      description: "Create, manage and track invoices.",
    },
    {
      icon: <CreditCard className="w-5 h-5 text-white" />,
      color: "bg-blue-500",
      glow: "group-hover:shadow-blue-500/40",
      title: "Bank & Card Transactions",
      description: "Sync and categorize transactions automatically.",
    },
    {
      icon: <Target className="w-5 h-5 text-white" />,
      color: "bg-blue-400",
      glow: "group-hover:shadow-blue-400/40",
      title: "Smart Budgeting",
      description: "Set budgets and stay on track.",
    },
    {
      icon: <Bell className="w-5 h-5 text-white" />,
      color: "bg-indigo-500",
      glow: "group-hover:shadow-indigo-500/40",
      title: "Bill Pay & Reminders",
      description: "Never miss a payment again.",
    },
    {
      icon: <RefreshCcw className="w-5 h-5 text-white" />,
      color: "bg-blue-500",
      glow: "group-hover:shadow-blue-500/40",
      title: "Subscription Management",
      description: "Track and manage all subscriptions.",
    },
    {
      icon: <PiggyBank className="w-5 h-5 text-white" />,
      color: "bg-orange-500",
      glow: "group-hover:shadow-orange-500/40",
      title: "Savings Goals",
      description: "Set goals and watch your savings grow.",
    },
    {
      icon: <LineChart className="w-5 h-5 text-white" />,
      color: "bg-green-500",
      glow: "group-hover:shadow-green-500/40",
      title: "Debt & Credit Tracking",
      description: "Monitor credit scores and track debt payoff.",
    },
    {
      icon: <FolderOpen className="w-5 h-5 text-white" />,
      color: "bg-blue-600",
      glow: "group-hover:shadow-blue-600/40",
      title: "Tax & Receipt Organizer",
      description: "Store receipts and organize tax documents.",
    },
    {
      icon: <FileBarChart className="w-5 h-5 text-white" />,
      color: "bg-blue-500",
      glow: "group-hover:shadow-blue-500/40",
      title: "Financial Reports",
      description: "Get detailed insights and custom reports.",
    },
    {
      icon: <Bot className="w-5 h-5 text-white" />,
      color: "bg-green-500",
      glow: "group-hover:shadow-green-500/40",
      title: "AI Financial Assistant",
      description: "Ask questions and get personalized insights.",
    },
  ];

  return (
    <section
      id="features"
      className="w-full scroll-mt-24 pt-12 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24"
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="group mb-8 flex items-center justify-center gap-3 sm:mb-10 lg:mb-12">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 sm:h-10 sm:w-10">
              <LayoutGrid className="h-4 w-4 text-white sm:h-5 sm:w-5" strokeWidth={2.5} />
            </span>
            <h2 className="text-center text-xl font-bold tracking-tight text-balance text-blue-950 sm:text-2xl lg:text-[1.75rem]">
              Everything You Need to Manage Your Money
            </h2>
          </div>
        </Reveal>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={Math.min(index, 7) * 60} variant="up" className="h-full">
              <div className="ml-card ml-sheen group flex h-full cursor-default flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-brand-green/30 sm:p-6">
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${feature.color} shadow-sm transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-lg ${feature.glow}`}
                >
                  <span className="transition-transform duration-500 ease-out group-hover:rotate-6">
                    {feature.icon}
                  </span>
                </div>
                <h3 className="mb-2 text-[15px] font-bold text-gray-900 transition-colors duration-300 group-hover:text-brand-green">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500 transition-colors duration-300 group-hover:text-gray-600">
                  {feature.description}
                </p>
                {/* Bottom accent line that draws in on hover */}
                <span className="mt-4 block h-[2px] w-0 rounded-full bg-gradient-to-r from-brand-green to-blue-500 transition-all duration-500 ease-out group-hover:w-12" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
