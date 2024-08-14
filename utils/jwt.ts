import { Response } from "express";
import { redis } from "./redis";
import { IUser } from "../models/user.model";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  // Explicitly assert or cast `user._id` as a string
  const userId = (user._id as unknown as string);

  // Upload session to Redis
  redis.set(userId, JSON.stringify(user) as any);

  // Parse environment variables to integrate with fallback values
  const accessTokenExpires = parseInt(process.env.ACCESS_TOKEN_EXPIRES || "300", 10);
  const refreshTokenExpires = parseInt(process.env.REFERSH_TOKEN_EXPIRES || "1200", 10);

  // Options for cookies
  const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpires * 1000),
    maxAge: accessTokenExpires * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpires * 1000),
    maxAge: refreshTokenExpires * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  // Only set secure only for production
  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
    refreshTokenOptions.secure = true;
  }

  // Set cookies and send response
  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);
  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};
