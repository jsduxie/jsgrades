'use client';

import React from 'react';
import type { QualificationFormData, QualificationLevel } from '@/types';
import {
    formClass,
    fieldWrapperClass,
    labelClass,
    inputClass,
    selectClass,
    gridTwoColsClass,
    gridThreeColsClass,
    actionsRowClass,
    buttonPrimaryClass,
    buttonGhostClass,
    alertErrorClass,
} from '@/styles/forms.style';

export type QualificationFormProps = {
    value: QualificationFormData;
    levels: QualificationLevel[];
    submitLabel: string;
    onChangeAction: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;
    onSubmitAction: (e: React.FormEvent<HTMLFormElement>) => void;
    onCancelAction?: () => void;
    submitting?: boolean;
    isLoadingLevels?: boolean;
    errorMsg?: string | null;
};

export default function QualificationForm({
    value,
    levels,
    submitLabel,
    onChangeAction,
    onSubmitAction,
    onCancelAction,
    submitting,
    isLoadingLevels,
    errorMsg,
}: QualificationFormProps) {
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
                    className={inputClass}
                    type='text'
                    value={value.name}
                    onChange={onChangeAction}
                    onInput={onInputHandler}
                    disabled={submitting}
                />
            </div>

            <div className={fieldWrapperClass}>
                <label className={labelClass} htmlFor='institution'>
                    Institution
                </label>
                <input
                    id='institution'
                    name='institution'
                    className={inputClass}
                    type='text'
                    value={value.institution}
                    onChange={onChangeAction}
                    onInput={onInputHandler}
                    disabled={submitting}
                />
            </div>

            <div className={fieldWrapperClass}>
                <label className={labelClass} htmlFor='level'>
                    Level
                </label>
                <select
                    id='level'
                    name='level'
                    className={selectClass}
                    value={value.level}
                    onChange={onChangeAction}
                    disabled={submitting || isLoadingLevels}
                >
                    <option value='' disabled>
                        {isLoadingLevels ? 'Loading…' : 'Select a level'}
                    </option>
                    {levels.map((l) => (
                        <option key={l.id} value={l.id}>
                            {l.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={gridTwoColsClass}>
                <div className={fieldWrapperClass}>
                    <label className={labelClass} htmlFor='startDate'>
                        Start date
                    </label>
                    <input
                        id='startDate'
                        name='startDate'
                        type='date'
                        className={inputClass}
                        value={value.startDate}
                        onChange={onChangeAction}
                        onInput={onInputHandler}
                        disabled={submitting}
                    />
                </div>
                <div className={fieldWrapperClass}>
                    <label className={labelClass} htmlFor='endDate'>
                        End date
                    </label>
                    <input
                        id='endDate'
                        name='endDate'
                        type='date'
                        className={inputClass}
                        value={value.endDate}
                        onChange={onChangeAction}
                        onInput={onInputHandler}
                        disabled={submitting || value.inProgress}
                    />
                </div>
            </div>

            <div className={gridThreeColsClass}>
                <div className={fieldWrapperClass}>
                    <label className={labelClass} htmlFor='currentGrade'>
                        Current grade
                    </label>
                    <input
                        id='currentGrade'
                        name='currentGrade'
                        type='text'
                        className={inputClass}
                        value={value.currentGrade}
                        onChange={onChangeAction}
                        onInput={onInputHandler}
                        disabled={submitting}
                    />
                </div>
                <div className={fieldWrapperClass}>
                    <label className={labelClass} htmlFor='targetGrade'>
                        Target grade
                    </label>
                    <input
                        id='targetGrade'
                        name='targetGrade'
                        type='text'
                        className={inputClass}
                        value={value.targetGrade}
                        onChange={onChangeAction}
                        onInput={onInputHandler}
                        disabled={submitting}
                    />
                </div>
                <div className={fieldWrapperClass}>
                    <label className={labelClass} htmlFor='predictedGrade'>
                        Predicted grade
                    </label>
                    <input
                        id='predictedGrade'
                        name='predictedGrade'
                        type='text'
                        className={inputClass}
                        value={value.predictedGrade}
                        onChange={onChangeAction}
                        onInput={onInputHandler}
                        disabled={submitting}
                    />
                </div>
            </div>

            <div className='flex items-center gap-2'>
                <input
                    id='inProgress'
                    name='inProgress'
                    type='checkbox'
                    checked={value.inProgress}
                    onChange={onChangeAction}
                    disabled={submitting}
                />
                <label className={labelClass} htmlFor='inProgress'>
                    In progress
                </label>
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
