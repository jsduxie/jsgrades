import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function useProtectedRoute() {
    const router = useRouter();
    const auth = useAuth();

    return {
        push: (href: string) => {
            const currentUser = auth?.currentUser;
            if (currentUser) {
                router.push(`/${href}`);
            } else {
                router.push(`/auth/login`);
            }
        },
    };
}
