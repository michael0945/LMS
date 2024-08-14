// src/types/custom.d.ts
import { IUser } from "../models/user.model";

declare global {
    namespace Express {  // Fix the typo here
        interface Request {
            user?: IUser;  // Use the IUser interface here
        }
    }
}
