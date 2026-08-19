"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    ThumbsUp,
    ThumbsDown,
    MessageCircle,
    Send,
    Trash2,
    Image as ImageIcon,
    X,
    Share2,
    Search,
    MapPin,
    Building2,
    CalendarDays,
    Loader2,
} from "lucide-react";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Post, Comment, PaginatedResponse } from "@/types/social";
import { Media } from "@/types/map";
import { uploadToCloudinary } from "@/lib/upload";

function timeAgo(dateStr: string): string {
    const seconds = Math.floor(
        (Date.now() - new Date(dateStr).getTime()) / 1000,
    );
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d`;
    const months = Math.floor(days / 30);
    return `${months}mo`;
}

function userAvatar(user: {
    profile?: { media?: Media[] };
    name: string;
}): string {
    const avatar = user.profile?.media?.find(
        (m: Media) => m.collection === "profiles",
    );
    return avatar?.secure_url ?? "https://placehold.net/avatar-5.png";
}

// ── Share Modal ────────────────────────────────────────────
function ShareModal({
    onClose,
    onShareItem,
    onReShare,
}: {
    onClose: () => void;
    onShareItem: (
        type: string,
        id: number,
        name: string,
        description?: string,
    ) => void;
    onReShare: (postId: number) => void;
}) {
    const [tab, setTab] = useState<"items" | "posts">("items");
    const [searchType, setSearchType] = useState<
        "destination" | "business" | "event"
    >("destination");
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [postSearchQuery, setPostSearchQuery] = useState("");
    const [postResults, setPostResults] = useState<any[]>([]);
    const [searchingPosts, setSearchingPosts] = useState(false);

    useEffect(() => {
        if (tab !== "items" || !searchQuery.trim()) {
            setResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const endpoint =
                    searchType === "destination"
                        ? "destinations"
                        : searchType === "business"
                          ? "businesses"
                          : "events";
                const res = await axios.get(`/api/v1/${endpoint}`, {
                    params: { search: searchQuery, per_page: 8 },
                });
                setResults(res.data.data ?? res.data);
            } catch {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, searchType, tab]);

    useEffect(() => {
        if (tab !== "posts" || !postSearchQuery.trim()) {
            setPostResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearchingPosts(true);
            try {
                const res = await axios.get("/api/v1/search", {
                    params: { q: postSearchQuery, type: "posts" },
                });
                setPostResults(res.data.data ?? res.data);
            } catch {
                setPostResults([]);
            } finally {
                setSearchingPosts(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [postSearchQuery, tab]);

    const typeIcons = {
        destination: <MapPin size={16} className="text-green-500" />,
        business: <Building2 size={16} className="text-blue-500" />,
        event: <CalendarDays size={16} className="text-purple-500" />,
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="border-b border-(--border) p-4">
                    <h3 className="text-base font-bold">Share</h3>
                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={() => setTab("items")}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${tab === "items" ? "bg-(--primary-clr) text-white" : "bg-(--dim-bg) text-[var(--light-fg)] hover:bg-(--border)"}`}
                        >
                            Share Item
                        </button>
                        <button
                            onClick={() => setTab("posts")}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${tab === "posts" ? "bg-(--primary-clr) text-white" : "bg-(--dim-bg) text-[var(--light-fg)] hover:bg-(--border)"}`}
                        >
                            Re-share Post
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    {tab === "items" ? (
                        <>
                            <div className="mb-3 flex gap-2">
                                {(
                                    [
                                        "destination",
                                        "business",
                                        "event",
                                    ] as const
                                ).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setSearchType(type);
                                            setSearchQuery("");
                                        }}
                                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium capitalize transition-colors ${searchType === type ? "bg-(--primary-clr) text-white" : "bg-(--dim-bg) text-[var(--light-fg)]"}`}
                                    >
                                        {typeIcons[type]}
                                        {type}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <Search
                                    size={14}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--light-fg)]"
                                />
                                <input
                                    type="text"
                                    placeholder={`Search ${searchType}s...`}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-(--border) bg-(--dim-bg) py-2 pl-9 pr-3 text-sm outline-none focus:border-(--primary-clr)"
                                />
                            </div>
                            {searching && (
                                <div className="flex justify-center py-4">
                                    <Loader2
                                        size={20}
                                        className="animate-spin text-(--primary-clr)"
                                    />
                                </div>
                            )}
                            <div className="mt-2 max-h-60 overflow-y-auto">
                                {results.map((item: any) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            onShareItem(
                                                searchType,
                                                item.id,
                                                item.name,
                                                item.description,
                                            );
                                            onClose();
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-(--dim-bg)"
                                    >
                                        {typeIcons[searchType]}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {item.name}
                                            </p>
                                            {item.description && (
                                                <p className="truncate text-xs text-[var(--light-fg)]">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                                {searchQuery &&
                                    !searching &&
                                    results.length === 0 && (
                                        <p className="py-4 text-center text-xs text-[var(--light-fg)]">
                                            No results found.
                                        </p>
                                    )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="relative">
                                <Search
                                    size={14}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--light-fg)]"
                                />
                                <input
                                    type="text"
                                    placeholder="Search posts to re-share..."
                                    value={postSearchQuery}
                                    onChange={(e) =>
                                        setPostSearchQuery(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-(--border) bg-(--dim-bg) py-2 pl-9 pr-3 text-sm outline-none focus:border-(--primary-clr)"
                                />
                            </div>
                            {searchingPosts && (
                                <div className="flex justify-center py-4">
                                    <Loader2
                                        size={20}
                                        className="animate-spin text-(--primary-clr)"
                                    />
                                </div>
                            )}
                            <div className="mt-2 max-h-60 overflow-y-auto">
                                {postResults.map((post: any) => (
                                    <button
                                        key={post.id}
                                        onClick={() => {
                                            onReShare(post.id);
                                            onClose();
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-(--dim-bg)"
                                    >
                                        <Share2
                                            size={16}
                                            className="shrink-0 text-[var(--primary-clr)]"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-bold">
                                                {post.user?.name ?? "User"}
                                            </p>
                                            <p className="truncate text-xs text-[var(--light-fg)]">
                                                {post.body?.slice(0, 80) ??
                                                    "No text"}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                                {postSearchQuery &&
                                    !searchingPosts &&
                                    postResults.length === 0 && (
                                        <p className="py-4 text-center text-xs text-[var(--light-fg)]">
                                            No posts found.
                                        </p>
                                    )}
                            </div>
                        </>
                    )}
                </div>

                <div className="border-t border-(--border) p-4">
                    <button
                        onClick={onClose}
                        className="w-full rounded-lg border border-(--border) py-2 text-xs font-medium text-[var(--light-fg)] transition-colors hover:bg-(--dim-bg)"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Post Card ──────────────────────────────────────────────
function PostCard({
    post,
    currentUserId,
    onDelete,
    onCommentAdded,
    onLikeToggled,
    onReShareCreated,
}: {
    post: Post;
    currentUserId?: number;
    onDelete: (id: number) => void;
    onCommentAdded: (postId: number, comment: Comment) => void;
    onLikeToggled: (postId: number, likes: Post["likes"]) => void;
    onReShareCreated: (post: Post) => void;
}) {
    const [commentText, setCommentText] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const isOwner = currentUserId === post.user_id;
    const likesCount = post.likes.filter((l) => l.type === "like").length;
    const dislikesCount = post.likes.filter(
        (l) => l.type === "dislike",
    ).length;
    const myLike = post.likes.find((l) => l.user_id === currentUserId);

    const handleLike = async () => {
        try {
            const res = await axios.post(`/api/v1/posts/${post.id}/like`);
            onLikeToggled(
                post.id,
                res.data.liked !== false
                    ? [
                          ...post.likes.filter(
                              (l) => l.user_id !== currentUserId,
                          ),
                          {
                              id: Date.now(),
                              user_id: currentUserId!,
                              likeable_type: "App\\Models\\Post",
                              likeable_id: post.id,
                              type: "like" as const,
                          },
                      ]
                    : post.likes.filter(
                          (l) => l.user_id !== currentUserId,
                      ),
            );
        } catch {
            /* empty */
        }
    };

    const handleDislike = async () => {
        try {
            const res = await axios.post(
                `/api/v1/posts/${post.id}/dislike`,
            );
            onLikeToggled(
                post.id,
                res.data.disliked !== false
                    ? [
                          ...post.likes.filter(
                              (l) => l.user_id !== currentUserId,
                          ),
                          {
                              id: Date.now(),
                              user_id: currentUserId!,
                              likeable_type: "App\\Models\\Post",
                              likeable_id: post.id,
                              type: "dislike" as const,
                          },
                      ]
                    : post.likes.filter(
                          (l) => l.user_id !== currentUserId,
                      ),
            );
        } catch {
            /* empty */
        }
    };

    const handleComment = async () => {
        if (!commentText.trim() || submitting) return;
        setSubmitting(true);
        try {
            const res = await axios.post(
                `/api/v1/posts/${post.id}/comments`,
                { body: commentText },
            );
            onCommentAdded(post.id, res.data);
            setCommentText("");
            setShowComments(true);
        } catch {
            /* empty */
        } finally {
            setSubmitting(false);
        }
    };

    const handleReShare = async (postId: number) => {
        try {
            const res = await axios.post("/api/v1/posts", {
                parent_post_id: postId,
            });
            onReShareCreated(res.data);
        } catch {
            /* empty */
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/v1/posts/${post.id}`);
            onDelete(post.id);
        } catch {
            /* empty */
        }
    };

    return (
        <>
            <div className="rounded-xl border border-(--border) bg-white p-4">
                {/* Post header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src={userAvatar(post.user)}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                            <p className="text-sm font-bold">
                                {post.user.name}
                            </p>
                            <p className="text-xs text-[var(--light-fg)]">
                                {timeAgo(post.created_at)}
                            </p>
                        </div>
                    </div>
                    {isOwner && (
                        <button
                            onClick={handleDelete}
                            className="rounded-lg p-1 text-[var(--light-fg)] hover:bg-(--dim-bg) hover:text-red-500"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>

                {/* Post text */}
                {post.body && (
                    <p className="mt-3 text-sm leading-relaxed">
                        {post.body}
                    </p>
                )}

                {/* Post media */}
                {post.media?.length > 0 && (
                    <div className="mt-3 grid gap-2">
                        {post.media.map((m) =>
                            m.resource_type === "video" ? (
                                <video
                                    key={m.id}
                                    src={m.secure_url}
                                    controls
                                    className="w-full rounded-xl object-cover"
                                />
                            ) : (
                                <img
                                    key={m.id}
                                    src={m.secure_url}
                                    alt=""
                                    className="w-full rounded-xl object-cover"
                                />
                            ),
                        )}
                    </div>
                )}

                {/* Shared item */}
                {post.shareable && (
                    <div className="mt-3 rounded-lg border border-(--border) bg-(--dim-bg) p-3">
                        <p className="text-xs font-medium text-[var(--primary-clr)]">
                            Shared {post.shareable_type}
                        </p>
                        <p className="mt-1 text-sm font-bold">
                            {post.shareable.name ?? "Untitled"}
                        </p>
                        {post.shareable.description && (
                            <p className="mt-0.5 text-xs text-[var(--light-fg)] line-clamp-2">
                                {post.shareable.description}
                            </p>
                        )}
                    </div>
                )}

                {/* Shared post */}
                {post.parentPost && (
                    <div className="mt-3 rounded-lg border border-(--border) bg-(--dim-bg) p-3">
                        <div className="flex items-center gap-2">
                            <img
                                src={userAvatar(post.parentPost.user)}
                                alt=""
                                className="h-6 w-6 rounded-full object-cover"
                            />
                            <span className="text-xs font-bold">
                                {post.parentPost.user.name}
                            </span>
                            <span className="text-[10px] text-[var(--light-fg)]">
                                {timeAgo(post.parentPost.created_at)}
                            </span>
                        </div>
                        {post.parentPost.body && (
                            <p className="mt-1 text-xs leading-relaxed">
                                {post.parentPost.body}
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="mt-3 flex items-center gap-4 border-t border-(--border) pt-3">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1 text-xs font-medium transition-colors hover:text-(--primary-clr) ${myLike?.type === "like" ? "text-(--primary-clr)" : "text-[var(--light-fg)]"}`}
                    >
                        <ThumbsUp size={14} />
                        {likesCount > 0 && likesCount}
                    </button>
                    <button
                        onClick={handleDislike}
                        className={`flex items-center gap-1 text-xs font-medium transition-colors hover:text-red-500 ${myLike?.type === "dislike" ? "text-red-500" : "text-[var(--light-fg)]"}`}
                    >
                        <ThumbsDown size={14} />
                        {dislikesCount > 0 && dislikesCount}
                    </button>
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-1 text-xs font-medium text-[var(--light-fg)] transition-colors hover:text-(--primary-clr)"
                    >
                        <MessageCircle size={14} />
                        {post.comments.length > 0 && post.comments.length}
                    </button>
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center gap-1 text-xs font-medium text-[var(--light-fg)] transition-colors hover:text-(--primary-clr)"
                    >
                        <Share2 size={14} />
                    </button>
                </div>

                {/* Comment input */}
                {showComments && (
                    <div className="mt-3 flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleComment()
                            }
                            className="flex-1 rounded-full border border-(--border) bg-(--dim-bg) px-3 py-2 text-xs outline-none focus:border-(--primary-clr)"
                        />
                        <button
                            onClick={handleComment}
                            disabled={!commentText.trim() || submitting}
                            className="rounded-full p-2 text-(--primary-clr) transition-colors hover:bg-(--dim-bg) disabled:opacity-40"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                )}

                {/* Comments */}
                {showComments && post.comments.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2.5 border-t border-(--border) pt-3">
                        {post.comments.map((c) => (
                            <CommentItem
                                key={c.id}
                                comment={c}
                                currentUserId={currentUserId}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showShareModal && (
                <ShareModal
                    onClose={() => setShowShareModal(false)}
                    onShareItem={(type, id, name, description) => {
                        axios.post("/api/v1/posts", {
                            shareable_type: type,
                            shareable_id: id,
                        }).then((res) => onReShareCreated(res.data));
                    }}
                    onReShare={handleReShare}
                />
            )}
        </>
    );
}

// ── Comment Item ───────────────────────────────────────────
function CommentItem({
    comment,
    currentUserId,
}: {
    comment: Comment;
    currentUserId?: number;
}) {
    const [replyText, setReplyText] = useState("");
    const [showReply, setShowReply] = useState(false);
    const [replies, setReplies] = useState<Comment[]>(
        comment.replies ?? [],
    );
    const [submitting, setSubmitting] = useState(false);

    const likesCount = comment.likes.filter(
        (l) => l.type === "like",
    ).length;
    const myLike = comment.likes.find(
        (l) => l.user_id === currentUserId,
    );

    const handleLike = async () => {
        try {
            await axios.post(`/api/v1/comments/${comment.id}/like`);
        } catch {
            /* empty */
        }
    };

    const handleReply = async () => {
        if (!replyText.trim() || submitting) return;
        setSubmitting(true);
        try {
            const res = await axios.post(
                `/api/v1/comments/${comment.id}/reply`,
                { body: replyText },
            );
            setReplies([...replies, res.data]);
            setReplyText("");
            setShowReply(false);
        } catch {
            /* empty */
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex gap-2">
            <img
                src={userAvatar(comment.user)}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
            />
            <div className="flex-1">
                <div className="rounded-lg bg-(--dim-bg) px-3 py-2">
                    <div className="flex items-baseline justify-between">
                        <span className="text-xs font-bold">
                            {comment.user.name}
                        </span>
                        <span className="text-[10px] text-[var(--light-fg)]">
                            {timeAgo(comment.created_at)}
                        </span>
                    </div>
                    <p className="mt-0.5 text-xs">{comment.body}</p>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[10px] text-[var(--light-fg)]">
                    <button
                        onClick={handleLike}
                        className={`font-medium hover:text-(--primary-clr) ${myLike?.type === "like" ? "text-(--primary-clr)" : ""}`}
                    >
                        Like {likesCount > 0 && `(${likesCount})`}
                    </button>
                    <button
                        onClick={() => setShowReply(!showReply)}
                        className="font-medium hover:text-(--primary-clr)"
                    >
                        Reply
                    </button>
                </div>

                {showReply && (
                    <div className="mt-2 flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleReply()
                            }
                            className="flex-1 rounded-full border border-(--border) bg-white px-3 py-1.5 text-[11px] outline-none focus:border-(--primary-clr)"
                        />
                        <button
                            onClick={handleReply}
                            disabled={!replyText.trim() || submitting}
                            className="rounded-full p-1.5 text-(--primary-clr) disabled:opacity-40"
                        >
                            <Send size={12} />
                        </button>
                    </div>
                )}

                {replies.length > 0 && (
                    <div className="mt-2 flex flex-col gap-2">
                        {replies.map((r) => (
                            <div
                                key={r.id}
                                className="ml-4 flex gap-2"
                            >
                                <img
                                    src={userAvatar(r.user)}
                                    alt=""
                                    className="h-5 w-5 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <div className="rounded-lg bg-(--dim-bg) px-2.5 py-1.5">
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-[11px] font-bold">
                                                {r.user.name}
                                            </span>
                                            <span className="text-[9px] text-[var(--light-fg)]">
                                                {timeAgo(r.created_at)}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-[11px]">
                                            {r.body}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main PostsTab ──────────────────────────────────────────
export default function PostsTab({
    userId,
    isOwnProfile,
}: {
    userId: number;
    isOwnProfile: boolean;
}) {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [composerText, setComposerText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchPosts = useCallback(
        async (pageNum: number = 1) => {
            try {
                const res = await axios.get<PaginatedResponse<Post>>(
                    `/api/v1/users/${userId}/posts`,
                    { params: { page: pageNum } },
                );
                if (pageNum === 1) {
                    setPosts(res.data.data);
                } else {
                    setPosts((prev) => [...prev, ...res.data.data]);
                }
                setHasMore(
                    res.data.current_page < res.data.last_page,
                );
            } catch {
                /* empty */
            } finally {
                setLoading(false);
            }
        },
        [userId],
    );

    useEffect(() => {
        setLoading(true);
        fetchPosts(1);
    }, [fetchPosts]);

    const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setMediaFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setMediaPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handlePost = async () => {
        if ((!composerText.trim() && !mediaFile) || submitting) return;
        setSubmitting(true);
        try {
            const res = await axios.post("/api/v1/posts", {
                body: composerText.trim() || null,
            });
            const newPost: Post = res.data;

            // Upload media if present
            if (mediaFile && user?.profile) {
                try {
                    const media = await uploadToCloudinary({
                        file: mediaFile,
                        modelType: "post",
                        modelId: newPost.id,
                        collection: "posts",
                    });
                    newPost.media = [media];
                } catch {
                    /* media upload failed but post exists */
                }
            }

            setPosts([newPost, ...posts]);
            setComposerText("");
            setMediaFile(null);
            setMediaPreview(null);
        } catch {
            /* empty */
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (postId: number) => {
        setPosts(posts.filter((p) => p.id !== postId));
    };

    const handleCommentAdded = (postId: number, comment: Comment) => {
        setPosts(
            posts.map((p) =>
                p.id === postId
                    ? { ...p, comments: [...p.comments, comment] }
                    : p,
            ),
        );
    };

    const handleLikeToggled = (postId: number, likes: Post["likes"]) => {
        setPosts(
            posts.map((p) => (p.id === postId ? { ...p, likes } : p)),
        );
    };

    const handleReShareCreated = (post: Post) => {
        setPosts([post, ...posts]);
    };

    const handleShareItem = (
        type: string,
        id: number,
        name: string,
        description?: string,
    ) => {
        axios
            .post("/api/v1/posts", {
                shareable_type: type,
                shareable_id: id,
            })
            .then((res) => {
                setPosts([res.data, ...posts]);
            });
    };

    const currentUserAvatar =
        user?.profile?.media?.find(
            (m: Media) => m.collection === "profiles",
        )?.secure_url ?? "https://placehold.net/avatar-5.png";

    return (
        <div className="flex flex-col gap-4">
            {/* Composer (own profile only) */}
            {isOwnProfile && (
                <div className="rounded-xl border border-(--border) bg-white p-4">
                    <div className="flex items-center gap-3">
                        <img
                            src={currentUserAvatar}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                        />
                        <input
                            type="text"
                            placeholder="Share your thoughts..."
                            value={composerText}
                            onChange={(e) =>
                                setComposerText(e.target.value)
                            }
                            onKeyDown={(e) =>
                                e.key === "Enter" && handlePost()
                            }
                            className="flex-1 rounded-full border border-(--border) bg-(--dim-bg) px-4 py-2.5 text-sm outline-none focus:border-(--primary-clr)"
                        />
                    </div>

                    {/* Media preview */}
                    {mediaPreview && (
                        <div className="relative mt-3">
                            <img
                                src={mediaPreview}
                                alt=""
                                className="max-h-48 w-full rounded-lg object-cover"
                            />
                            <button
                                onClick={() => {
                                    setMediaFile(null);
                                    setMediaPreview(null);
                                }}
                                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <div className="mt-3 flex items-center border-t border-(--border) pt-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleMediaSelect}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--light-fg)] transition-colors hover:bg-(--dim-bg)"
                        >
                            <ImageIcon size={16} />
                            Photo/Video
                        </button>
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--light-fg)] transition-colors hover:bg-(--dim-bg)"
                        >
                            <Share2 size={16} />
                            Share
                        </button>
                        <button
                            onClick={handlePost}
                            disabled={
                                (!composerText.trim() && !mediaFile) ||
                                submitting
                            }
                            className="ml-auto rounded-full bg-(--primary-clr) px-4 py-2 text-xs font-medium text-white transition-colors hover:opacity-90 disabled:opacity-40"
                        >
                            {submitting ? "Posting..." : "Post"}
                        </button>
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-(--border) border-t-(--primary-clr)" />
                </div>
            )}

            {/* Empty */}
            {!loading && posts.length === 0 && (
                <div className="rounded-xl border border-(--border) bg-white py-12 text-center text-sm text-[var(--light-fg)]">
                    No posts yet.
                </div>
            )}

            {/* Feed */}
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user?.id}
                    onDelete={handleDelete}
                    onCommentAdded={handleCommentAdded}
                    onLikeToggled={handleLikeToggled}
                    onReShareCreated={handleReShareCreated}
                />
            ))}

            {/* Load more */}
            {!loading && hasMore && posts.length > 0 && (
                <button
                    onClick={() => {
                        const next = page + 1;
                        setPage(next);
                        fetchPosts(next);
                    }}
                    className="rounded-lg border border-(--border) py-2 text-xs font-medium text-[var(--light-fg)] transition-colors hover:bg-(--dim-bg)"
                >
                    Load more
                </button>
            )}

            {/* Share modal (for composer) */}
            {showShareModal && (
                <ShareModal
                    onClose={() => setShowShareModal(false)}
                    onShareItem={handleShareItem}
                    onReShare={(postId) => {
                        axios
                            .post("/api/v1/posts", {
                                parent_post_id: postId,
                            })
                            .then((res) => {
                                setPosts([res.data, ...posts]);
                            });
                    }}
                />
            )}
        </div>
    );
}
