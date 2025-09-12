import PropsTable from './PropsTable';

const DocSection = ({ id, title, description, component, children }) => {
    return (
        <section id={id} className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">{title}</h2>
            {description && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">설명</h4>
                    <div className="text-sm text-gray-600">
                        {description}
                    </div>
                </div>
            )}
            {component && <PropsTable component={component} />}
            {children}
        </section>
    );
};

export default DocSection; 