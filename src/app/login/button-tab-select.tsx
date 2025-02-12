"use client";

import { useCarousel } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

export default function ButtonTabSelect() {
  const { scrollPrev } = useCarousel();

  return (
    <Button variant="outline" className="w-full md:hidden" onClick={scrollPrev}>
      选择已登录的账号
    </Button>
  );
}
