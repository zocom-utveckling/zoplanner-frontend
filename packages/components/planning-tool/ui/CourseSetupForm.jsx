import { useEffect } from "react";
import { useEffect } from "react";
import { useCourseSetupForm } from "../hooks/useCourseSetupForm";
import ZoTimePicker from "@zoplanner/time-picker";

const DAY_LABELS = {
  MONDAY: "Måndag",
  TUESDAY: "Tisdag",
  WEDNESDAY: "Onsdag",
  THURSDAY: "Torsdag",
  FRIDAY: "Fredag",
};

const DAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

export default function CourseSetupForm({
  onSave,
  initialValues,
  lockBasicInfo = false,
  showBasicInfo = true,
  showScheduleEditor = true,
  onEditBasicInfo,
  onEditSchedule,
  customers = [],
  onOpenAddCustomer,
}) {
  const {
    courseName,
    customerId,
    customerName,
    className,
    startDate,
    endDate,
    totalHours,
    selectedWeekdays,
    handleWeekdayToggle,
    handleWeekdayTimeChange,
    handleChange,
    handleSelectCustomer,
    handleSubmit,
    getStartTimeForDay,
    isSelected,
  } = useCourseSetupForm(onSave, initialValues);

  useEffect(() => {
    if (!customerId) return;

    const selectedCustomer = customers.find(
      (c) => String(c.id) === String(customerId),
    );

    if (selectedCustomer && selectedCustomer.name !== customerName) {
      handleSelectCustomer(selectedCustomer);
    }
  }, [customerId, customers, customerName, handleSelectCustomer]);

  const sessions = initialValues?.sessionsDraft ?? [];

  const scheduleSummary = (() => {
    if (!sessions.length) return "";

    const grouped = {};

    sessions.forEach((session) => {
      const date = new Date(session.timeStart);
      const day = date.getDay();
      const start = session.timeStart.split("T")[1]?.slice(0, 5);
      const end = session.timeEnd.split("T")[1]?.slice(0, 5);

      if (!grouped[day]) {
        grouped[day] = { start, end };
      }
    });

    return Object.entries(grouped)
      .map(([day, times]) => {
        const label =
          {
            1: "Måndagar",
            2: "Tisdagar",
            3: "Onsdagar",
            4: "Torsdagar",
            5: "Fredagar",
          }[day] || "";

        return `${label} ${times.start}–${times.end}`;
      })
      .join(", ");
  })();

  const weekdaySummary = weekdaySummarySource
    .map((entry) => {
      const dayLabel = DAY_LABELS[entry.day] || entry.day;
      const time = (entry.startTime || "").trim();
      return time ? `${dayLabel} ${time}` : dayLabel;
    })
    .join(", ");

  const resolvedScheduleSummary =
    scheduleSummary || weekdaySummary || "Inga tider valda";

  return (
    <section className="course-setup">
      <form className="course-setup-form" onSubmit={handleSubmit}>
        {showBasicInfo && (
          <>
            {lockBasicInfo ? (
              <div className="course-setup-summary">
                <div className="course-setup-summary__main">
                  <h2>Kursschema</h2>
                  <p>
                    <strong>Kund:</strong> {customerName} <br />
                    <strong>Klass:</strong> {className} <br />
                    <strong>Kurs:</strong> {courseName} <br />
                    <strong>Timmar:</strong> {totalHours} tim <br />
                    <strong>Period:</strong> {startDate} t.o.m {endDate}
                  </p>
                </div>

                <div className="course-setup-summary__actions">
                  {onEditBasicInfo && (
                    <button type="button" onClick={onEditBasicInfo}>
                      Redigera uppgifter
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="course-setup-field-container">
                <div className="course-setup-field">
                  <label htmlFor="customerId">
                    Kund <span className="course-setup-required">*</span>
                  </label>
                  <div className="course-setup-customer-selector">
                    <select
                      id="customerId"
                      name="customerId"
                      value={customerId || ""}
                      onChange={(e) => {
                        if (e.target.value === "__new_customer__") {
                          onOpenAddCustomer?.();
                          return;
                        }
                        handleChange(e);
                      }}
                      disabled={lockBasicInfo}
                    >
                      <option value="">-- Välj kund --</option>
                      {customers
                        .filter(
                          (c) =>
                            (c.name || "").trim().toUpperCase() !== "UTKAST",
                        )
                        .map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}
                          </option>
                        ))}
                      <option value="__new_customer__" disabled={lockBasicInfo}>
                        + Lägg till ny kund
                      </option>
                    </select>
                  </div>
                </div>

                <div className="course-setup-field">
                  <label htmlFor="className">
                    Klass <span className="course-setup-required">*</span>
                  </label>
                  <input
                    id="className"
                    name="className"
                    type="text"
                    placeholder="Ange klassnamn"
                    value={className}
                    onChange={handleChange}
                    disabled={lockBasicInfo}
                  />
                </div>

                <div className="course-setup-field">
                  <label htmlFor="courseName">
                    Kursnamn <span className="course-setup-required">*</span>
                  </label>
                  <input
                    id="courseName"
                    name="courseName"
                    type="text"
                    placeholder="Ange kursnamn"
                    value={courseName}
                    onChange={handleChange}
                    disabled={lockBasicInfo}
                  />
                </div>

                <div className="course-setup-field">
                  <label htmlFor="totalHours">
                    Totalt antal undervisningstimmar{" "}
                    <span className="course-setup-required">*</span>
                  </label>
                  <input
                    id="totalHours"
                    name="totalHours"
                    type="number"
                    min="1"
                    placeholder="Ange timmar"
                    value={totalHours}
                    onChange={handleChange}
                    disabled={lockBasicInfo}
                  />
                </div>

                <div className="course-setup-field">
                  <label htmlFor="startDate">
                    Startdatum <span className="course-setup-required">*</span>
                  </label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={startDate}
                    onChange={handleChange}
                    disabled={lockBasicInfo}
                  />
                </div>

                <div className="course-setup-field">
                  <label htmlFor="endDate">
                    Slutdatum <span className="course-setup-required">*</span>
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={endDate}
                    onChange={handleChange}
                    disabled={lockBasicInfo}
                  />
                </div>
              </div>
            )}
          </>
        )}

        <div className="course-setup-days">
          {showScheduleEditor ? (
            <>
              <span className="course-setup-days__title">
                Dag och tid <span className="course-setup-required">*</span>
              </span>

              <div className="course-setup-days__list">
                {DAY_ORDER.map((day) => (
                  <div className="course-setup-day-row" key={day}>
                    <label className="course-setup-day-label">
                      <input
                        type="checkbox"
                        checked={isSelected(day)}
                        onChange={() => handleWeekdayToggle(day)}
                      />
                      {DAY_LABELS[day]}
                    </label>

                    {isSelected(day) && (
                      <div className="course-setup-day-time">
                        <ZoTimePicker
                          label="Starttid"
                          name="startTime"
                          value={getStartTimeForDay(day)}
                          onChange={(event) =>
                            handleWeekdayTimeChange(day, event)
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="course-setup-hint">* Obligatoriska fält</div>
            </>
          ) : (
            <div className="course-setup-summary">
              <div className="course-setup-summary__main">
                <h3>Dag och tid</h3>
                <p>{resolvedScheduleSummary}</p>
              </div>

              <div className="course-setup-summary__actions">
                {onEditSchedule && (
                  <button type="button" onClick={onEditSchedule}>
                    Redigera dagar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </form>
    </section>
  );
}
