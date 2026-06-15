import { motion } from "framer-motion";
import { useState } from "react";
import SectionIntro from "./SectionIntro.jsx";

const activityLevels = [
  { id: "sedentary", label: "Sedentary", multiplier: 1.2 },
  { id: "light", label: "Light (1-3 days/week)", multiplier: 1.375 },
  { id: "moderate", label: "Moderate (3-5 days/week)", multiplier: 1.55 },
  { id: "active", label: "Active (6-7 days/week)", multiplier: 1.725 },
  { id: "veryActive", label: "Very active (intense daily)", multiplier: 1.9 },
];

function getBmr(weightKg, heightCm, age, gender) {
  if (gender === "male") {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }

  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

function getCaloriePlan(weightKg, heightCm, age, gender, activityId, goal) {
  const activity = activityLevels.find((level) => level.id === activityId) ?? activityLevels[2];
  const maintenance = Math.round(getBmr(weightKg, heightCm, age, gender) * activity.multiplier);
  const burnDeficit = 500;
  const gainSurplus = 350;

  if (goal === "burn") {
    return {
      maintenance,
      target: maintenance - burnDeficit,
      adjustment: burnDeficit,
      action: "burn",
      weeklyChange: 0.45,
      direction: "lose",
    };
  }

  return {
    maintenance,
    target: maintenance + gainSurplus,
    adjustment: gainSurplus,
    action: "add",
    weeklyChange: 0.35,
    direction: "gain",
  };
}

export default function WeightCalculator() {
  const [goal, setGoal] = useState("burn");
  const [gender, setGender] = useState("male");
  const [activity, setActivity] = useState("moderate");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCalculate = (event) => {
    event.preventDefault();

    const weightKg = Number(weight);
    const heightCm = Number(height);
    const ageYears = Number(age);

    if (!weightKg || !heightCm || !ageYears || weightKg <= 0 || heightCm <= 0 || ageYears <= 0) {
      setResult(null);
      setError("Enter valid weight, height, and age to calculate your calories.");
      return;
    }

    setError("");
    setResult(getCaloriePlan(weightKg, heightCm, ageYears, gender, activity, goal));
  };

  return (
    <section id="programs" className="section weight-calc-section light">
      <div className="container">
        <SectionIntro
          kicker="Fitness Tools"
          title="Calorie calculator."
          text="Find how many calories to burn for fat loss or how many extra calories to eat for healthy weight gain."
        />
        <motion.div
          className="weight-calc-grid"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <form className="weight-calc-form" onSubmit={handleCalculate}>
            <div className="weight-calc-goals" role="group" aria-label="Calorie goal">
              <button
                type="button"
                className={goal === "burn" ? "is-active" : ""}
                onClick={() => setGoal("burn")}
              >
                Burn Calories
              </button>
              <button
                type="button"
                className={goal === "gain" ? "is-active" : ""}
                onClick={() => setGoal("gain")}
              >
                Increase Calories
              </button>
            </div>

            <div className="weight-calc-fields">
              <label>
                Weight (kg)
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  placeholder="e.g. 72"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  aria-label="Weight in kilograms"
                />
              </label>
              <label>
                Height (cm)
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  placeholder="e.g. 175"
                  value={height}
                  onChange={(event) => setHeight(event.target.value)}
                  aria-label="Height in centimeters"
                />
              </label>
              <label>
                Age
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 28"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  aria-label="Age in years"
                />
              </label>
              <label>
                Gender
                <select value={gender} onChange={(event) => setGender(event.target.value)} aria-label="Gender">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>
            </div>

            <label>
              Activity level
              <select value={activity} onChange={(event) => setActivity(event.target.value)} aria-label="Activity level">
                {activityLevels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.label}
                  </option>
                ))}
              </select>
            </label>

            <button className="btn primary" type="submit">
              Calculate Calories
            </button>
            {error ? <p className="weight-calc-error">{error}</p> : null}
          </form>

          <div className={`weight-calc-result ${result ? "is-ready" : ""}`}>
            {result ? (
              <>
                <p className="weight-calc-label">
                  {result.action === "burn" ? "Daily calories to lose weight" : "Daily calories to gain weight"}
                </p>
                <strong>{result.target}</strong>
                <span className="weight-calc-unit">kcal / day</span>

                <div className="weight-calc-stats">
                  <article>
                    <span>Maintenance calories</span>
                    <strong>{result.maintenance} kcal</strong>
                  </article>
                  <article>
                    <span>{result.action === "burn" ? "Calories to burn daily" : "Extra calories to eat daily"}</span>
                    <strong>
                      {result.action === "burn" ? "-" : "+"}
                      {result.adjustment} kcal
                    </strong>
                  </article>
                  <article>
                    <span>Estimated weekly change</span>
                    <strong>
                      {result.direction === "lose" ? "Lose" : "Gain"} ~{result.weeklyChange} kg / week
                    </strong>
                  </article>
                </div>

                <p className="weight-calc-note">
                  {result.action === "burn"
                    ? "Combine this calorie target with cardio and strength training for better fat loss."
                    : "Pair extra calories with protein-rich meals and progressive strength training."}
                </p>
              </>
            ) : (
              <>
                <p className="weight-calc-label">Your calorie plan</p>
                <strong>--</strong>
                <span className="weight-calc-placeholder">
                  Choose burn or increase calories, then enter your details.
                </span>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}