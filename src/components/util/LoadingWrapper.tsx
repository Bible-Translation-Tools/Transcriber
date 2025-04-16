import { DetaultTranscriptionPrompt } from "../../api/domain/TranscriptionRequest";
type LoadingWrapperProps = {
	error?: Error | null;
	isError?: boolean;
	isPending?: boolean;
	children: React.ReactNode;
	pendingComponent?: React.ReactNode;
	errComponent?: React.ReactNode;
};

export function LoadingWrapper({
	children,
	error,
	isError,
	isPending,
	pendingComponent = <DefaultPending />,
	errComponent = <DefaultError error={error} />,
}: LoadingWrapperProps) {
	if (isPending) {
		return pendingComponent;
	}
	if (isError) {
		return errComponent;
	}
	return <>{children}</>;
}
function DefaultPending() {
	return <span>Loading..</span>;
}
function DefaultError(props: { error: Error | null | undefined }) {
	if (!props.error) {
		return null;
	}
	console.error(props.error);
	return <span>Error: {props.error?.message}</span>;
}
