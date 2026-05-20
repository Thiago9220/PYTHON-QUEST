import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-slate-950/95 group-[.toaster]:text-slate-100 group-[.toaster]:border-cyan-400/30 group-[.toaster]:shadow-[0_0_30px_rgba(14,165,233,0.18)] group-[.toaster]:backdrop-blur-xl group-[.toaster]:rounded-xl",
          title:
            "group-[.toast]:text-slate-50 group-[.toast]:font-black group-[.toast]:tracking-tight",
          description:
            "group-[.toast]:text-slate-400 group-[.toast]:font-semibold",
          success:
            "group-[.toaster]:border-emerald-400/35 group-[.toaster]:shadow-[0_0_30px_rgba(16,185,129,0.18)]",
          error:
            "group-[.toaster]:border-rose-400/40 group-[.toaster]:shadow-[0_0_30px_rgba(244,63,94,0.2)]",
          warning:
            "group-[.toaster]:border-amber-400/40 group-[.toaster]:shadow-[0_0_30px_rgba(245,158,11,0.18)]",
          info:
            "group-[.toaster]:border-sky-400/35 group-[.toaster]:shadow-[0_0_30px_rgba(14,165,233,0.18)]",
          actionButton:
            "group-[.toast]:bg-cyan-500/15 group-[.toast]:text-cyan-200 group-[.toast]:border group-[.toast]:border-cyan-400/30 group-[.toast]:rounded-lg group-[.toast]:font-black",
          cancelButton:
            "group-[.toast]:bg-slate-800 group-[.toast]:text-slate-300 group-[.toast]:rounded-lg",
          closeButton:
            "group-[.toast]:bg-slate-950 group-[.toast]:border-slate-700 group-[.toast]:text-slate-300",
        },
      }}
      style={
        {
          "--normal-bg": "rgba(2, 6, 23, 0.96)",
          "--normal-text": "#e2e8f0",
          "--normal-border": "rgba(34, 211, 238, 0.28)",
          "--success-bg": "rgba(2, 6, 23, 0.96)",
          "--success-text": "#d1fae5",
          "--success-border": "rgba(52, 211, 153, 0.35)",
          "--error-bg": "rgba(2, 6, 23, 0.96)",
          "--error-text": "#ffe4e6",
          "--error-border": "rgba(251, 113, 133, 0.42)",
          "--warning-bg": "rgba(2, 6, 23, 0.96)",
          "--warning-text": "#fef3c7",
          "--warning-border": "rgba(251, 191, 36, 0.4)",
          "--info-bg": "rgba(2, 6, 23, 0.96)",
          "--info-text": "#dbeafe",
          "--info-border": "rgba(56, 189, 248, 0.36)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
