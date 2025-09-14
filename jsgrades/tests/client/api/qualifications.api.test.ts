import {
    createQualification,
    deleteQualification,
    fetchQualificationLevels,
    fetchQualifications,
    updateQualification,
} from '@/lib/client/qualifications/qualifications.api';
import { mockQualification } from '@/__mocks__/qualification';
import type { APIResponse } from '@/types/api';
import type {
    NewQualification,
    Qualification,
    QualificationLevel,
} from '@/types/qualification';

describe('client qualifications.api', () => {
    const fetchSpy = global.fetch as unknown as jest.Mock;

    const auth = { token: 'tkn' };

    beforeEach(() => {
        fetchSpy.mockReset();
    });

    function mockResponse<T>(data: T, message = 'ok', status = 200): Response {
        const body: APIResponse<T> = { status: 'success', message, data };
        return {
            ok: status >= 200 && status < 300,
            status,
            statusText: message,
            json: async () => body,
        } as unknown as Response;
    }

    it('fetchQualifications calls correct endpoint and returns data', async () => {
        const q1 = mockQualification();
        const q2 = mockQualification({ id: 'q2', name: 'Physics' });
        const api = mockResponse<Qualification[]>([q1, q2]);
        fetchSpy.mockResolvedValue(api);

        const res = await fetchQualifications('user-123', auth);

        expect(fetchSpy).toHaveBeenCalledWith(
            '/api/qualifications?userId=user-123',
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer tkn',
                }),
            })
        );
        expect(res.data).toEqual([q1, q2]);
    });

    it('fetchQualificationLevels returns levels', async () => {
        const levels: QualificationLevel[] = [
            { id: '1', name: 'Certificate', level: 1 },
            { id: '2', name: 'Diploma', level: 2 },
        ];
        fetchSpy.mockResolvedValue(mockResponse(levels));

        const res = await fetchQualificationLevels(auth);
        expect(res.data).toEqual(levels);
    });

    it('createQualification posts payload and returns created qualification', async () => {
        const input: NewQualification = {
            userId: 'u1',
            level: 'A-Level',
            name: 'Math',
            institution: 'Some School',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-02-01'),
            currentGrade: 70,
            targetGrade: 90,
            predictedGrade: 85,
            inProgress: true,
        };
        const created: Qualification = {
            id: 'q-new',
            userId: input.userId,
            level: input.level,
            name: input.name,
            institution: input.institution,
            startDate: input.startDate!,
            endDate: input.endDate!,
            currentGrade: input.currentGrade,
            targetGrade: input.targetGrade,
            predictedGrade: input.predictedGrade,
            inProgress: true,
            created: new Date('2024-01-02T00:00:00.000Z'),
            updated: new Date('2024-01-02T00:00:00.000Z'),
        };
        fetchSpy.mockResolvedValue(mockResponse(created));

        const res = await createQualification(input, auth);

        expect(fetchSpy).toHaveBeenCalledWith(
            '/api/qualifications',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(input),
            })
        );
        expect(res.data).toEqual(created);
    });

    it('updateQualification puts payload and returns updated qualification', async () => {
        const updated: Qualification = mockQualification({
            name: 'Updated Name',
        });
        fetchSpy.mockResolvedValue(mockResponse(updated));

        const res = await updateQualification(
            'q1',
            { name: 'Updated Name' },
            auth
        );

        expect(fetchSpy).toHaveBeenCalledWith(
            '/api/qualifications/q1',
            expect.objectContaining({ method: 'PUT' })
        );
        expect(res.data).toEqual(updated);
    });

    it('deleteQualification calls delete and returns APIResponse<null>', async () => {
        const body: APIResponse<null> = {
            status: 'success',
            message: 'deleted',
            data: null,
        };
        fetchSpy.mockResolvedValue({
            ok: true,
            status: 200,
            statusText: 'deleted',
            json: async () => body,
        } as unknown as Response);

        const res = await deleteQualification('q1', auth);
        expect(fetchSpy).toHaveBeenCalledWith(
            '/api/qualifications/q1',
            expect.objectContaining({ method: 'DELETE' })
        );
        expect(res.status).toBe('success');
    });
});
