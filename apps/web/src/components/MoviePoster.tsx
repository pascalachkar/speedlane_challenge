import type { ImgHTMLAttributes, SyntheticEvent } from 'react';

type MoviePosterProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'src'> & {
  src: string;
  title: string;
};

function fallbackPoster(title: string): string {
  const safeTitle = title.length > 28 ? `${title.slice(0, 25)}…` : title;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#09121f"/><stop offset="1" stop-color="#123d70"/></linearGradient></defs>
    <rect width="600" height="900" fill="url(#bg)"/>
    <circle cx="300" cy="350" r="82" fill="none" stroke="#4b9cff" stroke-width="12"/>
    <circle cx="270" cy="320" r="14" fill="#4b9cff"/><circle cx="330" cy="320" r="14" fill="#4b9cff"/><circle cx="270" cy="380" r="14" fill="#4b9cff"/><circle cx="330" cy="380" r="14" fill="#4b9cff"/>
    <text x="300" y="520" text-anchor="middle" fill="#f4f7fb" font-family="Arial, sans-serif" font-size="34" font-weight="700">${safeTitle.replace(/[&<>"']/g, '')}</text>
    <text x="300" y="570" text-anchor="middle" fill="#9eb9d8" font-family="Arial, sans-serif" font-size="20" letter-spacing="4">REELHOUSE</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function MoviePoster({ src, title, onError, ...props }: MoviePosterProps) {
  function handleError(event: SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget;
    if (image.dataset.fallback !== 'true') {
      image.dataset.fallback = 'true';
      image.src = fallbackPoster(title);
    }
    onError?.(event);
  }

  return <img {...props} src={src} alt={`Poster for ${title}`} onError={handleError} />;
}
