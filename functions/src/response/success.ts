/**
 * custom success response
 * @param {any} result
 * @returns
 */
export const success = (result: any = null) => {
  const obj: { [key: string]: any } = { ok: true };
  if (result) obj["result"] = result;
  return obj;
};
