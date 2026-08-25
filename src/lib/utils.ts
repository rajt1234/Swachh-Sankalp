import { createClient } from '@/lib/supabase/client'

export async function generateUniqueUserId(role: string): Promise<string> {
  const supabase = createClient()
  const prefix = role === 'municipality' ? 'M' : role === 'recycler' ? 'R' : 'C'

  try {
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('user_id')
      .like('user_id', `${prefix}%`)
      .not('user_id', 'is', null)

    let maxNumber = 0

    if (existingProfiles && existingProfiles.length > 0) {
      for (const profile of existingProfiles) {
        const numberPart = profile.user_id?.substring(1) || ''
        const num = parseInt(numberPart, 10)
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num
        }
      }
    }

    const nextNumber = maxNumber + 1
    const paddedNumber = nextNumber.toString().padStart(5, '0')

    return `${prefix}${paddedNumber}`
  } catch (error) {
    console.error('Error generating user ID:', error)
    const timestamp = Date.now().toString().slice(-5)
    return `${prefix}${timestamp}`
  }
}
