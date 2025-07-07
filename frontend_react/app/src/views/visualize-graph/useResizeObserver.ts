import { useEffect, useState } from "react";

interface Dimensions {
  width: number;
  height: number;
}

const useResizeObserver = (ref: React.RefObject<HTMLElement | null>): Dimensions => {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 600, height: 600 });

  useEffect(() => {
    const target = ref.current;
    if (!target) return; // Si la référence est null, on sort de l'effet

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    observer.observe(target);

    // Nettoyage lors du démontage du composant
    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  }, [ref]);

  return dimensions;
};

export default useResizeObserver;