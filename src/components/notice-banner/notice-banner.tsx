import "./notice-banner.css";
export function NoticeBanner({
  notice,
  saveError,
  onDismiss,
}: {
  notice: string;
  saveError: boolean;
  onDismiss: () => void;
}) {
  if (!notice && !saveError) return null;
  return (
    <p className="notice" role="status">
      {saveError ? "Browser nggak bisa menyimpan. Jangan tutup dulu, ya." : notice}
      {!saveError && notice ? (
        <button className="notice-dismiss" onClick={onDismiss}>
          Mengerti
        </button>
      ) : null}
    </p>
  );
}
