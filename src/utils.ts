import bcrypt from "bcrypt";
import { z } from "zod";
import jwt, { JwtPayload } from "jsonwebtoken";
import xss from "xss";
import User from "./models/User.js";
import config from "./config.js";
import {
  FindAttributes,
  IObjKey,
  IUserModel,
  IZodHandleSchema,
} from "./types/global";
import { Response } from "express";

class Utils {
  private _changePasswdSchema = z.object({
    passwd: z.string().min(6).max(16),
  });

  private _registerSchema = this._changePasswdSchema.extend({
    name: z.string().min(3).max(100),
    email: z.string().max(100).email(),
  });

  private _patchSchema = this._registerSchema.partial();

  private _envSchema = z.object({
    NODE_ENV: z.enum(["production", "development"]),
    PORT: z.coerce.number().min(3000),
    HOST: z.string().url(),
    SMTP_USER: z.string().email(),
    SMTP_PASS: z.string().length(19),
    AUTH_DURATION_DAYS: z.coerce.number().min(1),
    SECRET: z.string().min(64),
  });

  private _objectKey = (obj: IObjKey) => {
    const key = Object.keys(obj)[0];
    return {
      key,
      value: obj[key],
    };
  };

  private _handleZodError = (err: any) => {
    const __dir = err.issues[0];
    return `${__dir.path}: ${__dir.message}`;
  };

  public validateInput = (input: object, schema: string) => {
    try {
      const handleSchema: IZodHandleSchema = {
        register: this._registerSchema,
        patch: this._patchSchema,
        changePasswd: this._changePasswdSchema,
        env: this._envSchema,
      };
      return handleSchema[schema].parse(input);
    } catch (err) {
      throw { zod: this._handleZodError(err) };
    }
  };

  public findUserByField = async (field: IObjKey, restrict = false) => {
    const { key, value } = this._objectKey(field);

    let attributes: FindAttributes = undefined;
    if (restrict) {
      attributes = { exclude: ["id", "passwd"] };
    }

    const user = (await User.findOne({
      where: { [key]: value },
      attributes,
    })) as IUserModel;

    return user;
  };

  public sanitizeInput = (input: IObjKey) => {
    const sanitizedData: IObjKey = {};
    for (const key of Object.keys(input)) {
      sanitizedData[key] = xss(input[key]);
    }
    return sanitizedData;
  };

  public updateUserField = async (user: IUserModel, fields: IObjKey) => {
    for (const key in fields) {
      if (key !== "passwd") {
        user[key] = fields[key];
        continue;
      }

      const salt = await bcrypt.genSalt(12);
      user[key] = await bcrypt.hash(fields[key], salt);
    }
    return user;
  };

  public jwtVerify = (token: string, payloadName?: string) => {
    try {
      const payload = jwt.verify(token, config.env.SECRET) as JwtPayload;
      return payloadName && payload[payloadName];
    } catch (err) {
      throw { status: 401, msg: config.serverMsg.invalidToken };
    }
  };

  public handleError = (res: Response, err: any) => {
    if (err.zod) {
      return res.status(422).json(err);
    }

    if (err.status && err.msg) {
      const { status, msg } = err;
      return res.status(status).json({ msg });
    }

    console.error(err);
    res.status(500).json({ msg: config.serverMsg.err });
  };

  public sendEmail = async ({ to, subject, link }: IObjKey) => {
    await config.transporter.sendMail({
      from: "Develop Store",
      to,
      subject,
      html: `<h3 style="font-weight: 400">${link}</h3>`,
    });
  };
}

export default new Utils();
