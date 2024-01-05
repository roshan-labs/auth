export const useLogger = () => {
  return {
    // eslint-disable-next-line no-console
    log: console.log,
    // eslint-disable-next-line no-console
    info: console.info,
    // eslint-disable-next-line no-console
    error: console.error,
    // eslint-disable-next-line no-console
    warn: console.warn,
  }
}
