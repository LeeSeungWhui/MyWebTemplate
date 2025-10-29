import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import EasyObj from '../app/lib/dataset/EasyObj';
import EasyList from '../app/lib/dataset/EasyList';
import { getBoundValue, setBoundValue } from '../app/lib/binding';

describe('EasyObj binding contract', () => {
    it('supports dotted key reads and writes via helper', () => {
        const { result } = renderHook(() => EasyObj({ user: { name: 'Ada' } }));

        act(() => {
            setBoundValue(result.current, 'user.name', 'Mina', { source: 'program' });
        });
        expect(getBoundValue(result.current, 'user.name')).toBe('Mina');

        act(() => {
            result.current.user = { name: 'Noa' };
        });
        expect(getBoundValue(result.current, 'user.name')).toBe('Noa');

        act(() => {
            result.current['user.name'] = 'Sia';
        });
        expect(getBoundValue(result.current, 'user.name')).toBe('Sia');
    });

    it('notifies subscribers with ctx metadata on direct assignment', () => {
        const { result } = renderHook(() => EasyObj({ profile: { name: 'Ada' } }));
        const listener = vi.fn();
        let unsubscribe;

        act(() => {
            unsubscribe = result.current.subscribe(listener);
        });

        act(() => {
            result.current.profile.name = 'Zia';
        });

        expect(listener).toHaveBeenCalledTimes(1);
        const payload = listener.mock.calls[0][0];
        expect(payload.ctx).toMatchObject({ dataKey: 'profile.name', modelType: 'obj', source: 'program' });
        expect(getBoundValue(result.current, 'profile.name')).toBe('Zia');

        act(() => {
            unsubscribe();
        });

        act(() => {
            result.current.profile.name = 'Ara';
        });

        expect(listener).toHaveBeenCalledTimes(1);
    });
});

describe('EasyList binding contract', () => {
    it('tracks nested mutations and dotted keys', () => {
        const { result } = renderHook(() => EasyList([{ id: 1, name: 'Ada' }, { id: 2, name: 'Mia' }]));

        act(() => {
            setBoundValue(result.current, '1.name', 'Nia', { source: 'program' });
        });
        expect(getBoundValue(result.current, '1.name')).toBe('Nia');

        act(() => {
            result.current.push({ id: 3, name: 'Ona' });
        });
        expect(getBoundValue(result.current, '2.name')).toBe('Ona');

        act(() => {
            result.current.splice(1, 1, { id: 4, name: 'Pia' });
        });
        expect(getBoundValue(result.current, '1.name')).toBe('Pia');
    });

    it('emits ctx for list subscriptions', () => {
        const { result } = renderHook(() => EasyList([{ id: 1, name: 'Ada' }]));
        const listener = vi.fn();

        act(() => {
            result.current.subscribe(listener);
        });

        act(() => {
            result.current[0].name = 'Gia';
        });

        expect(listener).toHaveBeenCalled();
        const payload = listener.mock.calls[0][0];
        expect(payload.ctx).toMatchObject({ dataKey: '0.name', modelType: 'list', source: 'program' });
        expect(getBoundValue(result.current, '0.name')).toBe('Gia');
    });
});
