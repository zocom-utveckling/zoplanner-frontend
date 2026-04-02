import { useEffect, useState } from "react";
import {
  courseService,
  customerService,
  classService,
  assignmentService,
} from "@zoplanner/api";

function getStatus(startDate, endDate) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "ongoing";
}

export function useCoursesOverview() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesData, customersData, classesData, assignmentsData] =
          await Promise.all([
            courseService.getAll(),
            customerService.getAll(),
            classService.getAll(),
            assignmentService.getAll(),
          ]);

        const enrichedCourses = coursesData.map((course) => {
          const classItem = classesData.find(
            (c) => c.id === course.classId,
          );

          const customer = customersData.find(
            (c) => c.id === classItem?.customerId,
          );

          const courseAssignments = assignmentsData.filter(
            (a) => a.courseId === course.id,
          );

          return {
            id: course.id,
            name: course.name,
             managerId: course.managerId,

            customerName: customer?.name,

            startDate: course.dateStart,
            endDate: course.dateEnd,

            assignmentCount: courseAssignments.length,

            status: getStatus(course.dateStart, course.dateEnd),
          };
        });

        setCourses(enrichedCourses);
      } catch (err) {
        console.error("Failed to fetch courses overview", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { courses, loading };
}