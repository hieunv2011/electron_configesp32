export function buildCommand(cmd, serial = "", ...params) {
  const parts = ["@", cmd.toUpperCase(), serial, ...params];
  return parts.join(",") + "$";
}