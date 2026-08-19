"use client";

import { useState } from "react";
import {
    Image as ImageIcon,
    Video,
    CalendarDays,
    Smile,
    MoreHorizontal,
    ThumbsUp,
    MessageCircle,
    Send,
} from "lucide-react";

interface PostComment {
    id: number;
    author: string;
    avatar: string;
    text: string;
    time: string;
    likes: number;
    replies?: PostComment[];
}

interface Post {
    id: number;
    author: string;
    role: string;
    avatar: string;
    time: string;
    text: string;
    image?: string;
    likes: number;
    comments: PostComment[];
    shares: number;
}

const MOCK_POSTS: Post[] = [
    {
        id: 1,
        author: "Yacine Benmoussa",
        role: "Travel Enthusiast",
        avatar: "https://placehold.net/avatar-5.png",
        time: "2h",
        text: "Just explored the stunning cliffs of Jijel! The Mediterranean coastline here is absolutely breathtaking. Highly recommend visiting Cap Carbonara for the sunset.",
        image: "https://placehold.net/800x400.png",
        likes: 56,
        comments: [
            {
                id: 101,
                author: "Amina Khaled",
                avatar: "https://placehold.net/avatar-2.png",
                text: "Looks amazing! Adding this to my bucket list.",
                time: "1h",
                likes: 3,
                replies: [
                    {
                        id: 102,
                        author: "Yacine Benmoussa",
                        avatar: "https://placehold.net/avatar-5.png",
                        text: "You should definitely go in spring, the weather is perfect!",
                        time: "45m",
                        likes: 1,
                    },
                ],
            },
            {
                id: 103,
                author: "Omar Saidi",
                avatar: "https://placehold.net/avatar-3.png",
                text: "I was there last summer, truly beautiful.",
                time: "30m",
                likes: 0,
            },
        ],
        shares: 3,
    },
    {
        id: 2,
        author: "Sara Hamidi",
        role: "Local Guide",
        avatar: "https://placehold.net/avatar-4.png",
        time: "5h",
        text: "Discovered a hidden gem in Tizi Ouzou — a traditional restaurant with the best couscous I've ever had. The hospitality was incredible.",
        likes: 32,
        comments: [],
        shares: 1,
    },
];

const ACTION_BUTTONS = [
    { icon: ImageIcon, label: "Photo" },
    { icon: Video, label: "Video" },
    { icon: CalendarDays, label: "Event" },
    { icon: Smile, label: "Feeling" },
];

