declare namespace Express {
  export interface Request {
    session?: import("@ory/client").Session;
  }
}
