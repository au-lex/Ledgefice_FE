import React, { useEffect, useState } from "react";
import { useSearchParams, useParams, Link } from "react-router-dom";
import { TickCircle, CloseCircle, Clock } from "iconsax-react";
import api from "../../api/lib/axios";

type Status = "pending" | "success" | "failed";

interface SubscriptionStatusResponse {
    status: "pending" | "paid" | "failed";
}

export default function PaymentStatusPage() {
    const { status: routeStatus } = useParams<{ status: Status }>();
    const [searchParams] = useSearchParams();
    const ref = searchParams.get("ref");

    const [polledStatus, setPolledStatus] = useState<Status>(routeStatus ?? "pending");

    useEffect(() => {
        if (routeStatus !== "pending" || !ref) return;

        // Backend webhook confirms payment async — poll until it lands.
        const interval = setInterval(async () => {
            try {
                const { data } = await api.get<SubscriptionStatusResponse>(
                    `/subscriptions/${ref}/status`
                );
                if (data.status === "paid") {
                    setPolledStatus("success");
                    clearInterval(interval);
                } else if (data.status === "failed") {
                    setPolledStatus("failed");
                    clearInterval(interval);
                }
            } catch {
                // keep polling
            }
        }, 3000);

        const timeout = setTimeout(() => clearInterval(interval), 60000); // stop after 1 min

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [routeStatus, ref]);

    const display = routeStatus === "pending" ? polledStatus : routeStatus ?? "pending";

    return (
        <div className="min-h-screen w-full bg-zinc-950 text-zinc-300 font-sans flex items-center justify-center px-3">
            <div className="w-full max-w-sm bg-pri border border-zinc-800 rounded-xl p-7 text-center space-y-4">
                {display === "pending" && (
                    <>
                        <Clock size={36} color="currentColor" className="text-zinc-500 mx-auto animate-pulse" />
                        <h1 className="text-lg font-medium text-zinc-100">Confirming payment…</h1>
                        <p className="text-xs text-zinc-500">Hang tight, this usually takes a few seconds.</p>
                    </>
                )}

                {display === "success" && (
                    <>
                        <TickCircle size={36} color="currentColor" className="text-emerald-400 mx-auto" />
                        <h1 className="text-lg font-medium text-zinc-100">Payment successful</h1>
                        <p className="text-xs text-zinc-500">Your workspace is ready.</p>
                        <Link
                            to="/login"
                            className="inline-block w-full bg-zinc-100 hover:bg-white text-zinc-950 text-sm font-medium px-4 py-3 rounded-lg transition-all mt-2"
                        >
                            Go to login
                        </Link>
                    </>
                )}

                {display === "failed" && (
                    <>
                        <CloseCircle size={36} color="currentColor" className="text-red-400 mx-auto" />
                        <h1 className="text-lg font-medium text-zinc-100">Payment failed</h1>
                        <p className="text-xs text-zinc-500">No charge was made. You can try again.</p>
                        <Link
                            to="/onboarding"
                            className="inline-block w-full bg-zinc-100 hover:bg-white text-zinc-950 text-sm font-medium px-4 py-3 rounded-lg transition-all mt-2"
                        >
                            Try again
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}