import * as React from "react";
import { Coffee, Star, Gift, Tag, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface StampIconProps {
  icon?: string;
  isCompleted?: boolean;
  color?: string;
  className?: string;
}

export function StampIcon({ icon = "cup", isCompleted = false, color = "#315EFB", className }: StampIconProps) {
  const iconProps = {
    className: cn("w-6 h-6 transition-all duration-300", className),
    style: { color: isCompleted ? color : "#98A2B3" },
  };

  switch (icon.toLowerCase()) {
    case "star":
      return <Star {...iconProps} fill={isCompleted ? color : "none"} />;
    case "gift":
      return <Gift {...iconProps} />;
    case "tag":
      return <Tag {...iconProps} />;
    case "heart":
      return <Heart {...iconProps} fill={isCompleted ? color : "none"} />;
    case "cup":
    default:
      return <Coffee {...iconProps} />;
  }
}
