export const useLogger = () => {
  return {
    log: console.log,
    info: console.info,
    error: console.error,
    warn: console.warn,
  }
}
