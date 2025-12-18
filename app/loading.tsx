export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
            <p className="text-muted text-sm tracking-wider animate-pulse">LOADING COCKPIT...</p>
        </div>
    );
}
