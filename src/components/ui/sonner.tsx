'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg data-[type=success]:group-[.toaster]:bg-emerald-600 data-[type=success]:group-[.toaster]:text-white data-[type=success]:group-[.toaster]:border-emerald-700 data-[type=error]:group-[.toaster]:bg-rose-600 data-[type=error]:group-[.toaster]:text-white data-[type=error]:group-[.toaster]:border-rose-700 data-[type=warning]:group-[.toaster]:bg-amber-500 data-[type=warning]:group-[.toaster]:text-amber-950 data-[type=warning]:group-[.toaster]:border-amber-600 data-[type=info]:group-[.toaster]:bg-blue-600 data-[type=info]:group-[.toaster]:text-white data-[type=info]:group-[.toaster]:border-blue-700',
          description:
            'group-[.toast]:text-muted-foreground group-data-[type=success]:text-emerald-100 group-data-[type=error]:text-rose-100 group-data-[type=warning]:text-amber-900 group-data-[type=info]:text-blue-100',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-data-[type=success]:bg-emerald-800 group-data-[type=success]:text-white group-data-[type=error]:bg-rose-800 group-data-[type=error]:text-white group-data-[type=warning]:bg-amber-700 group-data-[type=warning]:text-white group-data-[type=info]:bg-blue-800 group-data-[type=info]:text-white',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
