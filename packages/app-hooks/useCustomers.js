import { useEffect, useState } from "react";
import { customerService } from "../api"; 

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerService.getAll();
      setCustomers(res);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (payload) => {
    try {
      const res = await customerService.create(payload);
      const newCustomer = res;

      setCustomers((prev) => [...prev, newCustomer]);
      setSelectedCustomerId(newCustomer.id);

      return newCustomer;
    } catch (err) {
      console.error("Failed to create customer", err);
      throw err;
    }
  };

  const selectedCustomer = customers.find(
    (c) => c.id === selectedCustomerId
  );

  useEffect(() => {
    loadCustomers();
  }, []);

  return {
    customers,
    selectedCustomer,
    selectedCustomerId,
    setSelectedCustomerId,
    createCustomer,
    loading,
    reload: loadCustomers,
  };
}