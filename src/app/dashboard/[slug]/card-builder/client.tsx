"use client";

import * as React from "react";
import { LoyaltyCard } from "@/components/loyalty/loyalty-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Palette, Award, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

interface InitialData {
  businessId: string;
  businessName: string;
  businessSlug: string;
  programId: string;
  name: string;
  cardTitle: string;
  totalStamps: number;
  stampIcon: string;
  primaryColor: string;
  secondaryColor: string;
  terms: string;
  rewards: {
    stampsRequired: number;
    title: string;
    description: string;
    rewardType: "FREE_ITEM" | "DISCOUNT_PERCENT" | "DISCOUNT_FIXED";
    validityDays: number;
  }[];
}

export function CardBuilderClient({ initialData }: { initialData: InitialData }) {
  const [formData, setFormData] = React.useState(initialData);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const stampIcons = [
    { id: "cup", label: "Coffee Cup" },
    { id: "star", label: "Star" },
    { id: "gift", label: "Gift Box" },
    { id: "heart", label: "Heart" },
    { id: "tag", label: "Price Tag" },
  ];

  const presets = [
    {
      name: "Coffee Shop (5 Stamps)",
      totalStamps: 5,
      stampIcon: "cup",
      primaryColor: "#315EFB",
      rewards: [
        {
          stampsRequired: 3,
          title: "15% Off Pastry",
          description: "Enjoy a discount on any bakery item",
          rewardType: "DISCOUNT_PERCENT" as const,
          validityDays: 30,
        },
        {
          stampsRequired: 5,
          title: "Complimentary Coffee",
          description: "Any regular coffee or beverage",
          rewardType: "FREE_ITEM" as const,
          validityDays: 30,
        },
      ],
    },
    {
      name: "Bakery Club (8 Stamps)",
      totalStamps: 8,
      stampIcon: "gift",
      primaryColor: "#D97706",
      rewards: [
        {
          stampsRequired: 4,
          title: "Free Artisanal Cookie",
          description: "Your choice of fresh baked cookie",
          rewardType: "FREE_ITEM" as const,
          validityDays: 30,
        },
        {
          stampsRequired: 8,
          title: "Pastry Box of 4",
          description: "Redeem for 4 signature pastries",
          rewardType: "FREE_ITEM" as const,
          validityDays: 30,
        },
      ],
    },
    {
      name: "Salon & Grooming (6 Stamps)",
      totalStamps: 6,
      stampIcon: "star",
      primaryColor: "#059669",
      rewards: [
        {
          stampsRequired: 6,
          title: "50% Off Haircut or Spa",
          description: "Half price service on your 6th visit",
          rewardType: "DISCOUNT_PERCENT" as const,
          validityDays: 60,
        },
      ],
    },
  ];

  const handleApplyPreset = (preset: (typeof presets)[0]) => {
    setFormData((prev) => ({
      ...prev,
      totalStamps: preset.totalStamps,
      stampIcon: preset.stampIcon,
      primaryColor: preset.primaryColor,
      rewards: preset.rewards,
    }));
  };

  const handleAddReward = () => {
    setFormData((prev) => ({
      ...prev,
      rewards: [
        ...prev.rewards,
        {
          stampsRequired: Math.min(prev.totalStamps, (prev.rewards[prev.rewards.length - 1]?.stampsRequired || 0) + 2),
          title: "New Reward Milestone",
          description: "Perk description",
          rewardType: "FREE_ITEM",
          validityDays: 30,
        },
      ],
    }));
  };

  const handleRemoveReward = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rewards: prev.rewards.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/loyalty/program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save loyalty program");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || "An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-brand-border/60 gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
            Design &amp; Milestones
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-0.5">
            Loyalty Card Builder
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Customize how your customer card looks, set stamp count, and configure milestone rewards.
          </p>
        </div>
        <Button variant="primary" size="lg" className="font-bold" onClick={handleSave} isLoading={isSaving}>
          Publish Changes
        </Button>
      </div>

      {saveSuccess && (
        <div className="rounded-xl bg-brand-success-subtle p-4 border border-emerald-200 text-sm text-emerald-900 flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-brand-success flex-shrink-0" />
          <span>Loyalty program and branding changes published successfully!</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-sm text-brand-error flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preset Quick Start */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <span className="text-xs font-bold text-brand-muted uppercase flex items-center">
          <Sparkles className="h-3.5 w-3.5 mr-1 text-brand-blue" /> Presets:
        </span>
        {presets.map((preset) => (
          <Button
            key={preset.name}
            variant="outline"
            size="sm"
            onClick={() => handleApplyPreset(preset)}
            className="text-xs font-semibold whitespace-nowrap"
          >
            {preset.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Card Title &amp; Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Card Title"
                value={formData.cardTitle}
                onChange={(e) => setFormData({ ...formData, cardTitle: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
                    Total Stamps Required ({formData.totalStamps})
                  </label>
                  <select
                    value={formData.totalStamps}
                    onChange={(e) => setFormData({ ...formData, totalStamps: parseInt(e.target.value, 10) })}
                    className="w-full h-10 rounded-lg border border-brand-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value={3}>3 Stamps Card</option>
                    <option value={5}>5 Stamps Card (Standard)</option>
                    <option value={6}>6 Stamps Card</option>
                    <option value={8}>8 Stamps Card</option>
                    <option value={10}>10 Stamps Card</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
                    Stamp Icon
                  </label>
                  <select
                    value={formData.stampIcon}
                    onChange={(e) => setFormData({ ...formData, stampIcon: e.target.value })}
                    className="w-full h-10 rounded-lg border border-brand-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    {stampIcons.map((icon) => (
                      <option key={icon.id} value={icon.id}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="h-10 w-14 rounded-lg border border-brand-border cursor-pointer p-0.5"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
                    Card Background Tone
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="h-10 w-14 rounded-lg border border-brand-border cursor-pointer p-0.5"
                    />
                    <Input
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reward Milestones */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center">
                  <Award className="h-4 w-4 mr-2 text-brand-blue" />
                  Milestone Rewards
                </CardTitle>
                <CardDescription>Perks unlocked when customers reach specific stamp counts</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddReward}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Milestone
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.rewards.map((reward, index) => (
                <div key={index} className="p-4 rounded-xl border border-brand-border bg-brand-bg space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="blue">Milestone #{index + 1}</Badge>
                    {formData.rewards.length > 1 && (
                      <button
                        onClick={() => handleRemoveReward(index)}
                        className="text-brand-muted hover:text-brand-error transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1 sm:col-span-1">
                      <label className="block text-[10px] font-bold uppercase text-brand-muted">
                        At Stamp Count
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={formData.totalStamps}
                        value={reward.stampsRequired}
                        onChange={(e) => {
                          const updated = [...formData.rewards];
                          updated[index].stampsRequired = parseInt(e.target.value, 10) || 1;
                          setFormData({ ...formData, rewards: updated });
                        }}
                        className="h-9 w-full rounded-md border border-brand-border px-2 text-sm bg-white"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-brand-muted">
                        Reward Title
                      </label>
                      <input
                        type="text"
                        value={reward.title}
                        onChange={(e) => {
                          const updated = [...formData.rewards];
                          updated[index].title = e.target.value;
                          setFormData({ ...formData, rewards: updated });
                        }}
                        placeholder="e.g. Free Regular Coffee"
                        className="h-9 w-full rounded-md border border-brand-border px-2 text-sm bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-brand-muted">
                      Description &amp; Terms
                    </label>
                    <input
                      type="text"
                      value={reward.description}
                      onChange={(e) => {
                        const updated = [...formData.rewards];
                        updated[index].description = e.target.value;
                        setFormData({ ...formData, rewards: updated });
                      }}
                      placeholder="e.g. Valid for any hot or cold regular beverage"
                      className="h-9 w-full rounded-md border border-brand-border px-2 text-sm bg-white"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Interactive Preview */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="rounded-2xl bg-white p-5 border border-brand-border shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <span className="text-xs uppercase tracking-wider font-bold text-brand-blue flex items-center">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Live Customer Card Preview
              </span>
              <Badge variant="outline">Preview Mode</Badge>
            </div>

            <LoyaltyCard
              businessName={formData.businessName}
              businessSlug={formData.businessSlug}
              cardTitle={formData.cardTitle}
              primaryColor={formData.primaryColor}
              secondaryColor={formData.secondaryColor}
              stampIcon={formData.stampIcon}
              totalStamps={formData.totalStamps}
              currentStamps={Math.min(formData.totalStamps, 3)}
              nextReward={{
                title: formData.rewards[0]?.title || "Reward",
                stampsRemaining: Math.max(0, (formData.rewards[0]?.stampsRequired || 5) - 3),
              }}
              rewards={formData.rewards.map((r, i) => ({
                id: `preview-${i}`,
                title: r.title,
                description: r.description,
                stampsRequired: r.stampsRequired,
                isRedeemed: false,
              }))}
              isPreview={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
