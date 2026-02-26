/**
 * 파일명: Input.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 필터 및 마스크가 적용된 입력 컴포넌트
 */
import { useEffect, useState, useRef, forwardRef } from "react";
import Icon from "./Icon";
import {
  getBoundValue,
  setBoundValue,
  buildCtx,
  fireValueHandlers,
} from "../binding";
import { COMMON_COMPONENT_LANG_KO } from "@/app/common/i18n/lang.ko";

const MASK_TOKEN_RE = /[#Aa?*]/;

const toInputValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  return String(value);
};

/**
 * Input - 필터/마스크 지원 입력 컴포넌트
 * @date 2026-02-23
 */
const Input = forwardRef(
  (
    {
      dataObj,
      dataKey,
      type = "text",
      className = "",
      placeholder,
      onChange,
      onValueChange,
      value: propValue,
      defaultValue = "",
      error,
      filter,
      mask,
      maxDigits,
      maxDecimals,
      prefix,
      suffix,
      togglePassword,
      ...rest
    },
    ref
  ) => {
    const isBoundControlled = !!(dataObj && dataKey);
    const isPropControlled =
      !isBoundControlled && typeof propValue !== "undefined";
    const [showPassword, setShowPassword] = useState(false);
    const [draftValue, setDraftValue] = useState(undefined);
    const [innerValue, setInnerValue] = useState(
      () => propValue ?? defaultValue ?? ""
    );
    const composingRef = useRef(false);
    const baseStyle =
      "appearance-none block w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-offset-0";
    const HANGUL_RE = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/; // 한글 범위

    const states = {
      default: "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
      error: "border-red-300 focus:ring-red-500 focus:border-red-500",
    };
    const hasStringMask = typeof mask === "string" && mask.trim().length > 0;
    const hasFunctionMask = typeof mask === "function";

    const applyMask = (value, maskPattern) => {
      // 마스크에서 실제 입력 가능한 문자 개수 계산
      const maxLength = maskPattern.replace(/[^#A-Za-z?*]/g, "").length;

      // 마스크 패턴에 맞지 않는 문자 먼저 제거
      let cleanValue = "";
      let maskPosition = 0;

      for (let i = 0; i < value.length && cleanValue.length < maxLength; i++) {
        // 마스크의 다음 입력 위치 찾기
        while (
          maskPosition < maskPattern.length &&
          !MASK_TOKEN_RE.test(maskPattern[maskPosition])
        ) {
          maskPosition++;
        }

        if (maskPosition >= maskPattern.length) break;

        if (maskPattern[maskPosition] === "#" && /\d/.test(value[i])) {
          cleanValue += value[i];
          maskPosition++;
        } else if (maskPattern[maskPosition] === "A" && /[a-zA-Z]/.test(value[i])) {
          cleanValue += value[i].toUpperCase();
          maskPosition++;
        } else if (maskPattern[maskPosition] === "a" && /[a-zA-Z]/.test(value[i])) {
          cleanValue += value[i].toLowerCase();
          maskPosition++;
        } else if (maskPattern[maskPosition] === "?" && /[a-zA-Z]/.test(value[i])) {
          cleanValue += value[i];
          maskPosition++;
        } else if (maskPattern[maskPosition] === "*") {
          cleanValue += value[i];
          maskPosition++;
        }
      }

      // 마스크 적용
      let result = "";
      let valueIndex = 0;

      for (
        let i = 0;
        i < maskPattern.length && valueIndex < cleanValue.length;
        i++
      ) {
        if (MASK_TOKEN_RE.test(maskPattern[i])) {
          result += cleanValue[valueIndex];
          valueIndex++;
        } else {
          result += maskPattern[i];
        }
      }

      return result;
    };

    useEffect(() => {
      if (!isPropControlled) return;
      setDraftValue(undefined);
    }, [isPropControlled, propValue]);

    const commitValue = (raw) => {
      let value = raw;
      if (filter) {
        const regex = new RegExp(`[^${filter}]`, "g");
        value = value.replace(regex, "");
      }
      if (hasFunctionMask) {
        value = toInputValue(mask(value));
      } else if (hasStringMask) {
        value = applyMask(value, mask);
      }
      if (
        type === "number" &&
        (maxDigits !== undefined || maxDecimals !== undefined)
      ) {
        // 정규식 이스케이프 정리
        const regex = new RegExp(
          `^-?\\d{0,${maxDigits ?? 2}}(\\.\\d{0,${maxDecimals ?? 2}})?$`
        );
        if (!regex.test(value)) {
          return; // reject invalid numeric pattern
        }
      }
      if (isBoundControlled) {
        setBoundValue(dataObj, dataKey, value);
      } else if (isPropControlled) {
        // prop 기반 controlled 입력은 부모 상태를 단일 소스로 유지한다.
      } else {
        setInnerValue(value);
      }
      setDraftValue(undefined);
      return value;
    };

    // 조합 중 임시 문자열 허용 여부 판단
    const isAllowedDraft = (draftText) => {
      if (filter) {
        const allowHangulDraft = /가-힣/.test(filter);
        const cls = allowHangulDraft ? `${filter}ㄱ-ㅎㅏ-ㅣ가-힣` : filter;
        if (!new RegExp(`^[${cls}]*$`).test(draftText)) return false;
      }
      if (hasStringMask) {
        if (HANGUL_RE.test(draftText)) return false; // 마스크 존재 시 한글 금지 가정
      }
      if (type === "number" && !/^[0-9.\-]*$/.test(draftText)) return false;
      return true;
    };
    const getCommitted = () =>
      isBoundControlled
        ? getBoundValue(dataObj, dataKey) ?? ""
        : isPropControlled
          ? propValue ?? ""
          : innerValue ?? "";

    // 마스크/필터/number가 있을 때 입력 직전 1차 필터링
    const handleBeforeInput = (event) => {
      if (!filter && !hasStringMask && type !== "number") return;
      const data = event.data;

      // NOTE: 조합(insertCompositionText)은 onCompositionUpdate/Change에서 정밀 처리한다.
      // beforeinput 단계에서는 data가 없을 수 있으므로 무조건 차단하지 않는다.

      if (typeof data === "string" && data.length > 0) {
        // filter 기반 허용 목록
        if (filter) {
          const allow = new RegExp(`^[${filter}]+$`);
          if (!allow.test(data)) {
            event.preventDefault();
            return;
          }
        }

        // 마스크: 다음 슬롯 토큰을 계산해 토큰 유형과 입력 문자를 즉시 검증
        if (hasStringMask) {
          const isDigit = (inputChar) => /\d/.test(inputChar);
          const isAlpha = (inputChar) => /[a-zA-Z]/.test(inputChar);
          const nextMaskToken = (maskPattern, rawText) => {
            let maskPos = 0;
            // consume existing raw according to mask
            for (let i = 0; i < rawText.length; i++) {
              while (maskPos < maskPattern.length && !MASK_TOKEN_RE.test(maskPattern[maskPos])) {
                maskPos++;
              }
              if (maskPos >= maskPattern.length) break;
              let ok = false;
              if (maskPattern[maskPos] === "#") ok = isDigit(rawText[i]);
              else if (
                maskPattern[maskPos] === "A" ||
                maskPattern[maskPos] === "a" ||
                maskPattern[maskPos] === "?"
              ) {
                ok = isAlpha(rawText[i]);
              }
              else if (maskPattern[maskPos] === "*") ok = true;
              if (ok) maskPos++;
            }
            while (maskPos < maskPattern.length && !MASK_TOKEN_RE.test(maskPattern[maskPos])) {
              maskPos++;
            }
            return maskPos < maskPattern.length ? maskPattern[maskPos] : null;
          };
          const token = nextMaskToken(mask, event.currentTarget.value || "");
          if (token) {
            let ok = true;
            if (token === "#") ok = /\d/.test(data[0]);
            else if (token === "A" || token === "a" || token === "?")
              ok = /[a-zA-Z]/.test(data[0]);
            else if (token === "*") ok = true;
            if (!ok) {
              event.preventDefault();
              return;
            }
          }
        }

        // 숫자 타입: 숫자/점/부호만 허용 (붙여넣기 포함)
        if (type === "number") {
          if (!/^[0-9.\-]+$/.test(data)) {
            event.preventDefault();
            return;
          }
        }
      }
    };

    /**
     * handleKeyDown - 키다운 단계에서 허용되지 않은 문자를 즉시 차단
     * @date 2025-02-14
     */
    const handleKeyDown = (event) => {
      if (!filter && !hasStringMask && type !== "number") return;
      if (event.isComposing || event.nativeEvent.isComposing) return;
      const key = event.key;
      if (key.length !== 1) return; // 제어 키는 허용

      if (filter) {
        const allow = new RegExp(`^[${filter}]+$`);
        if (!allow.test(key)) {
          event.preventDefault();
          return;
        }
      }

      if (hasStringMask) {
        const hangul = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/;
        if (hangul.test(key)) {
          event.preventDefault();
          return;
        }
      }

      if (type === "number") {
        if (!/^[0-9.\-]$/.test(key)) {
          event.preventDefault();
          return;
        }
      }
    };

    const handleChange = (event) => {
      const composing = event.nativeEvent.isComposing || composingRef.current;
      const raw = event.target.value;

      // IME(한글 등) 조합 중에는 value를 커밋하지 않는다.
      // 조합 중에 커밋/DOM value를 만지면 자모 분리 현상이 발생할 수 있다.
      if (composing) {
        if (filter || hasStringMask || type === "number") {
          // 제약이 있을 때, 허용되지 않는 조합 문자열은 화면에 반영하지 않음
          if (!isAllowedDraft(raw)) {
            const last = getCommitted();
            if (event.target.value !== last) event.target.value = last; // DOM 즉시 되돌리기
            return;
          }
        }
        setDraftValue(raw);
        return;
      }

      const committed = commitValue(raw);
      if (typeof committed !== "undefined") {
        try {
          event.target.value = committed;
        } catch (_) {
          /* ignore readonly target */
        }
      }
      const ctx = buildCtx({
        dataKey,
        dataObj,
        source: "user",
        valid: null,
        dirty: true,
      });
      fireValueHandlers({
        onChange,
        onValueChange,
        value: committed,
        ctx,
        event,
      });
    };

    const inputClass = `
        ${baseStyle}
        ${error ? states.error : states.default}
        ${className}
    `.trim();

    return (
      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {prefix}
          </div>
        )}
        <input
          ref={ref}
          type={
            togglePassword
              ? showPassword
                ? "text"
                : "password"
              : type === "number"
              ? "text"
              : type
          }
          pattern={type === "number" ? "[0-9]*" : undefined}
          inputMode={type === "number" ? "decimal" : undefined}
          placeholder={placeholder || (hasStringMask ? mask : undefined)}
          value={draftValue ?? getCommitted()}
          onKeyDown={handleKeyDown}
          onBeforeInput={handleBeforeInput}
          onChange={handleChange}
          onCompositionStart={() => {
            composingRef.current = true;
          }}
          onCompositionUpdate={(event) => {
            if (filter || hasStringMask || type === "number") {
              const current = event.currentTarget.value;
              const next = current; // 최신 값은 이미 브라우저가 합성 반영한 상태
              if (!isAllowedDraft(next)) {
                event.preventDefault?.();
                const last = getCommitted();
                if (event.currentTarget.value !== last)
                  event.currentTarget.value = last;
              }
            }
          }}
          onCompositionEnd={(event) => {
            composingRef.current = false;
            const committed = commitValue(event.target.value);
            if (typeof committed !== "undefined") {
              try {
                event.target.value = committed;
              } catch (_) {
                /* ignore */
              }
            }
            const ctx = buildCtx({
              dataKey,
              dataObj,
              source: "user",
              valid: null,
              dirty: true,
            });
            fireValueHandlers({
              onChange,
              onValueChange,
              value: committed,
              ctx,
              event,
            });
          }}
          onBlur={(event) => {
            // Ensure final sanitize on blur in case some IME didn't fire compositionend properly
            const committed = commitValue(event.target.value);
            if (typeof committed !== "undefined") {
              try {
                event.target.value = committed;
              } catch (_) {
                /* ignore */
              }
            }
            const ctx = buildCtx({
              dataKey,
              dataObj,
              source: "user",
              valid: null,
              dirty: true,
            });
            fireValueHandlers({
              onChange,
              onValueChange,
              value: committed,
              ctx,
              event,
            });
          }}
          className={`
                    ${inputClass}
                    ${prefix ? "pl-10" : ""}
                    ${suffix ? "pr-10" : ""}
                    ${togglePassword ? "pr-10" : ""}
                `}
          aria-invalid={!!error}
          {...rest}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {suffix}
          </div>
        )}
        {togglePassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            aria-label={
              showPassword
                ? COMMON_COMPONENT_LANG_KO.input.hidePassword
                : COMMON_COMPONENT_LANG_KO.input.showPassword
            }
            aria-pressed={showPassword}
          >
            <Icon
              icon={showPassword ? "ri:RiEyeLine" : "ri:RiEyeOffLine"}
              className="w-5 h-5 text-gray-400"
            />
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

/**
 * @description Input export를 노출한다.
 */
export default Input;
