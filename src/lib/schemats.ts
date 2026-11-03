import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('正しいメールアドレスを入力してください'),
  company: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().min(1, 'メッセージを入力してください'),
  budget: z.string().nullish(),
  category: z.string().optional(),
})

export type ContactSchema = z.infer<typeof contactSchema>
