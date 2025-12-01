import TelebuyFlow from '../TelebuyFlow';
import { suppliers } from '@/data/suppliers';

export default function TelebuyFlowExample() {
  return <TelebuyFlow supplier={suppliers[0]} quantity={10} />;
}
