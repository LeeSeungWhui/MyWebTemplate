import { BrowserRouter } from 'react-router-dom';
import RouterConfig from '@/route/RouterConfig';
import { AppProvider } from '@/common/share/AppContext';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <RouterConfig />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;