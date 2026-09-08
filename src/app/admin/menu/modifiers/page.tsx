'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Sliders, X, Trash2, Loader2, Check, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ModifiersAdminPage() {
  const [modifierGroups, setModifierGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minSelections, setMinSelections] = useState('0');
  const [maxSelections, setMaxSelections] = useState('1');
  const [isRequired, setIsRequired] = useState(false);
  const [options, setOptions] = useState<Array<{ name: string; price: string; isDefault: boolean }>>([
    { name: '', price: '0', isDefault: false },
  ]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const loadGroups = async () => {
    try {
      const res = await fetch('/api/admin/menu');
      const data = await res.json();
      if (data.modifierGroups) setModifierGroups(data.modifierGroups);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const addOptionRow = () => {
    setOptions([...options, { name: '', price: '0', isDefault: false }]);
  };

  const removeOptionRow = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOptionRow = (index: number, field: string, val: any) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: val };
    setOptions(updated);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const validOptions = options.filter((o) => o.name.trim() !== '');
    if (validOptions.length === 0) {
      setError('Please add at least one modifier option.');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'MODIFIER_GROUP',
          data: {
            name: name.trim(),
            description: description.trim() || null,
            minSelections: parseInt(minSelections) || 0,
            maxSelections: parseInt(maxSelections) || 1,
            isRequired,
            modifiers: validOptions.map((o) => ({
              name: o.name.trim(),
              price: parseFloat(o.price) || 0,
              isDefault: o.isDefault,
            })),
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to create modifier group');

      await loadGroups();
      setIsModalOpen(false);
      setName('');
      setDescription('');
      setMinSelections('0');
      setMaxSelections('1');
      setIsRequired(false);
      setOptions([{ name: '', price: '0', isDefault: false }]);
    } catch (err: any) {
      setError(err.message || 'Error creating group');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Modifier Groups</h1>
          <p className="text-xs text-gray-500 mt-1">
            Create reusable add-ons, toppings, sauces, and customization choices for your dishes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-primary/25 hover:brightness-105 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Modifier Group</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modifierGroups.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-base text-gray-900 leading-snug">{group.name}</h3>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    group.isRequired
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {group.isRequired ? 'Required' : 'Optional'}
                </span>
              </div>

              {group.description && (
                <p className="text-xs text-gray-400 mb-3">{group.description}</p>
              )}

              <div className="text-[11px] font-semibold text-gray-500 mb-3">
                Rules: Min {group.minSelections} • Max {group.maxSelections} selection(s)
              </div>

              {/* Modifiers items list */}
              <div className="space-y-1.5 divide-y divide-gray-50 text-xs">
                {group.modifiers.map((m: any) => (
                  <div key={m.id} className="pt-1.5 first:pt-0 flex items-center justify-between">
                    <span className="text-gray-700">
                      {m.name} {m.isDefault && <span className="text-[10px] text-primary font-bold">(Default)</span>}
                    </span>
                    <span className="font-bold text-gray-900">
                      {m.price > 0 ? `+${formatCurrency(m.price)}` : 'Free'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 text-xs text-gray-400">
              {group.modifiers.length} options configured
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Create Modifier Group</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Choose Your Bun / Bread"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Select your preferred artisanal bun style"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Min Selections
                  </label>
                  <input
                    type="number"
                    value={minSelections}
                    onChange={(e) => setMinSelections(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Max Selections
                  </label>
                  <input
                    type="number"
                    value={maxSelections}
                    onChange={(e) => setMaxSelections(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="req"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
                />
                <label htmlFor="req" className="font-semibold text-gray-700">
                  Required selection (customer must pick at least 1)
                </label>
              </div>

              {/* Options Builder */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-700 uppercase">Modifier Options</span>
                  <button
                    type="button"
                    onClick={addOptionRow}
                    className="text-primary font-bold hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Row</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Option name (e.g. Brioche)"
                        value={opt.name}
                        onChange={(e) => updateOptionRow(idx, 'name', e.target.value)}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={opt.price}
                        onChange={(e) => updateOptionRow(idx, 'price', e.target.value)}
                        className="w-20 border border-gray-200 rounded-xl px-3 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeOptionRow(idx)}
                        disabled={options.length <= 1}
                        className="p-1.5 text-gray-300 hover:text-rose-500 rounded disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-xs font-bold shadow hover:brightness-105 transition-all flex items-center space-x-1"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Group</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}