import type { Report } from '../types'

export const mockReports: Report[] = [
  { id: 'RPT-1', name: 'Energy Consumption Report', period: 'Aug 2026', generatedAt: '2026-09-01', status: 'ready', fileType: 'PDF' },
  { id: 'RPT-2', name: 'Carbon Emissions Report', period: 'Aug 2026', generatedAt: '2026-09-01', status: 'ready', fileType: 'PDF' },
  { id: 'RPT-3', name: 'ESG Environmental Summary', period: 'Q3 2026', generatedAt: '2026-09-10', status: 'ready', fileType: 'PDF' },
  { id: 'RPT-4', name: 'Factory Efficiency Report', period: 'Aug 2026', generatedAt: '2026-09-01', status: 'ready', fileType: 'XLSX' },
  { id: 'RPT-5', name: 'Energy Consumption Report', period: 'Sep 2026', generatedAt: '', status: 'generating', fileType: 'PDF' },
  { id: 'RPT-6', name: 'ESG Environmental Summary', period: 'Q4 2026', generatedAt: '', status: 'scheduled', fileType: 'PDF' },
]
