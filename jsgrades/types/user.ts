export interface ClientUserDetails {
    uid?: string;
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    verified?: boolean;
    onBoarded?: boolean;
    avatarUrl?: string;
}

export interface DBUserDetails {
    first_name?: string;
    last_name?: string;
    date_of_birth?: Date;
    highest_qual_level?: number;
    verified?: boolean;
    onBoarded?: boolean;
    count_sign_in?: number;
}

export interface AuthenticatedUser {
    id: string;
    email: string;
    uid: string;
}
