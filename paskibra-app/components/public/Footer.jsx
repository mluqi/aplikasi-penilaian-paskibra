import Link from "next/link";
import { ShieldCheck, Twitter, Instagram, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Brand Section */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-red-600 dark:text-red-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                PaskibraApp
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Platform digital modern untuk manajemen dan penjurian lomba
              Paskibra yang akurat, transparan, dan efisien.
            </p>
            <div className="mt-8 flex space-x-6">
              <Link
                href="#"
                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300"
              >
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300"
              >
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-2 lg:grid-cols-3">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-6">
                Navigasi
              </p>
              <ul className="space-y-4 text-sm">
                <li>
                  <Link
                    href="#features"
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300"
                  >
                    Fitur
                  </Link>
                </li>
                <li>
                  <Link
                    href="#audience"
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300"
                  >
                    Untuk Siapa
                  </Link>
                </li>
                <li>
                  <Link
                    href="#testimonials"
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300"
                  >
                    Testimoni
                  </Link>
                </li>
                <li>
                  <Link
                    href="#how-it-works"
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300"
                  >
                    Cara Kerja
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-6">
                Bantuan
              </p>
              <ul className="space-y-4 text-sm">
                <li>
                  <Link
                    href="#faq"
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300"
                  >
                    Hubungi Kami
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300"
                  >
                    Dukungan
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-6">
                Legal
              </p>
              <ul className="space-y-4 text-sm">
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300"
                  >
                    Syarat & Ketentuan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300"
                  >
                    Kebijakan Privasi
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left flex items-center gap-1">
              &copy; {new Date().getFullYear()}{" "}
              <Link href="https://palindo.id" target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-400 hover:underline">
                palindo.id
              </Link>{" "}All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
