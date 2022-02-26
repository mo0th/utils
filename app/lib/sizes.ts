import { z } from 'zod'

export type CompressionLevelRange = { min: number; max: number }

export const BROTLI_LEVEL_RANGE: CompressionLevelRange = { min: 0, max: 11 }
export const GZIP_LEVEL_RANGE: CompressionLevelRange = { min: 0, max: 9 }
export const DEFLATE_LEVEL_RANGE: CompressionLevelRange = { min: 0, max: 9 }

const booleanOrCheckboxValue = () =>
  z.union([z.boolean(), z.enum(['on'])], {
    errorMap(issue, ctx) {
      if (issue.code === z.ZodIssueCode.invalid_union) {
        return { message: "must be true, false or 'on'" }
      }
      return z.defaultErrorMap(issue, ctx)
    },
  })
const coerceOptionalBooleanOrCheckboxValueToBoolean = (
  val: boolean | 'on' | undefined
): boolean =>
  typeof val === 'boolean' ? val : typeof val === 'undefined' ? false : true

const stringToIntInRange = (range: CompressionLevelRange) =>
  z
    .string()
    .regex(/^\d+$/)
    .transform(parseInt)
    .refine(val => val >= range.min && val <= range.max, {
      message: `must be between ${range.min} and ${range.max}, inclusive`,
    })

export const sizesRequestSchema = z
  .object({
    text: z.string(),
    files: z
      .array(z.instanceof(File, { message: 'files should only contain Files' }))
      .transform(files => files.filter(file => Boolean(file.name))),
    initialEnabled: booleanOrCheckboxValue(),
    brotliEnabled: booleanOrCheckboxValue(),
    brotliLevel: stringToIntInRange(BROTLI_LEVEL_RANGE),
    gzipEnabled: booleanOrCheckboxValue(),
    gzipLevel: stringToIntInRange(GZIP_LEVEL_RANGE),
    deflateEnabled: booleanOrCheckboxValue(),
    deflateLevel: stringToIntInRange(DEFLATE_LEVEL_RANGE),
  })
  .partial()
  .superRefine((val, ctx) => {
    if (!val.text && !val.files?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        fatal: true,
        message: 'you must provide at least one or text and files',
      })
    }
  })
  .transform(val => {
    val.initialEnabled = coerceOptionalBooleanOrCheckboxValueToBoolean(
      val.initialEnabled
    )

    if (typeof val.deflateLevel === 'undefined') {
      val.deflateLevel = DEFLATE_LEVEL_RANGE.max
    }
    val.deflateEnabled = coerceOptionalBooleanOrCheckboxValueToBoolean(
      val.deflateEnabled
    )

    if (typeof val.gzipLevel === 'undefined') {
      val.gzipLevel = GZIP_LEVEL_RANGE.max
    }
    val.gzipEnabled = coerceOptionalBooleanOrCheckboxValueToBoolean(
      val.gzipEnabled
    )

    if (typeof val.brotliLevel === 'undefined') {
      val.brotliLevel = BROTLI_LEVEL_RANGE.max
    }
    val.brotliEnabled = coerceOptionalBooleanOrCheckboxValueToBoolean(
      val.brotliEnabled
    )

    if (!val.text) {
      val.text = undefined
    }

    return val as SizesRequest
  })

export type SizesRequest = {
  text?: string
  files?: File[]
  initialEnabled: boolean
  deflateEnabled: boolean
  deflateLevel: number
  gzipEnabled: boolean
  gzipLevel: number
  brotliEnabled: boolean
  brotliLevel: number
}

export type SizesRequestErrors = z.inferFlattenedErrors<
  typeof sizesRequestSchema
>
