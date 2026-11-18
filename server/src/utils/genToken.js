import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export const genToken = (id, role = "user") => {
    return jwt.sign(
        { id, role },
        config.jwt_secret,
        { expiresIn: "7d" }
    );
};
