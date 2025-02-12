function Introduction() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}> {/* Centered content */}
            <div style={{ textAlign: 'center', color: '#0F2F4C', fontSize: '44.05px', fontFamily: 'Noto Sans', fontWeight: '500', lineHeight: '50.66px' }}>
                Add some photos to get started.
            </div>
            <div style={{ textAlign: 'center', color: '#516B86', fontSize: '20px', fontFamily: 'Noto Sans', fontWeight: '400', lineHeight: '40px' }}>
                This tool converts handwritten documents into a digital format. While it can be very reliable, we recommend you review your results.
            </div>
        </div>
    );
}

export default Introduction;