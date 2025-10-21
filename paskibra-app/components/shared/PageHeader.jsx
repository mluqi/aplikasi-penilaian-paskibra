export default function PageHeader({ breadcrumb, title, subtitle }) {
  return (
    <section className="relative pt-32 pb-10 lg:pt-26 lg:pb-12 text-center bg-white dark:bg-gray-900">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-96 bg-red-50 dark:bg-red-900/10 rounded-full blur-3xl opacity-50"></div>
      </div>
      <div className="container mx-auto px-4 relative">
        {breadcrumb && (
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-full">
            {breadcrumb}
          </span>
        )}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
          {title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
