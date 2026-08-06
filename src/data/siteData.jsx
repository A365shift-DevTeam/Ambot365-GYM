import {
  Activity,
  BadgeCheck,
  Camera,
  Dumbbell,
  Flame,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

export const brand = {
  name: "Ambot365 Gym",
  fullName: "Ambot365 Gym",
  tagline: "Fitness to Enjoy",
  address: "123 Health & Fitness Boulevard, Suite 100, Central City, 12345",
  location: "Central City",
  phones: ["+1 (555) 123-4567", "+1 (555) 987-6543"],
};

export const navItems = ["Home", "Facilities", "Programs", "Pricing", "Contact"];

export const workouts = [
  {
    id: "arms",
    title: "Arms Workout",
    subtitle: "Build stronger biceps, triceps, and forearms.",
    exercises: ["Bicep Curls", "Hammer Curls", "Tricep Dips", "Tricep Pushdowns", "Forearm Curls"],
    image: "https://images.unsplash.com/photo-1586436123658-9710c6fcb8c0?auto=format&fit=crop&w=1100&q=85",
    layout: "left",
    animation: "Image slides from left, content fades from bottom.",
  },
  {
    id: "chest",
    title: "Chest Workout",
    subtitle: "Build upper-body strength and a powerful chest.",
    exercises: ["Bench Press", "Incline Dumbbell Press", "Push-Ups", "Cable Fly", "Chest Dips"],
    image: "https://images.unsplash.com/photo-1587385789097-0197a7fbd179?auto=format&fit=crop&w=1100&q=85",
    layout: "right",
    animation: "Image scales up while text slides from right.",
  },
  {
    id: "abs",
    title: "Abs Workout",
    subtitle: "Train your core, improve balance, and define your midsection.",
    exercises: ["Crunches", "Leg Raises", "Plank", "Mountain Climbers", "Russian Twists"],
    image: "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?auto=format&fit=crop&w=1100&q=85",
    layout: "left",
    animation: "Exercise cards appear with staggered fade-up animation.",
  },
  {
    id: "legs",
    title: "Legs Workout",
    subtitle: "Build strong legs, power, balance, and stability.",
    exercises: ["Squats", "Lunges", "Leg Press", "Calf Raises", "Romanian Deadlift"],
    image: "https://images.unsplash.com/photo-1534368786749-b63e05c90863?auto=format&fit=crop&w=1100&q=85",
    layout: "right",
    animation: "Parallax background movement and floating exercise cards.",
    parallax: true,
  },
  {
    id: "back",
    title: "Back Workout",
    subtitle: "Improve posture, pulling strength, and upper-body balance.",
    exercises: ["Pull-Ups", "Lat Pulldown", "Deadlift", "Barbell Row", "Seated Cable Row"],
    image: "https://images.unsplash.com/photo-1598971639058-a090bd3c4613?auto=format&fit=crop&w=1100&q=85",
    layout: "left",
    animation: "Image slides from right and text slides from left.",
  },
  {
    id: "shoulder",
    title: "Shoulder Workout",
    subtitle: "Build broad shoulders and improve upper-body power.",
    exercises: ["Shoulder Press", "Lateral Raises", "Front Raises", "Shrugs", "Arnold Press"],
    image: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=1100&q=85",
    layout: "right",
    animation: "Red glow effect behind image and smooth fade-in cards.",
    glow: true,
  },
  {
    id: "cardio",
    title: "Cardio & Fat Loss",
    subtitle: "Burn calories, improve stamina, and increase endurance.",
    exercises: ["Treadmill Running", "Cycling", "Jump Rope", "HIIT", "Battle Rope"],
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1100&q=85",
    layout: "left",
    animation: "Fast motion lines, animated counters, and energetic transitions.",
    energetic: true,
  },
];

export const facilities = [
  ["Zumba Classes", Activity],
  ["State-of-the-art Equipment", Dumbbell],
  ["Group Workouts", Users],
  ["Bootcamp Challenges", Flame],
  ["Personal Training", Target],
  ["Luxurious Gym Facilities", Sparkles],
  ["Rehabilitation Services", HeartPulse],
];

export const whyChoose = [
  "Premier international fitness center",
  "World's top-rated premium equipment",
  "Certified trainers",
  "Functional training and CrossFit",
  "Personalized transformation programs",
  "Dedicated nutritionist and customized diet plans",
  "Expert support for nutrition, rehab, physio, and training",
  "Guaranteed transformation plans",
  "Luxurious amenities including steam, showers, and changing rooms",
];

export const pricing = [
  {
    title: "Membership",
    featured: true,
    items: [
      ["Monthly Package", "₹4,000"],
      ["Quarterly Package", "₹8,000"],
      ["Half-Yearly Package", "₹10,000"],
      ["Yearly Package", "₹15,000"],
    ],
  },
  {
    title: "Membership + Diet",
    items: [
      ["Monthly Package", "₹5,000"],
      ["Quarterly Package", "₹10,000"],
      ["Half-Yearly Package", "₹15,000"],
      ["Yearly Package", "₹25,000"],
    ],
  },
  {
    title: "Transformation Package",
    items: [["Complete Program", "₹60,000 + Tax"]],
  },
  {
    title: "Personal Training + Diet",
    items: [
      ["12 Sessions", "₹14,000 + Tax"],
      ["24 Sessions", "₹22,000 + Tax"],
    ],
  },
];

export const trainers = [
  {
    name: "Coach Prem",
    role: "Strength & Conditioning Coach",
    experience: "8+ years",
    specialty: "Muscle gain, strength training, and form correction",
    focus: "Structured progressive workouts for beginners and advanced members.",
  },
];

export const footerIcons = { Camera, Mail, Phone };
export const contactIcons = { Mail, MapPin, Phone };
export const commonIcons = { BadgeCheck, Dumbbell };
