import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({
  position = "top-center",
  offset = "16px",
  mobileOffset = "16px",
  ...props
}: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position={position}
      offset={offset}
      mobileOffset={mobileOffset}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:!border-zinc-800 group-[.toaster]:!bg-[#141414] group-[.toaster]:!text-white group-[.toaster]:!shadow-[0_16px_40px_rgba(0,0,0,0.45)]",
          description: "group-[.toast]:!text-zinc-400",
          actionButton: "group-[.toast]:!bg-[#C8FF00] group-[.toast]:!text-black",
          cancelButton: "group-[.toast]:!bg-[#1C1C1C] group-[.toast]:!text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
