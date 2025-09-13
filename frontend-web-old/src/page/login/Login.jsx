import EasyObj from '@/app/lib/dataset/EasyObj';
import Button from '@/app/lib/component/Button';
import Input from '@/app/lib/component/Input';

const Login = () => {
    const loginObj = EasyObj({
        email: '',
        password: '',
        rememberMe: false,
        errors: {
            email: '',
            password: ''
        }
    });

    const validateForm = () => {
        let isValid = true;
        loginObj.errors.email = '';
        loginObj.errors.password = '';

        if (!loginObj.email) {
            loginObj.errors.email = '이메일을 입력해주세요';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(loginObj.email)) {
            loginObj.errors.email = '올바른 이메일 형식이 아닙니다';
            isValid = false;
        }

        if (!loginObj.password) {
            loginObj.errors.password = '비밀번호를 입력해주세요';
            isValid = false;
        }

        return isValid;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            console.log('로그인 시도:', loginObj.email, loginObj.password);
        } catch (error) {
            console.error('로그인 실패:', error);
        }
    };

    return (
        <div className="w-full flex-1 flex items-center justify-center">
            <div className="flex w-full max-w-4xl mx-4 shadow-lg rounded-lg overflow-hidden">
                {/* 왼쪽: 브랜딩 섹션 */}
                <div className="hidden md:flex w-2/4 bg-blue-600 flex-col justify-center items-center text-white p-8">
                    <h1 className="text-2xl font-bold mb-4">웹페이지템플릿</h1>
                    <p className="text-sm mb-6 text-center">
                        샘플로그인페이지
                    </p>
                    <div className="text-sm text-blue-100">
                        • 샘플1<br />
                        • 샘플2<br />
                        • 샘플3<br />
                    </div>
                </div>

                {/* 오른쪽: 로그인 폼 */}
                <div className="w-full md:w-2/4 bg-white p-20">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인</h2>
                        <p className="text-sm text-gray-600">계정에 접속하여 시작하세요</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">이메일</label>
                            <div className="mt-1">
                                <Input
                                    type="email"
                                    dataObj={loginObj}
                                    dataKey="email"
                                    placeholder="이메일을 입력하세요"
                                    error={loginObj.errors.email}
                                />
                                {loginObj.errors.email &&
                                    <p className="mt-2 text-sm text-red-600">{loginObj.errors.email}</p>
                                }
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">비밀번호</label>
                            <div className="mt-1">
                                <Input
                                    type="password"
                                    dataObj={loginObj}
                                    dataKey="password"
                                    placeholder="비밀번호를 입력하세요"
                                    error={loginObj.errors.password}
                                />
                                {loginObj.errors.password &&
                                    <p className="mt-2 text-sm text-red-600">{loginObj.errors.password}</p>
                                }
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="rememberMe"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    checked={loginObj.rememberMe}
                                    onChange={e => loginObj.rememberMe = e.target.checked}
                                />
                                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                                    로그인 상태 유지
                                </label>
                            </div>
                            <div className="text-sm">
                                <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                                    비밀번호 찾기
                                </a>
                            </div>
                        </div>

                        <Button type="submit" variant="primary" className="w-full">
                            로그인
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;