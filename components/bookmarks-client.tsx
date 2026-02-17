"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Plus, ExternalLink } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface Bookmark {
    id: string;
    title: string;
    url: string;
    user_id: string;
    created_at: string;
}

export default function BookmarksClient({ user }: { user: User }) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [supabase] = useState(() => createClient());

    useEffect(() => {
        // Initial fetch
        const fetchBookmarks = async () => {
            const { data, error } = await supabase
                .from("bookmarks")
                .select("*")
                .order("created_at", { ascending: false });

            if (data) {
                setBookmarks(data);
            }
            setIsInitialLoading(false);
        };

        fetchBookmarks();

        // Realtime subscription
        const channel = supabase
            .channel(`realtime-bookmarks-${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bookmarks",
                },
                (payload) => {
                    // console.log("Realtime payload:", payload);
                    if (payload.eventType === "INSERT") {
                        const newBookmark = payload.new as Bookmark;
                        setBookmarks((prev) => {
                            // Prevent duplicates
                            if (prev.some(b => b.id === newBookmark.id)) return prev;
                            return [newBookmark, ...prev];
                        });
                    } else if (payload.eventType === "DELETE") {
                        setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id));
                    }
                }
            )
            .subscribe((status) => {
                if (status !== 'SUBSCRIBED') {
                    console.log('Realtime subscription status:', status);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, user.id]);

    const addBookmark = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !url) return;

        setIsLoading(true);
        // Ensure URL has protocol
        const formattedUrl = url.startsWith('http') ? url : `https://${url}`;

        // Optimistic update impossible without a fake ID if we want to support DELETE immediately.
        // So we will wait for server response.

        const { data, error } = await supabase.from("bookmarks").insert([
            { title, url: formattedUrl, user_id: user.id },
        ]).select().single();

        if (data) {
            setTitle("");
            setUrl("");
            // Update local state immediately after success
            setBookmarks(prev => [data, ...prev]);
            // Note: Realtime listener will also fire an INSERT event.
            // We handled deduplication in the listener.
        }
        setIsLoading(false);
    };

    const deleteBookmark = async (id: string) => {
        // Optimistic update
        setBookmarks((prev) => prev.filter((b) => b.id !== id));

        const { error } = await supabase.from("bookmarks").delete().eq("id", id);
        if (error) {
            console.error("Error deleting bookmark:", error);
            // Revert optimization if error (optional, but good practice would be to re-fetch or re-add)
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Bookmark</CardTitle>
                    <CardDescription>Save your favorite links for quick access</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={addBookmark} className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="grid w-full gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. My Favorite Blog"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid w-full gap-2">
                            <Label htmlFor="url">URL</Label>
                            <Input
                                id="url"
                                placeholder="e.g. https://example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            <span className="ml-2 sm:hidden">Add</span>
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Your Bookmarks</h2>
                {isInitialLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : bookmarks.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed">
                        No bookmarks yet. Add one above!
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {bookmarks.map((bookmark) => (
                            <Card key={bookmark.id} className="relative group hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-medium truncate" title={bookmark.title}>
                                        {bookmark.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <a
                                        href={bookmark.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-4 truncate"
                                    >
                                        <ExternalLink className="h-3 w-3 inline" />
                                        {bookmark.url}
                                    </a>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => deleteBookmark(bookmark.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
