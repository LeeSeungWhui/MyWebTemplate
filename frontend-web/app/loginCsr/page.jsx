/**
 * Login CSR page
 */
import Client from './view';
import { CSR_ENTRY_PROPS } from './initData';

export const dynamic = 'force-static';

export default function Page() {
  return <Client {...CSR_ENTRY_PROPS} />;
}
