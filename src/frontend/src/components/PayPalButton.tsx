import { CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const PAYPAL_CLIENT_ID =
  "AcXAQ5tkN2LvGxWDQHoalJ1F-ayuORmzaqP7oIFC9YzjBuzSMdrYOXEPtsMJ7u5_99u5_69wKqLKFEhB";

interface PayPalButtonProps {
  amount: number;
  taskId: bigint;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: Record<string, unknown>) => {
        render: (selector: string) => void;
      };
    };
  }
}

export default function PayPalButton({
  amount,
  taskId,
  onSuccess,
}: PayPalButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [paid, setPaid] = useState(false);
  const containerId = `paypal-btn-${taskId.toString()}`;

  useEffect(() => {
    if (window.paypal) {
      setSdkLoaded(true);
      return;
    }
    // Remove any existing PayPal scripts to avoid conflicts
    const existing = document.querySelector(
      `script[src*="paypal.com/sdk"]`,
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.onload = () => setSdkLoaded(true);
      if (window.paypal) setSdkLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
    script.onload = () => setSdkLoaded(true);
    script.onerror = () => setSdkLoaded(false);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!sdkLoaded || rendered || !window.paypal) return;
    const container = document.getElementById(containerId);
    if (!container) return;
    setRendered(true);
    try {
      window.paypal
        .Buttons({
          style: {
            layout: "horizontal",
            color: "gold",
            shape: "rect",
            label: "pay",
            height: 35,
          },
          createOrder: (_data: unknown, actions: Record<string, unknown>) => {
            const order = actions as {
              order: { create: (o: unknown) => Promise<string> };
            };
            return order.order.create({
              purchase_units: [
                {
                  amount: { value: amount.toFixed(2), currency_code: "USD" },
                  payee: { email_address: "jeffbasham41@gmail.com" },
                },
              ],
            });
          },
          onApprove: (_data: unknown, actions: Record<string, unknown>) => {
            const capture = actions as {
              order: { capture: () => Promise<void> };
            };
            return capture.order.capture().then(() => {
              setPaid(true);
              onSuccess?.();
            });
          },
        })
        .render(`#${containerId}`);
    } catch {
      // SDK not available
    }
  }, [sdkLoaded, rendered, containerId, amount, onSuccess]);

  if (paid) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-green-400/30 bg-green-400/10 px-3 py-2">
        <CheckCircle className="h-4 w-4 text-green-400" />
        <span className="text-sm font-semibold text-green-400">
          Payment Sent — ${amount.toFixed(2)}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="text-center text-xs text-muted-foreground">
        Payout:{" "}
        <span className="font-semibold text-foreground">
          ${amount.toFixed(2)}
        </span>
        {" → "}
        <span className="text-primary">jeffbasham41@gmail.com</span>
      </div>
      <div className="rounded-md border border-border/50 bg-muted/20 p-2">
        <div id={containerId} ref={containerRef} />
        {!sdkLoaded && (
          <div className="flex h-9 items-center justify-center gap-2 rounded bg-yellow-400/20 text-sm text-yellow-300">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading PayPal...
          </div>
        )}
      </div>
    </div>
  );
}
