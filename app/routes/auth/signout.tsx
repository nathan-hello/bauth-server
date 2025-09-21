import { useEffect } from "react";
import { signOut } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export function meta() {
    return [
        { title: "Sign Out - Playlist PowerTools" },
        { name: "description", content: "Sign out of your Playlist PowerTools account" },
    ];
}

export default function SignOut() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        async function doSignOut() {
            try {
                await signOut();
                // Invalidate user query so UI updates
                queryClient.invalidateQueries();
            } catch (err) {
                // Optionally handle error
            } finally {
                navigate("/", { replace: true });
            }
        }
        doSignOut();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <h1>Signing Out...</h1>
            <p>You are being signed out. Please wait.</p>
        </div>
    );
}
