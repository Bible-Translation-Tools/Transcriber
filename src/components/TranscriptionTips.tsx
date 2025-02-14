function TranscriptionTips() {
    return (
        <div style={{ width: '492px', height: '100vh', padding: '40px', background: '#F2F2F2', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '40px' }}>
            <div style={{ color: '#0F2F4C', fontSize: '33.82px', fontFamily: 'Noto Sans', fontWeight: '500', lineHeight: '38.89px' }}>
                Tips
            </div>
            <TipSection title="Paper style and Layout" content="Use lined paper using a verse-by-verse format, written on one side only. Ensure text is straight, with consistent margins on all sides." />
            <TipSection title="Edits" content="Avoid crossing out mistakes. You can fix these once the document is done being transcribed." />
            <TipSection title="Text Style" content="Write in block letters with even spacing between letters and words. Do not use superscripts or subscripts." />
        </div>
    );
}

function TipSection({ title, content }: { title: string; content: string }) {  // Added type annotations
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ color: '#0F2F4C', fontSize: '26px', fontFamily: 'Noto Sans', fontWeight: '600', lineHeight: '29.90px' }}>
                {title}
            </div>
            <div style={{ color: '#516B86', fontSize: '20px', fontFamily: 'Noto Sans', fontWeight: '400', lineHeight: '40px' }}>
                {content}
            </div>
        </div>
    );
}


export default TranscriptionTips;