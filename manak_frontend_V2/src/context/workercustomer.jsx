import {
  createContext,
  useEffect,
  useState,
} from "react";

export const WorkerCustomerContext =
  createContext();

export function WorkerCustomerProvider({
  children,
}) {
  const [
    selectedCustomer,
    setSelectedCustomer,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  // ==========================================
  // RESTORE CUSTOMER FOR CURRENT TAB SESSION
  // ==========================================
  useEffect(() => {
    try {
      const savedCustomer =
        sessionStorage.getItem(
          "workerSelectedCustomer"
        );

      if (savedCustomer) {
        setSelectedCustomer(
          JSON.parse(savedCustomer)
        );
      }
    } catch (err) {
      console.error(
        "Failed to restore worker customer:",
        err
      );

      sessionStorage.removeItem(
        "workerSelectedCustomer"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // SELECT CUSTOMER
  // ==========================================
  const selectCustomer = (
    customer
  ) => {
    setSelectedCustomer(customer);

    sessionStorage.setItem(
      "workerSelectedCustomer",
      JSON.stringify(customer)
    );
  };

  // ==========================================
  // CLEAR CUSTOMER
  // ==========================================
  const clearSelectedCustomer = () => {
    setSelectedCustomer(null);

    sessionStorage.removeItem(
      "workerSelectedCustomer"
    );
  };

  return (
    <WorkerCustomerContext.Provider
      value={{
        selectedCustomer,
        selectCustomer,
        clearSelectedCustomer,
        loading,
      }}
    >
      {children}
    </WorkerCustomerContext.Provider>
  );
}