'use client';

import React from 'react';
import type { QualificationNodeFormData, QualificationNodeType } from '@/types';
import {
    formClass,
    fieldWrapperClass,
    labelClass,
    inputClass,
    selectClass,
    gridThreeColsClass,
    actionsRowClass,
    buttonPrimaryClass,
    buttonGhostClass,
    alertErrorClass,
} from '@/styles/forms.style';

export type QualificationNodeFormProps = {
    value: QualificationNodeFormData;
    types: QualificationNodeType[];
    submitLabel: string;
    onChangeAction: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;
    onCreditsChangeAction: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onWeightChangeAction: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onTypeChangeAction: (typeId: string) => void;
    onSubmitAction: (e: React.FormEvent<HTMLFormElement>) => void;
    onCancelAction?: () => void;
    submitting?: boolean;
    isLoadingTypes?: boolean;
    errorMsg?: string | null;
};

export default function QualificationNodeForm({
    value,
    types,
    submitLabel,
    onChangeAction,
    onCreditsChangeAction,
    onWeightChangeAction,
    onTypeChangeAction,
    onSubmitAction,
    onCancelAction,
    submitting,
    isLoadingTypes,
    errorMsg,
}: QualificationNodeFormProps) {
    const onInputHandler: React.FormEventHandler<HTMLInputElement> = (e) =>
        onChangeAction(e as unknown as React.ChangeEvent<HTMLInputElement>);

    return (
        <form onSubmit={onSubmitAction} className={formClass}>
            {errorMsg ? (
                <div role='alert' className={alertErrorClass}>
                    {errorMsg}
                </div>
            ) : null}
            <div className={fieldWrapperClass}>
                <label className={labelClass} htmlFor='name'>
                    Name
                </label>
                <input
                    id='name'
                    name='name'
                    type='text'
                    className={inputClass}
                    value={value.name}
                    onChange={onChangeAction}
                    onInput={onInputHandler}
                    disabled={submitting}
                />
            </div>

            <div className={gridThreeColsClass}>
                <div className={fieldWrapperClass}>
                    <label className={labelClass} htmlFor='credits'>
                        Credits
                    </label>
                    <input
                        id='credits'
                        name='credits'
                        type='number'
                        className={inputClass}
                        value={String(value.credits)}
                        onChange={onCreditsChangeAction}
                        onInput={(e) =>
                            onCreditsChangeAction(
                                e as unknown as React.ChangeEvent<HTMLInputElement>
                            )
                        }
                        disabled={submitting}
                    />
                </div>
                <div className={fieldWrapperClass}>
                    <label className={labelClass} htmlFor='weight'>
                        Weight (%)
                    </label>
                    <input
                        id='weight'
                        name='weight'
                        type='number'
                        className={inputClass}
                        value={String(value.weight)}
                        onChange={onWeightChangeAction}
                        onInput={(e) =>
                            onWeightChangeAction(
                                e as unknown as React.ChangeEvent<HTMLInputElement>
                            )
                        }
                        disabled={submitting}
                    />
                </div>
                <div className={fieldWrapperClass}>
                    <label className={labelClass} htmlFor='type'>
                        Type
                    </label>
                    <select
                        id='type'
                        name='type'
                        className={selectClass}
                        value={value.type?.id ?? ''}
                        onChange={(e) => onTypeChangeAction(e.target.value)}
                        disabled={submitting || isLoadingTypes}
                    >
                        <option value='' disabled>
                            {isLoadingTypes ? 'Loading…' : 'Select a type'}
                        </option>
                        {types.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={actionsRowClass}>
                {onCancelAction && (
                    <button
                        type='button'
                        onClick={onCancelAction}
                        className={buttonGhostClass}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type='submit'
                    className={buttonPrimaryClass}
                    disabled={submitting}
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
