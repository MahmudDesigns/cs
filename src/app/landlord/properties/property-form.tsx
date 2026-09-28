"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Check, Link2, Plus, X } from "lucide-react";
import { createProperty, updateProperty, type PropertyState } from "@/actions/properties";
import { SubmitButton } from "@/components/submit-button";
import { AmenityIcon } from "@/components/amenity-icon";
import { ALL_IMAGES, AMENITIES, AREAS, ROOM_TYPES, UNIVERSITIES } from "@/lib/constants";
import type { Property } from "@/db/schema";

export function PropertyForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Property;
}) {
  const actionFn =
    mode === "edit" && initial ? updateProperty.bind(null, initial.id) : createProperty;
  const [state, action] = useActionState<PropertyState, FormData>(actionFn, null);

  const [amenities, setAmenities] = useState<string[]>(initial?.amenities ?? ["Wi-Fi"]);
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [customUrl, setCustomUrl] = useState("");

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <form action={action} className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      {/* left column */}
      <div className="space-y-5">
        <div className="card card-pad space-y-4">
          <h3 className="heading text-lg">Basics</h3>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">
              Listing title
            </span>
            <input
              name="title"
              required
              maxLength={120}
              defaultValue={initial?.title}
              placeholder="e.g. Sunrise Court — bright singles with Wi-Fi"
              className="field"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">
              Description <span className="font-normal normal-case text-ink/35">(min 40 chars)</span>
            </span>
            <textarea
              name="description"
              required
              rows={5}
              defaultValue={initial?.description}
              placeholder="Describe the rooms, the compound, house rules, utilities included, security…"
              className="field resize-none"
            />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Area</span>
              <select name="area" required defaultValue={initial?.area ?? AREAS[0]} className="field">
                {AREAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Room type</span>
              <select name="roomType" required defaultValue={initial?.roomType ?? "single"} className="field">
                {ROOM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Street address</span>
              <input
                name="address"
                required
                defaultValue={initial?.address}
                placeholder="12 Acacia Lane"
                className="field"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Nearest campus</span>
              <select name="nearestCampus" required defaultValue={initial?.nearestCampus ?? UNIVERSITIES[0]} className="field">
                {UNIVERSITIES.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Distance to campus (km)</span>
              <input
                name="distanceKm"
                required
                defaultValue={initial?.distanceKm ?? "1.0"}
                placeholder="0.8"
                className="field font-num"
              />
            </label>
          </div>
        </div>

        <div className="card card-pad space-y-4">
          <h3 className="heading text-lg">Pricing & capacity</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Rent / month ($)</span>
              <input name="pricePerMonth" type="number" min={1} required defaultValue={initial?.pricePerMonth} placeholder="240" className="field font-num" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Deposit ($)</span>
              <input name="deposit" type="number" min={0} defaultValue={initial?.deposit ?? 0} className="field font-num" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Total rooms</span>
              <input name="totalRooms" type="number" min={1} required defaultValue={initial?.totalRooms ?? 1} className="field font-num" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Available now</span>
              <input name="availableRooms" type="number" min={0} defaultValue={initial?.availableRooms ?? initial?.totalRooms ?? 1} className="field font-num" />
            </label>
          </div>
          <p className="text-xs leading-relaxed text-ink/50">
            Vacancy adjusts automatically as bookings are confirmed or completed — you only need to
            set the starting count.
          </p>
        </div>

        <div className="card card-pad">
          <h3 className="heading text-lg">Amenities</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {AMENITIES.map((a) => {
              const on = amenities.includes(a);
              return (
                <button
                  type="button"
                  key={a}
                  onClick={() => toggle(amenities, setAmenities, a)}
                  aria-pressed={on}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-all ${
                    on ? "border-moss bg-moss/10 text-moss" : "border-ink/15 text-ink/60 hover:border-ink/30"
                  }`}
                >
                  <AmenityIcon name={a} className="h-3.5 w-3.5" />
                  {a}
                </button>
              );
            })}
          </div>
          {amenities.map((a) => (
            <input key={a} type="hidden" name="amenities" value={a} />
          ))}
        </div>
      </div>

      {/* right column */}
      <div className="space-y-5">
        <div className="card card-pad">
          <h3 className="heading text-lg">Photos</h3>
          <p className="mt-1 text-xs text-ink/55">
            Pick from the verified photo library — or paste your own image URL.
          </p>

          {images.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {images.map((img, i) => (
                <div key={img} className="group relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-16 w-24 rounded-xl border-2 border-moss object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded-md bg-moss px-1.5 py-0.5 text-[9px] font-bold uppercase text-paper">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((x) => x !== img))}
                    className="absolute -right-1.5 -top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-ink text-paper opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {images.map((img) => (
            <input key={img} type="hidden" name="images" value={img} />
          ))}

          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/35" aria-hidden />
              <input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://…"
                className="field !py-2.5 !pl-8 text-xs"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const url = customUrl.trim();
                if (url && !images.includes(url)) setImages([...images, url]);
                setCustomUrl("");
              }}
              className="btn btn-ghost !px-3.5 !py-2 text-xs"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden /> Add
            </button>
          </div>

          <div className="no-scrollbar mt-4 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto pr-1">
            {ALL_IMAGES.map((img) => {
              const on = images.includes(img);
              return (
                <button
                  type="button"
                  key={img}
                  onClick={() => toggle(images, setImages, img)}
                  className={`relative h-20 overflow-hidden rounded-xl transition-all ${
                    on ? "ring-2 ring-moss ring-offset-2 ring-offset-paper" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                  {on && (
                    <span className="absolute inset-0 flex items-center justify-center bg-moss/30">
                      <Check className="h-5 w-5 text-paper" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card card-pad">
          <h3 className="heading text-lg">Publish</h3>
          <p className="mt-1 text-xs leading-relaxed text-ink/55">
            New and edited listings go to the admin queue and appear on the public site once
            verified — usually within a day.
          </p>
          {state?.error && (
            <p className="mt-3 flex items-start gap-2 rounded-2xl bg-ink px-4 py-3 text-xs text-paper">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.error}
            </p>
          )}
          <SubmitButton className="mt-4 w-full !py-3" pendingLabel={mode === "edit" ? "Saving changes…" : "Submitting for review…"}>
            {mode === "edit" ? "Save changes" : "Submit listing for verification"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
