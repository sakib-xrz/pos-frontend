"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  onSelect: (product: {
    id: string;
    name: string;
    price: number;
    image: string;
  }) => void;
}

export function ProductCard({
  id,
  name,
  price,
  image,
  onSelect,
}: ProductCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onSelect({ id, name, price, image })}
    >
      <CardContent className="p-3">
        <div className="aspect-square relative mb-2 rounded-md overflow-hidden">
          <Image
            src={image || "/placeholder.svg?height=200&width=200"}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
        <div className="text-sm font-medium line-clamp-1">{name}</div>
        <div className="text-xs text-muted-foreground">
          {formatCurrency(price)}
        </div>
      </CardContent>
    </Card>
  );
}
