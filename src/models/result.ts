import { Either, left, right, isLeft, isRight, getOrElse, Right, Left } from 'fp-ts/lib/Either';

type Err<E> = Either<E, never>; 
type Ok<T> = Either<never, T>; 

export const Err = <E>(e: E): Err<E> => left(e);
export const Ok = <T>(t: T): Ok<T> => right(t);

export type Result<T, E> = Either<E, T> 

export const isErr = <T, E>(result: Result<T, E>): result is Left<E> => isLeft(result); 
export const isOk = <T, E>(result: Result<T, E>): result is Right<T> => isRight(result);

export const map = <T, E, R>(result: Result<T, E>, f: (value: T) => R): Result<R, E> => {
    if (isOk(result)) {
        return Ok(f(result.right));
    } else {
        return result; 
    }
};

export const mapAsync = async <T, E, R>(result: Result<T, E>, f: (value: T) => Promise<R>): Promise<Result<R, E>> => {
    if (isOk(result)) {
        return Ok(await f(result.right));
    } else {
        return result; 
    }
}

export const unwrap = <T, E>(result: Result<T, E>): T => {
    if (isOk(result)) {
        return result.right;
    } else {
        throw result.left;
    }
}

export const match = <T, E>(result: Result<T, E>) => 
  <R1, R2>(okFn: (value: T) => R1, errFn: (error: E) => R2): R1 | R2 => {
    if (isOk(result)) {
        return okFn(result.right);
    } else {
        return errFn(result.left);
    }
};