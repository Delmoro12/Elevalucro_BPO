import PreOnboardForm from '../shared/PreOnboardForm'
import { planConfigs } from '../configs/planConfigs'

export default function PreOnboardAvancadoPage() {
  return <PreOnboardForm planConfig={planConfigs.avancado} />
}