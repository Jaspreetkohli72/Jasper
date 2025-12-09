import DateTimeDisplay from "./DateTimeDisplay";

export default function TopBar() {
    return (
        <header className="flex items-center justify-between px-3 pt-1 pb-2">
            <div className="flex flex-col gap-0.5">
                <DateTimeDisplay />
                <span className="text-[1.2rem] font-semibold text-text">Your money, at a glance</span>
            </div>
            <button className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[rgba(15,23,42,0.9)] border border-[rgba(148,163,184,0.35)] text-[0.8rem] cursor-pointer backdrop-blur-[18px]">
                <div className="w-[22px] h-[22px] rounded-full bg-[radial-gradient(circle_at_30%_0,#fff_0,#ff7ac3_40%,#020617_75%)] shadow-[0_0_12px_rgba(248,113,113,0.8)]"></div>
                <span className="text-gray-200">Jaspreet</span>
                <span className="w-[7px] h-[7px] rounded-full bg-green-500"></span>
            </button>
        </header>
    );
}
