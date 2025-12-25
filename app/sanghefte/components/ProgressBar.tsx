import { LIMITS } from "../../config/constants";

type ProgressBarProps = {
  currentLength: number;
};

export function ProgressBar({ currentLength }: ProgressBarProps) {
  const maxLength = LIMITS.qrCapacity;
  const percentage = Math.min((currentLength / maxLength) * 100, 100);
  const isOverLimit = currentLength > maxLength;

  let barColor: string;
  let statusText: string;

  if (isOverLimit) {
    barColor = "bg-red-600";
    statusText = "For stort for QR-kode! Bruk lenke i stedet.";
  } else if (percentage >= 90) {
    barColor = "bg-red-500";
    statusText = `${currentLength} / ${maxLength} tegn (${Math.round(percentage)}%) - Nesten fullt!`;
  } else if (percentage >= 70) {
    barColor = "bg-amber-500";
    statusText = `${currentLength} / ${maxLength} tegn (${Math.round(percentage)}%) - Nærmer seg grensen`;
  } else {
    barColor = "bg-green-500";
    statusText = `${currentLength} / ${maxLength} tegn (${Math.round(percentage)}%)`;
  }

  return (
    <div className="space-y-2">
      <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p
        className={`text-sm ${isOverLimit ? "text-red-600 font-medium" : "text-amber-800"}`}
      >
        {statusText}
      </p>
    </div>
  );
}
