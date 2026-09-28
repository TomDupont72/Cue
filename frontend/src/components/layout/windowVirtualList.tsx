import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useLayoutEffect, useRef, useState, type Key, type ReactNode } from "react";

type WindowVirtualListProps<T> = {
  items: readonly T[];
  estimateSize: number;
  getItemKey: (item: T, index: number) => Key;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
};

export function WindowVirtualList<T>({
  items,
  estimateSize,
  getItemKey,
  renderItem,
  overscan = 2,
}: WindowVirtualListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    if (!listRef.current) return;

    setScrollMargin(
      listRef.current.getBoundingClientRect().top + window.scrollY
    );
  }, [items]);

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => estimateSize,
    getItemKey: (index) => getItemKey(items[index], index),
    overscan,
    scrollMargin,
    useFlushSync: false,
  });

  return (
    <div
      ref={listRef}
      style={{
        position: "relative",
        height: virtualizer.getTotalSize(),
        width: "100%",
      }}
    >
      {virtualizer.getVirtualItems().map((virtualItem) => {
        const item = items[virtualItem.index];

        return (
          <div
            key={virtualItem.key}
            ref={virtualizer.measureElement}
            data-index={virtualItem.index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${
                virtualItem.start - scrollMargin
              }px)`,
            }}
          >
            {renderItem(item, virtualItem.index)}
          </div>
        );
      })}
    </div>
  );
}