"use client";

import { Button } from "@/components/ui/button";
import { useCarousel } from "@/components/ui/carousel";

export default function ButtonTabSelect() {
  const { scrollPrev } = useCarousel();

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full md:hidden"
      onClick={scrollPrev}
    >
      选择已登录的账号
    </Button>
  );
}
