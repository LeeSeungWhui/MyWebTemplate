import logo from '@/assets/image/logo.svg';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="h-20 bg-white border-b border-gray-200 rounded-lg">
            <div className="w-full px-4 h-full flex items-center justify-between">
                <div className="flex items-center">
                    <Link to="/login">
                        <img src={logo} alt="Logo" className="cursor-pointer" />
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;