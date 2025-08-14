import { useRouter } from 'next/navigation';
import { doSignOut } from '@/lib/client-auth';

export function useSignOut() {
    const router = useRouter();

    return {
        signOut: async () => {
            try {
                await doSignOut();
                router.push('/');
            } catch (err) {
                console.error(err);
            }
        },
    };
}
