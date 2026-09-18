import { PageShell } from '../components/layout/PageShell'
import { MachineTable } from '../components/machines/MachineTable'

export function MachinesPage() {
  return (
    <PageShell title="Machines" subtitle="Fleet status across all zones">
      <MachineTable />
    </PageShell>
  )
}
