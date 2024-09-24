import { NextFunction, Request, Response } from "express";
import ory from "./ory";

export const protectRoute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  ory.frontEnd
    .toSession({ cookie: req.header("cookie") })
    .then(({ data: session }) => {
      req.session = session;
      next();
    })
    .catch((error) => {
      res.redirect("/login");
    });
};

export const unProtectRoute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  ory.frontEnd
    .toSession({ cookie: req.header("cookie") })
    .then(() => {
      res.redirect("/home");
    })
    .catch((error) => {
      next();
    });
};

export const checkRole =
  (role: "admin" | "customer") =>
  (req: Request, res: Response, next: NextFunction) => {
    if (req.session) {
      if ((req.session.identity?.metadata_public as any).role === role) {
        next();
      } else {
        return res.status(403).json({ message: "Invalid Role" });
      }
    }
    return res.status(403).json({ message: "No Role Found" });
  };
