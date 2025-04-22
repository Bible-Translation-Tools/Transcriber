type ShowWhenProps = {
    when: boolean;
    children: React.ReactNode;
    fallback?: React.ReactNode;
};

export function ShowWhen({ when, children, fallback = null }: ShowWhenProps) {
    if (!when) {
        return <>{fallback}</>;
    }
    return <>{children}</>;
}
