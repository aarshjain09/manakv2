import {
  useContext,
} from "react";

import {
  Minus,
  Plus,
  Package,
  ShoppingCart,
  Check,
  TrendingUp,
} from "lucide-react";

import {
  AuthContext,
} from "../context/auth";

import {
  WorkerCustomerContext,
} from "../context/workercustomer";

export default function ProductCard({
  product,
  cartItem,
  increaseBox,
  decreaseBox,
  increasePiece,
  decreasePiece,
}) {
  // ==========================================
  // AUTH
  // ==========================================
  const {
    user,
  } = useContext(AuthContext);

  // ==========================================
  // WORKER SELECTED CUSTOMER
  // ==========================================
  const {
    selectedCustomer,
  } = useContext(
    WorkerCustomerContext
  );

  const boxes = Number(
    cartItem?.boxes || 0
  );

  const pieces = Number(
    cartItem?.pieces || 0
  );

  // ==========================================
  // EFFECTIVE PRICE TIER
  //
  // Normal customer:
  //   use logged-in user's priceTier
  //
  // Worker:
  //   use selected customer's priceTier
  // ==========================================
  const priceTier =
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
  // TIER-SPECIFIC PRICE
  // ==========================================
  const getCustomerPrice = () => {
    if (priceTier === "A") {
      return Number(
        product?.priceA || 0
      );
    }

    if (priceTier === "B") {
      return Number(
        product?.priceB || 0
      );
    }

    return Number(
      product?.priceC || 0
    );
  };

  const price =
    getCustomerPrice();

  const mrp = Number(
    product?.mrp || 0
  );

  // ==========================================
  // CUSTOMER MARGIN
  //
  // Formula:
  // ((MRP - Customer Price) / MRP) * 100
  //
  // IMPORTANT:
  // Uses effective selected customer's price
  // for worker.
  // ==========================================
  const marginPercent =
    mrp > 0 && price >= 0
      ? (
          ((mrp - price) / mrp) *
          100
        )
      : 0;

  const hasMargin =
    mrp > 0 &&
    price > 0 &&
    mrp > price;

  // ==========================================
  // PACKING + STOCK
  //
  // Stock is used internally for validation,
  // but exact stock quantity is NOT shown.
  // ==========================================
  const piecesPerBox = Math.max(
    1,
    Number(
      product?.piecesPerBox || 1
    )
  );

  const stockBoxes = Math.max(
    0,
    Number(
      product?.stockBoxes || 0
    )
  );

  const stockPieces = Math.max(
    0,
    Number(
      product?.stockPieces || 0
    )
  );

  const totalAvailablePieces =
    stockBoxes * piecesPerBox +
    stockPieces;

  const selectedTotalPieces =
    boxes * piecesPerBox +
    pieces;

  const outOfStock =
    totalAvailablePieces <= 0;

  const reachedStockLimit =
    selectedTotalPieces >=
    totalAvailablePieces;

  const isInCart =
    boxes > 0 || pieces > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
      {/* =====================================
          IMAGE
      ===================================== */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        {product?.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105 sm:p-4"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package
              size={38}
              className="text-slate-300"
            />
          </div>
        )}

        {/* =================================
            MARGIN BADGE
        ================================= */}
        {hasMargin && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white shadow-sm sm:left-3 sm:top-3 sm:text-xs">
            <TrendingUp size={12} />

            {marginPercent.toFixed(1)}%
            Margin
          </div>
        )}

        {/* =================================
            IN CART
        ================================= */}
        {isInCart && (
          <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md sm:right-3 sm:top-3">
            <Check size={15} />
          </div>
        )}

        {/* =================================
            OUT OF STOCK
        ================================= */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[1px]">
            <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* =====================================
          CONTENT
      ===================================== */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* PRODUCT CODE */}
        {product?.productCode && (
          <p className="mb-1 truncate text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:text-xs">
            {product.productCode}
          </p>
        )}

        {/* PRODUCT NAME */}
        <h2 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-900 sm:min-h-12 sm:text-base sm:leading-6">
          {product?.name}
        </h2>

        {/* BRAND + CATEGORY */}
        <div className="mt-1 flex min-h-5 items-center gap-1 overflow-hidden text-[11px] text-slate-400 sm:text-xs">
          {product?.brand?.name && (
            <span className="truncate">
              {product.brand.name}
            </span>
          )}

          {product?.brand?.name &&
            product?.category?.name && (
              <span>•</span>
            )}

          {product?.category?.name && (
            <span className="truncate">
              {product.category.name}
            </span>
          )}
        </div>

        {/* =====================================
            PRICE
        ===================================== */}
        <div className="mt-3">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-lg font-bold text-slate-950 sm:text-xl">
              ₹{price.toFixed(2)}
            </span>

            <span className="text-[11px] text-slate-500 sm:text-xs">
              / piece
            </span>
          </div>

          {mrp > 0 && (
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">
                MRP
              </span>

              <span
                className={`text-m${
                  mrp > price
                    ? "line-through"
                    : ""
                }`}
              >
                ₹{mrp.toFixed(2)}
              </span>
            </div>
          )}

          {/* =================================
              MARGIN INFO
          ================================= */}
          {hasMargin && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 sm:text-xs">
              <TrendingUp size={13} />

              Retailer Margin{" "}
              {marginPercent.toFixed(1)}%
            </div>
          )}
        </div>

        {/* =====================================
            PACKING
        ===================================== */}
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-2.5 py-2 text-[11px] sm:px-3 sm:text-xs">
          <span className="text-slate-500">
            Packing
          </span>

          <span className="font-semibold text-slate-700">
            {piecesPerBox} pcs / box
          </span>
        </div>

        {/* =====================================
            QUANTITY CONTROLS
        ===================================== */}
        <div className="mt-auto pt-4">
          {/* BOXES */}
          <QuantityRow
            label="Boxes"
            value={boxes}
            minusDisabled={
              outOfStock ||
              boxes <= 0
            }
            plusDisabled={
              outOfStock ||
              reachedStockLimit
            }
            onDecrease={() =>
              decreaseBox(product._id)
            }
            onIncrease={() =>
              increaseBox(product)
            }
          />

          {/* PIECES */}
          {product?.allowPieceSale && (
            <div className="mt-2">
              <QuantityRow
                label="Pieces"
                value={pieces}
                minusDisabled={
                  outOfStock ||
                  selectedTotalPieces <= 0
                }
                plusDisabled={
                  outOfStock ||
                  reachedStockLimit
                }
                onDecrease={() =>
                  decreasePiece(
                    product._id
                  )
                }
                onIncrease={() =>
                  increasePiece(product)
                }
              />
            </div>
          )}

          {/* FULL BOX ONLY */}
          {!product?.allowPieceSale && (
            <div className="mt-2 rounded-lg bg-amber-50 px-2.5 py-2 text-center text-[10px] font-medium text-amber-700 sm:text-xs">
              Full box sale only
            </div>
          )}

          {/* =====================================
              CART STATUS
          ===================================== */}
          {isInCart && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-primary sm:text-xs">
              <ShoppingCart size={14} />

              {selectedTotalPieces} pcs selected
            </div>
          )}

          {/* STOCK LIMIT */}
          {reachedStockLimit &&
            !outOfStock && (
              <div className="mt-2 text-center text-[10px] font-medium text-amber-600 sm:text-xs">
                Maximum quantity available
              </div>
            )}
        </div>
      </div>
    </article>
  );
}

// ==========================================
// QUANTITY ROW
// ==========================================
function QuantityRow({
  label,
  value,
  onDecrease,
  onIncrease,
  minusDisabled,
  plusDisabled,
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-medium text-slate-600 sm:text-sm">
        {label}
      </span>

      <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white">
        <button
          type="button"
          onClick={onDecrease}
          disabled={minusDisabled}
          className="flex h-8 w-8 items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9"
        >
          <Minus size={15} />
        </button>

        <div className="flex h-8 min-w-8 items-center justify-center border-x border-slate-200 px-1 text-xs font-bold text-slate-900 sm:h-9 sm:min-w-10 sm:text-sm">
          {value}
        </div>

        <button
          type="button"
          onClick={onIncrease}
          disabled={plusDisabled}
          className="flex h-8 w-8 items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}