interface Props {
  title: string;
  subtitle: string;
}

export default function SourceCard({
  title,
  subtitle,
}: Props) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">

      <div className="font-bold">
        {title}
      </div>

      <div className="text-sm text-gray-500">
        {subtitle}
      </div>

    </div>
  );
}