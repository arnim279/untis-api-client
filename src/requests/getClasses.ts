import { schema } from "@arnim279/schema-validator";
import { schoolClass, schoolClassSchema } from "../data/index.js";

export const method = "getKlassen";

export type result = schoolClass[];

export const resultSchema: schema = [schoolClassSchema];
