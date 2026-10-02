const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://pttkqeymimmtbzvjmjql.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0dGtxZXltaW1tdGJ6dmptanFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyODEyOTEsImV4cCI6MjA5OTg1NzI5MX0.XbogliO5cnfpzg-TLos-K5CIPfK-Kd4pAf3XNJXu49g'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fixData() {
  // Get the specific users we care about
  const { data: targetUsers, error: fetchError } = await supabase
    .from('profiles')
    .select('id, user_id, full_name, email')
    .in('full_name', ['Anil Das', 'Nayan Yadav', 'Akram Khan'])

  if (fetchError) {
    console.error('Error fetching users:', fetchError)
    process.exit(1)
  }

  console.log('Target users found:')
  targetUsers?.forEach(u => {
    console.log(`  ${u.full_name} (${u.email}) => profile_id: ${u.id}, user_id: ${u.user_id}`)
  })

  // Check existing complaints for these users
  const profileIds = targetUsers?.map(u => u.id) || []
  const { data: existingComplaints, error: existingError } = await supabase
    .from('complaints')
    .select('id, user_id, status, created_at')
    .in('user_id', profileIds)

  console.log('\nExisting complaints for these users:')
  if (existingError) {
    console.error('Error:', existingError)
  } else if (existingComplaints && existingComplaints.length > 0) {
    existingComplaints.forEach(c => {
      console.log(`  ${c.id.slice(0, 8)} => user: ${c.user_id}, status: ${c.status}`)
    })
  } else {
    console.log('  No complaints found.')
  }

  // Insert sample complaints for each user if they have none
  const now = new Date()
  const sampleComplaints = [
    {
      user_id: targetUsers?.find(u => u.full_name === 'Anil Das')?.id,
      description: 'Overflowing garbage bin near main market area in Anand. Waste scattered across the road causing unhygienic conditions.',
      status: 'resolved',
      created_at: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      city: 'Anand',
      state: 'Gujarat',
      location_text: 'Main Market, Anand',
      latitude: 22.5645,
      longitude: 72.9289,
      address: 'Market Road, Near Temple, Anand',
      pin_code: '388001',
      image_url: null,
      category_id: null,
      ai_category: 'mixed-waste',
      ai_verified: true,
      ai_severity: 'high',
      ai_recommendation: 'Mixed waste requires immediate segregation. Contact local municipality for bulk clearance.',
      tracking_id: 'SWA-2025-000001',
    },
    {
      user_id: targetUsers?.find(u => u.full_name === 'Nayan Yadav')?.id,
      description: 'Illegal dumping of construction waste near residential area in Panaji. Blocking the drainage system.',
      status: 'in_progress',
      created_at: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      city: 'Panaji',
      state: 'Goa',
      location_text: 'Residential Area, Panaji',
      latitude: 15.4909,
      longitude: 73.8278,
      address: 'Near Community Hall, Panaji',
      pin_code: '403001',
      image_url: null,
      category_id: null,
      ai_category: 'mixed-waste',
      ai_verified: true,
      ai_severity: 'medium',
      ai_recommendation: 'Construction waste should be disposed at designated sites. Report to local ward officer.',
      tracking_id: 'SWA-2025-000002',
    },
    {
      user_id: targetUsers?.find(u => u.full_name === 'Akram Khan')?.id,
      description: 'Garbage not collected for over a week in Jhansi locality. Children falling sick due to mosquitoes and foul smell.',
      status: 'pending',
      created_at: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
      city: 'Jhansi',
      state: 'Uttar Pradesh',
      location_text: 'Civil Lines, Jhansi',
      latitude: 25.4484,
      longitude: 78.5686,
      address: 'Near Bus Stand, Civil Lines, Jhansi',
      pin_code: '284001',
      image_url: null,
      category_id: null,
      ai_category: 'organic',
      ai_verified: true,
      ai_severity: 'high',
      ai_recommendation: 'Organic waste decomposing near residential area poses health risk. Immediate collection required.',
      tracking_id: 'SWA-2025-000003',
    },
  ]

  const { error: insertError } = await supabase
    .from('complaints')
    .insert(sampleComplaints)

  if (insertError) {
    console.error('Error inserting complaints:', insertError)
  } else {
    console.log('\nInserted 3 sample complaints successfully.')
  }

  // Now update/insert points for these users so rewards page shows them
  // We need to calculate points based on complaints: +50 per report
  const { data: finalCounts, error: countError } = await supabase
    .from('complaints')
    .select('user_id', { count: 'exact', head: false })
    .in('user_id', profileIds)

  if (!countError && finalCounts) {
    const userReportCounts = {}
    finalCounts.forEach(c => {
      userReportCounts[c.user_id] = (userReportCounts[c.user_id] || 0) + 1
    })

    console.log('\nUpdated report counts:')
    Object.entries(userReportCounts).forEach(([uid, count]) => {
      console.log(`  profile_id: ${uid} => ${count} reports`)
    })
  }
}

fixData().catch(console.error)
