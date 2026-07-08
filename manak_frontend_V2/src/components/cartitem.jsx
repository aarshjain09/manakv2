import QuantitySelector from "./quantityselector";

export default function CartItem({ item, onUpdate }) {
  const { product, pieces, boxes } = item;

  return (
    <div className="border p-4 rounded space-y-2 flex gap-4">
      {/* IMAGE */}
      {product.image && (
        <img
          src={product.image}   // ✅ FIX IS HERE
          alt={product.name}
          className="w-20 h-20 object-cover rounded border"
        />
      )}

      <div className="flex-1">
        <h2 className="font-semibold">{product.name}</h2>

        <div className="flex justify-between items-center mt-2">
          <span>Pieces</span>
          <QuantitySelector
            value={pieces}
            onChange={(v) =>
              onUpdate(product._id, "pieces", v)
            }
          />
        </div>

        <div className="flex justify-between items-center mt-2">
          <span>Boxes</span>
          <QuantitySelector
            value={boxes}
            onChange={(v) =>
              onUpdate(product._id, "boxes", v)
            }
          />
        </div>

        <div className="text-sm text-gray-600 mt-2">
          ₹{pieces * product.pricePerPiece +
            boxes * product.boxPrice}
        </div>
      </div>
    </div>
  );
}
