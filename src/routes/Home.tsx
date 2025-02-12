//import '../App.css'

import Introduction from "../components/Introduction";
import TranscriptionTips from "../components/TranscriptionTips";
import UploadImages from "../components/UploadImages";

function Home() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', height: '100vh' }}> {/* Added height for vertical centering */}
            <div style={{ width: '948px', height: '835px', padding: '40px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
                <Introduction />
                <UploadImages />
            </div>
            <TranscriptionTips />
        </div>
    );
}

export default Home;