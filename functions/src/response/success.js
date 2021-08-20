/**
 * custom success response
 * @param {any} result
 * @returns
 */
exports.success = (result = null) => {
  const obj = { ok: true };
  if (result) obj["result"] = result;
  return obj;
};
