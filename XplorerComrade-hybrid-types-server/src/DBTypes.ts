import { userProfile } from "./contentTypes";

type userLevel = {
    user_level_id: number;
    level_description: "Admin" | "User";
}

type UserLevels = userProfile & { level: userLevel };

type TokenContents = Pick<userProfile, "id" | "user_level_id">;

export type { userLevel, UserLevels, TokenContents };