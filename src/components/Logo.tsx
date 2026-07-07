import { ReceiptText } from "iconsax-react";
import { Link } from "react-router-dom";


export default function Logo() {
    return (
        <>
            <Link to="/" className="flex items-center gap-2.5  ">

                <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0 ">
                    <ReceiptText size={22} color="currentColor" variant="Bold"   className="text-zinc-950" />
                </div>
                <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">LedgeFice</h1>
            </Link>
        </>
    )
}