import Swal from "sweetalert2";

export const showSuccess = (title, text) => Swal.fire({ icon: "success", title, text, confirmButtonColor: "#13273c" });

export const showError = (title, text) => Swal.fire({ icon: "error", title, text, confirmButtonColor: "#13273c" });

export const confirmDelete = (title, text) => Swal.fire({
  icon: "warning",
  title,
  text,
  showCancelButton: true,
  confirmButtonText: "Delete",
  confirmButtonColor: "#B97943",
  cancelButtonColor: "#6b7280",
});

export const friendlyError = (error, fallback) => {
  const message = error?.message || "";
  if (/duplicate|unique/i.test(message)) return "A record with these details already exists.";
  if (/foreign key|sales_id/i.test(message)) return "The selected Sales ID is invalid.";
  if (/not null|required/i.test(message)) return "Please complete all required fields.";
  return fallback;
};
