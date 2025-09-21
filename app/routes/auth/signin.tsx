import { trpc } from "@/lib/trpc";
import { signIn } from "@/lib/auth";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export function meta() {
    return [
        { title: "Sign In - Playlist PowerTools" },
        { name: "description", content: "Sign in to your Playlist PowerTools account" },
    ];
}

export default function () {
    const { data: userData, isLoading } = useQuery(trpc.user.queryOptions());
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSignIn(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await signIn.email({
                email,
                password: pass,
            });
            // Optionally, refetch user data here if needed
        } catch (err: any) {
            setError(err?.message || "Sign in failed");
        } finally {
            setLoading(false);
        }
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (userData?.user) {
        return (
            <div>
                <h1>Already Signed In</h1>
                <p>You are already signed in as {userData.user.email}</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Sign In</h1>
            <form onSubmit={handleSignIn} className="max-w-xs mx-auto mt-8 flex flex-col gap-2">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="border px-2 py-1 rounded"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    className="border px-2 py-1 rounded"
                    required
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>
                {error && <p className="text-red-600">{error}</p>}
            </form>
        </div>
    );
} 