"use client";
/**
 * Login CSR client view
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import EasyObj from '@/app/lib/dataset/EasyObj';
import Input from '@/app/lib/component/Input';
import Button from '@/app/lib/component/Button';
import Checkbox from '@/app/lib/component/Checkbox';
import { csrJSON, postWithCsrf } from '@/app/lib/runtime/csr';
import { SESSION_PATH, createLoginFormModel } from './initData';

const sanitizeRedirect = (candidate) => {
  if (!candidate || typeof candidate !== 'string') return null;
  if (!candidate.startsWith('/')) return null;
  if (candidate.startsWith('//')) return null;
  if (/^https?:/i.test(candidate)) return null;
  return candidate;
};

export default function Client({ nextHint = null }) {
  const router = useRouter();
  const loginObj = EasyObj(useMemo(() => createLoginFormModel(), []));
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const payload = await csrJSON(SESSION_PATH);
        if (!alive) return;
        setSession(payload);
        if (payload?.result?.authenticated) {
          const target = sanitizeRedirect(nextHint) || '/';
          router.replace(target);
        }
      } catch (error) {
        console.error('세션 확인 실패:', error);
      } finally {
        if (alive) setChecking(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [nextHint, router]);

  const resetErrors = () => {
    loginObj.errors.email = '';
    loginObj.errors.password = '';
  };

  const validateForm = () => {
    resetErrors();
    let isValid = true;

    const email = String(loginObj.email || '').trim();
    const password = String(loginObj.password || '');

    loginObj.email = email;

    if (!email) {
      loginObj.errors.email = '이메일을 입력해주세요';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      loginObj.errors.email = '올바른 이메일 형식이 아닙니다';
      isValid = false;
    }

    if (!password) {
      loginObj.errors.password = '비밀번호를 입력해주세요';
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setPending(true);
    try {
      const response = await postWithCsrf('/api/v1/auth/login', {
        username: loginObj.email,
        password: loginObj.password,
        rememberMe: !!loginObj.rememberMe,
      });

      if (response?.status === 204) {
        const payload = await csrJSON(SESSION_PATH).catch(() => null);
        setSession(payload);
        const target = sanitizeRedirect(nextHint) || '/';
        router.replace(target);
      } else {
        const body = await response.json().catch(() => ({}));
        loginObj.errors.password = body?.message || '로그인에 실패했습니다';
      }
    } catch (error) {
      console.error(error);
      loginObj.errors.password = '로그인 중 오류가 발생했습니다';
    } finally {
      setPending(false);
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-3 text-gray-500">
          <span className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          <p className="text-sm">세션 확인 중...</p>
        </div>
      </main>
    );
  }

  if (session?.result?.authenticated) {
    return null;
  }

  const emailErrorId = loginObj.errors.email ? 'csr-login-email-error' : undefined;
  const passwordErrorId = loginObj.errors.password ? 'csr-login-password-error' : undefined;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="flex w-full max-w-5xl mx-4 shadow-xl rounded-2xl overflow-hidden bg-white">
        <aside className="hidden lg:flex w-2/5 bg-gradient-to-br from-indigo-600 to-indigo-500 text-white flex-col justify-center items-center p-12 space-y-4">
          <h1 className="text-3xl font-bold">웹페이지 템플릿</h1>
          <p className="text-sm text-indigo-100 text-center max-w-xs">
            CSR 전용 로그인 화면 예시로 EasyObj 상태와 클라이언트 데이터 흐름을 확인하세요.
          </p>
          <ul className="text-sm text-indigo-50 space-y-1 text-left w-full max-w-xs list-disc list-inside">
            <li>클라이언트 전용 세션 검사</li>
            <li>폼 검증 & 오류 메시지</li>
            <li>Tailwind 기반 반응형 레이아웃</li>
          </ul>
        </aside>

        <section className="w-full lg:w-3/5 p-10 md:p-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">로그인</h2>
            <p className="text-sm text-gray-600">계정 정보로 로그인하여 시작하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="csr-login-email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <div className="mt-2">
                <Input
                  id="csr-login-email"
                  type="email"
                  dataObj={loginObj}
                  dataKey="email"
                  placeholder="이메일을 입력하세요"
                  aria-describedby={emailErrorId}
                  error={loginObj.errors.email}
                />
                {loginObj.errors.email && (
                  <p id={emailErrorId} className="mt-2 text-sm text-red-600">
                    {loginObj.errors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="csr-login-password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="mt-2">
                <Input
                  id="csr-login-password"
                  type="password"
                  dataObj={loginObj}
                  dataKey="password"
                  placeholder="비밀번호를 입력하세요"
                  aria-describedby={passwordErrorId}
                  error={loginObj.errors.password}
                />
                {loginObj.errors.password && (
                  <p id={passwordErrorId} className="mt-2 text-sm text-red-600">
                    {loginObj.errors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Checkbox
                dataObj={loginObj}
                dataKey="rememberMe"
                label="로그인 상태 유지"
              />
              <Link href="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                비밀번호 찾기
              </Link>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" loading={pending}>
              로그인
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
