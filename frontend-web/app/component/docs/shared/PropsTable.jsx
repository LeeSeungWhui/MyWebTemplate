"use client";
import { useEffect, useState } from 'react';

const extractProps = (component) => {
    // forwardRef 등 래핑된 컴포넌트 지원
    const target =
        typeof component === 'function'
            ? component
            : component?.render;

    if (!target) return [];

    const code = target.toString();
    const match = code.match(/\(\s*\{([^}]*)\}/);
    if (!match) return [];
    const paramSection = match[1];
    return paramSection
        .split(',')
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => {
            const [decl, comment = ''] = p.split('//').map(s => s.trim());
            if (decl.startsWith('...')) return null;
            const [namePart, defaultValue] = decl.split('=').map(s => s.trim());
            const name = namePart.replace(/^\.\.\./, '');
            return {
                name,
                default: defaultValue || '-',
                description: comment || '-'
            };
        })
        .filter(Boolean);
};

const PropsTable = ({ component }) => {
    // Defer extraction to client to avoid SSR/CSR toString() mismatch
    const [rows, setRows] = useState(null);
    useEffect(() => {
        setRows(extractProps(component));
    }, [component]);
    if (!rows || rows.length === 0) return null;

    return (
        <div className="mb-6 overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
                <thead>
                    <tr>
                        <th className="px-2 py-1 border">Prop</th>
                        <th className="px-2 py-1 border">설명</th>
                        <th className="px-2 py-1 border">기본값</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(({ name, description, default: def }) => (
                        <tr key={name}>
                            <td className="px-2 py-1 border font-mono">{name}</td>
                            <td className="px-2 py-1 border">{description}</td>
                            <td className="px-2 py-1 border">{def}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PropsTable;
