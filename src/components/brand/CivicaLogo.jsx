const SOURCES = {
  logo: "/brand/civica-logo.svg",
  mark: "/brand/civica-mark.svg",
  icon: "/brand/civica-icon.svg",
};

/**
 * Civica brand image. `variant`: logo | mark | icon
 * Height is controlled; width scales with no stretching.
 */
export default function CivicaLogo({
  variant = "logo",
  height = 36,
  className = "",
}) {
  const src = SOURCES[variant] || SOURCES.logo;
  return (
    <img
      src={src}
      alt="Civica"
      height={height}
      className={`w-auto object-contain ${className}`}
      style={{ height, width: "auto" }}
      draggable={false}
    />
  );
}
