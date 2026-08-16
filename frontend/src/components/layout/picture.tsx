import { getTmdbImageUrl, type TmdbImageSize } from "@/lib/tmdbImage";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";
import type { ComponentProps } from "react";

type PictureProps = Omit<ComponentProps<"img">, "src"> & {
  path: string | null;
  size?: TmdbImageSize;
  hover?: boolean;
};

export default function Picture({
  path,
  size = "w500",
  hover = false,
  alt = "",
  className,
  ...props
}: PictureProps) {
  const url = getTmdbImageUrl(path, size);

  return (
    <>
      {url ? (
        <img
          {...props}
          src={url}
          alt={alt}
          loading="lazy"
          className={cn(
            "h-full w-full object-cover",
            hover && "transition-transform duration-300 group-hover:scale-105",
            className
          )}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <ImageOff className="size-8" />
        </div>
      )}
    </>
  );
}