export default function PostsTab({
    userName,
    userAvatar,
}: {
    userName: string;
    userAvatar: string;
}) {
    const [posts, setPosts] = useState(MOCK_POSTS);
    const [composerText, setComposerText] = useState("");
    const [commentInputs, setCommentInputs] = useState<
        Record<number, string>
    >({});

    const handlePost = () => {
        if (!composerText.trim()) return;
        const newPost: Post = {
            id: Date.now(),
            author: userName,
            role: "Traveler",
            avatar: userAvatar,
            time: "Just now",
            text: composerText,
            likes: 0,
            comments: [],
            shares: 0,
        };
        setPosts([newPost, ...posts]);
        setComposerText("");
    };

    const handleLike = (postId: number) => {
        setPosts(
            posts.map((p) =>
                p.id === postId ? { ...p, likes: p.likes + 1 } : p,
            ),
        );
    };

    const handleComment = (postId: number) => {
        const text = commentInputs[postId];
        if (!text?.trim()) return;
        const newComment: PostComment = {
            id: Date.now(),
            author: userName,
            avatar: userAvatar,
            text,
            time: "Just now",
            likes: 0,
        };
        setPosts(
            posts.map((p) =>
                p.id === postId
                    ? { ...p, comments: [...p.comments, newComment] }
                    : p,
            ),
        );
        setCommentInputs({ ...commentInputs, [postId]: "" });
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Composer */}
            <div className="rounded-xl border border-(--border) bg-white p-4">
                <div className="flex items-center gap-3">
                    <img
                        src={userAvatar}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                    />
                    <input
                        type="text"
                        placeholder="Share your thoughts..."
                        value={composerText}
                        onChange={(e) => setComposerText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handlePost()}
                        className="flex-1 rounded-full border border-(--border) bg-(--dim-bg) px-4 py-2.5 text-sm outline-none focus:border-(--primary-clr)"
                    />
                </div>
                <div className="mt-3 flex items-center gap-1 border-t border-(--border) pt-3">
                    {ACTION_BUTTONS.map((btn) => (
                        <button
                            key={btn.label}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--light-fg)] transition-colors hover:bg-(--dim-bg)"
                        >
                            <btn.icon size={16} />
                            {btn.label}
                        </button>
                    ))}
                    <button className="ml-auto rounded-lg p-1.5 text-[var(--light-fg)] transition-colors hover:bg-(--dim-bg)">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            {/* Feed */}
            {posts.map((post) => (
                <div
                    key={post.id}
                    className="rounded-xl border border-(--border) bg-white p-4"
                >
                    {/* Post header */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src={post.avatar}
                                alt=""
                                className="h-10 w-10 rounded-full object-cover"
                            />
                            <div>
                                <p className="text-sm font-bold">
                                    {post.author}
                                </p>
                                <p className="text-xs text-[var(--light-fg)]">
                                    {post.role} · {post.time}
                                </p>
                            </div>
                        </div>
                        <button className="rounded-lg p-1 text-[var(--light-fg)] hover:bg-(--dim-bg)">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>

                    {/* Post text */}
                    <p className="mt-3 text-sm leading-relaxed">{post.text}</p>

                    {/* Post image */}
                    {post.image && (
                        <img
                            src={post.image}
                            alt=""
                            className="mt-3 w-full rounded-xl object-cover"
                        />
                    )}

                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-6 border-t border-(--border) pt-3">
                        <button
                            onClick={() => handleLike(post.id)}
                            className="flex items-center gap-1.5 text-xs font-medium text-[var(--light-fg)] transition-colors hover:text-(--primary-clr)"
                        >
                            <ThumbsUp size={14} />
                            Liked ({post.likes})
                        </button>
                        <button className="flex items-center gap-1.5 text-xs font-medium text-[var(--light-fg)] transition-colors hover:text-(--primary-clr)">
                            <MessageCircle size={14} />
                            Comments ({post.comments.length})
                        </button>
                        <button className="ml-auto flex items-center gap-1.5 text-xs font-medium text-[var(--light-fg)] transition-colors hover:text-(--primary-clr)">
                            <Send size={14} />
                            Share ({post.shares})
                        </button>
                    </div>

                    {/* Comment input */}
                    <div className="mt-3 flex items-center gap-2">
                        <img
                            src={userAvatar}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                        />
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentInputs[post.id] ?? ""}
                            onChange={(e) =>
                                setCommentInputs({
                                    ...commentInputs,
                                    [post.id]: e.target.value,
                                })
                            }
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleComment(post.id)
                            }
                            className="flex-1 rounded-full border border-(--border) bg-(--dim-bg) px-3 py-2 text-xs outline-none focus:border-(--primary-clr)"
                        />
                    </div>

                    {/* Comments */}
                    {post.comments.length > 0 && (
                        <div className="mt-3 flex flex-col gap-2.5 border-t border-(--border) pt-3">
                            {post.comments.map((c) => (
                                <div key={c.id} className="flex gap-2">
                                    <img
                                        src={c.avatar}
                                        alt=""
                                        className="h-7 w-7 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <div className="rounded-lg bg-(--dim-bg) px-3 py-2">
                                            <div className="flex items-baseline justify-between">
                                                <span className="text-xs font-bold">
                                                    {c.author}
                                                </span>
                                                <span className="text-[10px] text-[var(--light-fg)]">
                                                    {c.time}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-xs">
                                                {c.text}
                                            </p>
                                        </div>
                                        <div className="mt-1 flex items-center gap-3 text-[10px] text-[var(--light-fg)]">
                                            <button className="font-medium hover:text-(--primary-clr)">
                                                Like ({c.likes})
                                            </button>
                                            <button className="font-medium hover:text-(--primary-clr)">
                                                Reply
                                            </button>
                                        </div>
                                        {/* Nested replies */}
                                        {c.replies?.map((r) => (
                                            <div
                                                key={r.id}
                                                className="ml-4 mt-2 flex gap-2"
                                            >
                                                <img
                                                    src={r.avatar}
                                                    alt=""
                                                    className="h-6 w-6 rounded-full object-cover"
                                                />
                                                <div className="flex-1">
                                                    <div className="rounded-lg bg-(--dim-bg) px-3 py-2">
                                                        <div className="flex items-baseline justify-between">
                                                            <span className="text-[11px] font-bold">
                                                                {r.author}
                                                            </span>
                                                            <span className="text-[10px] text-[var(--light-fg)]">
                                                                {r.time}
                                                            </span>
                                                        </div>
                                                        <p className="mt-0.5 text-[11px]">
                                                            {r.text}
                                                        </p>
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-3 text-[10px] text-[var(--light-fg)]">
                                                        <button className="font-medium hover:text-(--primary-clr)">
                                                            Like ({r.likes})
                                                        </button>
                                                        <button className="font-medium hover:text-(--primary-clr)">
                                                            Reply
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
