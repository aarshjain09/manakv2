import {
  useContext,
  useMemo,
  useState,
} from "react";

import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  Package,
  ArrowRight,
  Loader2,
  Store,
  UserRound,
  ClipboardList,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  CartContext,
} from "../context/cart";

import {
  AuthContext,
} from "../context/auth";

import {
  WorkerCustomerContext,
} from "../context/workercustomer";

import API from "../services/api";

export default function Cart() {
  const navigate = useNavigate();

  // ==========================================
  // AUTH
  // ==========================================
  const {
    user,
  } = useContext(AuthContext);

  // ==========================================
  // WORKER CUSTOMER
  // ==========================================
  const {
    selectedCustomer,
    clearSelectedCustomer,
  } = useContext(
    WorkerCustomerContext
  );

  // ==========================================
  // CART
  // ==========================================
  const {
    cart,
    increaseBox,
    decreaseBox,
    increasePiece,
    decreasePiece,
    removeFromCart,
    clearCart,
  } = useContext(CartContext);

  const [
    placingOrder,
    setPlacingOrder,
  ] = useState(false);

  // ==========================================
  // WORKER ORDER STATUS
  //
  // pending:
  // salesman has taken the order
  //
  // packed:
  // goods are already packed
  // ==========================================
  const [
    workerOrderStatus,
    setWorkerOrderStatus,
  ] = useState("pending");

  // ==========================================
  // IS WORKER
  // ==========================================
  const isWorker =
    user?.role === "worker";

  // ==========================================
  // EFFECTIVE PRICE TIER
  //
  // Customer:
  // logged-in customer's tier
  //
  // Worker:
  // selected customer's tier
  // ==========================================
  const effectivePriceTier = useMemo(() => {
    if (isWorker) {
      return String(
        selectedCustomer?.priceTier || "C"
      )
        .trim()
        .toUpperCase();
    }

    return String(
      user?.priceTier || "C"
    )
      .trim()
      .toUpperCase();
  }, [
    isWorker,
    selectedCustomer?.priceTier,
    user?.priceTier,
  ]);

  // ==========================================
  // PRICE HELPER
  // ==========================================
  const getPrice = (product) => {
    if (effectivePriceTier === "A") {
      return Number(
        product?.priceA || 0
      );
    }

    if (effectivePriceTier === "B") {
      return Number(
        product?.priceB || 0
      );
    }

    return Number(
      product?.priceC || 0
    );
  };

  // ==========================================
  // DISPLAY TOTAL
  //
  // Backend still calculates trusted total
  // ==========================================
  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) => {
        const product =
          item.product;

        let price = 0;

        if (
          effectivePriceTier === "A"
        ) {
          price = Number(
            product?.priceA || 0
          );
        } else if (
          effectivePriceTier === "B"
        ) {
          price = Number(
            product?.priceB || 0
          );
        } else {
          price = Number(
            product?.priceC || 0
          );
        }

        const piecesPerBox = Math.max(
          1,
          Number(
            product?.piecesPerBox || 1
          )
        );

        const totalPieces =
          Number(item.boxes || 0) *
            piecesPerBox +
          Number(item.pieces || 0);

        return (
          sum +
          totalPieces * price
        );
      },
      0
    );
  }, [
    cart,
    effectivePriceTier,
  ]);

  // ==========================================
  // PLACE ORDER
  // ==========================================
  const placeOrder = async () => {
    if (cart.length === 0) {
      return;
    }

    // ========================================
    // WORKER MUST HAVE CUSTOMER
    // ========================================
    if (
      isWorker &&
      !selectedCustomer
    ) {
      alert(
        "Please select a customer first"
      );

      navigate(
        "/worker/customer",
        {
          replace: true,
        }
      );

      return;
    }

    if (
      isWorker &&
      !selectedCustomer?.customerCode
    ) {
      alert(
        "Selected customer does not have a customer code"
      );

      return;
    }

    try {
      setPlacingOrder(true);

      // ========================================
      // COMMON ITEMS PAYLOAD
      // ========================================
      const items = cart.map(
        (item) => ({
          product:
            item.product._id,

          boxes: Number(
            item.boxes || 0
          ),

          pieces: Number(
            item.pieces || 0
          ),
        })
      );

      // ========================================
      // WORKER / SALESMAN ORDER
      // ========================================
      if (isWorker) {
        await API.post(
          "/orders/notebook",
          {
            customerCode:
              selectedCustomer.customerCode,

            items,

            // Selected at checkout
            status:
              workerOrderStatus,
          }
        );

        // Clear current customer's cart
        clearCart();

        // Clear selected customer session
        clearSelectedCustomer();

        alert(
          workerOrderStatus === "packed"
            ? "Packed order placed successfully"
            : "Pending order placed successfully"
        );

        // Return worker to customer selection
        navigate(
          "/worker/customer",
          {
            replace: true,
          }
        );

        return;
      }

      // ========================================
      // NORMAL CUSTOMER ORDER
      // ========================================
      await API.post(
        "/orders",
        {
          items,
        }
      );

      clearCart();

      alert(
        "Order placed successfully"
      );

      navigate("/orders");
    } catch (err) {
      console.error(
        "PLACE ORDER ERROR:",
        err.response?.data ||
          err.message
      );

      alert(
        err.response?.data?.message ||
          "Order could not be placed"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // ==========================================
  // EMPTY CART
  // ==========================================
  if (cart.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center sm:py-24">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <ShoppingCart size={30} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-950 sm:text-2xl">
            Your cart is empty
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Browse the product catalogue and
            add boxes or pieces to create
            your order.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Browse Products

            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* =====================================
          WORKER CUSTOMER BANNER
      ===================================== */}

      {isWorker &&
        selectedCustomer && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Store size={21} />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 sm:text-xs">
                    Ordering For
                  </p>

                  <h2 className="truncate text-base font-bold text-slate-950 sm:text-lg">
                    {selectedCustomer.shopName ||
                      selectedCustomer.ownerName ||
                      "Selected Customer"}
                  </h2>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                    {selectedCustomer.ownerName && (
                      <span className="flex items-center gap-1">
                        <UserRound
                          size={13}
                        />

                        {
                          selectedCustomer.ownerName
                        }
                      </span>
                    )}

                    {selectedCustomer.customerCode && (
                      <span className="font-semibold">
                        {
                          selectedCustomer.customerCode
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  clearCart();
                  clearSelectedCustomer();

                  navigate(
                    "/worker/customer",
                    {
                      replace: true,
                    }
                  );
                }}
                className="rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 sm:text-sm"
              >
                Change Customer
              </button>
            </div>
          </div>
        )}

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {isWorker
              ? "Customer Order"
              : "Your Order"}
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Shopping Cart
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {cart.length}{" "}
            {cart.length === 1
              ? "product"
              : "products"}{" "}
            in your cart
          </p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-semibold text-red-500 transition hover:text-red-700 sm:text-sm"
        >
          Clear Cart
        </button>
      </div>

      {/* =====================================
          LAYOUT
      ===================================== */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* ===================================
            CART ITEMS
        =================================== */}

        <div className="space-y-3">
          {cart.map((item) => {
            const product =
              item.product;

            const price =
              getPrice(product);

            const piecesPerBox =
              Math.max(
                1,
                Number(
                  product?.piecesPerBox ||
                    1
                )
              );

            const totalPieces =
              Number(item.boxes || 0) *
                piecesPerBox +
              Number(item.pieces || 0);

            const itemTotal =
              totalPieces * price;

            return (
              <article
                key={product._id}
                className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
              >
                <div className="flex gap-3 sm:gap-4">
                  {/* IMAGE */}

                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 sm:h-28 sm:w-28">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <Package
                        size={30}
                        className="text-slate-300"
                      />
                    )}
                  </div>

                  {/* DETAILS */}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {product.productCode && (
                          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:text-xs">
                            {
                              product.productCode
                            }
                          </p>
                        )}

                        <h2 className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-900 sm:text-base">
                          {product.name}
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(
                            product._id
                          )
                        }
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2
                          size={17}
                        />
                      </button>
                    </div>

                    {/* PRICE */}

                    <div className="mt-2 flex flex-wrap items-baseline gap-1">
                      <span className="font-bold text-slate-950">
                        ₹
                        {price.toFixed(
                          2
                        )}
                      </span>

                      <span className="text-xs text-slate-400">
                        / piece
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      {piecesPerBox} pcs /
                      box
                    </p>
                  </div>
                </div>

                {/* QUANTITY CONTROLS */}

                <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                  {/* BOXES */}

                  <QuantityControl
                    label="Boxes"
                    value={Number(
                      item.boxes || 0
                    )}
                    onMinus={() =>
                      decreaseBox(
                        product._id
                      )
                    }
                    onPlus={() =>
                      increaseBox(
                        product
                      )
                    }
                  />

                  {/* PIECES */}

                  {product.allowPieceSale ? (
                    <QuantityControl
                      label="Pieces"
                      value={Number(
                        item.pieces || 0
                      )}
                      onMinus={() =>
                        decreasePiece(
                          product._id
                        )
                      }
                      onPlus={() =>
                        increasePiece(
                          product
                        )
                      }
                    />
                  ) : (
                    <div className="flex items-center justify-center rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                      Full box sale only
                    </div>
                  )}
                </div>

                {/* ITEM TOTAL */}

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500 sm:text-sm">
                    {totalPieces} total
                    pieces
                  </span>

                  <span className="text-sm font-bold text-slate-950 sm:text-base">
                    ₹
                    {itemTotal.toFixed(
                      2
                    )}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* ===================================
            SUMMARY
        =================================== */}

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-24">
          <h2 className="text-lg font-bold text-slate-950">
            Order Summary
          </h2>

          {/* WORKER CUSTOMER SUMMARY */}

          {isWorker &&
            selectedCustomer && (
              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Customer
                </p>

                <p className="mt-1 truncate text-sm font-bold text-slate-900">
                  {selectedCustomer.shopName ||
                    selectedCustomer.ownerName}
                </p>

                {selectedCustomer.customerCode && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {
                      selectedCustomer.customerCode
                    }
                  </p>
                )}
              </div>
            )}

          {/* =================================
              WORKER ORDER STATUS
          ================================= */}

          {isWorker && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                  <ClipboardList
                    size={18}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="worker-order-status"
                    className="block text-sm font-bold text-slate-900"
                  >
                    Order Status
                  </label>

                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    Choose how this
                    order should enter
                    the system.
                  </p>
                </div>
              </div>

              <select
                id="worker-order-status"
                value={
                  workerOrderStatus
                }
                onChange={(e) =>
                  setWorkerOrderStatus(
                    e.target.value
                  )
                }
                disabled={placingOrder}
                className="mt-3 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="pending">
                  Pending — Order Taken
                </option>

                <option value="packed">
                  Packed — Goods Packed
                </option>
              </select>

              <div
                className={`mt-3 rounded-lg px-3 py-2.5 text-xs font-medium leading-5 ${
                  workerOrderStatus ===
                  "packed"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {workerOrderStatus ===
                "packed"
                  ? "Goods are already packed and ready for the next delivery step."
                  : "Order has been taken and still needs to be packed."}
              </div>
            </div>
          )}

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4 text-slate-500">
              <span>Products</span>

              <span className="font-medium text-slate-800">
                {cart.length}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-slate-500">
              <span>
                Estimated amount
              </span>

              <span className="font-medium text-slate-800">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="my-5 border-t border-slate-200" />

          <div className="flex items-end justify-between gap-4">
            <span className="font-semibold text-slate-700">
              Total
            </span>

            <span className="text-2xl font-bold text-slate-950">
              ₹{total.toFixed(2)}
            </span>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            Final order amount is validated
            by the server when your order is
            placed.
          </p>

          <button
            type="button"
            onClick={placeOrder}
            disabled={placingOrder}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placingOrder ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Placing Order...
              </>
            ) : (
              <>
                {isWorker
                  ? workerOrderStatus ===
                    "packed"
                    ? "Place as Packed"
                    : "Place as Pending"
                  : "Place Order"}

                <ArrowRight
                  size={18}
                />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
            className="mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Continue Shopping
          </button>
        </aside>
      </div>

      <div className="h-8 sm:h-12" />
    </div>
  );
}

// ==========================================
// QUANTITY CONTROL
// ==========================================

function QuantityControl({
  label,
  value,
  onMinus,
  onPlus,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
      <span className="text-xs font-semibold text-slate-600 sm:text-sm">
        {label}
      </span>

      <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white">
        <button
          type="button"
          onClick={onMinus}
          className="flex h-8 w-8 items-center justify-center text-slate-600 transition hover:bg-slate-100"
        >
          <Minus size={15} />
        </button>

        <span className="flex h-8 min-w-9 items-center justify-center border-x border-slate-200 px-1 text-xs font-bold text-slate-900 sm:text-sm">
          {value}
        </span>

        <button
          type="button"
          onClick={onPlus}
          className="flex h-8 w-8 items-center justify-center text-slate-600 transition hover:bg-slate-100"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}