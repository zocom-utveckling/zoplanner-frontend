import { useState } from "react";
import { useCustomers, useCurrentActor } from "@zoplanner/app-hooks";

export const emptyOrder = {
  customerId: "",
  courseName: "",
  startDate: "",
  endDate: "",
  totalHours: "",
  className: "",
};

export function useCustomerRegistry({ user }) {
  const {
    customers,
    loading,
    createCustomer,
    selectedCustomer,
    setSelectedCustomerId,
    removeCustomer,
  } = useCustomers();

  const { managerId, isLoadingActor } = useCurrentActor(user);

  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerCity, setNewCustomerCity] = useState("");
  const [newCustomerContactName, setNewCustomerContactName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    mine: false,
    cities: [],
  });

  const [orders, setOrders] = useState([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [newOrder, setNewOrder] = useState(emptyOrder);
  const [startPlanningOnOrderSave, setStartPlanningOnOrderSave] =
    useState(false);

  const [modalCustomer, setModalCustomer] = useState(null);

  const resetNewCustomerForm = () => {
    setNewCustomerName("");
    setNewCustomerCity("");
    setNewCustomerContactName("");
    setNewCustomerPhone("");
    setNewCustomerEmail("");
    setNewCustomerAddress("");
  };

  const closeCreateCustomer = () => {
    setIsCreating(false);
    resetNewCustomerForm();
  };

  const closeCreateOrder = () => {
    setIsCreatingOrder(false);
    setNewOrder(emptyOrder);
    setStartPlanningOnOrderSave(false);
  };

  const openCreateCustomerFromOrder = () => {
    setIsCreatingOrder(false);
    setIsCreating(true);
  };

  const handleToggleCreateCustomer = () => {
    setIsCreating((prev) => !prev);
    setIsCreatingOrder(false);
    setStartPlanningOnOrderSave(false);
    setShowFilters(false);
    setSearch("");
    setModalCustomer(null);
    setSelectedCustomerId(null);
  };

  const handleToggleCreateOrder = () => {
    setIsCreatingOrder((prev) => !prev);
    setIsCreating(false);
    setShowFilters(false);
    setSearch("");
    setModalCustomer(null);
    setSelectedCustomerId(null);
  };

  const toggleMultiFilter = (key, value) => {
    setFilters((prev) => {
      const exists = prev[key].includes(value);

      return {
        ...prev,
        [key]: exists
          ? prev[key].filter((v) => v !== value)
          : [...prev[key], value],
      };
    });
  };

  const resetFilters = () => {
    setFilters({
      mine: false,
      cities: [],
    });
  };
const filteredCustomers = customers
  .filter((c) => {
    const name = (c.name || "").trim().toUpperCase();
    return name && !name.startsWith("UTKAST");
  })
  .filter((c) =>
    (c.name || "").toLowerCase().startsWith(search.trim().toLowerCase()),
  )
  .filter((c) => {
    if (!filters.mine) return true;
    return Number(c.managerId) === Number(managerId);
  })
  .filter((c) => {
    if (filters.cities.length > 0) return filters.cities.includes(c.city);
    return true;
  });
  return {
    customers,
    loading,
    createCustomer,
    selectedCustomer,
    setSelectedCustomerId,
    removeCustomer,

    managerId,
    isLoadingActor,

    newCustomerName,
    setNewCustomerName,
    newCustomerCity,
    setNewCustomerCity,
    newCustomerContactName,
    setNewCustomerContactName,
    newCustomerPhone,
    setNewCustomerPhone,
    newCustomerEmail,
    setNewCustomerEmail,
    newCustomerAddress,
    setNewCustomerAddress,
    isCreating,
    setIsCreating,

    search,
    setSearch,
    showFilters,
    setShowFilters,

    filters,
    setFilters,
    toggleMultiFilter,
    resetFilters,

    orders,
    setOrders,
    isCreatingOrder,
    setIsCreatingOrder,
    newOrder,
    setNewOrder,
    startPlanningOnOrderSave,
    setStartPlanningOnOrderSave,

    modalCustomer,
    setModalCustomer,

    resetNewCustomerForm,
    closeCreateCustomer,
    closeCreateOrder,
    openCreateCustomerFromOrder,
    handleToggleCreateCustomer,
    handleToggleCreateOrder,

    filteredCustomers,
  };
}