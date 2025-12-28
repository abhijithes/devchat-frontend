import { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";

function CodeMessage({ content }: { content: string }) {
    const codeRef = useRef<HTMLElement>(null);
    const lines = content.split("\n");

    useEffect(() => {
        if (codeRef.current) {
            Prism.highlightElement(codeRef.current);
        }
    }, [content]);

    return (
        <div className="max-w-full overflow-x-auto rounded-lg border border-[#30363d] bg-[#0d1117] text-sm">
            <div className="flex">
                {/* Line numbers */}
                <div className="select-none px-3 py-2 text-right text-[#6e7681] font-mono">
                    {lines.map((_, i) => (
                        <div key={i} className="leading-6">
                            {i + 1}
                        </div>
                    ))}
                </div>

                {/* Code */}
                <pre className="px-3 py-2 leading-6">
                    <code ref={codeRef} className="language-javascript font-mono whitespace-pre">
                        {content}
                    </code>
                </pre>
            </div>
        </div>
    );
}

export default CodeMessage;
