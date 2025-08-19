import PreOnboardForm from '../shared/PreOnboardForm'
import { planConfigs } from '../configs/planConfigs'

export default function PreOnboardGerencialPage() {
  return <PreOnboardForm planConfig={planConfigs.gerencial} />
}