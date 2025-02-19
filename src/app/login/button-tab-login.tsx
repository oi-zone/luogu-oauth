"use client";

import { Button } from "@/components/ui/button";
import { useCarousel } from "@/components/ui/carousel";

export default function ButtonTabLogin() {
  const { scrollNext } = useCarousel();

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full md:hidden"
      onClick={scrollNext}
    >
      登录其他账号
    </Button>
  );
}
