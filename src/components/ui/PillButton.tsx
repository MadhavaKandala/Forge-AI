import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./button";

export interface PillButtonProps extends ButtonProps {
    gradient?: boolean;
}

const PillButton = React.forwardRef<HTMLButtonElement, PillButtonProps>(
    ({ className, gradient = true, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                className={cn(
                    "rounded-full font-bold transition-all active:scale-95",
                    gradient && "bg-gradient-to-r from-[#dfff4f] to-[#2fb58f] text-black hover:opacity-90 border-none shadow-lg shadow-green-900/20",
                    !gradient && "bg-[#1a1a1a] text-white hover:bg-[#252525]",
                    className
                )}
                {...props}
            />
        );
    }
);

PillButton.displayName = "PillButton";

export { PillButton };
