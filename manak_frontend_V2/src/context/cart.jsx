import {
  createContext,
  useEffect,
  useState,
} from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // ==========================================
  // LOAD CART FROM LOCAL STORAGE
  // ==========================================
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");

      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(
        (item) =>
          item?.product?._id &&
          Number(item.boxes || 0) >= 0 &&
          Number(item.pieces || 0) >= 0
      );
    } catch (error) {
      console.error(
        "Failed to load cart:",
        error
      );

      return [];
    }
  });

  // ==========================================
  // SAVE CART TO LOCAL STORAGE
  // ==========================================
  useEffect(() => {
    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  // ==========================================
  // GET PIECES PER BOX
  // ==========================================
  const getPiecesPerBox = (product) => {
    return Math.max(
      1,
      Number(product?.piecesPerBox || 1)
    );
  };

  // ==========================================
  // GET AVAILABLE STOCK IN TOTAL PIECES
  // ==========================================
  const getAvailablePieces = (product) => {
    const piecesPerBox =
      getPiecesPerBox(product);

    const stockBoxes = Math.max(
      0,
      Number(product?.stockBoxes || 0)
    );

    const stockPieces = Math.max(
      0,
      Number(product?.stockPieces || 0)
    );

    return (
      stockBoxes * piecesPerBox +
      stockPieces
    );
  };

  // ==========================================
  // CONVERT TOTAL PIECES
  //
  // Example:
  // piecesPerBox = 12
  //
  // 13 total pieces
  // =>
  // 1 box + 1 piece
  // ==========================================
  const convertTotalPieces = (
    product,
    totalPieces
  ) => {
    const piecesPerBox =
      getPiecesPerBox(product);

    const availablePieces =
      getAvailablePieces(product);

    let safeTotalPieces = Math.max(
      0,
      Math.floor(Number(totalPieces || 0))
    );

    // Never exceed stock
    safeTotalPieces = Math.min(
      safeTotalPieces,
      availablePieces
    );

    // ========================================
    // LOOSE PIECES ALLOWED
    // ========================================
    if (product?.allowPieceSale) {
      return {
        boxes: Math.floor(
          safeTotalPieces / piecesPerBox
        ),

        pieces:
          safeTotalPieces % piecesPerBox,
      };
    }

    // ========================================
    // FULL BOX ONLY
    // ========================================
    return {
      boxes: Math.floor(
        safeTotalPieces / piecesPerBox
      ),

      pieces: 0,
    };
  };

  // ==========================================
  // NORMALIZE BOXES + PIECES
  //
  // Example:
  // piecesPerBox = 12
  //
  // 1 box + 13 pieces
  // =>
  // 2 boxes + 1 piece
  // ==========================================
  const normalizeQuantity = (
    product,
    boxes,
    pieces
  ) => {
    const piecesPerBox =
      getPiecesPerBox(product);

    const safeBoxes = Math.max(
      0,
      Math.floor(Number(boxes || 0))
    );

    let safePieces = Math.max(
      0,
      Math.floor(Number(pieces || 0))
    );

    // No loose piece sale
    if (!product?.allowPieceSale) {
      safePieces = 0;
    }

    const totalPieces =
      safeBoxes * piecesPerBox +
      safePieces;

    return convertTotalPieces(
      product,
      totalPieces
    );
  };

  // ==========================================
  // ADD TO CART
  // ==========================================
  const addToCart = (
    product,
    pieces = 0,
    boxes = 0
  ) => {
    if (!product?._id) {
      return;
    }

    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.product._id === product._id
      );

      const currentBoxes = Number(
        existing?.boxes || 0
      );

      const currentPieces = Number(
        existing?.pieces || 0
      );

      const nextBoxes =
        currentBoxes +
        Math.max(
          0,
          Math.floor(Number(boxes || 0))
        );

      const nextPieces =
        currentPieces +
        Math.max(
          0,
          Math.floor(Number(pieces || 0))
        );

      const normalized =
        normalizeQuantity(
          product,
          nextBoxes,
          nextPieces
        );

      // Nothing valid to add
      if (
        normalized.boxes === 0 &&
        normalized.pieces === 0
      ) {
        return prev;
      }

      // Product already exists
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id
            ? {
                ...item,
                product,
                boxes: normalized.boxes,
                pieces: normalized.pieces,
              }
            : item
        );
      }

      // New product
      return [
        ...prev,
        {
          product,
          boxes: normalized.boxes,
          pieces: normalized.pieces,
        },
      ];
    });
  };

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================
  const updateQty = (
    productId,
    field,
    value
  ) => {
    if (
      field !== "boxes" &&
      field !== "pieces"
    ) {
      return;
    }

    setCart((prev) =>
      prev
        .map((item) => {
          if (
            item.product._id !== productId
          ) {
            return item;
          }

          const product = item.product;

          const currentBoxes = Number(
            item.boxes || 0
          );

          const currentPieces = Number(
            item.pieces || 0
          );

          const nextValue = Math.max(
            0,
            Math.floor(Number(value || 0))
          );

          let nextBoxes = currentBoxes;
          let nextPieces = currentPieces;

          if (field === "boxes") {
            nextBoxes = nextValue;
          }

          if (field === "pieces") {
            nextPieces = nextValue;
          }

          const normalized =
            normalizeQuantity(
              product,
              nextBoxes,
              nextPieces
            );

          return {
            ...item,
            boxes: normalized.boxes,
            pieces: normalized.pieces,
          };
        })
        .filter(
          (item) =>
            !(
              Number(item.boxes || 0) === 0 &&
              Number(item.pieces || 0) === 0
            )
        )
    );
  };

  // ==========================================
  // INCREASE BOX BY 1
  // ==========================================
  const increaseBox = (product) => {
    if (!product?._id) {
      return;
    }

    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.product._id === product._id
      );

      if (!existing) {
        const normalized =
          normalizeQuantity(
            product,
            1,
            0
          );

        if (
          normalized.boxes === 0 &&
          normalized.pieces === 0
        ) {
          return prev;
        }

        return [
          ...prev,
          {
            product,
            boxes: normalized.boxes,
            pieces: normalized.pieces,
          },
        ];
      }

      return prev.map((item) => {
        if (
          item.product._id !== product._id
        ) {
          return item;
        }

        const normalized =
          normalizeQuantity(
            product,
            Number(item.boxes || 0) + 1,
            Number(item.pieces || 0)
          );

        return {
          ...item,
          product,
          boxes: normalized.boxes,
          pieces: normalized.pieces,
        };
      });
    });
  };

  // ==========================================
  // DECREASE BOX BY 1
  // ==========================================
  const decreaseBox = (productId) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (
            item.product._id !== productId
          ) {
            return item;
          }

          const normalized =
            normalizeQuantity(
              item.product,
              Math.max(
                0,
                Number(item.boxes || 0) - 1
              ),
              Number(item.pieces || 0)
            );

          return {
            ...item,
            boxes: normalized.boxes,
            pieces: normalized.pieces,
          };
        })
        .filter(
          (item) =>
            !(
              Number(item.boxes || 0) === 0 &&
              Number(item.pieces || 0) === 0
            )
        )
    );
  };

  // ==========================================
  // INCREASE PIECE BY 1
  //
  // Example:
  // piecesPerBox = 12
  //
  // 0 boxes + 11 pieces
  // press +
  //
  // =>
  // 1 box + 0 pieces
  // ==========================================
  const increasePiece = (product) => {
    if (
      !product?._id ||
      !product?.allowPieceSale
    ) {
      return;
    }

    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.product._id === product._id
      );

      if (!existing) {
        const normalized =
          normalizeQuantity(
            product,
            0,
            1
          );

        if (
          normalized.boxes === 0 &&
          normalized.pieces === 0
        ) {
          return prev;
        }

        return [
          ...prev,
          {
            product,
            boxes: normalized.boxes,
            pieces: normalized.pieces,
          },
        ];
      }

      return prev.map((item) => {
        if (
          item.product._id !== product._id
        ) {
          return item;
        }

        const normalized =
          normalizeQuantity(
            product,
            Number(item.boxes || 0),
            Number(item.pieces || 0) + 1
          );

        return {
          ...item,
          product,
          boxes: normalized.boxes,
          pieces: normalized.pieces,
        };
      });
    });
  };

  // ==========================================
  // DECREASE PIECE BY 1
  //
  // Example:
  // piecesPerBox = 12
  //
  // 1 box + 0 pieces
  // press -
  //
  // =>
  // 0 boxes + 11 pieces
  // ==========================================
  const decreasePiece = (productId) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (
            item.product._id !== productId
          ) {
            return item;
          }

          const product = item.product;

          if (!product?.allowPieceSale) {
            return item;
          }

          const piecesPerBox =
            getPiecesPerBox(product);

          const currentTotalPieces =
            Number(item.boxes || 0) *
              piecesPerBox +
            Number(item.pieces || 0);

          const nextTotalPieces = Math.max(
            0,
            currentTotalPieces - 1
          );

          const normalized =
            convertTotalPieces(
              product,
              nextTotalPieces
            );

          return {
            ...item,
            boxes: normalized.boxes,
            pieces: normalized.pieces,
          };
        })
        .filter(
          (item) =>
            !(
              Number(item.boxes || 0) === 0 &&
              Number(item.pieces || 0) === 0
            )
        )
    );
  };

  // ==========================================
  // REMOVE FROM CART
  // ==========================================
  const removeFromCart = (productId) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          item.product._id !== productId
      )
    );
  };

  // ==========================================
  // CLEAR CART
  // ==========================================
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  // ==========================================
  // GET CART ITEM
  // ==========================================
  const getCartItem = (productId) => {
    return cart.find(
      (item) =>
        item.product._id === productId
    );
  };

  // ==========================================
  // CART COUNT
  // Distinct products
  // ==========================================
  const cartCount = cart.length;

  // ==========================================
  // TOTAL PHYSICAL PIECES
  // ==========================================
  const cartTotalUnits = cart.reduce(
    (sum, item) => {
      const piecesPerBox =
        getPiecesPerBox(item.product);

      return (
        sum +
        Number(item.boxes || 0) *
          piecesPerBox +
        Number(item.pieces || 0)
      );
    },
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,

        cartCount,
        cartTotalUnits,

        addToCart,
        updateQty,

        increaseBox,
        decreaseBox,

        increasePiece,
        decreasePiece,

        removeFromCart,
        clearCart,

        getCartItem,
        getAvailablePieces,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};