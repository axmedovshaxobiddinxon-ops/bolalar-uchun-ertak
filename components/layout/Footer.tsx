import { Heart, BookOpen } from "lucide-react";

const VALUES_BADGES = [
  "Ezgulik", "Halollik", "Odob", "Ilm", "Kitob",
  "Vatan", "Oila", "Ustoz", "Do'stlik", "Mehnat",
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-amber-100 dark:border-gray-800 bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Values strip */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {VALUES_BADGES.map((value) => (
            <span
              key={value}
              className="px-3 py-1 bg-amber-50 dark:bg-gray-800 border border-amber-200 dark:border-gray-700 rounded-full text-xs font-semibold text-amber-700 dark:text-amber-400"
            >
              {value}
            </span>
          ))}
        </div>

        {/* Tagline */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen size={16} className="text-amber-400" />
            <span className="font-display font-bold text-gray-700 dark:text-gray-300">
              Bolalar Uchun Ertak
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
            Har bir ertak — yangi saboq. Har bir saboq — yangi bola.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600 flex items-center justify-center gap-1">
            Bolalar uchun{" "}
            <Heart size={11} className="text-red-400 fill-red-400 inline" />{" "}
            bilan yaratilgan · O&apos;zbekiston &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
