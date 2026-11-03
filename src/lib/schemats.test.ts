import { describe, expect, it } from 'vitest'
import { contactSchema } from './schemats'

const inquiry = {
  name: '相談者',
  email: 'inquiry@example.com',
  message: '予約の転記作業について相談したいです。',
}

describe('問い合わせの任意予算', () => {
  it('予算を省略して相談できる', () => {
    expect(contactSchema.safeParse(inquiry).success).toBe(true)
  })

  it('未選択のラジオボタンが返すnullを受け付ける', () => {
    expect(contactSchema.safeParse({ ...inquiry, budget: null }).success).toBe(
      true,
    )
  })

  it.each(['', '50万〜100万円未満'])('予算欄の値 %j を受け付ける', (budget) => {
    expect(contactSchema.parse({ ...inquiry, budget }).budget).toBe(budget)
  })

  it.each([500000, { amount: 500000 }, ['50万円']])(
    '不正な予算の型 %j を拒否する',
    (budget) => {
      expect(contactSchema.safeParse({ ...inquiry, budget }).success).toBe(
        false,
      )
    },
  )

  it.each(['name', 'email', 'message'] as const)(
    '予算未選択でも必須項目 %s を検証する',
    (field) => {
      const result = contactSchema.safeParse({
        ...inquiry,
        budget: null,
        [field]: '',
      })
      expect(result.success).toBe(false)
      if (!result.success)
        expect(
          result.error.issues.some((issue) => issue.path[0] === field),
        ).toBe(true)
    },
  )
})
