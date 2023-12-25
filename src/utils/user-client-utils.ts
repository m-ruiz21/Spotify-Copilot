"use client"

import { AuthenticatedUser } from "@/utils/auth-utils";
import { getAuthenticatedUser, loadUserTasteProfile } from "@/utils/user-server-utils";
import { Result, Err } from "@/models/result";
import { ErrorWithCode } from "@/models/error";
import { match } from "@/models/result"

export async function fetchUserData(email: string, setUser: React.Dispatch<React.SetStateAction<AuthenticatedUser | undefined>>) {
    const user = await getAuthenticatedUser(email);
    return match(user)(
        (user) => {
            setUser(user);
            return loadUserTasteProfile(user); 
        },
        (error) => Err(error)
    );

};