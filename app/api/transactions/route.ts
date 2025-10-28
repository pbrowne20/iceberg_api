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
    const ticker = searchParams.get('ticker')

    // Start collecting WHERE clauses
    const whereClauses: any[] = []

    if (transactionType)
      whereClauses.push(sql`LOWER(TRIM(transaction_type)) = LOWER(TRIM(${transactionType}))`)
    if (transactionYear)
      whereClauses.push(sql`transaction_year = ${transactionYear}`)
    if (submarket)
      whereClauses.push(sql`LOWER(TRIM(submarket)) = LOWER(TRIM(${submarket}))`)
    if (propertyType && propertyType !== 'ALL')
      whereClauses.push(sql`LOWER(TRIM(property_type)) = LOWER(TRIM(${propertyType}))`)
    if (ticker && ticker !== 'ALL')
      whereClauses.push(sql`LOWER(TRIM(ticker)) = LOWER(TRIM(${ticker}))`)

    let whereSQL = sql`TRUE`
if (whereClauses.length > 0) {
  // manually join clauses with AND
  const combined = whereClauses.reduce(
    (acc, clause, idx) =>
      idx === 0 ? sql`${clause}` : sql`${acc} AND ${clause}`,
    sql``
  )
  whereSQL = combined
}

const query = sql`
  SELECT *
  FROM iceberg.fact_transactions
  WHERE ${whereSQL}
  ORDER BY transaction_year DESC, transaction_quarter DESC
  LIMIT 5000;
`

    const rows = await query

    return NextResponse.json({
      success: true,
      count: rows.length,
      rows,
    })
  } catch (error: any) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
