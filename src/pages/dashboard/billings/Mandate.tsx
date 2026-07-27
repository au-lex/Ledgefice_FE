import { useState } from "react";
import { CloseCircle, Bank as BankIcon, TickCircle } from "iconsax-react";
import {
  useListBanks,
  useLookupAccount,
  useInitiateMandate,
} from "../../../api/hooks/useMandates";

type Step = "form" | "confirm" | "redirecting";

export default function MandateSetupModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>("form");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const { data: banks, isLoading: banksLoading } = useListBanks();
  const lookup = useLookupAccount();
  const initiateMandate = useInitiateMandate();

  const selectedBankName = banks?.find((b) => b.code === bankCode)?.name ?? "";

  const canContinue = !!bankCode && accountNumber.length >= 10;

  const handleLookup = () => {
    if (!canContinue) return;
    lookup.mutate(
      { account_number: accountNumber, bank_code: bankCode },
      {
        onSuccess: (res) => {
          setAccountName(res.account_name);
          setStep("confirm");
        },
      },
    );
  };

  const handleCreate = () => {
    initiateMandate.mutate(
      { account_number: accountNumber, bank_code: bankCode },
      {
        onSuccess: (res) => {
          // Paystack's mandate flow is a bank-hosted authentication page —
          // there's no in-app instructions step like Nomba's NIBSS
          // token-payment. The browser leaves the app here; mandate status
          // gets confirmed later via the webhook once they come back.
          setStep("redirecting");
          window.location.href = res.redirect_url;
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 transition-opacity">
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
          <h2 className="text-sm font-medium text-zinc-100">Set Up Auto-Renewal</h2>
          <button
            onClick={onClose}
            disabled={step === "redirecting"}
            className="text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-40"
          >
            <CloseCircle size={20} color="currentColor" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto bg-zinc-950/30">

          {step === "form" && (
            <>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Link a bank account for Direct Debit. You'll be sent to your bank to authorize it — no card required.
              </p>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-1.5">
                  Bank
                </label>
                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  disabled={banksLoading}
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-200 outline-none focus:border-zinc-600 transition-colors font-medium appearance-none cursor-pointer"
                >
                  <option value="">{banksLoading ? "Loading banks…" : "Select a bank"}</option>
                  {banks?.map((b) => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="0123456789"
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors font-medium"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleLookup}
                  disabled={!canContinue || lookup.isPending}
                  className="w-full py-2.5 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  {lookup.isPending ? "Looking up account…" : "Continue"}
                </button>
              </div>
            </>
          )}

          {step === "confirm" && (
            <>
              <div className="p-4 bg-zinc-800/40 rounded-lg border border-zinc-700/50">
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-1">
                  Confirm this is your account
                </p>
                <p className="text-sm font-semibold text-zinc-100">{accountName}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {accountNumber} · {selectedBankName}
                </p>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                You'll be redirected to your bank to authorize this mandate. Come back here once you're done — it'll show as active within a few seconds.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep("form")}
                  disabled={initiateMandate.isPending}
                  className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-all disabled:opacity-40"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={initiateMandate.isPending}
                  className="flex-1 py-2.5 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white transition-all disabled:opacity-40 shadow-sm"
                >
                  {initiateMandate.isPending ? "Preparing…" : "Continue to Bank"}
                </button>
              </div>
            </>
          )}

          {step === "redirecting" && (
            <div className="text-center space-y-3 py-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TickCircle size={24} color="currentColor" variant="Bulk" />
              </div>
              <p className="text-sm font-medium text-zinc-100">Taking you to your bank…</p>
              <p className="text-[11px] text-zinc-400">
                If nothing happens, check your browser's pop-up blocker.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}