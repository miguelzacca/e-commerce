"use strict";

import { Request, Response, NextFunction } from "express";
import { Model, FindAttributeOptions } from "sequelize";
import { Schema, ZodError } from "zod";

interface IUserModel extends Model {
  [key: string]: any;
}

interface IPublicDataMsg {
  msg: string;
}

interface IPublicDataZod {
  zod: ZodError;
}

export interface IEnv {
  NODE_ENV: string;
  PORT: number;
  HOST: HOST;
  SMTP_USER: string;
  AUTH_DURATION_DAYS: number;
  SECRET: string;
}

export interface IZodHandleSchema {
  [key: string]: Schema;
}

export interface IController {
  (req: Request, res: Response): void;
}

export interface IObjKey {
  [key: string]: string;
}

export interface IMiddleware {
  (req: Request, res: Response, next: NextFunction): void;
}

export interface IObjFromFormData {
  [key: string]: FormDataEntryValue;
}

export type PublicData = IPublicDataMsg | IPublicDataZod;

export type FindAttributes = FindAttributeOptions | undefined;
