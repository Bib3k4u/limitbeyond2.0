interface PageBannerProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
}

export function PageBanner({ title, subtitle, imageUrl }: PageBannerProps) {
  return (
    <div className="-mx-4 -mt-14 md:-mx-6 md:-mt-6 mb-6 relative overflow-hidden h-52 sm:h-60">
      <img
        src={imageUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      {/* Left-to-right gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
      {/* Bottom vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      {/* Text — sits at the bottom, indented to match page content padding */}
      <div className="relative h-full flex flex-col justify-end px-5 pb-5 sm:px-8 sm:pb-7 md:px-7 md:pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow">{title}</h1>
        {subtitle && <p className="text-sm text-white/60 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
