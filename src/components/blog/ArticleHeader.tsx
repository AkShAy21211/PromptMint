import { Calendar, Clock } from "lucide-react";

interface ArticleHeaderProps {
    title: string;
    description: string;
    date: string;
    readingTime: string;
    tags?: string[];
}

export default function ArticleHeader({
    title,
    description,
    date,
    readingTime,
    tags = []
}: ArticleHeaderProps) {
    return (
        <header className="mb-12">
            <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground leading-[1.1]">
                {title}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                {description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground/60 border-y border-white/5 py-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={date}>{date}</time>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{readingTime} read</span>
                </div>
            </div>
        </header>
    );
}
