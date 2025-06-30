import Pino from "pino";

export const pino = Pino({});

export const makeLogger = (serviceName: string) => {
  return pino.child({ service: serviceName });
};
