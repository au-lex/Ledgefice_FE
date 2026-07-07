import { useState } from "react";
import toast from "react-hot-toast";
import { CloseCircle, Copy, Bank as BankIcon, TickCircle } from "iconsax-react";
import {
  useListBanks,
  useLookupAccount,
  useCreateMandate,
} from "../../../api/hooks/useMandates";

type Step = "form" | "confirm" | "done";

interface ParsedMandateAccount {
  accountNumber: string;
  bankName: string;
  accountName: string;
}

interface ParsedMandateInstructions {
  amount: string | null;
  accounts: ParsedMandateAccount[];
  raw: string;
}

function parseMandateInstructions(description: string): ParsedMandateInstructions {
  const amountMatch = description.match(/₦\s?([\d,]+\.?\d*)/);
  const amount = amountMatch ? amountMatch[1] : null;

  const accountRegex =
    /Account Number:\s*(\d+)\s*Bank:\s*(.+?)\s*Account Name:\s*(.+?)(?=\s*OR\s*Account Number|$)/gs;

  const accounts: ParsedMandateAccount[] = [];
  let match: RegExpExecArray | null;
  while ((match = accountRegex.exec(description)) !== null) {
    accounts.push({
      accountNumber: match[1].trim(),
      bankName: match[2].trim(),
      accountName: match[3].trim(),
    });
  }

  return { amount, accounts, raw: description };
}

function copyToClipboard(value: string, label: string) {
  navigator.clipboard
    .writeText(value)
    .then(() => toast.success(`${label} copied`))
    .catch(() => toast.error("Failed to copy"));
}

export default function MandateSetupModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>("form");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [instructions, setInstructions] = useState<ParsedMandateInstructions | null>(null);

  const { data: banks, isLoading: banksLoading } = useListBanks();
  const lookup = useLookupAccount();
  const createMandate = useCreateMandate();

  const selectedBankName = banks?.find((b) => b.code === bankCode)?.name ?? "";

  const canContinue =
    !!bankCode && accountNumber.length >= 10 && phoneNumber.length >= 10;

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
    createMandate.mutate(
      {
        account_number: accountNumber,
        bank_code: bankCode,
        account_name: accountName,
        phone_number: phoneNumber,
      },
      {
        onSuccess: (res) => {
          setInstructions(parseMandateInstructions(res.description));
          setStep("done");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 transition-opacity">
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
          <h2 className="text-sm font-medium text-zinc-100">Set Up Auto-Renewal</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <CloseCircle size={20} color="currentColor" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto bg-zinc-950/30">

          {step === "form" && (
            <>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Link a bank account for Direct Debit. You'll authenticate a small NIBSS token payment with your bank to activate it.
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

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="08012345678"
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors font-medium"
                />
                <p className="text-[10px] text-zinc-500 mt-1.5">
                  Required by your bank to authenticate the mandate.
                </p>
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
                You'll receive a small token-payment request from your bank to authenticate this mandate — check your bank app after confirming.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep("form")}
                  className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={createMandate.isPending}
                  className="flex-1 py-2.5 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white transition-all disabled:opacity-40 shadow-sm"
                >
                  {createMandate.isPending ? "Creating…" : "Confirm & Link"}
                </button>
              </div>
            </>
          )}

          {step === "done" && instructions && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                  <TickCircle size={24} color="currentColor" variant="Bulk" />
                </div>
                <p className="text-sm font-medium text-zinc-100">
                  {instructions.amount
                    ? `Send ₦${instructions.amount} to authenticate`
                    : "Authentication Required"}
                </p>
                <p className="text-[11px] text-zinc-400 leading-relaxed px-2">
                  Send this exact amount from the account you just linked, using your bank's app or internet banking. Choose either option below.
                </p>
              </div>

              {instructions.accounts.length > 0 ? (
                <div className="space-y-3">
                  {instructions.accounts.map((acc, i) => (
                    <div
                      key={i}
                      className="p-4 bg-zinc-800/40 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                          <BankIcon size={14} color="currentColor" />
                          {acc.bankName}
                        </div>
                        {instructions.accounts.length > 1 && (
                          <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">
                            Option {i + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-zinc-100 font-mono tracking-wide">
                            {acc.accountNumber}
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {acc.accountName}
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(acc.accountNumber, "Account number")}
                          className="p-2.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 rounded-lg transition-colors shrink-0"
                          title="Copy account number"
                        >
                          <Copy size={16} color="currentColor" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-zinc-800/40 rounded-lg border border-zinc-700/50">
                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {instructions.raw}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white transition-all shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}