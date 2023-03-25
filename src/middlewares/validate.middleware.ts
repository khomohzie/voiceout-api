import CustomException from "@utils/handlers/error.handler";
import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        params: req.params,
        query: req.query,
        //* In the case of form data, I need to parse the data field.
        body: req.body.data ? JSON.parse(req.body.data) : req.body,
        id_photo_front: req.files?.[0] as unknown as Express.Multer.File,
        id_photo_back: req.files?.[1] as unknown as Express.Multer.File,
      });

      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const messages: Array<String> = [];
        const metas: Array<String> = [];

        err.errors.forEach((element) => {
          messages.push(element.message);
          metas.push(`${element.path[1] ?? ""} ${element.path[0] ?? ""}`);
        });

        return next(
          new CustomException(400, messages.join(". "), {
            path: metas.join(". "),
          })
        );
      }

      next(err);
    }
  };
