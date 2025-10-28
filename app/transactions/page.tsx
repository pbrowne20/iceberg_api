'use client'
import { useEffect, useState } from 'react'

export default function TransactionsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/transactions')
      .then((res) => res.json())
      .then((json) => {
        setData(json.rows || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to load data.')
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="p-4">Loading transactions...</p>
  if (error) return <p className="p-4 text-red-600">{error}</p>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ICEBERG Transactions</h1>
      <p className="mb-2 text-gray-600">
        Displaying {data.length} records from the live NeonDB dataset.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border px-2 py-1">Property</th>
              <th className="border px-2 py-1">Submarket</th>
              <th className="border px-2 py-1">Type</th>
              <th className="border px-2 py-1">Year</th>
              <th className="border px-2 py-1">Quarter</th>
              <th className="border px-2 py-1">Metric</th>
              <th className="border px-2 py-1">Value</th>
              <th className="border px-2 py-1">Unit</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{row.property}</td>
                <td className="border px-2 py-1">{row.submarket}</td>
                <td className="border px-2 py-1">{row.transaction_type}</td>
                <td className="border px-2 py-1">{row.transaction_year}</td>
                <td className="border px-2 py-1">{row.transaction_quarter}</td>
                <td className="border px-2 py-1">{row.canonical_name}</td>
                <td className="border px-2 py-1">{row.value}</td>
                <td className="border px-2 py-1">{row.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
