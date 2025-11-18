
import * as Yup from "yup";

export const currentYear = new Date().getFullYear();

export const dateSchema = Yup.string()
  .nullable()
  .test("date-format-and-validity", "Invalid date format (YYYY-MM-DD)", (value) => {
    // Allow null/undefined/empty values
    if (!value || value.trim() === "") {
      return true;
    }

    // Check format first
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    // Parse and validate the date components
    const [year, month, day] = value.split("-").map(Number);

    // Basic range checks
    if (year < 1800 || year > currentYear) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    // Create date object and verify it's valid (handles leap years, month lengths, etc.)
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() + 1 === month &&
      date.getDate() === day
    );
  });

// Alternative approach using separate validators (more granular error messages)
export const dateSchemaDetailed = Yup.string()
  .nullable()
  .when([], {
    is: (value: string) => value && value.trim() !== "",
    then: (schema) => schema
      .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      .test("valid-year", "Year must be between 1800 and current year", (value) => {
        if (!value) return true;
        const year = parseInt(value.split("-")[0]);
        return year >= 1800 && year <= currentYear;
      })
      .test("valid-date", "Invalid date (check month/day)", (value) => {
        if (!value) return true;
        const [year, month, day] = value.split("-").map(Number);
        
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        
        const date = new Date(year, month - 1, day);
        return (
          date.getFullYear() === year &&
          date.getMonth() + 1 === month &&
          date.getDate() === day
        );
      }),
    otherwise: (schema) => schema
  });

// Usage example - for required dates
export const requiredDateSchema = Yup.string()
  .required("Date is required")
  .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .test("valid-date", "Invalid date", (value) => {
    if (!value) return false;
    
    const [year, month, day] = value.split("-").map(Number);
    
    if (year < 1800 || year > currentYear) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() + 1 === month &&
      date.getDate() === day
    );
  });