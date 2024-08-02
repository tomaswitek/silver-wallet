interface Props {
  value?: bigint;
}

export function Amount({ value }: Props) {
  const formatValue = (val: bigint): string => {
    const strValue = val.toString();
    const integerPart = strValue.slice(0, -8);
    const decimalPart = strValue.slice(-8).padStart(8, "0");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const formattedDecimal = decimalPart.replace(/\.?0+$/, "");
    return formattedDecimal
      ? `${formattedInteger}.${formattedDecimal}`
      : formattedInteger;
  };

  if (!value) {
    return 0;
  }

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: "36px",
        fontWeight: "bold",
      }}
    >
      {formatValue(value)}
    </div>
  );
}

export default Amount;
