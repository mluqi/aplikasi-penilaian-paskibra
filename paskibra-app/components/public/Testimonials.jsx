"use client";
import React, { useState, useEffect, useRef } from "react";
import { Quote } from "lucide-react";

const testimonialsList = [
  {
    name: "Ahmad Fauzi",
    role: "Ketua Pelaksana, Lomba Patriot 2023",
    quote:
      "PaskibraApp benar-benar revolusioner. Proses rekapitulasi yang biasanya butuh berjam-jam, kini selesai dalam hitungan menit. Sangat direkomendasikan!",
  },
  {
    name: "Siti Nurhaliza",
    role: "Juri Kehormatan, Gebyar Paskibra Nasional",
    quote:
      "Sebagai juri, antarmuka aplikasi ini sangat intuitif. Saya bisa fokus penuh pada penampilan peserta tanpa direpotkan oleh kertas dan pulpen. Penilaian jadi lebih objektif.",
  },
  {
    name: "Budi Santoso",
    role: "Pembina, SMA Garuda Emas",
    quote:
      "Transparansi adalah kunci. Dengan aplikasi ini, kami sebagai tim peserta merasa lebih percaya dengan hasil lomba. Semua informasi tersaji dengan jelas dan cepat.",
  },
  {
    name: "Maya Sari",
    role: "Koordinator Juri, Festival Paskibra 2023",
    quote:
      "Sistem penilaian real-time memudahkan koordinasi antar juri. Hasil langsung terkonsolidasi tanpa perlu rapat panjang. Efisiensi waktu sangat terasa.",
  },
  {
    name: "Rizki Pratama",
    role: "Ketua Panitia, Porseni Paskibra 2023",
    quote:
      "Dari pendaftaran hingga pengumuman juara, semua terintegrasi dengan baik. Peserta puas, panitia tidak stres. Win-win solution untuk semua pihak.",
  },
  {
    name: "Dewi Anggraeni",
    role: "Pembina, SMA Nusantara Bangsa",
    quote:
      "Platform ini membuat manajemen tim lebih terorganisir. Jadwal latihan, pendaftaran lomba, dan monitoring hasil semua dalam satu aplikasi.",
  },
];

const Testimonials = () => {
  const [offset, setOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cardWidth, setCardWidth] = useState(384); // Default width
  const cardRef = useRef(null);

  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [
    ...testimonialsList,
    ...testimonialsList,
    ...testimonialsList,
  ];

  // Dynamically get card width
  useEffect(() => {
    const updateCardWidth = () => {
      if (cardRef.current) {
        setCardWidth(cardRef.current.offsetWidth);
      }
    };

    updateCardWidth(); // Initial width

    const resizeObserver = new ResizeObserver(updateCardWidth);
    if (cardRef.current) {
      resizeObserver.observe(cardRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  // Continuous auto slide
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setOffset((prevOffset) => prevOffset - 1);
    }, 30); // Update every 30ms for smooth animation

    return () => clearInterval(interval);
  }, [isPaused]);

  // Calculate card width including gap
  const gap = 24; // Corresponds to gap-6
  const totalCardWidth = cardWidth + gap;

  // Reset offset when it reaches the end of one complete set
  useEffect(() => {
    if (offset <= -(testimonialsList.length * totalCardWidth)) {
      setOffset(0);
    }
  }, [offset, testimonialsList.length, totalCardWidth, cardWidth]);

  return (
    <section
      id="testimonials"
      className="py-16 sm:py-24 bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="text-sm font-medium text-red-600 dark:text-red-400 mb-4 block">
            Testimoni
          </span>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Dipercaya oleh{" "}
            <span className="text-red-600 dark:text-red-400">
              Panitia, Juri, dan Pembina
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Dengarkan pengalaman langsung dari mereka yang telah menggunakan
            platform kami.
          </p>
        </div>

        {/* Smooth Slider Container */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="flex gap-6"
            style={{
              transform: `translateX(${offset}px)`,
              transition: "none",
            }}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${index}`}
                ref={index === 0 ? cardRef : null} // Attach ref to the first card
                className="flex-shrink-0 w-[80vw] max-w-xs sm:w-96"
              >
                <div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 h-full transition-all duration-300 hover:shadow-lg hover:border-red-200 dark:hover:border-red-800">
                  {/* Quote Icon */}
                  <div className="mb-4">
                    <Quote className="w-4 h-4 md:h-6 md:w-6 text-red-600 dark:text-red-400 opacity-80" />
                  </div>

                  {/* Quote Text */}
                  <p className="text-xs md:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-6 flex-1 transition-colors duration-300">
                    "{testimonial.quote}"
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 font-semibold text-xs md:text-sm">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs md:text-base font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                        {testimonial.name}
                      </h4>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-4 md:w-24 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none transition-colors duration-300"></div>
          <div className="absolute right-0 top-0 bottom-0 w-4 md:w-24 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none transition-colors duration-300"></div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
