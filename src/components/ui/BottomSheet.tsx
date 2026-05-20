import * as React from "react";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "./drawer";

interface BottomSheetProps {
    title: string;
    description?: string;
    trigger?: React.ReactNode;
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
    title,
    description,
    trigger,
    children,
    open,
    onOpenChange,
    className
}) => {
    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
            <DrawerContent className={cn("bg-[#121212] border-[#262626] text-white", className)}>
                <div className="mx-auto mt-4 h-2 w-[40px] rounded-full bg-[#262626]" />
                <DrawerHeader className="text-left">
                    <DrawerTitle className="text-xl font-bold">{title}</DrawerTitle>
                    {description && <DrawerDescription className="text-muted-foreground">{description}</DrawerDescription>}
                </DrawerHeader>
                <div className="p-4 pt-0">
                    {children}
                </div>
            </DrawerContent>
        </Drawer>
    );
};
