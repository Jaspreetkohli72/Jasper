"use client";
import React, { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import { Plus, User, ArrowUpRight, ArrowDownLeft, Phone } from "lucide-react";

export default function ContactsPage() {
    const { contacts, addContact, loading } = useFinance();
    const [isAddMode, setIsAddMode] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPhone, setNewPhone] = useState("");

    const handleAddContact = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        await addContact({ name: newName, phone: newPhone });
        setNewName("");
        setNewPhone("");
        setIsAddMode(false);
    };

    // Calculate balances
    // This logic might be moved to Context or calculated here if transactions are available
    // Assuming 'contacts' from context already has 'balance' computed or we compute it.
    // Let's assume Context provides populated contacts for now, or we compute.

    // Actually, looking at context plan, it's better to compute in context or here.
    // Let's compute here if context passes simple list. 
    // But `contacts` from context usually is just the list.
    // We need `transactions` too.

    // Refined: Context should likely provide `contactMetrics` similar to `categoryMetrics`.

    return (
        <div className="pb-24 p-4 md:p-0">
            <header className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Contacts
                    </h1>
                    <p className="text-xs text-muted">Manage debts and credits</p>
                </div>
                <button
                    onClick={() => setIsAddMode(!isAddMode)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <Plus size={20} className="text-white" />
                </button>
            </header>

            {isAddMode && (
                <form onSubmit={handleAddContact} className="mb-6 p-4 rounded-2xl glass-soft animate-in fade-in slide-in-from-top-4">
                    <div className="flex flex-col gap-3">
                        <input
                            type="text"
                            placeholder="Name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30 transition-colors"
                            autoFocus
                        />
                        <input
                            type="tel"
                            placeholder="Phone (optional)"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30 transition-colors"
                        />
                        <div className="flex gap-2 mt-1">
                            <button
                                type="button"
                                onClick={() => setIsAddMode(false)}
                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                            >
                                Add Contact
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : contacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted">
                    <User size={48} className="mb-4 opacity-20" />
                    <p>No contacts yet</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {contacts.map((contact) => (
                        <div
                            key={contact.id}
                            className="p-4 rounded-2xl glass-soft flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/10 text-lg">
                                    {contact.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-200">{contact.name}</h3>
                                    {contact.phone && (
                                        <div className="flex items-center gap-1 text-xs text-muted">
                                            <Phone size={10} />
                                            <span>{contact.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-right">
                                {(contact.balance || 0) !== 0 ? (
                                    <>
                                        <div className={`text-lg font-semibold ${contact.balance > 0 ? "text-green-400" : "text-red-400"}`}>
                                            {contact.balance > 0 ? "+" : ""}
                                            ₹{Math.abs(contact.balance).toLocaleString('en-IN')}
                                        </div>
                                        <div className="text-[10px] text-muted uppercase tracking-wider">
                                            {contact.balance > 0 ? "Owes You" : "You Owe"}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-sm text-muted">Settled</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
