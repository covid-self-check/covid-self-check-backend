import { DeletePatientSchema, DeletePatientType } from './DeletePatientSchema'
import { ExportRequestToCallSchema, ExportRequestToCallType } from './ExportRequestToCallSchema'
import { HistorySchema, HistoryType } from './HistorySchema'
import { RegisterSchema, RegisterType } from './RegisterSchema'
import { GetProfileSchema, GetProfileType } from './GetProfileSchema'
import { RequestToRegisterSchema, RequestToRegisterType } from './RequestToRegisterSchema'
import { ImportPatientIdSchema, ImportPatientIdType } from './ImportPatientIdSchema'
import { ImportRequestToRegisterSchema, ImportRequestToRegisterType } from './ImportRequestToRegisterSchema'
import { ImportWhitelistSchema, ImportWhitelistType } from './ImportWhitelistSchema'
import { ValidationResult } from 'joi'

type Result<T> = Omit<ValidationResult, 'value'> & { value: T }

export const validateDeletePatientSchema = (data: DeletePatientType): Result<DeletePatientType> => DeletePatientSchema.validate(data)
export const validateExportRequestToCallSchema = (data: ExportRequestToCallType): Result<ExportRequestToCallType> => ExportRequestToCallSchema.validate(data)
export const validateHistorySchema = (data: HistoryType): Result<HistoryType> => HistorySchema.validate(data)
export const validateRegisterSchema = (data: RegisterType): Result<RegisterType> => RegisterSchema.validate(data)
export const validateGetProfileSchema = (data: GetProfileType): Result<GetProfileType> => GetProfileSchema.validate(data)
export const validateRequestToRegisterSchema = (data: RequestToRegisterType): Result<RequestToRegisterType> => RequestToRegisterSchema.validate(data)
export const validateImportPatientIdSchema = (data: ImportPatientIdType): Result<ImportPatientIdType> => ImportPatientIdSchema.validate(data)
export const validateImportRequestToRegisterSchema = (data: ImportRequestToRegisterType): Result<ImportRequestToRegisterType> => ImportRequestToRegisterSchema.validate(data)
export const validateImportWhitelistSchema = (data: ImportWhitelistType): Result<ImportWhitelistType> => ImportWhitelistSchema.validate(data)