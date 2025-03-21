import { CSRF_STATE_KEY } from "@src/constants";

function Home() {

    const scopes = encodeURIComponent(
        "openid email profile read:user read:repository write:repository",
    );
    
    function generateOAuthState(length = 32): string {
        const existingKey = sessionStorage.getItem(CSRF_STATE_KEY);
        if (existingKey) {
            return existingKey;
        }
        const state = [...crypto.getRandomValues(new Uint8Array(length))]
            .map((b) => b.toString(36).padStart(2, "0"))
            .join("")
            .slice(0, length);
        sessionStorage.setItem(CSRF_STATE_KEY, state);
        return state;
    }

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-xl w-96">
                <div className="flex justify-center mb-6">
                    {/* <img
                        src=""
                        className="logo"
                        alt="WACS Logo"
                    /> */}
                </div>
                <h2 className="text-2xl font-semibold mb-4">Transcriber Login</h2>
                <p className="mb-6">Please log in using your WA Content Services (WACS) account.</p>
                <a
                    className="login-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex flex-row items-center gap-2 justify-center"
                    href={`${import.meta.env.VITE_SSO_BASE_URL
                        }/login/oauth/authorize?client_id=${import.meta.env.VITE_SSO_CLIENT_ID
                        }&redirect_uri=${import.meta.env.VITE_SSO_REDIRECT_URL
                        }&response_type=code&scope=${scopes}&state=${generateOAuthState()}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 150 150" width="32" height="32"><path fill="#fff" d="M0 0h150v149.481H0z"/><path fill="#726658" d="M66.542 114.481h-17.67L82.791 35h17.67l-33.92 79.481ZM135 35h-17.671l-33.895 79.481h17.67L135 35Z"/><path fill="#B85659" d="M32.647 35H15l33.896 79.481h17.646L32.647 35Z"/><path fill="#82A93F" d="M67.217 35H49.578l33.896 79.481h17.646L67.217 35Z"/><path fill="#FAA83C" d="M100.43 35H82.791l33.896 79.481h17.646L100.43 35Z"/></svg>
                    Login with WACS
                </a>
            </div>
        </div>
    );
};

export default Home;
