import { sql } from './lib/db.js'

async function test() {
  try {
    const result = await sql`SELECT NOW() AS current_time`
    console.log('✅ Connection successful:', result)
  } catch (err) {
    console.error('❌ Connection failed:', err)
  }
}

test()
