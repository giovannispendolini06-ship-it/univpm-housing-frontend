export default function AnimatedNumber({
  value,
  suffix,
}: {
  value: number;
  suffix?: string;
}) {
  return (
    <>
      {value.toLocaleString("it-IT")}
      {suffix ?? ""}
    </>
  );
}
