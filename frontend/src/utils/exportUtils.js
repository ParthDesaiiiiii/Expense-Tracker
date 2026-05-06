import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export function transactionsToCSV(transactions){
  const header = ['Date','Type','Category','Description','Amount']
  const rows = transactions.map(t => [t.date||'', t.type||'', t.category||'', (t.description||'').replace(/\n/g,' '), Number(t.amount||0).toFixed(2)])
  const csv = [header, ...rows].map(r => r.map(c => '"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n')
  return csv
}

export function downloadCSV(transactions, filename='report.csv'){
  const csv = transactionsToCSV(transactions)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadPDF(el, filename='report.pdf'){
  const doc = new jsPDF('p','pt','a4')
  const canvas = await html2canvas(el, { scale: 2 })
  const imgData = canvas.toDataURL('image/png')
  const imgProps = doc.getImageProperties(imgData)
  const pdfWidth = doc.internal.pageSize.getWidth()
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
  doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
  doc.save(filename)
}
