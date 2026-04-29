import { useEffect, useState } from "react";
import { useCustomers, useCurrentActor } from "@zoplanner/app-hooks";
import { createPlanningOrder } from "@zoplanner/admin";
import { classService, consultantService, userService } from "@zoplanner/api";

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

  const [consultants, setConsultants] = useState([]);
  const [users, setUsers] = useState([]);

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

  useEffect(() => {
    async function loadExtraData() {
      try {
        const [consultantsData, usersData] = await Promise.all([
          consultantService.getAll(),
          userService.getAll(),
        ]);

        setConsultants(consultantsData ?? []);
        setUsers(usersData ?? []);
      } catch (err) {
        console.error("Failed to load extra city data", err);
      }
    }

    loadExtraData();
  }, []);

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

  async function handleCreateCustomer({ nextStep = null } = {}) {
    if (!managerId) return;

    try {
      const customer = await createCustomer({
        name: newCustomerName,
        city: newCustomerCity,
        managerId,
      });

      resetNewCustomerForm();
      setIsCreating(false);

      if (nextStep === "order" || nextStep === "planning") {
        setNewOrder((prev) => ({
          ...emptyOrder,
          ...prev,
          customerId: String(customer.id),
        }));
        setStartPlanningOnOrderSave(nextStep === "planning");
        setIsCreatingOrder(true);
      }

      return customer;
    } catch (error) {
      console.error("❌ Failed to create customer:", error);
      alert("Kunde inte skapa kund.");
      return null;
    }
  }

  async function handleCreateOrder({
    startPlanning = false,
    onStartPlanning,
  } = {}) {
    const selectedOrderCustomer = customers.find(
      (customer) => customer.id === Number(newOrder.customerId),
    );

    if (!selectedOrderCustomer) {
      alert("Välj kund.");
      return;
    }

    if (
      !newOrder.courseName ||
      !newOrder.startDate ||
      !newOrder.endDate ||
      !newOrder.className ||
      !newOrder.totalHours
    ) {
      alert("Fyll i kursnamn, klass, datum och antal timmar.");
      return;
    }

    const shouldStartPlanning = startPlanning || startPlanningOnOrderSave;

    try {
      const order = await createPlanningOrder({
        customerId: selectedOrderCustomer.id,
        customerName: selectedOrderCustomer.name,
        className: newOrder.className,
        courseName: newOrder.courseName,
        startDate: newOrder.startDate,
        endDate: newOrder.endDate,
        totalHours: newOrder.totalHours,
        managerId,
      });

      setOrders((prev) => [...prev, order]);
      setNewOrder(emptyOrder);
      setIsCreatingOrder(false);
      setStartPlanningOnOrderSave(false);

      if (shouldStartPlanning) {
        onStartPlanning?.(order);
      }

      return order;
    } catch (error) {
      console.error("❌ Failed to create planning order:", error);
      alert("Kunde inte skapa beställning.");
      return null;
    }
  }

  async function handleDeleteCustomer() {
    if (!modalCustomer) return;

    try {
      const classes = await classService.getByCustomerId(modalCustomer.id);

      if (classes && classes.length > 0) {
        alert(
          `Kunden "${modalCustomer.name}" kan inte raderas eftersom det finns kurser kopplade till kunden.`,
        );
        return;
      }
    } catch {
      alert("Kunde inte kontrollera kundens kurser.");
      return;
    }

    if (
      !confirm(`Radera kunden "${modalCustomer.name}"? Detta kan inte ångras.`)
    ) {
      return;
    }

    try {
      await removeCustomer(modalCustomer.id);
      setModalCustomer(null);
    } catch {
      alert("Kunde inte radera kunden.");
    }
  }

  const resetFilters = () => {
    setFilters({
      mine: false,
      cities: [],
    });
  };

  const filteredCustomers = customers
    .filter((customer) => {
      const name = (customer.name || "").trim().toUpperCase();
      return name && !name.startsWith("UTKAST");
    })
    .filter((customer) =>
      (customer.name || "")
        .toLowerCase()
        .startsWith(search.trim().toLowerCase()),
    )
    .filter((customer) => {
      if (!filters.mine) return true;
      return Number(customer.managerId) === Number(managerId);
    })
    .filter((customer) => {
      if (filters.cities.length > 0) {
        return filters.cities.includes(customer.city);
      }

      return true;
    });

  const citySourceRecords = [...customers, ...consultants, ...users];

  return {
    customers,
    loading,
    createCustomer,
    selectedCustomer,
    setSelectedCustomerId,
    removeCustomer,
    citySourceRecords,

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
    handleCreateCustomer,
    handleCreateOrder,
    handleDeleteCustomer,

    filteredCustomers,
  };
}