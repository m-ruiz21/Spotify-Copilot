"use server"

import { Prisma, Token } from '@prisma/client'
import { AuthenticatedUser, refreshUserAccess } from './auth-utils';
import { Result, Ok, Err, match, mapAsync } from '@/models/result';
import { ErrorWithCode } from '@/models/error';
import { getUser } from '@auth/utils/prisma-utils';
import { upsertUserProfile } from '@/taste-profile/upsert-taste-profile';
import { updateLastUpdated } from './prisma-utils';

/**
 * Checks if given token is expired 
 * @param token 
 * @returns boolean representing if token is expired
 */
export const isExpired = (token: Token) => {
    const now = Math.floor(Date.now() / 1000);
    const minUntilExpiration = token.expiresAt - now;
    return minUntilExpiration < 10; 
} 


/**
 * Gets user information and token from database
 *  
 * @param email user's email 
 * @returns Either AuthenticatedUser | ErrorWithCode 
 */
export const getAuthenticatedUser = async (email: string) : Promise<Result<AuthenticatedUser, ErrorWithCode>> => {
    const user: AuthenticatedUser | null = await getUser(email);

    if (!user) {
        return Err({status: 404, message: "User not found"});
    }
    if (!user.token) {
        return Err({status: 401, message: "User is not authenticated"});
    }

    if (!isExpired(user.token)) {   
        return Ok(user);
    }

    const newUser = await refreshUserAccess(user);

    return newUser;
}


/**
 * Updates / creates user taste profile if necessary
 */
export const loadUserTasteProfile = async (user: AuthenticatedUser): Promise<Result<boolean, ErrorWithCode>> => {
    let diffInDays = 1000;    // arbitrarily large number
    if (user.lastUpdated) {
        const now = new Date();
        const diffInMilliseconds = now.getTime() - user.lastUpdated.getTime();
        diffInDays = diffInMilliseconds / (1000 * 3600 * 24);
    }


    if (!user.lastUpdated || diffInDays > 10) {
        const embeddingResult = await upsertUserProfile(user);
        const result = await mapAsync(
            embeddingResult,
            async (embeddingResult) => updateLastUpdated(user.id)
        );

        return match(result)(
            (success) => Ok(true), 
            (error) => Err(error)
        );
    }

    return Ok(true);
}