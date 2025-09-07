import Header from './Header';
import Footer from './Footer';

const BasicLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Header />
            <main className="flex-1 flex">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default BasicLayout;