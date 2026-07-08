export default function QuantitySelector({ value, onChange }) {
  const increase = () => onChange(value + 1);
  const decrease = () => {
    if (value > 0) onChange(value - 1);
  };

  const handleInput = (e) => {
    const num = Number(e.target.value);
    if (!isNaN(num) && num >= 0) onChange(num);
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <button
        onClick={decrease}
        className="px-2 sm:px-3 py-1 bg-gray-200 rounded text-sm"
      >
        −
      </button>

      <input
        type="number"
        value={value}
        onChange={handleInput}
        className="w-10 sm:w-14 text-center border rounded text-sm"
      />

      <button
        onClick={increase}
        className="px-2 sm:px-3 py-1 bg-gray-200 rounded text-sm"
      >
        +
      </button>
    </div>
  );
}
