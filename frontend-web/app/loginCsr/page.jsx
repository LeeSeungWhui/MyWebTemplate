/**
 * Login CSR page
 */
import Client from './view';
import { CSR_ENTRY_PROPS } from './initData';

export const dynamic = 'force-static';

const Page = () => <Client {...CSR_ENTRY_PROPS} />;

export default Page;
