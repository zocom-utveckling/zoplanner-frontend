import { useCallback, useState } from "react";
import { classService, customerService } from "@zoplanner/api";

function resolveId(payload) {
  return payload?.id ?? payload?.data?.id ?? null;
}

function normalizeName(value, fallback) {
  const trimmed = String(value ?? "").trim();
  return trimmed || fallback;
}

export function useDraftRelationSync() {
  const [isPreparingDraft, setIsPreparingDraft] = useState(false);

  const prepareDraftRelations = useCallback(async (draft, managerId, previousDraft) => {
    if (!draft) return null;

    if (!managerId) {
      alert("Kunde inte identifiera användaren. Försök igen.");
      return null;
    }

    const nextDraft = {
      ...draft,
      customerId: draft.customerId ?? previousDraft?.customerId ?? null,
      classId: draft.classId ?? previousDraft?.classId ?? null,
      customerName: draft.customerName ?? previousDraft?.customerName ?? "",
      className: draft.className ?? previousDraft?.className ?? "",
      isDraftCustomerEntity:
        typeof draft.isDraftCustomerEntity === "boolean"
          ? draft.isDraftCustomerEntity
          : previousDraft?.isDraftCustomerEntity ?? false,
      isDraftClassEntity:
        typeof draft.isDraftClassEntity === "boolean"
          ? draft.isDraftClassEntity
          : previousDraft?.isDraftClassEntity ?? false,
    };

    if (
      previousDraft?.customerId &&
      nextDraft.customerId &&
      previousDraft.customerId !== nextDraft.customerId
    ) {
      nextDraft.isDraftCustomerEntity = false;
    }

    if (
      previousDraft?.classId &&
      nextDraft.classId &&
      previousDraft.classId !== nextDraft.classId
    ) {
      nextDraft.isDraftClassEntity = false;
    }

    const fallbackBase = normalizeName(nextDraft.courseName, "kurs");
    const fallbackCustomerName = `UTKAST_${fallbackBase}_KUND`;
    const fallbackClassName = `UTKAST_${fallbackBase}_KLASS`;
    const desiredCustomerName = normalizeName(
      nextDraft.customerName,
      fallbackCustomerName,
    );
    const desiredClassName = normalizeName(nextDraft.className, fallbackClassName);

    setIsPreparingDraft(true);

    try {
      if (!nextDraft.customerId) {
        const createdCustomer = await customerService.create({
          name: desiredCustomerName,
          managerId,
        });

        nextDraft.customerId = resolveId(createdCustomer);

        if (!nextDraft.customerId) {
          alert("Kunde inte skapa utkastskund.");
          return null;
        }

        nextDraft.customerName = desiredCustomerName;
        nextDraft.isDraftCustomerEntity = true;
      } else if (
        nextDraft.isDraftCustomerEntity &&
        previousDraft?.customerName !== desiredCustomerName
      ) {
        await customerService.update(nextDraft.customerId, {
          name: desiredCustomerName,
          managerId,
        });

        nextDraft.customerName = desiredCustomerName;
      }

      if (!nextDraft.classId) {
        const createdClass = await classService.create({
          name: desiredClassName,
          customerId: nextDraft.customerId,
        });

        nextDraft.classId = resolveId(createdClass);

        if (!nextDraft.classId) {
          alert("Kunde inte skapa utkastsklass.");
          return null;
        }

        nextDraft.className = desiredClassName;
        nextDraft.isDraftClassEntity = true;
      } else if (
        nextDraft.isDraftClassEntity &&
        (previousDraft?.className !== desiredClassName ||
          previousDraft?.customerId !== nextDraft.customerId)
      ) {
        await classService.update(nextDraft.classId, {
          name: desiredClassName,
          customerId: nextDraft.customerId,
        });

        nextDraft.className = desiredClassName;
      }

      return nextDraft;
    } catch (error) {
      console.error("Failed to prepare draft relations:", error);
      alert("Kunde inte skapa eller uppdatera utkast för kund/klass.");
      return null;
    } finally {
      setIsPreparingDraft(false);
    }
  }, []);

  return {
    isPreparingDraft,
    prepareDraftRelations,
  };
}