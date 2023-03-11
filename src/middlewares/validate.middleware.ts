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
				body: req.body,
			});

			next();
		} catch (err: any) {
			if (err instanceof ZodError) {
				const messages: Array<String> = [];
				const metas: Array<String> = [];

				err.errors.forEach((element) => {
					messages.push(element.message);
					metas.push(`${element.path[1]} ${element.path[0]}`);
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
