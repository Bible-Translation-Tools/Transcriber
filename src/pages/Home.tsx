import { useEffect } from "react";

function Home() {
	// This is needed cause wrangler's serve fallback immediately services index.html which resolves to /, which if we have a route for, resolves to that, so can't run server logic on /.
	useEffect(() => {
		window.location.href = "/login";
	}, []);
	return null;
}

export default Home;
