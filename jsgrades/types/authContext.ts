import { User } from 'firebase/auth';

export type AuthContextType = {
    currentUser: User | null;
    userLoggedIn: boolean;
    loading: boolean;
};
