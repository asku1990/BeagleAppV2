export function canAccessAdmin(role: "USER" | "ADMIN") {
  return role === "ADMIN";
}
