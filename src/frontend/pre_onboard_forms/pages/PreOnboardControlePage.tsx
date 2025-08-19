import PreOnboardForm from '../shared/PreOnboardForm'
import { planConfigs } from '../configs/planConfigs'

export default function PreOnboardControlePage() {
  return <PreOnboardForm planConfig={planConfigs.controle} />
}