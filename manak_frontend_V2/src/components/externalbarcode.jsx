import {
  useContext,
} from "react";

import {
  Check,
  Package,
  ScanBarcode,
  TrendingUp,
  X,
} from "lucide-react";

import {
  AuthContext,
} from "../context/auth";

import {
  CartContext,
} from "../context/cart";

import {
  WorkerCustomerContext,
} from "../context/workercustomer";

import QuantitySelector from "./quantityselector";

export default function ExternalScanProductModal({
  product,
  open,
  onClose,
}) {
  const {
    user,
  } = useContext(AuthContext);

  const {
    selectedCustomer,
  } = useContext(
    WorkerCustomerContext
  );

  const {
    cart = [],
    addToCart,
    updateQty,
  } = useContext(CartContext);

  if (!open || !product) {
    return null;
  }

  // ==========================================
  // EFFECTIVE TIER
  // ==========================================
  const tier =
    user?.role === "worker"
      ? String(
          selectedCustomer?.priceTier ||
            "C"
        )
          .trim()
          .toUpperCase()
      : String(
          user?.priceTier || "C"
        )
          .trim()
          .toUpperCase();

  // ==========================================
  // PRICE
  // ==========================================
  let price = 0;

  if (tier === "A") {
    price = Number(
      product.priceA || 0
    );
  } else if (tier === "B") {
    price = Number(
      product.priceB || 0
    );
  } else {
    price = Number(
      product.priceC || 0
    );
  }

  if (!price || price <= 0) {
    price = Number(
      product.pricePerPiece || 0
    );
  }

  // ==========================================
  // MARGIN
  // ==========================================
  const mrp = Number(
    product.mrp || 0
  );

  const margin =
    mrp > 0 && price > 0
      ? ((mrp - price) / mrp) *
        100
      : 0;

  // ==========================================
  // CART ITEM
  // ==========================================
  const cartItem =
    cart.find((item) => {
      const productId =
        typeof item.product === "object"
          ? item.product?._id
          : item.product;

      return (
        String(productId) ===
        String(product._id)
      );
    }) || null;

  const pieces = Number(
    cartItem?.pieces || 0
  );

  const boxes = Number(
    cartItem?.boxes || 0
  );

  // ==========================================
  // PIECES CHANGE
  // ==========================================
  const handlePiecesChange = (
    value
  ) => {
    const qty = Math.max(
      0,
      Number(value) || 0
    );

    if (cartItem) {
      updateQty(
        product._id,
        "pieces",
        qty
      );
    } else {
      addToCart(
        product,
        qty,
        0
      );
    }
  };

  // ==========================================
  // BOXES CHANGE
  // ==========================================
  const handleBoxesChange = (
    value
  ) => {
    const qty = Math.max(
      0,
      Number(value) || 0
    );

    if (cartItem) {
      updateQty(
        product._id,
        "boxes",
        qty
      );
    } else {
      addToCart(
        product,
        0,
        qty
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl">
        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
        >
          <X size={18} />
        </button>

        {/* TOP STATUS */}
        <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
            <ScanBarcode size={18} />

            Barcode Scanned Successfully
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-[180px_minmax(0,1fr)]">
          {/* IMAGE */}
          <div className="flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-slate-50">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain p-4"
              />
            ) : (
              <Package
                size={42}
                className="text-slate-300"
              />
            )}
          </div>

          {/* DETAILS */}
          <div className="min-w-0">
            {product.productCode && (
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {product.productCode}
              </p>
            )}

            <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
              {product.name}
            </h2>

            {product.barcode && (
              <p className="mt-1 text-xs text-slate-500">
                Barcode:{" "}
                <span className="font-semibold">
                  {product.barcode}
                </span>
              </p>
            )}

            {/* PRICE */}
            <div className="mt-5 flex flex-wrap items-end gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Your Price
                </p>

                <p className="text-2xl font-bold text-emerald-600">
                  ₹{price.toFixed(2)}
                </p>
              </div>

              {mrp > 0 && (
                <div>
                  <p className="text-xs text-slate-400">
                    MRP
                  </p>

                  <p className="text-sm text-slate-500 line-through">
                    ₹{mrp.toFixed(2)}
                  </p>
                </div>
              )}

              {margin > 0 && (
                <div className="mb-0.5 inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  <TrendingUp
                    size={13}
                  />

                  {margin.toFixed(1)}%
                  Margin
                </div>
              )}
            </div>

            {/* PACKING */}
            <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              {Number(
                product.piecesPerBox || 1
              )}{" "}
              pcs / box
            </div>

            {/* QUANTITY */}
            <div className="mt-5 space-y-3">
              {product.allowPieceSale && (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Pieces
                    </p>

                    <p className="text-xs text-slate-500">
                      Loose units
                    </p>
                  </div>

                  <QuantitySelector
                    value={pieces}
                    onChange={
                      handlePiecesChange
                    }
                  />
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Boxes
                  </p>

                  <p className="text-xs text-slate-500">
                    Full cartons
                  </p>
                </div>

                <QuantitySelector
                  value={boxes}
                  onChange={
                    handleBoxesChange
                  }
                />
              </div>
            </div>

            {(pieces > 0 ||
              boxes > 0) && (
              <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-emerald-100 px-3 py-2.5 text-sm font-bold text-emerald-700">
                <Check size={17} />

                Added to Cart
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}