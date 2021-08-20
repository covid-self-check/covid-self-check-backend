import { DeletePatientSchema, DeletePatientType } from './DeletePatientSchema'
import { ExportRequestToCallSchema, ExportRequestToCallType } from './ExportRequestToCallSchema'
import { HistorySchema, HistoryType } from './HistorySchema'
import { RegisterSchema, RegisterType } from './RegisterSchema'
import { GetProfileSchema, GetProfileType } from './GetProfileSchema'
import { RequestToRegisterSchema, RequestToRegisterType } from './RequestToRegisterSchema'
import { ImportPatientIdSchema, ImportPatientIdType } from './ImportPatientIdSchema'
import { ImportRequestToRegisterSchema, ImportRequestToRegisterType } from './ImportRequestToRegisterSchema'
import { ImportWhitelistSchema, ImportWhitelistType } from './ImportWhitelistSchema'

export const validateDeletePatientSchema = (data: DeletePatientType) => DeletePatientSchema.validate<DeletePatientType>(data)
export const validateExportRequestToCallSchema = (data: ExportRequestToCallType) => ExportRequestToCallSchema.validate<ExportRequestToCallType>(data)
export const validateHistorySchema = (data: HistoryType) => HistorySchema.validate<HistoryType>(data)
export const validateRegisterSchema = (data: RegisterType) => RegisterSchema.validate<RegisterType>(data)
export const validateGetProfileSchema = (data: GetProfileType) => GetProfileSchema.validate<GetProfileType>(data)
export const validateRequestToRegisterSchema = (data: RequestToRegisterType) => RequestToRegisterSchema.validate<RequestToRegisterType>(data)
export const validateImportPatientIdSchema = (data: ImportPatientIdType) => ImportPatientIdSchema.validate<ImportPatientIdType>(data)
export const validateImportRequestToRegisterSchema = (data: ImportRequestToRegisterType) => ImportRequestToRegisterSchema.validate<ImportRequestToRegisterType>(data)
export const validateImportWhitelistSchema = (data: ImportWhitelistType) => ImportWhitelistSchema.validate<ImportWhitelistType>(data)