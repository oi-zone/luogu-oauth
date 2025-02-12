"use client";

import { useCarousel } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

export default function ButtonTabLogin() {
  const { scrollNext } = useCarousel();

  return (
    <Button variant="outline" className="w-full md:hidden" onClick={scrollNext}>
      登录其他账号
    </Button>
  );
}
