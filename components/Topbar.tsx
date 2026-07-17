export default function Topbar({
  title,
  crumb,
}: {
  title: string;
  crumb: string;
}) {
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <div className="crumb">{crumb}</div>
      </div>
      <div className="topbar-right">
        <span className="badge badge-gold">
          <span className="dot" /> Demo build
        </span>
        <div className="avatar">JS</div>
      </div>
    </header>
  );
}
