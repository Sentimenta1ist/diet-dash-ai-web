"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";

// ====== AI Diet Generator — Diet Dash Themed (Green Hero) ======
// Drop this file into Next.js as app/page.tsx (or pages/index.tsx)
// Tailwind required. Palette tuned to green accents like your landing (btns, headings).

function NumberField({ label, value, onChange, min = 0, step = 1, placeholder }: {
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-gray-700">{label}</span>
      <input
        type="number"
        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 shadow-sm outline-none focus:border-green-500"
        value={value === undefined ? "" : value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        step={step}
        placeholder={placeholder}
      />
    </label>
  );
}

function CustomDropdown<T extends string>({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder 
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Debug effect to monitor isOpen state
  useEffect(() => {
    console.log('Dropdown isOpen state changed:', isOpen);
  }, [isOpen]);

  const selectedOption = options.find(option => option.value === value);

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-gray-700 font-medium">{label}</span>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 cursor-pointer transition-all duration-200 hover:border-green-300 text-left"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={selectedOption ? "text-gray-700" : "text-gray-500"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors duration-150 ${
                  option.value === value ? 'bg-green-100 text-green-800 font-medium' : 'text-gray-700'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Option clicked, closing dropdown');
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </label>
  );
}

export default function DietDashAIDietGenerator() {
  const [gender, setGender] = useState<"Male" | "Female" | "">("");
  const [age, setAge] = useState<number>();
  const [height, setHeight] = useState<number>();
  const [weight, setWeight] = useState<number>();

  const [weightGoal, setWeightGoal] = useState<"gain" | "maintain" | "loss" | "custom" | "">("");
  const [targetCalories, setTargetCalories] = useState<number>();
  const [protein, setProtein] = useState<number>();
  const [carbs, setCarbs] = useState<number>();
  const [fat, setFat] = useState<number>();

  const [mealsCount, setMealsCount] = useState<number>(4);
  const [comments, setComments] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const isValid = useMemo(() => {
    const validation = {
      gender: gender !== "",
      age: !!age && age > 0,
      height: !!height && height > 0,
      weight: !!weight && weight > 0,
      weightGoal: weightGoal !== "",
      targetCalories: weightGoal === "custom" ? (!!targetCalories && targetCalories > 500) : true,
      protein: weightGoal === "custom" ? (!!protein && protein > 0) : true,
      carbs: weightGoal === "custom" ? (!!carbs && carbs > 0) : true,
      fat: weightGoal === "custom" ? (!!fat && fat > 0) : true,
      mealsCount: !!mealsCount && mealsCount > 0,
    };
    
    // Debug log
    console.log("Validation status:", validation);
    
    return Object.values(validation).every(Boolean);
  }, [gender, age, height, weight, weightGoal, targetCalories, protein, carbs, fat, mealsCount]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        gender,
        age,
        height_cm: height,
        weight_kg: weight,
        weightGoal,
        ...(weightGoal === "custom" && {
          target: {
            calories: targetCalories,
            protein_g: protein,
            carbs_g: carbs,
            fat_g: fat,
          }
        }),
        mealsCount,
        comments,
      };

      console.log("Sending payload:", payload);

      const res = await fetch("https://chief-oriole-relative.ngrok-free.app/api/generate", {
        method: "POST",
        headers: { 
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", errorText);
        throw new Error(`API Error (${res.status}): ${errorText || res.statusText}`);
      }

      const data = await res.json();
      console.log("API Response:", data);
      setResult(data);
    } catch (err: any) {
      console.error("Fetch error:", err);
      
      // Handle CORS errors specifically
      if (err.message.includes('Failed to fetch') || err.message.includes('CORS')) {
        setError("CORS Error: The API server doesn't allow requests from this domain. Please check the API configuration.");
      } else {
        setError(err?.message || "Unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 text-gray-900">
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 md:pb-16 md:pt-16 lg:px-8">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl text-center">
            <span className="block">Boost Your Efficiency as a <span className="text-green-800">Nutritionist</span></span>
            <span className="block">Today with <span className="text-green-800">Diet Dash</span></span>
          </h1>
        </div>
      </section>

      {/* GENERATOR */}
      <section id="generator" className="border-t border-green-100 bg-gradient-to-b from-transparent to-green-100/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Form */}
            <div className="rounded-3xl border border-green-100 bg-white/80 backdrop-blur-sm shadow-lg w-full lg:w-1/2">
              <div className="p-4">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 ring-1 ring-purple-500/20 flex items-center justify-center overflow-hidden">
                    <img 
                      src="/rina-avatar.jpg" 
                      alt="Rina (Your AI Assistant)" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-lg font-semibold">Rina (Your AI Assistant)</h2>
                </div>
                <form className="grid grid-cols-1 gap-4" onSubmit={onSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <CustomDropdown
                    label="Gender"
                    value={gender}
                    onChange={setGender}
                    options={[
                      { value: "", label: "— Select gender —" },
                      { value: "Male", label: "👨 Male" },
                      { value: "Female", label: "👩 Female" },
                    ]}
                    placeholder="— Select gender —"
                  />
                  <NumberField label="Age" value={age} onChange={setAge} min={10} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <NumberField label="Height (cm)" value={height} onChange={setHeight} min={100} />
                  <NumberField label="Weight (kg)" value={weight} onChange={setWeight} min={30} step={0.1} />
                </div>

                <CustomDropdown
                  label="Weight Goal"
                  value={weightGoal}
                  onChange={setWeightGoal}
                  options={[
                    { value: "", label: "— Select your goal —" },
                    { value: "loss", label: "📉 Weight Loss - Reduce body weight" },
                    { value: "maintain", label: "⚖️ Weight Maintenance - Keep current weight" },
                    { value: "gain", label: "📈 Weight Gain - Build muscle & weight" },
                    { value: "custom", label: "🎯 Custom Targets - Set your own values" },
                  ]}
                  placeholder="— Select your goal —"
                />

                {weightGoal && weightGoal !== "custom" && (
                  <p className="text-xs text-green-600 mt-1">
                    {weightGoal === "loss" && "We'll create a calorie deficit plan for weight loss"}
                    {weightGoal === "maintain" && "We'll calculate your maintenance calories"}
                    {weightGoal === "gain" && "We'll create a calorie surplus plan for muscle building"}
                  </p>
                )}

                {weightGoal === "custom" && (
                  <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 ring-1 ring-inset ring-green-200 shadow-sm">
                    <h3 className="mb-3 text-sm font-medium text-gray-700">Custom Target Values</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <NumberField label="Calories (kcal/day)" value={targetCalories} onChange={setTargetCalories} min={900} />
                      <NumberField label="Protein (g/day)" value={protein} onChange={setProtein} min={10} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <NumberField label="Carbs (g/day)" value={carbs} onChange={setCarbs} min={10} />
                      <NumberField label="Fat (g/day)" value={fat} onChange={setFat} min={10} />
                    </div>
                  </div>
                )}

                <NumberField label="Meals per day" value={mealsCount} onChange={setMealsCount} min={1} />

                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-gray-700">Comments / Preferences</span>
                  <textarea
                    className="min-h-[100px] w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 shadow-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    placeholder="For example: no fish; add chicken; 4 eggs every day; 2.5L water; no lactose, etc."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </label>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <button
                    disabled={!isValid || isLoading}
                    className="rounded-full bg-gradient-to-r from-green-600 to-green-700 px-5 py-2.5 text-white shadow-lg transition hover:from-green-700 hover:to-green-800 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
                    type="submit"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating Plan...</span>
                      </>
                    ) : (
                      "Generate Plan"
                    )}
                  </button>
                  <div className="text-xs text-gray-500">
                    {!isValid && (
                      <div className="text-red-500">
                        Fill in all fields: {[
                          gender === "" && "gender",
                          (!age || age <= 0) && "age", 
                          (!height || height <= 0) && "height",
                          (!weight || weight <= 0) && "weight",
                          weightGoal === "" && "weight goal",
                          weightGoal === "custom" && (!targetCalories || targetCalories <= 500) && "calories",
                          weightGoal === "custom" && (!protein || protein <= 0) && "protein",
                          weightGoal === "custom" && (!carbs || carbs <= 0) && "carbs",
                          weightGoal === "custom" && (!fat || fat <= 0) && "fat"
                        ].filter(Boolean).join(", ")}
                      </div>
                    )}
                    {isValid && "Data is not saved without your consent."}
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
                )}
              </form>
              </div>
            </div>

            {/* Result */}
            <div className="rounded-3xl border border-green-100 bg-white/80 backdrop-blur-sm shadow-lg w-full lg:w-1/2">
              <div className="p-4">
                <h2 className="mb-3 text-lg font-semibold">Result</h2>
                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-600 text-center">
                      Rina is creating your personalized diet plan...
                    </p>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                )}
                {!isLoading && !result && (
                  <p className="text-sm text-gray-500">Generate a plan to see JSON with calories, macros, and meals here. After PDF integration, you'll be able to download the ready file.</p>
                )}
                {!isLoading && result && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-3 text-sm ring-1 ring-inset ring-green-200 shadow-sm">
                        <div className="text-gray-500">Calories</div>
                        <div className="text-lg font-semibold">{result.dailyCalories} kcal</div>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-3 text-sm ring-1 ring-inset ring-green-200 shadow-sm">
                        <div className="text-gray-500">Protein / Carbs / Fat</div>
                        <div className="text-lg font-semibold">{result?.macros?.protein} / {result?.macros?.carbs} / {result?.macros?.fat} g</div>
                      </div>
                      {typeof result.estimatedCostEUR === "number" && (
                        <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-3 text-sm ring-1 ring-inset ring-green-200 shadow-sm">
                          <div className="text-gray-500">Estimated Cost</div>
                          <div className="text-lg font-semibold">≈ €{Number(result.estimatedCostEUR).toFixed(2)} / day</div>
                        </div>
                      )}
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
                      <table className="w-full table-auto text-left text-sm">
                        <thead className="bg-gradient-to-r from-green-50 to-emerald-50 text-gray-600">
                          <tr>
                            <th className="px-3 py-2">Meal</th>
                            <th className="px-3 py-2">Product</th>
                            <th className="px-3 py-2">Amount</th>
                            <th className="px-3 py-2">Calories</th>
                            <th className="px-3 py-2">P / C / F</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.meals?.map((meal: any, i: number) => (
                            <React.Fragment key={i}>
                              {meal.items?.map((it: any, j: number) => (
                                <tr key={`${i}-${j}`} className="border-t border-green-100">
                                  <td className="px-3 py-2 align-top font-medium text-gray-800">{j === 0 ? meal.name : ""}</td>
                                  <td className="px-3 py-2">{it.product}</td>
                                  <td className="px-3 py-2">{it.amount}</td>
                                  <td className="px-3 py-2">{typeof it.calories === "number" ? Math.round(it.calories) : it.calories}</td>
                                  <td className="px-3 py-2">{it.protein ?? "-"} / {it.carbs ?? "-"} / {it.fat ?? "-"}</td>
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>


                    {result.notes && (
                      <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-3 text-sm ring-1 ring-inset ring-green-200 text-gray-700 shadow-sm">
                        <div className="mb-1 font-medium">Notes</div>
                        <p>{result.notes}</p>
                      </div>
                    )}

                    {result.pdfUrl && (
                      <a
                        href={result.pdfUrl}
          target="_blank"
                        rel="noreferrer"
                        className="inline-block rounded-full bg-gradient-to-r from-green-600 to-green-700 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:from-green-700 hover:to-green-800"
                      >
                        Download PDF
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">© {new Date().getFullYear()} Diet Dash — AI Diet Generator</p>
    </div>
      </section>
    </main>
  );
}
