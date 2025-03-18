import "./App.css";
import { ImageProvider } from "./context/ImageContext"; // Import your context
import TranscriptionPage from "./routes/TranscriptionPage";

function App() {
	return (
		<>
			<ImageProvider>
				<TranscriptionPage />
			</ImageProvider>
		</>
	);
}

export default App;
