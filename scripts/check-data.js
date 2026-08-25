const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = 'https://pttkqeymimmtbzvjmjql.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0dGtxZXltaW1tdGJ6dmptanFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyODEyOTEsImV4cCI6MjA5OTg1NzI5MX0.XbogliO5cnfpzg-TLos-K5CIPfK-Kd4pAf3XNJXu49g'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkData() {
  // Check profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, user_id, full_name, email, points, state, city')
    .order('created_at', { ascending: false })
    .limit(20)

  console.log('=== PROFILES ===')
  if (profileError) {
    console.error('Profile error:', profileError)
  } else if (profiles) {
    profiles.forEach(p => {
      console.log(`Name: ${p.full_name}, Email: ${p.email}, user_id: ${p.user_id}, Points: ${p.points}, State: ${p.state}, City: ${p.city}`)
    })
  }

  // Check complaints
  const { data: complaints, error: complaintsError } = await supabase
    .from('complaints')
    .select('id, user_id, status, created_at, description')
    .order('created_at', { ascending: false })
    .limit(20)

  console.log('\n=== COMPLAINTS ===')
  if (complaintsError) {
    console.error('Complaints error:', complaintsError)
  } else if (complaints) {
    complaints.forEach(c => {
      console.log(`ID: ${c.id.slice(0,8)}, user_id: ${c.user_id}, Status: ${c.status}, Desc: ${c.description?.slice(0,50) || 'N/A'}`)
    })
  }

  // Count total complaints per user
  const { data: allComplaints, error: allError } = await supabase
    .from('complaints')
    .select('user_id')

  console.log('\n=== COMPLAINT COUNT BY USER ===')
  if (!allError && allComplaints) {
    const counts = {}
    allComplaints.forEach(c => {
      counts[c.user_id] = (counts[c.user_id] || 0) + 1
    })
    Object.entries(counts).forEach(([uid, count]) => {
      console.log(`user_id: ${uid} => ${count} complaints`)
    })
  }
}

checkData().catch(console.error)
