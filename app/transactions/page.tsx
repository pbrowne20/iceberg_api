'use client'

import { useState } from 'react'
import { track } from '@vercel/analytics'

export default function TransactionsConsole() {
  const [transactionType, setTransactionType] = useState('')
  const [year, setYear] = useState('')
  const [ticker, setTicker] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table')

  const handleQuery = async () => {
    track('Run Query Clicked', {
    transactionType,
    year,
    ticker,
    propertyType,
  })
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const params = new URLSearchParams()
      if (transactionType) params.append('transaction_type', transactionType)
      if (year && year !== 'ALL') params.append('year', year)
      if (ticker) params.append('ticker', ticker)
      if (propertyType && propertyType !== 'ALL')
        params.append('property_type', propertyType)

      const res = await fetch(`/api/transactions?${params.toString()}`)
      if (!res.ok) throw new Error(`API returned ${res.status}`)
      const data = await res.json()
      setResponse(data)
    } catch (err: any) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = () => {
    track('Download CSV Clicked', {
      rowCount: response?.rows?.length || 0,
    })    
    if (!response || !response.rows?.length) return
    const rows = response.rows
    const header = Object.keys(rows[0]).join(',')
    const csvRows = rows.map((r: any) =>
      Object.values(r)
        .map((v) => `"${v ?? ''}"`)
        .join(',')
    )
    const csv = [header, ...csvRows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'iceberg_transactions.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Hide these columns from Table View
  const hiddenColumns = [
    'iceberg_property_id',
    'iceberg_market_id',
    'iceberg_submarket_id',
    'iceberg_metric_code',
    'submarket',
    'raw_metric_name',
    'iceberg_metric_category',
    'iceberg_metric_sub_category',
  ]

  // Year dropdown options (2000–2025 + ALL)
  const years = ['ALL', ...Array.from({ length: 26 }, (_, i) => (2000 + i).toString())]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-sm rounded-xl p-6 border border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800 mb-5">
          ICEBERG Data API Query Console
        </h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Query Field
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value="">All</option>
              <option value="ACQUISITION">Acquisition</option>
              <option value="DISPOSITION">Disposition</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y === 'ALL' ? 'All Years' : y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Ticker
            </label>
            <select
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value="">All</option>
              <option value="SLG">SLG</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value="ALL">All</option>
              <option value="OFFICE">Office</option>
              <option value="RETAIL">Retail</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 mb-5">
          <button
            onClick={handleQuery}
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            {loading ? 'Running...' : 'Run Query'}
          </button>

          {response?.rows?.length > 0 && (
            <>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 text-sm rounded-md border ${
                  viewMode === 'table'
                    ? 'bg-blue-50 border-blue-400 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`px-4 py-2 text-sm rounded-md border ${
                  viewMode === 'json'
                    ? 'bg-blue-50 border-blue-400 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                JSON View
              </button>
              <button
                onClick={downloadCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
              >
                Download CSV
              </button>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-600 bg-red-50 border border-red-200 p-2 rounded-md text-sm">
            ⚠️ {error}
          </p>
        )}

        {/* Results */}
        {response && !loading && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-gray-600">
                Showing {response.rows?.length || 0} result
                {response.rows?.length !== 1 && 's'}
              </p>
              <p className="text-[10px] text-gray-400 italic">
                Data sourced live from iceberg.fact_transactions
              </p>
            </div>

            {viewMode === 'json' ? (
              <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-xs border">
                {JSON.stringify(response, null, 2)}
              </pre>
            ) : (
              <div className="overflow-x-auto max-h-[70vh] border border-gray-200 rounded-lg shadow-sm">
                <table className="table-auto min-w-full text-[12px] border-collapse">
                  <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                    <tr>
                      {Object.keys(response.rows[0] || {})
                        .filter((key) => !hiddenColumns.includes(key))
                        .map((key) => (
                          <th
                            key={key}
                            className="px-2 py-2 border-b border-gray-300 text-left font-semibold uppercase tracking-wide whitespace-nowrap"
                          >
                            {key.replaceAll('_', ' ')}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {response.rows.map((row: any, i: number) => (
                      <tr
                        key={i}
                        className={`${
                          i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-blue-50 transition-colors`}
                      >
                        {Object.entries(row)
                          .filter(([key]) => !hiddenColumns.includes(key))
                          .map(([key, val]: any, j: number) => (
                            <td
                              key={j}
                              className="px-2 py-1 border-b border-gray-200 text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]"
                              title={String(val)}
                            >
                              {key === 'Date'
                                ? new Date(val).toISOString().split('T')[0]
                                : val === null || val === undefined || val === ''
                                ? '—'
                                : String(val)}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
