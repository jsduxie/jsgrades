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

export interface AuthenticatedUser {
    id: string;
    email: string;
    uid: string;
}
