"use client";

import { Check } from "lucide-react";

const pricingList = [
  {
    title: "Paket Layanan Event",
    price: "Hubungi Kami",
    period: "",
    description:
      "Solusi lengkap dan terintegrasi untuk menyukseskan event Anda.",
    features: [
      "Jumlah Tim & Juri Tanpa Batas",
      "Sistem Penilaian Real-time",
      "Manajemen E-Voting (QRIS)",
      "Rekapitulasi Nilai Otomatis",
      "Export Data (PDF, Excel)",
      "Dukungan Teknis Penuh",
    ],
    buttonText: "Hubungi Marketing via WhatsApp",
    isFeatured: true,
  },
];

function Pricing() {
  return (
    <section
      id="pricing"
      className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-300"
    >
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="text-sm font-medium text-red-600 dark:text-red-400 mb-4 block">
            Harga
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Paket yang Sesuai{" "}
            <span className="text-red-600 dark:text-red-400">
              Kebutuhan Anda
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Dapatkan penawaran terbaik untuk menyelenggarakan event 
            berskala kecil maupun besar.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 max-w-md mx-auto gap-8 items-center">
            {pricingList.map((plan) => (
              <div
                key={plan.title}
                className={`relative flex flex-col rounded-xl border p-8 transition-all duration-300 ${
                  plan.isFeatured
                    ? "border-red-600 dark:border-red-500 shadow-2xl bg-red-50/30 dark:bg-red-900/10"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg hover:-translate-y-1"
                }`}
              >
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {plan.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline mb-8">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Check
                          className={`h-5 w-5 shrink-0 ${
                            plan.isFeatured ? "text-red-600" : "text-green-500"
                          }`}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() =>
                    window.open("https://wa.me/6287717555589", "_blank")
                  }
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 cursor-pointer ${
                    plan.isFeatured
                      ? "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Pricing;
