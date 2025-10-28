// app/api/transactions/route.ts
import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const transactionType = searchParams.get('transaction_type')
    const transactionYear = searchParams.get('year')
    const submarket = searchParams.get('submarket')
    const propertyType = searchParams.get('property_type')

    // Build base query with tagged template syntax
    let query

    if (transactionType && transactionYear) {
      query = sql`
        SELECT *
        FROM iceberg.fact_transactions
        WHERE LOWER(transaction_type) = LOWER(${transactionType})
          AND transaction_year = ${transactionYear}
        ORDER BY transaction_year DESC, transaction_quarter DESC
        LIMIT 100;
      `
    } else if (transactionType) {
      query = sql`
        SELECT *
        FROM iceberg.fact_transactions
        WHERE LOWER(transaction_type) = LOWER(${transactionType})
        ORDER BY transaction_year DESC, transaction_quarter DESC
        LIMIT 100;
      `
    } else if (transactionYear) {
      query = sql`
        SELECT *
        FROM iceberg.fact_transactions
        WHERE transaction_year = ${transactionYear}
        ORDER BY transaction_year DESC, transaction_quarter DESC
        LIMIT 100;
      `
    } else if (submarket) {
      query = sql`
        SELECT *
        FROM iceberg.fact_transactions
        WHERE submarket = ${submarket}
        ORDER BY transaction_year DESC, transaction_quarter DESC
        LIMIT 100;
      `
    } else if (propertyType) {
      query = sql`
        SELECT *
        FROM iceberg.fact_transactions
        WHERE property_type = ${propertyType}
        ORDER BY transaction_year DESC, transaction_quarter DESC
        LIMIT 100;
      `
    } else {
      query = sql`
        SELECT *
        FROM iceberg.fact_transactions
        ORDER BY transaction_year DESC, transaction_quarter DESC
        LIMIT 100;
      `
    }

    const rows = await query

    return NextResponse.json({
      success: true,
      count: rows.length,
      rows,
    })
  } catch (error: any) {
    console.error('❌ API Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
