import { useState } from "react";
import { useUpdateReady } from "../../update/update-ready";
import { Icon } from "../icon/icon";
import "./update-banner.css";

// A newer build has taken over this tab. Reloading replays the saved journal,
// so the table can pick it up between turns without losing its place.
export function UpdateBanner() {
  const ready = useUpdateReady();
  const [dismissed, setDismissed] = useState(false);
  if (!ready || dismissed) return null;
  return (
    <div className="update-banner" role="status">
      <span className="update-banner-icon" aria-hidden="true">
        <Icon name="sparkles" size={16} />
      </span>
      <p>
        <strong>Versi baru udah siap.</strong> Muat ulang biar kebagian yang terbaru.
      </p>
      <button className="update-banner-later" onClick={() => setDismissed(true)}>
        Nanti aja
      </button>
      <button className="update-banner-reload" onClick={() => window.location.reload()}>
        Muat ulang
        <Icon name="reset" size={15} />
      </button>
    </div>
  );
}
