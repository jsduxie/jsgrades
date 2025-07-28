import { User } from 'firebase/auth';
import { ClientUserDetails } from './';

export type AuthContextType = {
    currentUser: User | null;
    userLoggedIn: boolean;
    loading: boolean;
    userDetails: ClientUserDetails | null;
};
