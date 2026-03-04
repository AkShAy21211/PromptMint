export type StylingType = "Tailwind CSS" | "shadcn/ui" | "CSS Modules" | "NativeWind" | "SwiftUI" | "Jetpack Compose" | "Material UI" | "Chakra UI" | "Bootstrap";
export type LanguageType = "TypeScript" | "JavaScript" | "Swift" | "Kotlin" | "Java" | "C# (Unity)" | "Go" | "Python";
export type AnimationType = "Framer Motion" | "Reanimated" | "GSAP" | "Lottie" | "CSS Keyframes" | "None";

export type PlanType = "free" | "pro" | "lifetime";

export interface Stack {
    styling: StylingType;
    language: LanguageType;
    animation: AnimationType;
}
