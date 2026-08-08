interface Props {
  title: string;
  subtitle: string;
}

export default function SourceCard({
  title,
  subtitle,
}: Props) {
  return (
    <div className="source-card">
      <div className="source-card-title">{title}</div>
      <div className="source-card-subtitle">{subtitle}</div>
    </div>
  );
}