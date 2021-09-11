import { DeletePatientSchema, DeletePatientType } from './DeletePatientSchema'
import { HistorySchema, HistoryType } from './HistorySchema'
import { GetProfileSchema, GetProfileType } from './GetProfileSchema'
import { ValidationResult } from 'joi'

type Result<T> = Omit<ValidationResult, 'value'> & { value: T }

export const validateDeletePatientSchema = (data: DeletePatientType): Result<DeletePatientType> => DeletePatientSchema.validate(data)
export const validateHistorySchema = (data: HistoryType): Result<HistoryType> => HistorySchema.validate(data)
export const validateGetProfileSchema = (data: GetProfileType): Result<GetProfileType> => GetProfileSchema.validate(data)

export { DeletePatientType, HistoryType, GetProfileType }