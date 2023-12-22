"use server"

import {Token } from '@prisma/client'
import { AuthenticatedUser, refreshUserAccess } from './auth-utils';
import { Result, Ok, Err, match } from '@/models/result';
import { ErrorWithCode } from '@/models/error';
import { getUser } from '@auth/utils/prisma-utils';

export const isExpired = (token: Token) => {
    const now = Math.floor(Date.now() / 1000);
    const minUntilExpiration = token.expiresAt - now;
    return minUntilExpiration < 10; 
} 

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
    return match(newUser)(
        (user) => Ok(user),
        (error) => Err(error)
    );
}